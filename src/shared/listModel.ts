import { localDayIndex, parseLocalDate } from './dates'
import type { Change, ListQuery, TaskRow } from './types'

// Which tasks belong in which list, decided locally.
//
// WHY: the change feed (types.ts `Change`) tells every view what Todoist
// answered after a mutation. To apply it without a refetch, a view must know
// whether the changed task still belongs in the list it shows: a task
// rescheduled to next week leaves Today, a task moved to another project
// leaves this one, a quick-added task due today joins Today. These predicates
// mirror the server queries the service sends (server/handlers.ts TODAY_QUERY,
// UPCOMING_QUERY, projectId/label params). Saved filters and search use
// Todoist's full query language, which we do not re-implement: for them the
// answer is 'unknown' and the view keeps the row (updated in place) and
// revalidates in the background.
//
// Shared by the views (src/ui/store.ts) and the runtime's list cache.

export type Membership = 'in' | 'out' | 'unknown'

export type QueryContext = {
  now: Date
  /** The Inbox project id, when known (from meta). */
  inboxId?: string | null
  /** Who "me" is for assigned-to filters. */
  userId?: string | null
}

/** Stable key for a list query — the cache key everywhere. */
export function queryKey(query: ListQuery): string {
  return `${query.kind}:${query.id ?? ''}:${query.query ?? ''}`
}

function assignedToMeOrNobody(task: TaskRow & { responsibleUid?: string | null }, ctx: QueryContext): boolean {
  const responsible = (task as { responsibleUid?: string | null }).responsibleUid
  return !responsible || !ctx.userId || responsible === ctx.userId
}

export function membership(query: ListQuery, task: TaskRow, ctx: QueryContext): Membership {
  if (query.kind === 'completed') return task.completedAt ? 'in' : 'out'
  if (task.completedAt) return 'out'
  switch (query.kind) {
    case 'today': {
      if (!task.due || !assignedToMeOrNobody(task, ctx)) return 'out'
      return localDayIndex(parseLocalDate(task.due.date)) <= localDayIndex(ctx.now) ? 'in' : 'out'
    }
    case 'upcoming': {
      // "due before: 14 days" — overdue included, day 14 excluded.
      if (!task.due || !assignedToMeOrNobody(task, ctx)) return 'out'
      return localDayIndex(parseLocalDate(task.due.date)) < localDayIndex(ctx.now) + 14 ? 'in' : 'out'
    }
    case 'inbox':
      if (!ctx.inboxId) return 'unknown'
      return task.projectId === ctx.inboxId ? 'in' : 'out'
    case 'project':
      return task.projectId === query.id ? 'in' : 'out'
    case 'label':
      return task.labels.includes(query.query ?? '') ? 'in' : 'out'
    default:
      return 'unknown'
  }
}

/** A list's ids after one change. Pure; the order of existing ids is kept
 *  (views sort for display), a joining task is appended. */
export function applyChangeToIds(ids: string[], query: ListQuery, change: Change, ctx: QueryContext, parentOf?: (id: string) => string | null): string[] {
  if (change.kind === 'meta' || change.kind === 'comment') return ids
  if (change.kind === 'remove') {
    if (query.kind === 'completed' && change.reason === 'completed' && change.task) {
      return ids.includes(change.id) ? ids : [change.id, ...ids]
    }
    // Deleting a task deletes its whole subtree in Todoist.
    const doomed = new Set([change.id])
    if (change.reason === 'deleted' && parentOf) {
      for (let grew = true; grew;) {
        grew = false
        for (const id of ids) {
          const parent = parentOf(id)
          if (parent && doomed.has(parent) && !doomed.has(id)) { doomed.add(id); grew = true }
        }
      }
    }
    return ids.filter(id => !doomed.has(id))
  }
  const has = ids.includes(change.task.id)
  const verdict = membership(query, change.task, ctx)
  if (verdict === 'out') return has ? ids.filter(id => id !== change.task.id) : ids
  if (verdict === 'in' && !has) return [...ids, change.task.id]
  return ids
}
