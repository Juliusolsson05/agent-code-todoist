import { defineRuntime, type JsonValue, type RuntimeContext } from 'agent-code-extension-api'

import { collect, fitsBridge, LIST_DESCRIPTION_CHARS, toJson } from './shared/budget'
import { applyChangeToIds, queryKey, type QueryContext } from './shared/listModel'
import type { Change, CommentRow, HostState, ListQuery, Meta, SetupStatus, Settings, TaskPage, TaskRow } from './shared/types'
import { tdErrorCode } from './shared/types'

// The hidden runtime: the one owner of the td service and of "something changed".
//
// WHY views do not call services.invoke themselves even though the view API
// allows it: the panel and the quick-add modal are separate frames. When the
// modal adds a task, the panel must refresh. Only a context that sees EVERY
// mutation can tell all views, so mutations are routed through here and followed
// by a `revision` bump published to every view (views refetch on change). The
// same single owner also means exactly one services.start() caller.
//
// Activation: `onStartupFinished` so due-now toasts can work without a view
// open, plus onView/onCommand. Startup does NOTHING native unless the user turned
// due reminders on — the service starts lazily on the first request otherwise.

const SERVICE = 'todoist.td'
const VIEWS = ['todoist.main', 'todoist.quickAdd', 'todoist.window'] as const

const READS = new Set(['status', 'meta', 'sections', 'list', 'task'])
/** Reassembling a large reply (src/shared/budget.ts). Forwarded like a read but
 *  never retried after a restart: the parts lived in the old service. */
const CHUNK = 'chunk'
/** Restart-and-retry is only safe when the failure was quick. The view's
 *  request to this runtime has its own 30 s limit, after which the host
 *  retires the WHOLE runtime (runtimeService.ts); a retry that starts late
 *  (e.g. after the host killed a slow invoke at 30 s) can only push us past
 *  it. A dead service is normally reported at once ("not running"). */
const RETRY_WITHIN_MS = 2_000
const MUTATIONS = new Set([
  'quickAdd', 'addWithIntent', 'add', 'update', 'move', 'complete', 'uncomplete', 'delete', 'comment',
  'createProject', 'createSection', 'createLabel',
])
const SETUP = new Set(['login', 'install', 'cancelJob', 'openUrl', 'logout'])
/** How many recent changes the publication carries. A view that was busy (or
 *  just mounted) and missed more than this simply revalidates its list. */
const CHANGE_WINDOW = 40

type ChangeDraft = Change extends infer C ? (C extends { seq: number } ? Omit<C, 'seq'> : never) : never

/** What a successful mutation changed, from the canonical entity the service
 *  returned (server/handlers.ts "Writes"). */
function changesFor(name: string, input: unknown, result: unknown): ChangeDraft[] {
  const p = (input ?? {}) as { id?: string; taskId?: string }
  const r = (result ?? {}) as { task?: TaskRow | null }
  switch (name) {
    case 'quickAdd': case 'add': case 'update':
      return result ? [{ kind: 'upsert', task: result as TaskRow }] : []
    case 'addWithIntent': case 'move': case 'uncomplete':
      return r.task ? [{ kind: 'upsert', task: r.task }] : []
    case 'complete':
      // A recurring task comes back OPEN at its next date; a normal one closed.
      if (r.task && !r.task.completedAt) return [{ kind: 'upsert', task: r.task }]
      return p.id ? [{ kind: 'remove', id: p.id, reason: 'completed', task: r.task ?? null }] : []
    case 'delete':
      return p.id ? [{ kind: 'remove', id: p.id, reason: 'deleted', task: null }] : []
    case 'comment':
      return p.taskId && result ? [{ kind: 'comment', taskId: p.taskId, comment: result as CommentRow }] : []
    case 'createProject': case 'createSection': case 'createLabel':
      return [{ kind: 'meta' }]
    default:
      return []
  }
}

/** Keep publications small: the list only shows a description preview, and
 *  views that need the full text (the task view) fetch the task. */
function slim(task: TaskRow): TaskRow {
  return task.description.length > LIST_DESCRIPTION_CHARS ? { ...task, description: `${task.description.slice(0, LIST_DESCRIPTION_CHARS - 1)}…` } : task
}

/** How often Agent Code's Settings page edits are noticed (see the watcher). */
export const SETTINGS_WATCH_MS = 60_000

