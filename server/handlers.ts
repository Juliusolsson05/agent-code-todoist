import { AsyncLocalStorage } from 'node:async_hooks'
import { spawn } from 'node:child_process'

import { DETAIL_DESCRIPTION_CHARS, toJson } from '../src/shared/budget'
import type {
  CommentRow,
  ListQuery,
  Meta,
  SetupStatus,
  TaskDetail,
  TaskDraft,
  TaskPage,
  TaskPatch,
  TaskRow,
  UserRow,
} from '../src/shared/types'
import {
  compactAll,
  compactComment,
  compactFilter,
  compactLabel,
  compactProject,
  compactSection,
  compactTask,
  compactUser,
} from './compact'
import { TodoistRequestError, type TodoistApi } from '@doist/todoist-sdk'

import { planFollowUps, type QuickAddIntent } from '../src/shared/quickAddPlan'
import { api, dropClient, mapApiError, requestId } from './api'
import { cancelJob, clearFinishedJob, jobStatus, startJob } from './jobs'
import { locateBrew, locateTd, loginPath, type Located } from './locate'
import { TdError, runTd } from './run'

// The service's RPC table. One handler per row of the plan's "Service RPC
// contract". Everything that reaches td goes through `td()` below, which owns
// locating the binary; everything that leaves goes through `toJson` (the host
// rejects `undefined` anywhere in a reply — see src/shared/budget.ts).
//
// Ref discipline: we ALWAYS pass `id:<id>` refs. td also accepts names and fuzzy
// matches them, which is great for humans and dangerous for a UI: a project named
// "Work" and one named "Work stuff" must never be confused by a click.
//
// User text discipline: user-provided strings are passed as `--flag=value`
// (single argv element, `=` form). A title like "-v fix" passed as a separate
// argv element would be parsed by commander as an OPTION, not a value.

/** Tasks per td page. Bigger pages mean fewer "Load more" clicks; smaller ones
 *  a faster first paint. A page larger than the bridge allows is chunked, never
 *  trimmed (src/shared/budget.ts), so this is a latency knob, not a limit. */
const PAGE_LIMIT = 120

/** Saved filters load in one go, up to this many tasks. td refuses `--cursor`
 *  for a filter with several comma-separated queries ("each section has its
 *  own cursor") and for a filter with a saved sort order (it sorts locally,
 *  after fetching everything, and drops the API cursor) — td 5.4.10
 *  commands/filter/view.js. Paging those is impossible through td, so we ask
 *  for enough that real filters are complete, and say so when one is not. */
const FILTER_LIMIT = 1000

/**
 * One deadline for everything a single service invoke does.
 *
 * WHY: Agent Code kills the service when an invoke passes 30 s
 * (serviceHost.ts) and retires the whole RUNTIME when a view request passes
 * 30 s (runtimeService.ts) — every open Todoist view dies with it. A per-td
 * 20 s cap is not enough on its own: a read that fails slowly (16 s) and is
 * retried gets a fresh 20 s and returned after 34.6 s in review. So the
 * service wrapper (server/invoke.ts) opens a scope with an absolute deadline,
 * and every td call inside it — first attempts, retries, sequential calls in
 * `status` — is cut to what is left. 25 s leaves 5 s for locating td, service
 * start-up and the two IPC hops before the host's 30 s.
 */
export const INVOKE_BUDGET_MS = 25_000
const invokeScope = new AsyncLocalStorage<{ deadline: number }>()

export function withinBudget<T>(fn: () => Promise<T>, budgetMs = INVOKE_BUDGET_MS): Promise<T> {
  return invokeScope.run({ deadline: Date.now() + budgetMs }, fn)
}

function remainingMs(): number {
  const scope = invokeScope.getStore()
  return scope ? scope.deadline - Date.now() : Number.POSITIVE_INFINITY
}

/** Below this, starting td (≈0.4 s of Node start-up alone) cannot produce an
 *  answer in time; failing fast with TIMEOUT beats being killed by the host. */
const MIN_ATTEMPT_MS = 1_500
/** A retry is only worth it if it gets a realistic run, not a sliver. */
const MIN_RETRY_MS = 5_000

