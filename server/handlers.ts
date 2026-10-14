import { AsyncLocalStorage } from 'node:async_hooks'
import { spawn } from 'node:child_process'

import { DETAIL_DESCRIPTION_CHARS, toJson } from '../src/shared/budget'
import { priorityLabel } from '../src/shared/colors'
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
  resultsOf,
} from './compact'
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

const ref = (id: string) => `id:${id}`

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
      if (generation === configGeneration) cachedUser = user
      if (job?.state === 'succeeded') clearFinishedJob()
      return toJson({ state: user ? 'ready' : 'signed-out', td: info, searched, user, error: null, ...base })
    } catch (error) {
      if (error instanceof TdError && (error.code === 'NO_TOKEN' || error.code === 'AUTH')) {
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
  startJob({ kind: 'login', command: found.path, args, env: found.env, onUrl: openExternal, onDone: () => { cachedUser = null } })
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
// Reads

export async function meta(): Promise<Meta> {
  // Sections are NOT fetched here: `td section list` refuses to run without a
  // project or a search term (td 5.4.10 section/index.js), so an account-wide
  // list would cost one td process per project. An earlier version called it
  // without a project, the CLI exited with usage, and a `.catch` turned that
  // into "no sections" for every user — found by the real-td integration
  // tests. Views load sections per project through `sections` instead.
  const [projects, labels, filters] = await Promise.all([
    td(['project', 'list', '--all', '--json', '--full'], { read: true }),
    td(['label', 'list', '--all', '--json', '--full'], { read: true }).catch(() => ({ results: [] })),
    // Saved filters are a Pro feature; a free account must still get a sidebar.
    td(['filter', 'list', '--json', '--full'], { read: true }).catch(() => ({ results: [] })),
  ])
  const projectRows = compactAll(resultsOf(projects).results, compactProject).sort((a, b) => Number(b.isInbox) - Number(a.isInbox) || a.order - b.order)
  return toJson({
    projects: projectRows,
    sections: [],
    labels: compactAll(resultsOf(labels).results, compactLabel).sort((a, b) => a.order - b.order || a.name.localeCompare(b.name)),
    filters: compactAll(resultsOf(filters).results, compactFilter),
    user: cachedUser,
  })
}

export async function sections(params: unknown) {
  const projectId = requireId(asObject(params).projectId, 'project')
  const raw = await td(['section', 'list', ref(projectId), '--all', '--json', '--full'], { read: true })
  return toJson(compactAll(resultsOf(raw).results, compactSection).sort((a, b) => a.order - b.order))
}

/** Local calendar day `offset` days from now, as td's --since expects. */
function localDay(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
}

function listArgs(query: ListQuery): string[] {
  const page = ['--json', '--full', `--limit=${PAGE_LIMIT}`, ...(query.cursor ? [`--cursor=${query.cursor}`] : [])]
  switch (query.kind) {
    case 'today':
      return ['today', ...page]
    case 'upcoming':
      // 14 days: a week shows too little on a Monday, a month buries the near term.
      return ['upcoming', '14', ...page]
    case 'inbox':
      return ['inbox', ...page]
    case 'project':
      return ['task', 'list', `--project=${ref(requireId(query.id, 'project'))}`, ...page]
    case 'label':
      return ['task', 'list', `--label=${requireString(query.query, 'label', 200)}`, ...page]
    case 'filter':
      if (query.id) return ['filter', 'view', ref(requireId(query.id, 'filter')), '--json', '--full', `--limit=${FILTER_LIMIT}`, ...(query.cursor ? [`--cursor=${query.cursor}`] : [])]
      return ['task', 'list', `--filter=${requireString(query.query, 'filter', 1000)}`, ...page]
    case 'search':
      // Todoist filter syntax: `search: text` matches content. Commas separate
      // queries in filter syntax, so strip them from free text.
      return ['task', 'list', `--filter=search: ${requireString(query.query, 'search', 200).replace(/[,&|]/g, ' ')}`, ...page]
    case 'completed':
      // td's default window is TODAY only (since=today, until=tomorrow — seen
      // in the integration request log). Two weeks matches what people mean by
      // "what did I finish lately" without paging through months.
      return ['completed', 'list', `--since=${localDay(-14)}`, ...page]
    default:
      throw new TdError('INVALID', 'Unknown list.')
  }
}

export async function list(params: unknown): Promise<TaskPage> {
  const query = asObject(params) as ListQuery
  const raw = await td(listArgs(query), { read: true })
  if (query.kind === 'filter' && query.id) return toJson(filterPage(raw))
  const { results, nextCursor } = resultsOf(raw)
  return toJson({ tasks: compactAll(results, item => compactTask(item)), nextCursor, truncated: false })
}

/**
 * A saved filter's tasks, and whether that is all of them.
 *
 * `td filter view` answers in two shapes: `{results, nextCursor}` for a
 * one-query filter, and `{sections: [{query, results, nextCursor}]}` when the
 * filter has several comma-separated queries. Only the first shape can ever be
 * continued, and only when td kept the API cursor (it drops it when it sorted
 * locally). Anything else that may have more is reported as `truncated`, so the
 * view says "showing the first N" instead of presenting a partial list as
 * complete — the earlier version flattened sections and dropped every cursor.
 */
export function filterPage(raw: unknown): TaskPage {
  const full = (count: number) => count >= FILTER_LIMIT
  if (raw && typeof raw === 'object' && Array.isArray((raw as { sections?: unknown }).sections)) {
    const sections = (raw as { sections: Array<{ results?: unknown[]; nextCursor?: unknown }> }).sections
    const seen = new Set<string>()
    const tasks: TaskRow[] = []
    // td deliberately keeps a task that matches two sections in both (Todoist
    // shows it under each query). The list is keyed by task id, so the second
    // copy is dropped here; the task is still shown once.
    for (const section of sections) {
      for (const task of compactAll(section.results ?? [], item => compactTask(item))) {
        if (seen.has(task.id)) continue
        seen.add(task.id)
        tasks.push(task)
      }
    }
    const truncated = sections.some(section => !!section.nextCursor || full(section.results?.length ?? 0))
    return { tasks, nextCursor: null, truncated }
  }
  const { results, nextCursor } = resultsOf(raw)
  return {
    tasks: compactAll(results, item => compactTask(item)),
    nextCursor,
    // Sorted saved filters come back sliced to the limit with no cursor; a
    // full page without a cursor therefore MAY have more.
    truncated: !nextCursor && full(results.length),
  }
}

export async function task(params: unknown): Promise<TaskDetail> {
  const id = requireId(asObject(params).id)
  const [raw, comments] = await Promise.all([
    td(['task', 'view', ref(id), '--json', '--full', '--include-children'], { read: true }),
    td(['comment', 'list', ref(id), '--json', '--full', '--limit=50'], { read: true }).catch(() => ({ results: [] })),
  ])
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS)
  if (!row) throw new TdError('BAD_OUTPUT', 'td returned no task.')
  const children = Array.isArray((raw as { children?: unknown }).children) ? (raw as { children: unknown[] }).children : []
  return toJson({
    task: row,
    children: compactAll(children, item => compactTask(item)).sort((a, b) => a.order - b.order),
    comments: compactAll(resultsOf(comments).results, compactComment).sort((a, b) => a.postedAt.localeCompare(b.postedAt)),
  })
}

// ---------------------------------------------------------------------------
// Writes

function taskFrom(raw: unknown): TaskRow {
  const row = compactTask(raw, DETAIL_DESCRIPTION_CHARS)
  if (!row) throw new TdError('BAD_OUTPUT', 'td did not return the task.')
  return toJson(row)
}

function priorityFlag(value: unknown): string[] {
  return typeof value === 'number' && value >= 1 && value <= 4 ? [`--priority=${priorityLabel(value)}`] : []
}

function labelsValue(value: unknown): string | null {
  if (!Array.isArray(value)) return null
  return value.filter((l): l is string => typeof l === 'string' && !!l.trim()).map(l => l.replace(/,/g, ' ').trim()).join(',')
}

export async function quickAdd(params: unknown): Promise<TaskRow> {
  const text = requireString(asObject(params).text, 'text', 2000)
  // --stdin: the whole natural-language line goes through stdin, so a title
  // starting with "-" or containing anything shell-ish is never an argv token.
  return taskFrom(await td(['task', 'quickadd', '--stdin', '--json'], { stdin: text }))
}

export async function add(params: unknown): Promise<TaskRow> {
  const draft = asObject(params) as TaskDraft
  const args = ['task', 'add', `--content=${requireString(draft.content, 'Task name', 2000)}`, '--json']
  if (draft.description) args.push(`--description=${String(draft.description).slice(0, 16_000)}`)
  if (draft.due) args.push(`--due=${draft.due}`)
  if (draft.deadline) args.push(`--deadline=${draft.deadline}`)
  if (draft.duration) args.push(`--duration=${draft.duration}`)
  args.push(...priorityFlag(draft.priority))
  const projectId = optionalId(draft.projectId)
  const sectionId = optionalId(draft.sectionId)
  const parentId = optionalId(draft.parentId)
  if (projectId) args.push(`--project=${ref(projectId)}`)
  if (sectionId) args.push(`--section=${ref(sectionId)}`)
  if (parentId) args.push(`--parent=${ref(parentId)}`)
  const labels = labelsValue(draft.labels)
  if (labels) args.push(`--labels=${labels}`)
  return taskFrom(await td(args))
}

export async function update(params: unknown): Promise<TaskRow> {
  const p = asObject(params) as TaskPatch & { id?: unknown }
  const id = requireId(p.id)
  const args = ['task', 'update', ref(id), '--json']
  if (p.content !== undefined) args.push(`--content=${requireString(p.content, 'Task name', 2000)}`)
  if (p.description !== undefined) args.push(`--description=${String(p.description).slice(0, 16_000)}`)
  // Empty string = clear. td has explicit --no-* flags for that; an empty
  // `--due=` would be sent to the API as due_string "" with undefined results.
  if (p.due !== undefined) args.push(p.due ? `--due=${p.due}` : '--no-due')
  if (p.deadline !== undefined) args.push(p.deadline ? `--deadline=${p.deadline}` : '--no-deadline')
  if (p.duration !== undefined && p.duration) args.push(`--duration=${p.duration}`)
  args.push(...priorityFlag(p.priority))
  if (p.labels !== undefined) {
    const labels = labelsValue(p.labels)
    args.push(labels ? `--labels=${labels}` : '--no-labels')
  }
  if (args.length === 4) throw new TdError('INVALID', 'Nothing to update.')
  return taskFrom(await td(args))
}

export async function move(params: unknown): Promise<{ ok: true }> {
  const p = asObject(params)
  const args = ['task', 'move', ref(requireId(p.id)), '--json']
  const projectId = optionalId(p.projectId)
  const sectionId = optionalId(p.sectionId)
  const parentId = optionalId(p.parentId)
  if (projectId) args.push(`--project=${ref(projectId)}`)
  if (sectionId) args.push(`--section=${ref(sectionId)}`)
  else if (p.noSection === true) args.push('--no-section')
  if (parentId) args.push(`--parent=${ref(parentId)}`)
  else if (p.noParent === true) args.push('--no-parent')
  if (args.length === 4) throw new TdError('INVALID', 'Nowhere to move to.')
  await td(args)
  return { ok: true }
}

export async function complete(params: unknown): Promise<{ ok: true }> {
  await td(['task', 'complete', ref(requireId(asObject(params).id)), '--json'])
  return { ok: true }
}

export async function uncomplete(params: unknown): Promise<{ ok: true }> {
  await td(['task', 'uncomplete', ref(requireId(asObject(params).id)), '--json'])
  return { ok: true }
}

export async function remove(params: unknown): Promise<{ ok: true }> {
  await td(['task', 'delete', ref(requireId(asObject(params).id)), '--yes', '--json'])
  return { ok: true }
}

export async function comment(params: unknown): Promise<CommentRow> {
  const p = asObject(params)
  const raw = await td(['comment', 'add', ref(requireId(p.taskId, 'task')), `--content=${requireString(p.content, 'Comment', 15_000)}`, '--json'])
  const row = compactComment(raw)
  if (!row) throw new TdError('BAD_OUTPUT', 'td did not return the comment.')
  return toJson(row)
}

export async function createProject(params: unknown) {
  const p = asObject(params)
  const args = ['project', 'create', `--name=${requireString(p.name, 'Project name', 120)}`, '--json']
  if (typeof p.color === 'string' && /^[a-z_]{2,20}$/.test(p.color)) args.push(`--color=${p.color}`)
  const parentId = optionalId(p.parentId)
  if (parentId) args.push(`--parent=${ref(parentId)}`)
  if (p.favorite === true) args.push('--favorite')
  const row = compactProject(await td(args))
  if (!row) throw new TdError('BAD_OUTPUT', 'td did not return the project.')
  return toJson(row)
}

export async function createSection(params: unknown) {
  const p = asObject(params)
  const raw = await td(['section', 'create', `--name=${requireString(p.name, 'Section name', 120)}`, `--project=${ref(requireId(p.projectId, 'project'))}`, '--json'])
  const row = compactSection(raw)
  if (!row) throw new TdError('BAD_OUTPUT', 'td did not return the section.')
  return toJson(row)
}

export async function createLabel(params: unknown) {
  const p = asObject(params)
  const args = ['label', 'create', `--name=${requireString(p.name, 'Label name', 60).replace(/^@/, '')}`, '--json']
  if (typeof p.color === 'string' && /^[a-z_]{2,20}$/.test(p.color)) args.push(`--color=${p.color}`)
  const row = compactLabel(await td(args))
  if (!row) throw new TdError('BAD_OUTPUT', 'td did not return the label.')
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
