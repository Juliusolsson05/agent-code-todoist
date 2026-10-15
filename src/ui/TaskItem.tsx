import { memo, useLayoutEffect, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import { dueTone, formatDeadline, formatDue, formatDuration } from '../shared/dates'
import type { ApiPriority, LabelRow, ProjectRow, SectionRow, TaskRow } from '../shared/types'
import { CalendarIcon, ClockIcon, CommentIcon, DeadlineIcon, FlagIcon, InboxIcon, LabelIcon, RecurringIcon, SubtaskIcon, TrashIcon } from './Icons'
import { renderInline } from './markdown'
import { DuePicker, PriorityPicker } from './pickers'

// One task row.
//
// Layout follows Todoist's own list row because users read it at a glance:
// round checkbox tinted by priority on the left, title, then a quiet metadata
// line (due · deadline · duration · labels · project). Hover reveals the two
// actions people do most from a list — reschedule and change priority — so the
// drawer is only needed for real edits.

export type Lookup = {
  project(id: string): ProjectRow | undefined
  section(id: string | null): SectionRow | undefined
  label(name: string): LabelRow | undefined
}

/** One object of row callbacks, created once per workspace (useMemo with
 *  stable deps). Passing inline arrows per row defeated `memo` and made every
 *  j/k render all N rows (evaluator 1: 3,000 row renders for 10 key presses
 *  on 300 tasks; with stable callbacks, 19). */
export type RowActions = {
  toggle: (task: TaskRow) => void
  open: (task: TaskRow) => void
  focus: (task: TaskRow) => void
  patch: (task: TaskRow, patch: { due?: string; priority?: ApiPriority }) => void
  /** Absent for read-only accounts. */
  remove?: (task: TaskRow) => void
  openUrl: (url: string) => void
}

export const TaskItem = memo(function TaskItem({
  task, lookup, now, showProject, focused, phase, pending, depth = 0, childCount = 0, actions,
}: {
  task: TaskRow
  lookup: Lookup
  now: Date
  showProject: boolean
  focused: boolean
  /** Completion animation: 'checked' (check + strike), then 'collapsing'. */
  phase?: 'checked' | 'collapsing'
  /** Not confirmed by Todoist yet (a quick-add row, an edit in flight). */
  pending: boolean
  depth?: number
  childCount?: number
  actions: RowActions
}) {
  const [menu, setMenu] = useState<null | 'due' | 'priority'>(null)
  const dueRef = useRef<HTMLButtonElement>(null)
  const prioRef = useRef<HTMLButtonElement>(null)
  const rowRef = useRef<HTMLDivElement>(null)
  const done = !!task.completedAt || !!phase
  const isPendingRow = task.id.startsWith('pending-')
  // The collapse animates from the row's real height (CSS cannot animate
  // height: auto). Measured once, when collapsing starts.
  useLayoutEffect(() => {
    if (phase === 'collapsing' && rowRef.current) rowRef.current.style.setProperty('--row-h', `${rowRef.current.offsetHeight}px`)
  }, [phase])
  const tone = dueTone(task.due, now)
  const project = lookup.project(task.projectId)
  const section = lookup.section(task.sectionId)

  return (
    <div
      ref={rowRef}
      className={`td-task${focused ? ' is-focused' : ''}${done ? ' is-done' : ''}${phase ? ` is-${phase}` : ''}${pending || isPendingRow ? ' is-pending' : ''}`}
      style={depth ? { paddingLeft: 12 + depth * 26 } : undefined}
      data-task-id={task.id}
      role="listitem"
      aria-label={task.content}
      onMouseDown={() => !isPendingRow && actions.focus(task)}
      onClick={event => {
        // Clicks on interactive children (links, buttons) handle themselves.
        if (isPendingRow || (event.target as HTMLElement).closest('button, a, input')) return
        actions.open(task)
      }}
    >
      <button
        type="button"
        className={`td-checkbox p${task.priority}`}
        style={{ '--prio': PRIORITY_COLORS[task.priority] } as React.CSSProperties}
        aria-label={done ? 'Reopen task' : 'Complete task'}
        title={done ? 'Reopen' : 'Complete'}
        disabled={isPendingRow}
        onClick={() => actions.toggle(task)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.6 8.3 2.3 2.3 4.6-4.9" /></svg>
      </button>

      <div className="td-task-main">
        <div className="td-task-title">{renderInline(task.content, actions.openUrl, task.id)}</div>
        {task.description && !done && <div className="td-task-desc">{task.description.split('\n')[0]}</div>}
        <div className="td-task-meta">
          {task.due && (
            <span className={`td-chip td-due tone-${tone}`} title={task.due.string}>
              {task.due.recurring ? <RecurringIcon size={12} /> : <CalendarIcon size={12} />}
              {formatDue(task.due, now)}
            </span>
          )}
          {task.deadline && (
            <span className="td-chip td-deadline" title="Deadline">
              <DeadlineIcon size={12} />{formatDeadline(task.deadline, now)}
            </span>
          )}
          {task.duration && (
            <span className="td-chip" title="Duration"><ClockIcon size={12} />{formatDuration(task.duration)}</span>
          )}
          {childCount > 0 && (
            <span className="td-chip" title="Subtasks"><SubtaskIcon size={12} />{childCount}</span>
          )}
          {task.commentCount > 0 && (
            <span className="td-chip" title="Comments"><CommentIcon size={12} />{task.commentCount}</span>
          )}
          {task.labels.map(name => (
            <span key={name} className="td-chip td-label" style={{ color: colorHex(lookup.label(name)?.color) }}>
              <LabelIcon size={12} />{name}
            </span>
          ))}
          {task.completedAt && (
            <span className="td-chip">Completed {new Date(task.completedAt).toLocaleTimeString(undefined, { hour: 'numeric', minute: '2-digit' })}</span>
          )}
          {showProject && project && (
            <span className="td-chip td-project-chip">
              {project.isInbox ? <InboxIcon size={12} /> : <span className="td-dot sm" style={{ background: colorHex(project.color) }} />}
              {project.name}{section ? <span className="td-dim"> / {section.name}</span> : null}
            </span>
          )}
        </div>
      </div>

      {!done && !isPendingRow && (
        <div className="td-task-actions">
          <button ref={dueRef} type="button" className="td-icon-btn" title="Schedule (t = today)" onClick={() => setMenu('due')}>
            <CalendarIcon />
          </button>
          <button ref={prioRef} type="button" className="td-icon-btn" title="Priority (1–4)" onClick={() => setMenu('priority')}>
            <FlagIcon />
          </button>
          {actions.remove && (
            <button type="button" className="td-icon-btn danger" title="Delete (⌫)" onClick={() => actions.remove!(task)}>
              <TrashIcon />
            </button>
          )}
        </div>
      )}

      {menu === 'due' && (
        <DuePicker anchor={dueRef.current} current={task.due?.string} onPick={due => actions.patch(task, { due })} onClose={() => setMenu(null)} />
      )}
      {menu === 'priority' && (
        <PriorityPicker anchor={prioRef.current} current={task.priority} onPick={priority => actions.patch(task, { priority })} onClose={() => setMenu(null)} />
      )}
    </div>
  )
})