let located: Located | null = null
let tdVersion: { path: string; version: string } | null = null
let cachedUser: UserRow | null = null
let settingPath = ''
/** Bumped whenever the td path setting changes or td is re-located. A status
 *  call only updates the cached user if no newer configuration appeared while
 *  it waited on `td auth status`: otherwise a slow answer from the OLD td
 *  (another account) overwrote the new account's user (review of PR #2). */
let configGeneration = 0

async function resolveTd(refresh = false): Promise<{ located: Located | null; searched: string[] }> {
  if (located && !refresh) return { located, searched: [] }
  const result = await locateTd(settingPath, { refresh })
  located = result.found
  return { located, searched: result.searched }
}

async function td(args: string[], options: { timeoutMs?: number; expectJson?: boolean; stdin?: string; read?: boolean } = {}): Promise<unknown> {
  const { located: found } = await resolveTd()
  if (!found) throw new TdError('TD_NOT_FOUND', 'The Todoist CLI (td) is not installed or could not be found.')
  const { read, timeoutMs = 20_000, ...runOptions } = options
  const attempt = () => {
    const left = remainingMs()
    if (left < MIN_ATTEMPT_MS) throw new TdError('TIMEOUT', `td ${args.slice(0, 2).join(' ')} was not started: the request ran out of time.`)
    return runTd(found.path, args, { env: found.env, ...runOptions, timeoutMs: Math.min(timeoutMs, left) })
  }
  try {
    try {
      return await attempt()
    } catch (error) {
      // td 5.4.10 does NOT retry a transient server error (verified by the
      // integration suite: one 503 on /projects failed `project list`, and with
      // it the whole sidebar). Reads are idempotent, so retry them once after a
      // short pause. Never writes: a failed write may still have landed, and
      // replaying it could duplicate a task — the same rule the host applies.
      // Never TIMEOUT either: that already spent most of the invoke budget.
      // And only when the invoke deadline leaves room for a real second run.
      if (read && error instanceof TdError && error.code === 'TD_FAILED' && remainingMs() - 400 >= MIN_RETRY_MS) {
        await new Promise(resolve => setTimeout(resolve, 400))
        return await attempt()
      }
      throw error
    }
  } catch (error) {
    // A td that vanished (uninstalled, brew upgrade moved it) — forget the cached
    // location so the next status re-runs the ladder instead of failing forever.
    if (error instanceof TdError && error.code === 'TD_NOT_FOUND') located = null
    if (error instanceof TdError && error.code === 'NO_TOKEN') cachedUser = null
    throw error
  }
}

function requireString(value: unknown, field: string, max = 20_000): string {
  if (typeof value !== 'string' || !value.trim()) throw new TdError('INVALID', `${field} is required.`)
  if (value.length > max) throw new TdError('INVALID', `${field} is too long.`)
  return value
}

function optionalId(value: unknown): string | null {
  // Todoist ids are numeric or base32 strings. Requiring an alphanumeric first
  // character keeps anything flag-shaped ("--yes") out of argv even though the
  // `id:` prefix would already neutralise it — defence in depth for the one
  // value that is interpolated into every mutating command.
  return typeof value === 'string' && /^[A-Za-z0-9][A-Za-z0-9_-]{0,63}$/.test(value) ? value : null
}

function requireId(value: unknown, field = 'id'): string {
  const id = optionalId(value)
  if (!id) throw new TdError('INVALID', `${field} is not a valid Todoist id.`)
  return id
}

function asObject(params: unknown): Record<string, unknown> {
  return params && typeof params === 'object' && !Array.isArray(params) ? (params as Record<string, unknown>) : {}
}

// ---------------------------------------------------------------------------
// Setup

