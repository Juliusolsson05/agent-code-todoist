import { memo, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import { dueTone, formatDeadline, formatDue, formatDuration } from '../shared/dates'
import type { ApiPriority, LabelRow, ProjectRow, SectionRow, TaskRow } from '../shared/types'
import { CalendarIcon, ClockIcon, CommentIcon, DeadlineIcon, FlagIcon, InboxIcon, LabelIcon, RecurringIcon, SubtaskIcon } from './Icons'
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

export const TaskItem = memo(function TaskItem({
  task, lookup, now, showProject, focused, completing, depth = 0, childCount = 0,
  onToggle, onOpen, onPatch, onFocus, onOpenUrl,
}: {
  task: TaskRow
  lookup: Lookup
  now: Date
  showProject: boolean
  focused: boolean
  /** Optimistically completed (fading out, undo available). */
  completing: boolean
  depth?: number
  childCount?: number
  onToggle: (task: TaskRow) => void
  onOpen: (task: TaskRow) => void
  onPatch: (task: TaskRow, patch: { due?: string; priority?: ApiPriority }) => void
  onFocus: (task: TaskRow) => void
  onOpenUrl: (url: string) => void
}) {
  const [menu, setMenu] = useState<null | 'due' | 'priority'>(null)
  const dueRef = useRef<HTMLButtonElement>(null)
  const prioRef = useRef<HTMLButtonElement>(null)
  const done = !!task.completedAt || completing
  const tone = dueTone(task.due, now)
  const project = lookup.project(task.projectId)
  const section = lookup.section(task.sectionId)

  return (
    <div
      className={`td-task${focused ? ' is-focused' : ''}${done ? ' is-done' : ''}${completing ? ' is-completing' : ''}`}
      style={depth ? { paddingLeft: 12 + depth * 26 } : undefined}
      data-task-id={task.id}
      role="listitem"
      aria-label={task.content}
      onMouseDown={() => onFocus(task)}
      onClick={event => {
        // Clicks on interactive children (links, buttons) handle themselves.
        if ((event.target as HTMLElement).closest('button, a, input')) return
        onOpen(task)
      }}
    >
      <button
        type="button"
        className={`td-checkbox p${task.priority}`}
        style={{ '--prio': PRIORITY_COLORS[task.priority] } as React.CSSProperties}
        aria-label={done ? 'Reopen task' : 'Complete task'}
        title={done ? 'Reopen' : 'Complete'}
        onClick={() => onToggle(task)}
      >
        <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.6 8.3 2.3 2.3 4.6-4.9" /></svg>
      </button>

      <div className="td-task-main">
        <div className="td-task-title">{renderInline(task.content, onOpenUrl, task.id)}</div>
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

      {!done && (
        <div className="td-task-actions">
          <button ref={dueRef} type="button" className="td-icon-btn" title="Schedule (t = today)" onClick={() => setMenu('due')}>
            <CalendarIcon />
          </button>
          <button ref={prioRef} type="button" className="td-icon-btn" title="Priority (1–4)" onClick={() => setMenu('priority')}>
            <FlagIcon />
          </button>
        </div>
      )}

      {menu === 'due' && (
        <DuePicker anchor={dueRef.current} current={task.due?.string} onPick={due => onPatch(task, { due })} onClose={() => setMenu(null)} />
      )}
      {menu === 'priority' && (
        <PriorityPicker anchor={prioRef.current} current={task.priority} onPick={priority => onPatch(task, { priority })} onClose={() => setMenu(null)} />
      )}
    </div>
  )
})