const DEFAULT_SETTINGS: Settings = {
  tdPath: '',
  defaultView: 'today',
  dueReminders: false,
  reminderIntervalMinutes: 5,
  inheritTheme: false,
}

export default defineRuntime({
  async activate(context: RuntimeContext) {
    const { api } = context
    let revision = 1
    let metaRevision = 1
    let changeSeq = 0
    let changes: Change[] = []
    let setup: SetupStatus | null = null
    // First pages of recently seen lists and the last meta, so a view (a new
    // pane, the modal, a view switch) paints instantly and revalidates in the
    // background. Kept correct by the same change feed the views apply.
    const listCache = new Map<string, { query: ListQuery; page: TaskPage }>()
    let metaCache: Meta | null = null
    let settings: Settings = DEFAULT_SETTINGS
    let starting: Promise<void> | null = null

    const readSettings = async (): Promise<Settings> => {
      const [tdPath, defaultView, dueReminders, interval, inheritTheme] = await Promise.all([
        api.storage.get<string>('todoist.tdPath'),
        api.storage.get<string>('todoist.defaultView'),
        api.storage.get<boolean>('todoist.dueReminders'),
        api.storage.get<number>('todoist.reminderIntervalMinutes'),
        api.storage.get<boolean>('todoist.inheritTheme'),
      ])
      // Settings rows are written by Agent Code's Settings UI into OUR storage
      // under the full id; the manifest default is display-only and never
      // written, so every read repeats the default (authoring.md §5).
      settings = {
        tdPath: typeof tdPath === 'string' ? tdPath : '',
        defaultView: defaultView === 'upcoming' || defaultView === 'inbox' ? defaultView : 'today',
        dueReminders: dueReminders === true,
        reminderIntervalMinutes: typeof interval === 'number' && interval >= 1 ? Math.min(120, Math.round(interval)) : 5,
        inheritTheme: inheritTheme === true,
      }
      return settings
    }

    const publish = async () => {
      const state: HostState = { revision, metaRevision, changeSeq, changes, setup, settings }
      await Promise.all(VIEWS.map(view => context.views.publish(view, toJson(state) as unknown as JsonValue).catch(() => {})))
    }

    const ensureService = (): Promise<void> => {
      if (!starting) {
        starting = api.services.start(SERVICE).then(() => undefined, error => {
          starting = null
          throw error
        })
      }
      return starting
    }

    const invoke = async (name: string, params?: JsonValue): Promise<JsonValue | undefined> => {
      await ensureService()
      const started = Date.now()
      try {
        return await api.services.invoke(SERVICE, name, params)
      } catch (error) {
        const message = String((error as Error)?.message ?? error)
        // The host terminates the service on an invoke timeout, an unexpected
        // exit or an extension update. Restart ONCE for reads only: a read is
        // safe to repeat; a mutation whose outcome is unknown must never be
        // replayed (the host's own rule), so it surfaces and the view refetches.
        // "timed out" is deliberately NOT retried: that invoke already used the
        // host's 30 s, so a retry could only outlive the view's own request.
        if (READS.has(name) && Date.now() - started <= RETRY_WITHIN_MS && /not running|exited|no longer active|stopped/i.test(message)) {
          starting = null
          await ensureService()
          return api.services.invoke(SERVICE, name, params)
        }
        throw error
      }
    }

    /** The runtime's own reads: a large reply arrives chunked (budget.ts). */
    const read = async <T,>(name: string, params?: JsonValue): Promise<T> =>
      collect<T>(await invoke(name, params), (id, index) => invoke(CHUNK, { id, index }) as Promise<unknown>)

    /** Who and which td the views' data belongs to. A change of ANY part makes
     *  every list and the sidebar stale, even when the state stays 'ready' —
     *  switching the td path to a second install signed into another account
     *  used to keep account A's lists under account B's header (review). */
    const identity = (status: SetupStatus | null) => `${status?.state}|${status?.user?.id ?? ''}|${status?.td?.path ?? ''}`

    /** A different account, td, or setup state: nothing cached is valid. */
    const accountChanged = () => {
      revision++
      metaRevision++
      forgetAccountData()
      if (setup?.state === 'ready') prefetch()
    }

    let setupSeq = 0
    const refreshSetup = async (refresh = false): Promise<SetupStatus> => {
      await readSettings()
      const seq = ++setupSeq
      const next = await read<SetupStatus>('status', { tdPath: settings.tdPath, refresh })
      // A slower, older status (e.g. still asking the PREVIOUS td who is signed
      // in) must not overwrite a newer one.
      if (seq !== setupSeq) return setup ?? next
      const before = identity(setup)
      setup = next
      // Becoming ready (sign-in finished, td installed) or switching account /
      // td invalidates whatever the views showed before — bump so they reload.
      if (before !== identity(setup)) accountChanged()
      await publish()
      return setup
    }

    const cacheContext = (): QueryContext => ({
      now: new Date(),
      inboxId: metaCache?.projects.find(p => p.isInbox)?.id ?? null,
      userId: setup?.user?.id ?? null,
    })

    /** Record what changed, update the caches, publish once. */
    const pushChanges = async (drafts: ChangeDraft[]) => {
      if (!drafts.length) return
      const ctx = cacheContext()
      for (const draft of drafts) {
        const change = { ...(draft.kind === 'upsert' ? { ...draft, task: slim(draft.task) } : draft), seq: ++changeSeq } as Change
        changes.push(change)
        if (change.kind === 'meta') { metaRevision++; metaCache = null; continue }
        for (const entry of listCache.values()) {
          const byId = new Map(entry.page.tasks.map(t => [t.id, t]))
          const ids = applyChangeToIds(entry.page.tasks.map(t => t.id), entry.query, change, ctx, id => byId.get(id)?.parentId ?? null)
          if (change.kind === 'upsert') byId.set(change.task.id, change.task)
          if (change.kind === 'remove' && change.task) byId.set(change.id, change.task)
          entry.page = { ...entry.page, tasks: ids.map(id => byId.get(id)).filter((t): t is TaskRow => !!t) }
        }
      }
      if (changes.length > CHANGE_WINDOW) changes = changes.slice(-CHANGE_WINDOW)
      await publish()
    }

    const forgetAccountData = () => {
      listCache.clear()
      metaCache = null
      changes = []
    }

    /** Warm the caches once the account is known, so the first pane paints
     *  from memory. Best-effort and quiet. */
    const PREFETCH: ListQuery[] = [{ kind: 'today' }, { kind: 'inbox' }, { kind: 'upcoming' }]
    const prefetch = () => {
      void read<Meta>('meta').then(m => { if (fitsBridge(m)) metaCache = m }, () => {})
      for (const query of PREFETCH) {
        void read<TaskPage>('list', query as unknown as JsonValue).then(page => {
          if (fitsBridge(page)) listCache.set(queryKey(query), { query, page })
        }, () => {})
      }
    }

    for (const name of [...READS, CHUNK, ...MUTATIONS, ...SETUP]) {
      context.registerRequest(name, async input => {
        if (name === 'status') {
          const p = (input ?? {}) as { refresh?: boolean }
          return refreshSetup(p.refresh === true) as unknown as JsonValue
        }
        // Instant answers from memory: `cached: true` never reaches the
        // service; null means "nothing cached, ask normally".
        const flags = (input ?? {}) as { cached?: boolean; cursor?: string | null }
        if (flags.cached === true && name === 'list') {
          return (listCache.get(queryKey(input as unknown as ListQuery))?.page ?? null) as unknown as JsonValue
        }
        if (flags.cached === true && name === 'meta') return metaCache as unknown as JsonValue
        try {
          const result = await invoke(name, input ?? undefined)
          if (name === 'list' && !flags.cursor && result && fitsBridge(result)) {
            const query = input as unknown as ListQuery
            listCache.set(queryKey(query), { query: { kind: query.kind, id: query.id, query: query.query }, page: result as unknown as TaskPage })
          }
          if (name === 'meta' && result && fitsBridge(result)) metaCache = result as unknown as Meta
          if (MUTATIONS.has(name)) await pushChanges(changesFor(name, input, result))
          if (SETUP.has(name) && name !== 'openUrl') {
            ++setupSeq // newer than any status still in flight
            const before = identity(setup)
            setup = result as unknown as SetupStatus
            if (before !== identity(setup)) accountChanged()
            await publish()
          }
          return result as JsonValue
        } catch (error) {
          const code = tdErrorCode(error)
          // A timed-out mutation may have landed server-side: everything
          // may be stale, so views revalidate.
          if (MUTATIONS.has(name) && code === 'TIMEOUT') {
            revision++
            await publish()
          }
          // Signed out, token revoked (AUTH: a 401 from Todoist, e.g. the user
          // revoked access on the web) or td gone mid-session: re-check so every
          // view swaps to the setup screen instead of each toasting "HTTP 401".
          if (code === 'NO_TOKEN' || code === 'AUTH' || code === 'TD_NOT_FOUND') void refreshSetup(true).catch(() => {})
          throw error
        }
      })
    }

    context.registerRequest('settings', async () => (await readSettings()) as unknown as JsonValue)
    context.registerRequest('setSetting', async input => {
      const p = (input ?? {}) as { key?: string; value?: JsonValue }
      const allowed = ['todoist.defaultView', 'todoist.dueReminders', 'todoist.reminderIntervalMinutes', 'todoist.tdPath', 'todoist.inheritTheme']
      if (!p.key || !allowed.includes(p.key) || p.value === undefined) throw new Error('INVALID: Unknown setting.')
      await api.storage.set(p.key, p.value)
      await readSettings()
      if (p.key === 'todoist.tdPath') await refreshSetup(true)
      else await publish()
      scheduleReminders()
      return settings as unknown as JsonValue
    })

    context.registerCommand('todoist.refresh', async () => {
      revision++
      await refreshSetup(true)
    })

    // ---------------------------------------------------------------------
    // Due-now toasts (opt-in).
    //
    // Only TIMED tasks: an all-day task has no moment to be "due now", and a
    // toast per all-day task every morning is noise the user can already see in
    // Today. We remember what we announced (by id + due time, so a rescheduled
    // task can announce again) in storage, so an app restart inside the window
    // does not repeat toasts.
    let reminderTimer: ReturnType<typeof setInterval> | null = null
    const REMINDER_MAX_PAGES = 10
    const announced = new Set<string>((await api.storage.get<string[]>('todoist.announced')) ?? [])

    const checkDue = async () => {
      try {
        if (!settings.dueReminders) return
        const status = setup?.state === 'ready' ? setup : await refreshSetup()
        if (status.state !== 'ready') return
        // Every page of Today, not just the first: a timed task sorted after
        // 120 all-day ones would otherwise never be announced (review of PR
        // #2). Bounded so a pathological account cannot spin here.
        const tasks: TaskPage['tasks'] = []
        let cursor: string | null = null
        for (let page = 0; page < REMINDER_MAX_PAGES; page++) {
          const result: TaskPage = await read<TaskPage>('list', { kind: 'today', cursor })
          tasks.push(...result.tasks)
          cursor = result.nextCursor
          if (!cursor) break
        }
        const now = Date.now()
        const window = settings.reminderIntervalMinutes * 60_000
        let changed = false
        for (const task of tasks) {
          const at = task.due?.datetime ? Date.parse(task.due.datetime) : NaN
          if (!Number.isFinite(at) || at > now || now - at > window + 60_000) continue
          const key = `${task.id}@${task.due!.datetime}`
          if (announced.has(key)) continue
          announced.add(key)
          changed = true
          await api.notifications.show(`Due now: ${task.content}`.slice(0, 200)).catch(() => {})
        }
        if (changed) {
          // Bounded: only the most recent 200 keys matter (the window is minutes).
          const keep = [...announced].slice(-200)
          announced.clear()
          keep.forEach(key => announced.add(key))
          await api.storage.set('todoist.announced', keep)
        }
      } catch {
        // Background work never throws into the host; the panel shows errors.
      }
    }

    const scheduleReminders = () => {
      if (reminderTimer) clearInterval(reminderTimer)
      reminderTimer = null
      if (!settings.dueReminders) return
      reminderTimer = setInterval(() => void checkDue(), settings.reminderIntervalMinutes * 60_000)
      void checkDue()
    }

    // Agent Code's Settings page writes our storage directly and does not notify
    // us. Re-read once a minute (storage only, nothing native) so turning due
    // reminders on in Settings takes effect without reopening the panel.
    // A td path changed THERE must also re-locate td, exactly like setSetting
    // does — otherwise the service keeps running the old binary (review).
    const settingsWatch = setInterval(() => {
      const before = settings
      void readSettings().then(async next => {
        if (JSON.stringify(next) === JSON.stringify(before)) return
        if (next.tdPath !== before.tdPath) await refreshSetup(true)
        else await publish()
        scheduleReminders()
      }).catch(() => {})
    }, SETTINGS_WATCH_MS)

    context.subscriptions.push({
      dispose: () => {
        if (reminderTimer) clearInterval(reminderTimer)
        clearInterval(settingsWatch)
      },
    })

    await readSettings()
    await publish()
    scheduleReminders()
  },
})