export async function status(params: unknown): Promise<SetupStatus> {
  const p = asObject(params)
  const nextSetting = typeof p.tdPath === 'string' ? p.tdPath : settingPath
  const refresh = p.refresh === true || nextSetting !== settingPath
  settingPath = nextSetting
  if (refresh) configGeneration++
  const generation = configGeneration
  const job = jobStatus()
  const brew = await locateBrew()
  const base = { brew, job, checkedAt: Date.now() }
  // While a job runs, do not shell out to td: during `brew install` td may be
  // half-linked, and during login `auth status` would race the token write.
  const { located: found, searched } = await resolveTd(refresh || job?.state === 'succeeded')
  if (!found) {
    return toJson({ state: 'td-missing', td: null, searched, user: null, error: null, ...base })
  }
  if (job?.state === 'running') {
    return toJson({ state: job.kind === 'install' ? 'td-missing' : 'signed-out', td: tdVersion?.path === found.path ? { path: found.path, version: tdVersion.version, node: null } : null, searched, user: null, error: null, ...base })
  }
  try {
    if (!tdVersion || tdVersion.path !== found.path || refresh) {
      tdVersion = { path: found.path, version: String(await td(['--version'], { expectJson: false, timeoutMs: 10_000 })) }
    }
    const info = { path: found.path, version: tdVersion.version, node: null }
    try {
      const user = compactUser(await td(['auth', 'status', '--json'], { timeoutMs: 15_000 }))
      if (generation === configGeneration) {
        // A different account (td switched users outside Agent Code) must not
        // keep using the previous account's token.
        if (user?.id !== cachedUser?.id) dropClient()
        cachedUser = user
      }
      if (!user) dropClient()
      if (job?.state === 'succeeded') clearFinishedJob()
      return toJson({ state: user ? 'ready' : 'signed-out', td: info, searched, user, error: null, ...base })
    } catch (error) {
      if (error instanceof TdError && (error.code === 'NO_TOKEN' || error.code === 'AUTH')) {
        dropClient()
        return toJson({ state: 'signed-out', td: info, searched, user: null, error: error.code === 'AUTH' ? error.message : null, ...base })
      }
      throw error
    }
  } catch (error) {
    if (error instanceof TdError && error.code === 'TD_NOT_FOUND') {
      return toJson({ state: 'td-missing', td: null, searched, user: null, error: error.message, ...base })
    }
    return toJson({ state: 'error', td: tdVersion ? { path: found.path, version: tdVersion.version, node: null } : null, searched, user: null, error: (error as Error).message, ...base })
  }
}

function openExternal(url: string): void {
  const opener = process.platform === 'darwin' ? 'open' : process.platform === 'win32' ? 'explorer' : 'xdg-open'
  const child = spawn(opener, [url], { stdio: 'ignore', detached: true })
  child.on('error', () => {})
  child.unref()
}

export async function login(params: unknown): Promise<SetupStatus> {
  const p = asObject(params)
  const { located: found } = await resolveTd()
  if (!found) throw new TdError('TD_NOT_FOUND', 'Install the Todoist CLI first.')
  // --no-browser-open: td prints the authorize URL and we open it ourselves, so
  // the setup screen can also SHOW it (re-open / copy when the browser tab got
  // lost) — the default path opens a browser we can never point back to.
  const args = ['--no-spinner', 'auth', 'login', '--no-browser-open', ...(p.readOnly === true ? ['--read-only'] : [])]
  startJob({ kind: 'login', command: found.path, args, env: found.env, onUrl: openExternal, onDone: () => { cachedUser = null; dropClient() } })
  return status({})
}

export async function install(): Promise<SetupStatus> {
  const brew = await locateBrew()
  if (!brew) throw new TdError('INVALID', 'Homebrew is not installed. Install td with: npm install -g @doist/todoist-cli')
  const shellPath = await loginPath()
  startJob({
    kind: 'install',
    command: brew,
    args: ['install', 'todoist-cli'],
    env: {
      ...process.env,
      PATH: [shellPath, process.env.PATH, '/opt/homebrew/bin:/usr/local/bin:/usr/bin:/bin'].filter(Boolean).join(':'),
      // No prompts can be answered from here; never let brew wait on stdin.
      NONINTERACTIVE: '1',
      HOMEBREW_NO_ENV_HINTS: '1',
    },
    onDone: () => { located = null; tdVersion = null },
  })
  return status({})
}

export async function cancel(): Promise<SetupStatus> {
  cancelJob()
  return status({})
}

export async function logout(): Promise<SetupStatus> {
  await td(['auth', 'logout', '--json'])
  cachedUser = null
  dropClient()
  return status({ refresh: true })
}

