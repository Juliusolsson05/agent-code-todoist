import { COMMENT_CHARS, LIST_DESCRIPTION_CHARS } from '../src/shared/budget'
import type {
  ApiPriority,
  CommentRow,
  DueRow,
  FilterRow,
  LabelRow,
  ProjectRow,
  SectionRow,
  TaskRow,
  UserRow,
} from '../src/shared/types'

// @doist/todoist-sdk entities → the compact Row types the bridge carries.
//
// Input shape = @doist/todoist-sdk 15.3.1 entities after JSON serialisation
// (camelCase; Date fields become ISO strings) — exactly what td `--json --full`
// printed, and what server/handlers.ts call() produces from the SDK client. tests/compact.test.mjs builds its
// inputs by running the SDK's OWN test defaults through the SDK's zod schemas
// and JSON.stringify, i.e. byte-for-byte what td prints.
//
// Every reader is defensive (`str`, `num`, …) because td is a separately updated
// binary: a renamed or missing field in a future td must degrade one cell of the
// UI, never throw and blank the whole list.

type Raw = Record<string, unknown>

const str = (value: unknown, fallback = ''): string => (typeof value === 'string' ? value : fallback)
const strOrNull = (value: unknown): string | null => (typeof value === 'string' && value ? value : null)
const num = (value: unknown, fallback = 0): number => (typeof value === 'number' && Number.isFinite(value) ? value : fallback)
const bool = (value: unknown): boolean => value === true
const isObj = (value: unknown): value is Raw => !!value && typeof value === 'object' && !Array.isArray(value)

function clip(text: string, max: number): string {
  return text.length > max ? `${text.slice(0, max - 1)}…` : text
}

export function compactDue(raw: unknown): DueRow | null {
  if (!isObj(raw)) return null
  const date = str(raw.date)
  if (!date) return null
  // The SDK types `date` as "YYYY-MM-DD" but its own defaults put a full ISO
  // timestamp there, and the API does the same for timed tasks on some paths.
  // Normalise: date is always the calendar day; a time, wherever it came from,
  // goes to datetime.
  const datetime = strOrNull(raw.datetime) ?? (date.length > 10 && date.includes('T') ? date : null)
  return {
    date: date.slice(0, 10),
    datetime,
    string: str(raw.string),
    recurring: bool(raw.isRecurring),
  }
}

export function compactTask(raw: unknown, descriptionChars = LIST_DESCRIPTION_CHARS): TaskRow | null {
  if (!isObj(raw)) return null
  const id = str(raw.id)
  if (!id) return null
  const priority = Math.min(4, Math.max(1, Math.round(num(raw.priority, 1)))) as ApiPriority
  const duration = isObj(raw.duration) && (raw.duration.unit === 'minute' || raw.duration.unit === 'day')
    ? { amount: num(raw.duration.amount), unit: raw.duration.unit as 'minute' | 'day' }
    : null
  return {
    id,
    content: str(raw.content),
    description: clip(str(raw.description), descriptionChars),
    priority,
    due: compactDue(raw.due),
    deadline: isObj(raw.deadline) ? strOrNull(raw.deadline.date) : null,
    duration,
    projectId: str(raw.projectId),
    sectionId: strOrNull(raw.sectionId),
    parentId: strOrNull(raw.parentId),
    labels: Array.isArray(raw.labels) ? raw.labels.filter((l): l is string => typeof l === 'string') : [],
    order: num(raw.childOrder, num(raw.order)),
    commentCount: num(raw.noteCount, num(raw.commentCount)),
    completedAt: strOrNull(raw.completedAt),
    url: str(raw.url) || `https://app.todoist.com/app/task/${encodeURIComponent(id)}`,
  }
}

export function compactProject(raw: unknown): ProjectRow | null {
  if (!isObj(raw) || !str(raw.id)) return null
  return {
    id: str(raw.id),
    name: str(raw.name, 'Untitled'),
    color: str(raw.color, 'charcoal'),
    parentId: strOrNull(raw.parentId),
    order: num(raw.childOrder),
    isFavorite: bool(raw.isFavorite),
    isInbox: bool(raw.inboxProject),
    isShared: bool(raw.isShared),
    viewStyle: str(raw.viewStyle, 'list'),
    url: str(raw.url) || `https://app.todoist.com/app/project/${encodeURIComponent(str(raw.id))}`,
  }
}

export function compactSection(raw: unknown): SectionRow | null {
  if (!isObj(raw) || !str(raw.id)) return null
  return { id: str(raw.id), projectId: str(raw.projectId), name: str(raw.name), order: num(raw.sectionOrder) }
}

export function compactLabel(raw: unknown): LabelRow | null {
  if (!isObj(raw) || !str(raw.name)) return null
  return { id: str(raw.id, str(raw.name)), name: str(raw.name), color: str(raw.color, 'charcoal'), isFavorite: bool(raw.isFavorite), order: num(raw.order) }
}

export function compactFilter(raw: unknown): FilterRow | null {
  if (!isObj(raw) || !str(raw.id)) return null
  return { id: str(raw.id), name: str(raw.name), query: str(raw.query), color: str(raw.color, 'charcoal'), isFavorite: bool(raw.isFavorite) }
}

export function compactComment(raw: unknown): CommentRow | null {
  if (!isObj(raw) || !str(raw.id)) return null
  const file = isObj(raw.fileAttachment) ? raw.fileAttachment : null
  return {
    id: str(raw.id),
    content: clip(str(raw.content), COMMENT_CHARS),
    postedAt: str(raw.postedAt),
    attachment: file
      ? { name: str(file.fileName, 'attachment'), url: str(file.fileUrl, str(file.url)), type: str(file.fileType, str(file.resourceType)) }
      : null,
  }
}

/** `td auth status --json`: {id, email, fullName, authMode, authScope, …}. */
export function compactUser(raw: unknown): UserRow | null {
  if (!isObj(raw) || !str(raw.id)) return null
  const mode = str(raw.authMode)
  return {
    id: str(raw.id),
    email: str(raw.email),
    fullName: str(raw.fullName),
    readOnly: mode === 'read-only' || /^data:read$/.test(str(raw.authScope)),
  }
}

/** Lists come as `{results, nextCursor}`; some older td commands print a bare
 *  array. Accept both so a td that changes its envelope degrades gracefully. */
export function resultsOf(raw: unknown): { results: unknown[]; nextCursor: string | null } {
  if (Array.isArray(raw)) return { results: raw, nextCursor: null }
  if (isObj(raw) && Array.isArray(raw.results)) return { results: raw.results, nextCursor: strOrNull(raw.nextCursor) }
  return { results: [], nextCursor: null }
}

export function compactAll<T>(items: unknown[], fn: (item: unknown) => T | null): T[] {
  const out: T[] = []
  for (const item of items) {
    const row = fn(item)
    if (row) out.push(row)
  }
  return out
}
