import type { TaskPage, TaskRow } from './types'

// Fitting replies through Agent Code's bounded JSON bridge.
//
// The host validates every runtime/view message: at most 4096 JSON values, depth
// 32, 128 Ki characters (docs/extensions/authoring.md §2; enforced in
// agent-code src/shared/types/extensionJson.ts). An over-budget message is
// REJECTED, so a large Today view would surface as a failed request rather than a
// short list. We therefore measure with the same notion of "value" (every
// primitive, array and object counts once) and trim BEFORE sending.
//
// Headroom: the envelope around our payload (request id, wrapper object, the
// runtime's own re-wrapping when it forwards a service reply to a view) costs a
// handful of values and a few hundred characters. 3500 / 110 000 leaves a wide
// margin without wasting much page.

export const HOST_MAX_VALUES = 4096
export const HOST_MAX_CHARS = 128 * 1024
export const PAGE_MAX_VALUES = 3500
export const PAGE_MAX_CHARS = 110_000

/** Count JSON values the way the host does: one per primitive, array, object. */
export function countJsonValues(value: unknown): number {
  if (value === null || typeof value !== 'object') return 1
  let count = 1
  if (Array.isArray(value)) {
    for (const item of value) count += countJsonValues(item)
  } else {
    for (const item of Object.values(value as Record<string, unknown>)) {
      if (item !== undefined) count += countJsonValues(item)
    }
  }
  return count
}

/**
 * Trim a task list to the bridge budget.
 *
 * Returns the tasks that fit plus `truncated`. The caller keeps td's own
 * `nextCursor` when nothing was cut; when we cut, the cursor is no longer
 * meaningful (td's cursor points after the LAST task it returned, not after the
 * last one we kept), so the service re-requests with a smaller `--limit` instead
 * of handing out a cursor that would skip tasks. See server/handlers.ts:list.
 */
export function fitTasks(tasks: TaskRow[], maxValues = PAGE_MAX_VALUES, maxChars = PAGE_MAX_CHARS): { tasks: TaskRow[]; truncated: boolean } {
  let values = 8 // page wrapper: {tasks, nextCursor, truncated} + slack
  let chars = 64
  const kept: TaskRow[] = []
  for (const task of tasks) {
    const taskValues = countJsonValues(task)
    const taskChars = JSON.stringify(task).length + 1
    if (values + taskValues > maxValues || chars + taskChars > maxChars) {
      return { tasks: kept, truncated: true }
    }
    values += taskValues
    chars += taskChars
    kept.push(task)
  }
  return { tasks: kept, truncated: false }
}

export function pageOf(tasks: TaskRow[], nextCursor: string | null): TaskPage {
  const fitted = fitTasks(tasks)
  return { tasks: fitted.tasks, nextCursor: fitted.truncated ? null : nextCursor, truncated: fitted.truncated }
}

/**
 * Make a value bridge-legal: drop `undefined`, turn Dates into ISO strings.
 *
 * WHY: the host's validator (agent-code src/shared/types/extensionJson.ts
 * `isExtensionJson`) walks the structured-clone, where an `undefined` property
 * SURVIVES the clone and is then rejected as "not JSON" — the whole reply fails
 * with "Invalid arguments". An optional field left as `undefined` anywhere in a
 * nested row is enough. Round-tripping through JSON at every boundary we own is
 * the cheap, total fix (payloads are already budgeted to ~110 KB).
 */
export function toJson<T>(value: T): T {
  return value === undefined ? (null as T) : (JSON.parse(JSON.stringify(value)) as T)
}

/** Long descriptions are the one field that can make a single task huge (people
 *  paste logs into Todoist). Lists only need a preview; the detail drawer
 *  fetches the task on its own and gets a larger slice. */
export const LIST_DESCRIPTION_CHARS = 280
export const DETAIL_DESCRIPTION_CHARS = 16_000
export const COMMENT_CHARS = 4_000