export async function openUrl(params: unknown): Promise<{ ok: true }> {
  const url = requireString(asObject(params).url, 'url', 2048)
  // The service is unsandboxed native code; the frame must not be able to turn
  // it into a generic launcher. `open file:///…` or a custom scheme (`vscode:`,
  // `x-apple…`) would execute local handlers, so only web URLs pass.
  //
  // WHY any http(s) host and not only todoist.com (the plan's first ruling):
  // the links users click are the ones in THEIR task titles and comments — PR
  // links, docs, tickets. The sandboxed frame cannot open them itself (popups and
  // navigation are denied), so refusing would make every link in a task dead. An
  // http(s) URL opened in the default browser is exactly what clicking it in
  // Todoist does.
  let parsed: URL
  try { parsed = new URL(url) } catch { throw new TdError('INVALID', 'Not a URL.') }
  if (parsed.protocol !== 'https:' && parsed.protocol !== 'http:') throw new TdError('INVALID', 'Only web links can be opened.')
  openExternal(parsed.toString())
  return { ok: true }
}

// ---------------------------------------------------------------------------
// Talking to Todoist
//
// Every read and write below goes through the long-lived SDK client
// (server/api.ts), inside the request's deadline. td is not spawned on this
// path at all — that was the measured latency floor (see the plan's
// "Snappiness evaluation").

/** Run one SDK call (or a small group) for this request. Reads get ONE retry
 *  on a Todoist 5xx when the deadline allows — the SDK already retries network
 *  errors, never server errors. Writes are never retried here: they carry an
 *  X-Request-Id instead (api.ts). */
async function call<T>(fn: (client: TodoistApi) => Promise<T>, options: { read?: boolean } = {}): Promise<T> {
  const { located: found } = await resolveTd()
  if (!found) throw new TdError('TD_NOT_FOUND', 'The Todoist CLI (td) is not installed or could not be found.')
  const attempt = async () => {
    const left = Math.min(remainingMs(), 20_000)
    if (left < 500) throw new TdError('TIMEOUT', 'The request ran out of time.')
    const client = await api(found, configGeneration)
    let timer: ReturnType<typeof setTimeout> | undefined
    try {
      // JSON round trip: the SDK coerces timestamps (completedAt, postedAt…)
      // to Date objects; compact.ts reads the JSON form td used to print, so
      // every entity is normalised here, once.
      return await Promise.race([
        fn(client).then(value => (value === undefined ? value : JSON.parse(JSON.stringify(value))) as T),
        new Promise<never>((_, reject) => {
          timer = setTimeout(() => reject(new TdError('TIMEOUT', `Todoist did not answer within ${Math.round(left / 1000)} s.`)), left)
        }),
      ])
    } finally {
      clearTimeout(timer)
    }
  }
  try {
    return await attempt()
  } catch (error) {
    let mapped = mapApiError(error)
    const serverError = error instanceof TodoistRequestError && (error.httpStatusCode ?? 0) >= 500
    if (options.read && serverError && remainingMs() - 300 >= MIN_RETRY_MS) {
      await new Promise(resolve => setTimeout(resolve, 300))
      try { return await attempt() } catch (again) { mapped = mapApiError(again) }
    }
    if (mapped.code === 'AUTH' || mapped.code === 'NO_TOKEN') { cachedUser = null; dropClient() }
    throw mapped
  }
}

/** The account the service believes it is signed into (what `meta` reports). */
export function accountUser(): UserRow | null {
  return cachedUser
}

const read = <T,>(fn: (client: TodoistApi) => Promise<T>) => call(fn, { read: true })

/** Every page of a cursor-paged collection (projects, labels: the sidebar
 *  needs all of them; Todoist Pro caps them at a few hundred). */
async function allPages<T>(page: (cursor: string | null) => Promise<{ results: T[]; nextCursor: string | null }>): Promise<T[]> {
  const out: T[] = []
  let cursor: string | null = null
  for (let i = 0; i < 50; i++) {
    const result = await page(cursor)
    out.push(...result.results)
    cursor = result.nextCursor
    if (!cursor) break
  }
  return out
}

/** Account facts fetched once per configuration: the Inbox id (Inbox is a
 *  project query) and saved-filter queries (a filter view needs its query). */
let inboxId: { generation: number; id: string } | null = null
const filterQueries = new Map<string, string>()

