import type { ApiPriority, TaskPatch, TaskRow } from './types'

// What still has to happen after Todoist's quick-add parser created a task,
// decided from the task it RETURNED — never from our highlighter.
//
// WHY: the first version appended syntax to the typed line (" today",
// " @label", " tomorrow p1") and used the hint tokenizer to decide whether to
// move the task into the current project. Review of PR #2 showed both fail on
// ordinary input:
// - Todoist's " // description" must come last, so "Fix login // see logs"
//   + " today" became the description "see logs today": no date, the task
//   missing from Today, and a green "Added" toast.
// - "Fix #123 crash" tokenizes "#123" as a project, so the move was skipped and
//   the task landed in Inbox; the parser keeps an unmatched "#123" as text.
// - " @\"waiting on\"" is not Todoist syntax at all (spaces are escaped "\ ").
// Only the server knows what it parsed, and it tells us in the returned row.
// So the raw line goes to Todoist untouched, and what the view or the pickers
// want is applied with structured `update` / `move` calls where the parser did
// not already do it. That costs one extra td call in those cases and removes
// every way of corrupting the text.

export type QuickAddIntent = {
  /** Where the task should land: the open project, or the modal's picker. */
  projectId?: string | null
  sectionId?: string | null
  /** The Inbox id: a task the parser did not route lands there. */
  inboxId?: string | null
  /** Due string to apply when the parser found no date (Today view, picker). */
  due?: string | null
  /** Priority to apply when the parser left the default (picker). */
  priority?: ApiPriority
  /** Labels that must be on the task (label view, picker). */
  labels?: string[]
  /** A line appended to the description (the modal's agent link). */
  note?: string | null
}

export type FollowUps = {
  update: TaskPatch | null
  move: { projectId?: string; sectionId?: string } | null
  /** Plain words for what follow-ups do, for a partial-failure message. */
  steps: string[]
}

export function planFollowUps(created: TaskRow, intent: QuickAddIntent): FollowUps {
  const update: TaskPatch = {}
  const steps: string[] = []

  if (intent.due && !created.due) {
    update.due = intent.due
    steps.push(`schedule it for ${intent.due}`)
  }
  // Priority 1 is the API default ("p4"): if the typed line set p1–p3 the
  // parser already applied it and the picker must not override what was typed.
  if (intent.priority && intent.priority > 1 && created.priority === 1) {
    update.priority = intent.priority
    steps.push(`set priority P${5 - intent.priority}`)
  }
  const missing = (intent.labels ?? []).filter(label => !created.labels.includes(label))
  if (missing.length) {
    update.labels = [...created.labels, ...missing]
    steps.push(`add ${missing.map(l => `@${l}`).join(', ')}`)
  }
  if (intent.note) {
    update.description = created.description ? `${created.description}\n\n${intent.note}` : intent.note
    steps.push('link the agent')
  }

  let move: FollowUps['move'] = null
  if (intent.projectId) {
    if (created.projectId === intent.projectId) {
      if (intent.sectionId && created.sectionId !== intent.sectionId) move = { sectionId: intent.sectionId }
    } else if (!intent.inboxId || created.projectId === intent.inboxId) {
      // The parser did not route it (no #project typed, or one that matched
      // nothing): put it where the user is looking. A #project the parser DID
      // match lands elsewhere than Inbox and is left alone — typed wins.
      move = intent.sectionId ? { sectionId: intent.sectionId } : { projectId: intent.projectId }
    }
    if (move) steps.push('move it to the chosen project')
  }

  return { update: Object.keys(update).length ? update : null, move, steps }
}

/** Run the follow-ups. Throws a PartialAdd when the task exists but a
 *  follow-up failed, so callers never retry the quick add itself (which would
 *  create a duplicate — review of PR #2). */
export class PartialAdd extends Error {
  constructor(readonly created: TaskRow, readonly steps: string[], readonly cause: unknown) {
    super(`Added “${created.content}”, but could not ${steps.join(' and ')}.`)
  }
}

export async function applyFollowUps(
  created: TaskRow,
  plan: FollowUps,
  call: {
    update: (input: { id: string } & TaskPatch) => Promise<unknown>
    move: (input: { id: string; projectId?: string; sectionId?: string }) => Promise<unknown>
  },
): Promise<void> {
  try {
    if (plan.update) await call.update({ id: created.id, ...plan.update })
    if (plan.move) await call.move({ id: created.id, ...plan.move })
  } catch (error) {
    throw new PartialAdd(created, plan.steps, error)
  }
}
