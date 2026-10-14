import { defineRuntime, type JsonValue, type RuntimeContext } from 'agent-code-extension-api'

import { toJson } from './shared/budget'
import type { HostState, SetupStatus, Settings, TaskPage } from './shared/types'
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
const VIEWS = ['todoist.main', 'todoist.quickAdd'] as const

const READS = new Set(['status', 'meta', 'sections', 'list', 'task'])
const MUTATIONS = new Set([
  'quickAdd', 'add', 'update', 'move', 'complete', 'uncomplete', 'delete', 'comment',
  'createProject', 'createSection', 'createLabel', 'logout',
])
const SETUP = new Set(['login', 'install', 'cancelJob', 'openUrl'])

const DEFAULT_SETTINGS: Settings = {
  tdPath: '',
  defaultView: 'today',
  dueReminders: false,
  reminderIntervalMinutes: 5,
}

export default defineRuntime({
  async activate(context: RuntimeContext) {
    const { api } = context
    let revision = 1
    let setup: SetupStatus | null = null
    let settings: Settings = DEFAULT_SETTINGS
    let starting: Promise<void> | null = null

    const readSettings = async (): Promise<Settings> => {
      const [tdPath, defaultView, dueReminders, interval] = await Promise.all([
        api.storage.get<string>('todoist.tdPath'),
        api.storage.get<string>('todoist.defaultView'),
        api.storage.get<boolean>('todoist.dueReminders'),
        api.storage.get<number>('todoist.reminderIntervalMinutes'),
      ])
      // Settings rows are written by Agent Code's Settings UI into OUR storage
      // under the full id; the manifest default is display-only and never
      // written, so every read repeats the default (authoring.md §5).
      settings = {
        tdPath: typeof tdPath === 'string' ? tdPath : '',
        defaultView: defaultView === 'upcoming' || defaultView === 'inbox' ? defaultView : 'today',
        dueReminders: dueReminders === true,
        reminderIntervalMinutes: typeof interval === 'number' && interval >= 1 ? Math.min(120, Math.round(interval)) : 5,
      }
      return settings
    }

    const publish = async () => {
      const state: HostState = { revision, setup, settings }
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
      try {
        return await api.services.invoke(SERVICE, name, params)
      } catch (error) {
        const message = String((error as Error)?.message ?? error)
        // The host terminates the service on an invoke timeout, an unexpected
        // exit or an extension update. Restart ONCE for reads only: a read is
        // safe to repeat; a mutation whose outcome is unknown must never be
        // replayed (the host's own rule), so it surfaces and the view refetches.
        if (READS.has(name) && /not running|exited|no longer active|timed out|stopped/i.test(message)) {
          starting = null
          await ensureService()
          return api.services.invoke(SERVICE, name, params)
        }
        throw error
      }
    }

    const refreshSetup = async (refresh = false): Promise<SetupStatus> => {
      await readSettings()
      const previous = setup?.state
      setup = (await invoke('status', { tdPath: settings.tdPath, refresh })) as unknown as SetupStatus
      // Becoming ready (sign-in finished, td installed) invalidates whatever the
      // views showed before — bump so they load real data.
      if (previous !== setup.state) revision++
      await publish()
      return setup
    }

    for (const name of [...READS, ...MUTATIONS, ...SETUP]) {
      context.registerRequest(name, async input => {
        if (name === 'status') {
          const p = (input ?? {}) as { refresh?: boolean }
          return refreshSetup(p.refresh === true) as unknown as JsonValue
        }
        try {
          const result = await invoke(name, input ?? undefined)
          if (MUTATIONS.has(name)) {
            revision++
            await publish()
          }
          if (SETUP.has(name) && name !== 'openUrl') {
            setup = result as unknown as SetupStatus
            await publish()
          }
          return result as JsonValue
        } catch (error) {
          const code = tdErrorCode(error)
          // A timed-out mutation may have landed server-side: refetch.
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
      const allowed = ['todoist.defaultView', 'todoist.dueReminders', 'todoist.reminderIntervalMinutes', 'todoist.tdPath']
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
    const announced = new Set<string>((await api.storage.get<string[]>('todoist.announced')) ?? [])

    const checkDue = async () => {
      try {
        if (!settings.dueReminders) return
        const status = setup?.state === 'ready' ? setup : await refreshSetup()
        if (status.state !== 'ready') return
        const page = (await invoke('list', { kind: 'today' })) as unknown as TaskPage
        const now = Date.now()
        const window = settings.reminderIntervalMinutes * 60_000
        let changed = false
        for (const task of page.tasks) {
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
    const settingsWatch = setInterval(() => {
      const before = JSON.stringify(settings)
      void readSettings().then(next => {
        if (JSON.stringify(next) === before) return
        scheduleReminders()
        void publish()
      }).catch(() => {})
    }, 60_000)

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