async function inboxProjectId(): Promise<string> {
  if (inboxId?.generation === configGeneration) return inboxId.id
  const user = await read(client => client.getUser())
  const id = String((user as { inboxProjectId?: unknown }).inboxProjectId ?? '')
  if (!id) throw new TdError('BAD_OUTPUT', 'Todoist did not report an Inbox project.')
  inboxId = { generation: configGeneration, id }
  return id
}

// ---------------------------------------------------------------------------
// Reads

export async function meta(): Promise<Meta> {
  // Sections load per project through `sections` (views cache them).
  const [projects, labels, filters] = await Promise.all([
    read(client => allPages(cursor => client.getProjects({ cursor, limit: 200 }))),
    read(client => allPages(cursor => client.getLabels({ cursor, limit: 200 }))).catch(() => []),
    // Saved filters live in the Sync API; a free account has none. Never fail
    // the sidebar over them.
    read(client => client.sync({ resourceTypes: ['filters'], syncToken: '*' })).then(r => ((r as { filters?: unknown[] }).filters ?? []).filter(f => !(f as { isDeleted?: boolean }).isDeleted), () => []),
  ])
  const filterRows = compactAll(filters, compactFilter)
  for (const f of filterRows) filterQueries.set(f.id, f.query)
  const projectRows = compactAll(projects, compactProject).sort((a, b) => Number(b.isInbox) - Number(a.isInbox) || a.order - b.order)
  return toJson({
    projects: projectRows,
    sections: [],
    labels: compactAll(labels, compactLabel).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    filters: filterRows,
    user: cachedUser,
  })
}

export async function sections(params: unknown) {
  const projectId = requireId(asObject(params).projectId, 'project')
  const rows = await read(client => allPages(cursor => client.getSections({ projectId, cursor, limit: 200 })))
  return toJson(compactAll(rows, compactSection).sort((a, b) => a.order - b.order))
}

