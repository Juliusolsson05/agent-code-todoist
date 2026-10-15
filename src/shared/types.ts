// The wire model shared by the service (Node), the runtime frame and the view
// frames.
//
// WHY our own compact Row types instead of passing td's JSON through: every hop
// (service → runtime → view) crosses Agent Code's bounded JSON bridge — at most
// 4096 JSON values and 128 Ki characters per message. A full SDK Task is ~35
// values; a busy Today view of 150 tasks would blow the value budget and the call
// would REJECT, not truncate. Rows keep only what the UI paints (~15 values), so
// a page of ~230 tasks fits, and budget.ts trims the rest with a cursor.
//
// Source of truth for field meaning is @doist/todoist-sdk 15.3.1's zod schemas
// (TaskSchema etc.), which are exactly what `td --json --full` serialises. The
// mapping lives in server/compact.ts and is pinned by tests/compact.test.mjs.
//
// Everything here must stay JSON-only (no Date, no undefined in arrays): these
// objects are the bridge payloads themselves.

/** Todoist API priority: 4 = p1 (urgent, red) … 1 = p4 (none). Kept in API
 *  numbering end to end; only the UI translates to "p1". Inverting this at any
 *  one hop silently turns every urgent task into a no-priority one. */
export type ApiPriority = 1 | 2 | 3 | 4

export type DueRow = {
  /** YYYY-MM-DD, always present. */
  date: string
  /** Full ISO datetime when the task has a time, else null. */
  datetime: string | null
  /** Todoist's human text, e.g. "every mon at 9". */
  string: string
  recurring: boolean
}

export type TaskRow = {
  id: string
  content: string
  description: string
  priority: ApiPriority
  due: DueRow | null
  /** Deadline date (YYYY-MM-DD) or null. */
  deadline: string | null
  duration: { amount: number; unit: 'minute' | 'day' } | null
  projectId: string
  sectionId: string | null
  parentId: string | null
  labels: string[]
  /** childOrder from Todoist: the manual order inside a project/section. */
  order: number
  /** Comment count when td reports one, else 0. td 5.4.10 never does: the SDK's
   *  TaskSchema strips `noteCount`, so the UI must not read 0 as "no comments"
   *  (the detail drawer always loads the real list). Kept for a future td. */
  commentCount: number
  /** ISO timestamp for completed tasks, else null. */
  completedAt: string | null
  url: string
}

export type ProjectRow = {
  id: string
  name: string
  color: string
  parentId: string | null
  order: number
  isFavorite: boolean
  isInbox: boolean
  isShared: boolean
  viewStyle: string
  url: string
}

export type SectionRow = { id: string; projectId: string; name: string; order: number }
export type LabelRow = { id: string; name: string; color: string; isFavorite: boolean; order: number }
export type FilterRow = { id: string; name: string; query: string; color: string; isFavorite: boolean }

export type CommentRow = {
  id: string
  content: string
  postedAt: string
  /** Attachment name when the comment carries a file. */
  attachment: { name: string; url: string; type: string } | null
}

export type UserRow = { id: string; email: string; fullName: string; readOnly: boolean }

export type Meta = {
  projects: ProjectRow[]
  /** Always empty from the service (td cannot list sections account-wide);
   *  views merge in per-project results from the `sections` call. */
  sections: SectionRow[]
  labels: LabelRow[]
  filters: FilterRow[]
  user: UserRow | null
}

export type ListKind = 'today' | 'upcoming' | 'inbox' | 'project' | 'label' | 'filter' | 'search' | 'completed'

export type ListQuery = {
  kind: ListKind
  /** project/label/filter id for those kinds. */
  id?: string
  /** search text (kind 'search') or raw Todoist filter query (kind 'filter' without id). */
  query?: string
  cursor?: string | null
}

export type TaskPage = {
  tasks: TaskRow[]
  nextCursor: string | null
  /** True when the page was cut to fit the bridge budget; nextCursor then
   *  resumes AFTER the last task we kept (see budget.ts). */
  truncated: boolean
}