/** Local calendar day `offset` days from now, as Todoist's date params expect. */
function localDay(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

/** The queries td 5.4.10 builds for `today` and `upcoming 14` (commands/today.js,
 *  upcoming.js): the same filters, so the lists match what td showed. */
export const TODAY_QUERY = '(today | overdue) & (assigned to: me | !assigned)'
export const UPCOMING_QUERY = '(due before: 14 days) & (assigned to: me | !assigned)'

type Page = { results: unknown[]; nextCursor: string | null }

export async function list(params: unknown): Promise<TaskPage> {
  const query = asObject(params) as ListQuery
  const cursor = typeof query.cursor === 'string' && query.cursor ? query.cursor : null
  const limit = PAGE_LIMIT
  const page = (raw: Page): TaskPage => toJson({ tasks: compactAll(raw.results, item => compactTask(item)), nextCursor: raw.nextCursor, truncated: false })
  switch (query.kind) {
    case 'today':
      return page(await read(client => client.getTasksByFilter({ query: TODAY_QUERY, cursor, limit })))
    case 'upcoming':
      return page(await read(client => client.getTasksByFilter({ query: UPCOMING_QUERY, cursor, limit })))
    case 'inbox': {
      const projectId = await inboxProjectId()
      return page(await read(client => client.getTasks({ projectId, cursor, limit })))
    }
    case 'project': {
      const projectId = requireId(query.id, 'project')
      return page(await read(client => client.getTasks({ projectId, cursor, limit })))
    }
    case 'label': {
      const label = requireString(query.query, 'label', 200)
      return page(await read(client => client.getTasks({ label, cursor, limit })))
    }
    case 'search': {
      // `search:` matches content; commas separate queries in filter syntax.
      const text = requireString(query.query, 'search', 200).replace(/[,&|]/g, ' ')
      return page(await read(client => client.getTasksByFilter({ query: `search: ${text}`, cursor, limit })))
    }
    case 'filter': {
      if (!query.id) return page(await read(client => client.getTasksByFilter({ query: requireString(query.query, 'filter', 1000), cursor, limit })))
      const id = requireId(query.id, 'filter')
      if (!filterQueries.has(id)) await meta()
      const stored = filterQueries.get(id) ?? (typeof query.query === 'string' ? query.query : '')
      if (!stored) throw new TdError('INVALID', 'That saved filter no longer exists.')
      return toJson(await filterPage(stored, cursor))
    }
    case 'completed': {
      // Two weeks: what people mean by "what did I finish lately". Todoist's
      // default window is today only.
      const raw = await read(client => client.getCompletedTasksByCompletionDate({ since: localDay(-14), until: localDay(1), cursor, limit }))
      return page({ results: raw.items, nextCursor: raw.nextCursor })
    }
    default:
      throw new TdError('INVALID', 'Unknown list.')
  }
}

/** Split a saved filter's query on its top-level commas: Todoist shows each
 *  comma-separated query as its own section (td does the same split). Commas
 *  inside parentheses belong to the query. */
export function splitFilterQueries(query: string): string[] {
  const parts: string[] = []
  let depth = 0
  let current = ''
  for (const ch of query) {
    if (ch === '(') depth++
    if (ch === ')') depth = Math.max(0, depth - 1)
    if (ch === ',' && depth === 0) { if (current.trim()) parts.push(current.trim()); current = ''; continue }
    current += ch
  }
  if (current.trim()) parts.push(current.trim())
  return parts
}

/**
 * A saved filter's tasks, and whether that is all of them.
 *
 * One query pages normally with Todoist's cursor. Several comma-separated
 * queries are fetched as sections (up to FILTER_LIMIT each) and merged; a
 * merged list cannot be continued with one cursor, so if any section has more
 * the page says `truncated` and the view tells the user — never presenting a
 * partial list as complete.
 */
export async function filterPage(query: string, cursor: string | null): Promise<TaskPage> {
  const queries = splitFilterQueries(query)
  if (queries.length <= 1) {
    const raw = await read(client => client.getTasksByFilter({ query: queries[0] ?? query, cursor, limit: PAGE_LIMIT }))
    return { tasks: compactAll(raw.results, item => compactTask(item)), nextCursor: raw.nextCursor, truncated: false }
  }
  const sections = await Promise.all(queries.map(q => read(client => client.getTasksByFilter({ query: q, limit: FILTER_LIMIT }))))
  const seen = new Set<string>()
  const tasks: TaskRow[] = []
  // A task matching two sections appears in both in Todoist; the list is keyed
  // by id, so it is shown once.
  for (const section of sections) {
    for (const task of compactAll(section.results, item => compactTask(item))) {
      if (seen.has(task.id)) continue
      seen.add(task.id)
      tasks.push(task)
    }
  }
  return { tasks, nextCursor: null, truncated: sections.some(section => !!section.nextCursor) }
}

export async function task(params: unknown): Promise<TaskDetail> {
  const id = requireId(asObject(params).id)
  // Three direct reads in parallel — td fetched the task twice and probed every
  // child for grandchildren (29 requests for 25 children; here: 3).
  const [raw, children, comments] = await Promise.all([
    read(client => client.getTask(id)),
    read(client => allPages(cursor => client.getTasks({ parentId: id, cursor, limit: 200 }))).catch(() => []),
    read(client => client.getComments({ taskId: id, limit: 50 })).then(r => r.results, () => []),
  ])
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS)
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist returned no task.')
  return toJson({
    task: row,
    children: compactAll(children, item => compactTask(item)).sort((a, b) => a.order - b.order),
    comments: compactAll(comments, compactComment).sort((a, b) => a.postedAt.localeCompare(b.postedAt)),
  })
}

// ---------------------------------------------------------------------------
// Writes
//
// Each returns the canonical entity Todoist answered with, so the runtime can
// publish exactly what changed and views reconcile without refetching lists.

function taskFrom(raw: unknown): TaskRow {
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS)
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist did not return the task.')
  return toJson(row)
}

function priorityValue(value: unknown): number | undefined {
  return typeof value === 'number' && value >= 1 && value <= 4 ? Math.round(value) : undefined
}

function labelsValue(value: unknown): string[] | null {
  if (!Array.isArray(value)) return null
  return value.filter((l): l is string => typeof l === 'string' && !!l.trim()).map(l => l.trim())
}

/** "45m", "1h30m", "2h" → minutes. */
export function durationMinutes(value: unknown): number | null {
  if (typeof value !== 'string') return null
  const m = /^\s*(?:(\d+)\s*h)?\s*(?:(\d+)\s*m)?\s*$/i.exec(value)
  if (!m || (!m[1] && !m[2])) return null
  const minutes = Number(m[1] ?? 0) * 60 + Number(m[2] ?? 0)
  return minutes > 0 ? minutes : null
}

/** The SDK's update/add fields from our TaskPatch/TaskDraft. Empty string =
 *  clear: "no date" is Todoist's own clearing due string, a null deadline
 *  clears it, an empty label list removes all labels. */
function taskFields(p: TaskPatch & { content?: unknown }) {
  const fields: Record<string, unknown> = {}
  if (p.content !== undefined) fields.content = requireString(p.content, 'Task name', 2000)
  if (p.description !== undefined) fields.description = String(p.description).slice(0, 16_000)
  if (p.due !== undefined) fields.dueString = p.due ? String(p.due) : 'no date'
  if (p.deadline !== undefined) fields.deadlineDate = p.deadline ? String(p.deadline) : null
  const minutes = p.duration ? durationMinutes(p.duration) : null
  if (minutes) { fields.duration = minutes; fields.durationUnit = 'minute' }
  const priority = priorityValue(p.priority)
  if (priority) fields.priority = priority
  const labels = p.labels !== undefined ? labelsValue(p.labels) : null
  if (labels) fields.labels = labels
  return fields
}

async function reread(id: string): Promise<TaskRow | null> {
  try {
    return taskFrom(await read(client => client.getTask(id)))
  } catch {
    return null
  }
}

export async function quickAdd(params: unknown): Promise<TaskRow> {
  const text = requireString(asObject(params).text, 'text', 2000)
  return taskFrom(await call(client => client.quickAddTask({ text })))
}

/**
 * Quick add plus the view's/picker's intent, in ONE request.
 *
 * The parser runs first (Todoist decides what the text meant), then
 * planFollowUps (src/shared/quickAddPlan.ts) applies what it did not: today's
 * date in Today, the open project, picked labels, the agent note. Doing it here
 * means one change published instead of two or three (each of which made every
 * view reload — 10 td processes per add in beta.4). A failed follow-up returns
 * the created task with `partial`, never an error: the task exists and the
 * caller must not add it again.
 */
export async function addWithIntent(params: unknown): Promise<{ task: TaskRow; partial: string | null }> {
  const p = asObject(params)
  const text = requireString(p.text, 'text', 2000)
  const intent = (asObject(p.intent) as QuickAddIntent)
  if (!intent.inboxId) intent.inboxId = await inboxProjectId().catch(() => null)
  const created = taskFrom(await call(client => client.quickAddTask({ text })))
  const plan = planFollowUps(created, intent)
  let current = created
  try {
    if (plan.update) current = taskFrom(await call(client => client.updateTask(created.id, taskFields(plan.update!) as never, requestId())))
    if (plan.move) current = taskFrom(await call(client => client.moveTask(created.id, plan.move as never, requestId())))
    return toJson({ task: current, partial: null })
  } catch (error) {
    const reason = error instanceof TdError ? error.message.replace(/^[A-Z_]+: /, '') : String(error)
    return toJson({ task: current, partial: `Added “${created.content}”, but could not ${plan.steps.join(' and ')}. ${reason}` })
  }
}

export async function add(params: unknown): Promise<TaskRow> {
  const draft = asObject(params) as TaskDraft
  const fields: Record<string, unknown> = { ...taskFields(draft), content: requireString(draft.content, 'Task name', 2000) }
  if (fields.dueString === 'no date') delete fields.dueString
  if (fields.deadlineDate === null) delete fields.deadlineDate
  const projectId = optionalId(draft.projectId)
  const sectionId = optionalId(draft.sectionId)
  const parentId = optionalId(draft.parentId)
  if (projectId) fields.projectId = projectId
  if (sectionId) fields.sectionId = sectionId
  if (parentId) fields.parentId = parentId
  return taskFrom(await call(client => client.addTask(fields as never, requestId())))
}