export type TaskDetail = { task: TaskRow; children: TaskRow[]; comments: CommentRow[] }

/** Fields accepted by add/update. Strings are passed to td verbatim; `due` is
 *  Todoist natural language ("tomorrow 3pm", "every monday"). Empty string on
 *  update means "clear" for due/deadline/duration/labels. */
export type TaskDraft = {
  content: string
  description?: string
  due?: string
  deadline?: string
  duration?: string
  priority?: ApiPriority
  projectId?: string
  sectionId?: string
  parentId?: string
  labels?: string[]
}

export type TaskPatch = Partial<Omit<TaskDraft, 'projectId' | 'sectionId' | 'parentId'>>

// ---------------------------------------------------------------------------
// Setup: the two prerequisites (td installed, signed in) and the long jobs that
// satisfy them. Jobs exist because the host kills a service whose invoke runs
// past 30 s — a browser OAuth login or a brew install can take minutes, so they
// run detached and the UI polls `status`.

export type JobKind = 'login' | 'install'

export type JobStatus = {
  kind: JobKind
  state: 'running' | 'succeeded' | 'failed'
  startedAt: number
  /** Login: the OAuth URL once td printed it, so the user can re-open it. */
  authorizeUrl: string | null
  /** Last line(s) of output, for the failure message. */
  detail: string | null
}

export type SetupState = 'td-missing' | 'signed-out' | 'ready' | 'error'

export type SetupStatus = {
  state: SetupState
  td: { path: string; version: string; node: string | null } | null
  /** Where we looked, for the "td not found" screen. */
  searched: string[]
  /** Homebrew binary when available — enables the one-click install. */
  brew: string | null
  user: UserRow | null
  job: JobStatus | null
  error: string | null
  checkedAt: number
}

export type Settings = {
  tdPath: string
  defaultView: 'today' | 'upcoming' | 'inbox'
  dueReminders: boolean
  reminderIntervalMinutes: number
  /** false (default): Todoist's own look — its colours, light or dark following
   *  Agent Code, its font and logo. true: Agent Code's theme tokens. */
  inheritTheme: boolean
}

/** Published by the runtime to every view. Views refetch their data whenever
 *  `revision` changes; it is bumped after every successful mutation from ANY
 *  view, which is how a quick-add in the modal shows up in the open panel. */
export type HostState = {
  revision: number
  setup: SetupStatus | null
  settings: Settings
}

/** An agent session the quick-add can link to (current tab first). */
export type AgentLink = {
  id: string
  title: string
  cwd: string
  kind: string | null
  inActiveTab: boolean
  working: boolean
}

/** Errors cross the bridge as `Error.message`; this prefix grammar lets the
 *  runtime/view branch without parsing prose. */
export type TdErrorCode =
  | 'TD_NOT_FOUND'
  | 'NO_TOKEN'
  | 'AUTH'
  | 'TIMEOUT'
  | 'TD_FAILED'
  | 'BAD_OUTPUT'
  | 'INVALID'
  | 'BUSY'

export function tdErrorCode(error: unknown): TdErrorCode | null {
  const message = error instanceof Error ? error.message : String(error ?? '')
  const match = /\b(TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):/.exec(message)
  return match ? (match[1] as TdErrorCode) : null
}

/** The human part of a bridged error, without the code prefix or the host's
 *  own wrapping ("Error invoking …: "). */
export function tdErrorMessage(error: unknown): string {
  const message = error instanceof Error ? error.message : String(error ?? 'Unknown error')
  const match = /\b(?:TD_NOT_FOUND|NO_TOKEN|AUTH|TIMEOUT|TD_FAILED|BAD_OUTPUT|INVALID|BUSY):\s*(.*)$/s.exec(message)
  return (match ? match[1] : message).trim() || 'Unknown error'
}