export async function update(params: unknown): Promise<TaskRow> {
  const p = asObject(params) as TaskPatch & { id?: unknown }
  const id = requireId(p.id)
  const fields = taskFields(p)
  // An empty label list is a real change (remove all labels).
  if (p.labels !== undefined && Array.isArray(p.labels) && !fields.labels) fields.labels = []
  if (!Object.keys(fields).length) throw new TdError('INVALID', 'Nothing to update.')
  return taskFrom(await call(client => client.updateTask(id, fields as never, requestId())))
}

export async function move(params: unknown): Promise<{ ok: true; task: TaskRow | null }> {
  const p = asObject(params)
  const id = requireId(p.id)
  const projectId = optionalId(p.projectId)
  const sectionId = optionalId(p.sectionId)
  const parentId = optionalId(p.parentId)
  // Todoist's move takes exactly one destination. "No section" / "no parent"
  // = the project root.
  const target = sectionId ? { sectionId } : parentId ? { parentId } : projectId ? { projectId } : null
  if (!target) throw new TdError('INVALID', 'Nowhere to move to.')
  const raw = await call(client => client.moveTask(id, target as never, requestId()))
  return toJson({ ok: true, task: compactTask(raw, DETAIL_DESCRIPTION_CHARS) })
}

/** Complete, then read the task back: a recurring task rolls to its next date
 *  (still open), a normal one comes back `completedAt` — the runtime publishes
 *  whichever is true, so no view has to refetch to find out. */
export async function complete(params: unknown): Promise<{ ok: true; task: TaskRow | null }> {
  const id = requireId(asObject(params).id)
  await call(client => client.closeTask(id, requestId()))
  return toJson({ ok: true, task: await reread(id) })
}

export async function uncomplete(params: unknown): Promise<{ ok: true; task: TaskRow | null }> {
  const id = requireId(asObject(params).id)
  await call(client => client.reopenTask(id, requestId()))
  return toJson({ ok: true, task: await reread(id) })
}

export async function remove(params: unknown): Promise<{ ok: true; id: string }> {
  const id = requireId(asObject(params).id)
  await call(client => client.deleteTask(id, requestId()))
  return { ok: true, id }
}

export async function comment(params: unknown): Promise<CommentRow> {
  const p = asObject(params)
  const taskId = requireId(p.taskId, 'task')
  const content = requireString(p.content, 'Comment', 15_000)
  const row = compactComment(await call(client => client.addComment({ taskId, content }, requestId())))
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist did not return the comment.')
  return toJson(row)
}

const colorValue = (value: unknown) => (typeof value === 'string' && /^[a-z_]{2,20}$/.test(value) ? value : undefined)

export async function createProject(params: unknown) {
  const p = asObject(params)
  const fields: Record<string, unknown> = { name: requireString(p.name, 'Project name', 120) }
  const color = colorValue(p.color)
  if (color) fields.color = color
  const parentId = optionalId(p.parentId)
  if (parentId) fields.parentId = parentId
  if (p.favorite === true) fields.isFavorite = true
  const row = compactProject(await call(client => client.addProject(fields as never, requestId())))
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist did not return the project.')
  return toJson(row)
}

export async function createSection(params: unknown) {
  const p = asObject(params)
  const name = requireString(p.name, 'Section name', 120)
  const projectId = requireId(p.projectId, 'project')
  const row = compactSection(await call(client => client.addSection({ name, projectId }, requestId())))
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist did not return the section.')
  return toJson(row)
}

export async function createLabel(params: unknown) {
  const p = asObject(params)
  const fields: Record<string, unknown> = { name: requireString(p.name, 'Label name', 60).replace(/^@/, '').trim() }
  const color = colorValue(p.color)
  if (color) fields.color = color
  const row = compactLabel(await call(client => client.addLabel(fields as never, requestId())))
  if (!row) throw new TdError('BAD_OUTPUT', 'Todoist did not return the label.')
  return toJson(row)
}

export const handlers = {
  status,
  login,
  install,
  cancelJob: cancel,
  logout,
  openUrl,
  meta,
  sections,
  list,
  task,
  quickAdd,
  addWithIntent,
  add,
  update,
  move,
  complete,
  uncomplete,
  delete: remove,
  comment,
  createProject,
  createSection,
  createLabel,
} as const

export type HandlerName = keyof typeof handlers
