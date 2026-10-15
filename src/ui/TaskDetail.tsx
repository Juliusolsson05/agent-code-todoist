import { useEffect, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import { dueTone, formatDue, formatDuration } from '../shared/dates'
import type { ApiPriority, Meta, TaskPatch, TaskRow } from '../shared/types'
import { tdErrorMessage } from '../shared/types'
import { useBridge } from './bridge'
import {
  CalendarIcon, ClockIcon, CloseIcon, CommentIcon, DeadlineIcon, ExternalIcon, FlagFilledIcon,
  InboxIcon, LabelIcon, MoveIcon, PlusIcon, RecurringIcon, SubtaskIcon, TrashIcon,
} from './Icons'
import { MarkdownBlock, renderInline } from './markdown'
import { DuePicker, LabelPicker, PriorityPicker, ProjectPicker } from './pickers'
import { useStore } from './store'
import type { TaskActions } from './useTaskActions'
import { useTaskDetail } from './useWorkspaceData'

// The task view — Todoist's task modal, not a side drawer.
//
// WHY a modal over the list (snappiness evaluation, evaluators 2/4/6): the
// drawer squeezed the list from 932 to 492 px in one frame (every title
// rewrapped), opened on a grey skeleton for 0.3–1 s although the row already
// had the task, and was remounted for every j/k (skeleton + slide replayed).
// Todoist's web app opens a task as a dialog over the list. So:
// - It renders at once from the task in the store (the row's data, with any
//   pending edit); sub-tasks and comments load into place behind it.
// - It is NOT keyed by task: moving between tasks swaps content in place.
// - Every edit goes through the same optimistic actions as the list, so the
//   row behind and the modal always agree.
// - The title/description editors hold a draft; switching task or closing
//   saves it (beta.4 review: a description draft was lost on switch).

const DURATIONS = ['15m', '30m', '45m', '1h', '1h30m', '2h', '3h', '4h']

export function TaskDetailPanel({ taskId, meta, now, actions, readOnly, onClose, onOpenTask, onDelete, onOpenUrl, onCreateLabel, onNeedSections, onError }: {
  taskId: string
  meta: Meta
  now: Date
  actions: TaskActions
  readOnly: boolean
  onClose: () => void
  onOpenTask: (id: string) => void
  onDelete: (task: TaskRow) => void
  onOpenUrl: (url: string) => void
  onCreateLabel: (name: string) => Promise<void>
  onNeedSections: (projectId: string) => void
  onError: (message: string) => void
}) {
  const bridge = useBridge()
  const s = useStore()
  const { loading } = useTaskDetail(bridge, taskId, onError)
  const task = s.task(taskId) ?? s.detail(taskId)?.task
  const detail = s.detail(taskId)
  const [editing, setEditingState] = useState<null | 'title' | 'description'>(null)
  const [draft, setDraftState] = useState('')
  const [menu, setMenu] = useState<null | 'due' | 'priority' | 'labels' | 'project'>(null)
  const [comment, setComment] = useState('')
  const [subtask, setSubtask] = useState('')
  const anchors = { due: useRef<HTMLButtonElement>(null), priority: useRef<HTMLButtonElement>(null), labels: useRef<HTMLButtonElement>(null), project: useRef<HTMLButtonElement>(null) }
  // Synchronous mirrors: Enter's blur and the switch/close save both run
  // before React re-renders the state.
  const editingRef = useRef<null | 'title' | 'description'>(null)
  const draftRef = useRef('')
  const taskRef = useRef<TaskRow | undefined>(task)
  taskRef.current = task
  const setEditing = (value: null | 'title' | 'description') => { editingRef.current = value; setEditingState(value) }
  const setDraft = (value: string) => { draftRef.current = value; setDraftState(value) }

  const save = (patch: TaskPatch) => {
    const current = taskRef.current
    if (current) void actions.update(current, patch).catch(() => {})
  }

  // Switching task (j/k, a sub-task, the parent link) or closing: save an open
  // editor's draft for the task it belongs to, then reset per-task UI.
  useEffect(() => () => {
    const field = editingRef.current
    const current = taskRef.current
    if (field && current) {
      const change = draftChange(field, draftRef.current, current)
      if (change) void actions.update(current, change).catch(() => {})
    }
    editingRef.current = null
    setEditingState(null)
    setMenu(null)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const projectOfTask = task?.projectId
  useEffect(() => { if (projectOfTask) onNeedSections(projectOfTask) }, [projectOfTask, onNeedSections])

  if (!task) {
    return (
      <Shell onClose={onClose}>
        <div className="td-task-modal-head"><span className="td-skel" style={{ width: 120 }} /><button className="td-icon-btn" onClick={onClose} title="Close (Esc)"><CloseIcon /></button></div>
        <div className="td-task-modal-body"><div className="td-task-modal-main">
          <div className="td-skel" style={{ width: '80%', height: 20, marginBottom: 14 }} />
          <div className="td-skel" style={{ width: '60%' }} />
        </div></div>
      </Shell>
    )
  }

  const project = meta.projects.find(p => p.id === task.projectId)
  const section = meta.sections.find(sec => sec.id === task.sectionId)
  const done = !!task.completedAt || s.isHidden(task.id)
  const tone = dueTone(task.due, now)
  const children = (detail?.children ?? []).filter(child => !s.isHidden(child.id)).map(child => s.task(child.id) ?? child)
  const comments = detail?.comments ?? []
  const fullDescription = detail?.task.description && detail.task.description.length > task.description.length ? detail.task.description : task.description

  const saveText = () => {
    // Enter saves and unmounts the title editor; if the browser then fires
    // blur, this runs again — the ref is already cleared, so it is a no-op.
    const field = editingRef.current
    if (!field) return
    setEditing(null)
    const change = draftChange(field, draftRef.current, { ...task, description: fullDescription })
    if (change) save(change)
  }

  const submitComment = async () => {
    const content = comment.trim()
    if (!content) return
    // Clear at submit: the next comment typed while this one posts must not
    // be erased when it lands (review: "Second draft" was lost).
    setComment('')
    try {
      const created = await bridge.call('comment', { taskId: task.id, content })
      s.addComment(task.id, created)
    } catch (error) {
      setComment(current => current || content)
      onError(tdErrorMessage(error))
    }
  }

  const submitSubtask = async () => {
    const content = subtask.trim()
    if (!content) return
    setSubtask('')
    try {
      const created = await bridge.call('add', { content, parentId: task.id, projectId: task.projectId })
      s.addChild(task.id, created)
    } catch (error) {
      setSubtask(current => current || content)
      onError(tdErrorMessage(error))
    }
  }

  return (
    <Shell onClose={onClose}>
      <div className="td-task-modal-head">
        <button ref={anchors.project} className="td-crumb" onClick={() => !readOnly && setMenu('project')} title="Move to project / section">
          {project?.isInbox ? <InboxIcon size={13} /> : <span className="td-dot sm" style={{ background: colorHex(project?.color) }} />}
          <span>{project?.name ?? 'Project'}</span>
          {section && <span className="td-dim">/ {section.name}</span>}
          {!readOnly && <MoveIcon size={12} className="td-crumb-move" />}
        </button>
        <div className="td-drawer-tools">
          <button className="td-icon-btn" title="Open in Todoist" onClick={() => onOpenUrl(task.url)}><ExternalIcon /></button>
          {!readOnly && <button className="td-icon-btn danger" title="Delete task (⌫)" onClick={() => onDelete(task)}><TrashIcon /></button>}
          <button className="td-icon-btn" title="Close (Esc)" onClick={onClose}><CloseIcon /></button>
        </div>
      </div>

      <div className="td-task-modal-body">
        <div className="td-task-modal-main">
          {task.parentId && (
            <button className="td-parent-link" onClick={() => onOpenTask(task.parentId!)}>
              <SubtaskIcon size={12} /> Open parent task
            </button>
          )}
          <div className="td-drawer-title-row">
            <button
              type="button"
              className={`td-checkbox lg p${task.priority}${done ? ' is-checked' : ''}`}
              style={{ '--prio': PRIORITY_COLORS[task.priority] } as React.CSSProperties}
              aria-label={done ? 'Reopen task' : 'Complete task'}
              disabled={readOnly}
              onClick={() => (done ? actions.reopen(task) : actions.complete(task))}
            >
              <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.6 8.3 2.3 2.3 4.6-4.9" /></svg>
            </button>
            {editing === 'title' ? (
              <textarea
                autoFocus
                className="td-edit-title"
                value={draft}
                rows={Math.min(5, Math.max(1, Math.ceil(draft.length / 40)))}
                onChange={e => setDraft(e.target.value)}
                onBlur={saveText}
                onKeyDown={e => {
                  if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); saveText() }
                  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(null) }
                }}
              />
            ) : (
              <h2 className={`td-drawer-title${done ? ' is-done' : ''}`} onClick={() => { if (readOnly) return; setDraft(task.content); setEditing('title') }} title="Click to edit">
                {renderInline(task.content, onOpenUrl, 'title')}
              </h2>
            )}
          </div>

          {editing === 'description' ? (
            <div className="td-edit-desc-wrap">
              <textarea
                autoFocus
                className="td-edit-desc"
                value={draft}
                placeholder="Description (Markdown supported)"
                onChange={e => setDraft(e.target.value)}
                onKeyDown={e => {
                  if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); saveText() }
                  if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(null) }
                }}
              />
              <div className="td-edit-actions">
                <span className="td-dim">⌘↵ to save</span>
                <button className="td-btn" onClick={() => setEditing(null)}>Cancel</button>
                <button className="td-btn td-btn-primary" onClick={saveText}>Save</button>
              </div>
            </div>
          ) : fullDescription ? (
            <div className="td-desc" onClick={e => { if (readOnly || (e.target as HTMLElement).closest('a')) return; setDraft(fullDescription); setEditing('description') }} title="Click to edit">
              <MarkdownBlock text={fullDescription} open={onOpenUrl} />
            </div>
          ) : !readOnly ? (
            <button className="td-add-desc" onClick={() => { setDraft(''); setEditing('description') }}>Add description</button>
          ) : null}

          <section className="td-section-block">
            <h3><SubtaskIcon size={13} /> Sub-tasks <span className="td-count">{children.length || ''}</span></h3>
            {children.map(child => (
              <div key={child.id} className={`td-subtask${child.completedAt ? ' is-done' : ''}`}>
                <button
                  type="button"
                  className={`td-checkbox sm p${child.priority}`}
                  style={{ '--prio': PRIORITY_COLORS[child.priority] } as React.CSSProperties}
                  aria-label="Complete sub-task"
                  disabled={readOnly}
                  onClick={() => actions.complete(child)}
                >
                  <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.6 8.3 2.3 2.3 4.6-4.9" /></svg>
                </button>
                <button className="td-subtask-title" onClick={() => onOpenTask(child.id)}>{renderInline(child.content, onOpenUrl, child.id)}</button>
                {child.due && <span className={`td-chip td-due tone-${dueTone(child.due, now)}`}>{formatDue(child.due, now)}</span>}
              </div>
            ))}
            {loading && !detail && <div className="td-skel" style={{ width: '45%', margin: '6px 0' }} />}
            {!readOnly && (
              <form className="td-inline-add" onSubmit={e => { e.preventDefault(); void submitSubtask() }}>
                <PlusIcon size={13} />
                <input value={subtask} onChange={e => setSubtask(e.target.value)} placeholder="Add sub-task" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur() } }} />
              </form>
            )}
          </section>

          <section className="td-section-block">
            <h3><CommentIcon size={13} /> Comments <span className="td-count">{comments.length || ''}</span></h3>
            {comments.map(c => (
              <div key={c.id} className="td-comment">
                <div className="td-comment-meta">{new Date(c.postedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
                {c.content && <MarkdownBlock text={c.content} open={onOpenUrl} />}
                {c.attachment && (
                  <button className="td-attachment" onClick={() => c.attachment?.url && onOpenUrl(c.attachment.url)}>📎 {c.attachment.name}</button>
                )}
              </div>
            ))}
            {loading && !detail && <div className="td-skel" style={{ width: '70%', margin: '6px 0' }} />}
            {!readOnly && (
              <form className="td-comment-form" onSubmit={e => { e.preventDefault(); void submitComment() }}>
                <textarea
                  value={comment}
                  onChange={e => setComment(e.target.value)}
                  placeholder="Write a comment"
                  rows={comment.includes('\n') ? 4 : 2}
                  onKeyDown={e => {
                    if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); (e.currentTarget.form as HTMLFormElement).requestSubmit() }
                    if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); (e.target as HTMLTextAreaElement).blur() }
                  }}
                />
                <button className="td-btn td-btn-primary" disabled={!comment.trim()}>Comment</button>
              </form>
            )}
          </section>
        </div>

        <aside className="td-task-modal-side">
          <div className="td-side-row">
            <span className="td-prop-label">Project</span>
            <button className="td-prop-value" disabled={readOnly} onClick={() => setMenu('project')}>
              {project?.isInbox ? <InboxIcon size={13} /> : <span className="td-dot sm" style={{ background: colorHex(project?.color) }} />}
              {project?.name ?? 'Project'}{section ? <span className="td-dim"> / {section.name}</span> : null}
            </button>
          </div>
          <div className="td-side-row">
            <span className="td-prop-label"><CalendarIcon size={13} />Date</span>
            <button ref={anchors.due} className={`td-prop-value tone-${tone}`} disabled={readOnly} onClick={() => setMenu('due')}>
              {task.due ? <>{task.due.recurring && <RecurringIcon size={12} />}{formatDue(task.due, now)}<span className="td-dim td-prop-sub">{task.due.recurring ? task.due.string : ''}</span></> : <span className="td-dim">No date</span>}
            </button>
          </div>
          <div className="td-side-row">
            <span className="td-prop-label"><DeadlineIcon size={13} />Deadline</span>
            <span className="td-prop-value-wrap">
              <input type="date" className={`td-date-input${task.deadline ? '' : ' is-empty'}`} value={task.deadline ?? ''} disabled={readOnly} onChange={e => save({ deadline: e.target.value })} aria-label="Deadline" />
              {task.deadline && !readOnly && <button className="td-icon-btn sm" title="Clear deadline" onClick={() => save({ deadline: '' })}><CloseIcon size={12} /></button>}
            </span>
          </div>
          <div className="td-side-row">
            <span className="td-prop-label"><FlagFilledIcon size={13} color="currentColor" />Priority</span>
            <button ref={anchors.priority} className="td-prop-value" disabled={readOnly} onClick={() => setMenu('priority')}>
              <FlagFilledIcon size={13} color={task.priority === 1 ? 'var(--td-muted)' : PRIORITY_COLORS[task.priority]} />
              P{5 - task.priority}
            </button>
          </div>
          <div className="td-side-row">
            <span className="td-prop-label"><LabelIcon size={13} />Labels</span>
            <div className="td-prop-labels">
              {task.labels.map(name => {
                const label = meta.labels.find(l => l.name === name)
                return (
                  <span key={name} className="td-label-pill" style={{ '--label': colorHex(label?.color) } as React.CSSProperties}>
                    {name}
                    {!readOnly && <button title={`Remove ${name}`} onClick={() => save({ labels: task.labels.filter(l => l !== name) })}><CloseIcon size={10} /></button>}
                  </span>
                )
              })}
              {!readOnly && <button ref={anchors.labels} className="td-icon-btn sm" title="Add label" onClick={() => setMenu('labels')}><PlusIcon size={12} /></button>}
            </div>
          </div>
          <div className="td-side-row">
            <span className="td-prop-label"><ClockIcon size={13} />Duration</span>
            <select className="td-select" value={task.duration ? durationValue(task.duration) : ''} disabled={readOnly} onChange={e => { if (e.target.value) save({ duration: e.target.value }) }} aria-label="Duration">
              <option value="" disabled>{task.duration ? formatDuration(task.duration) : 'None'}</option>
              {DURATIONS.map(d => <option key={d} value={d}>{d.replace('h30m', 'h 30m')}</option>)}
            </select>
          </div>
        </aside>
      </div>

      {menu === 'due' && <DuePicker anchor={anchors.due.current} current={task.due?.string} onPick={due => save({ due })} onClose={() => setMenu(null)} />}
      {menu === 'priority' && <PriorityPicker anchor={anchors.priority.current} current={task.priority} onPick={priority => save({ priority: priority as ApiPriority })} onClose={() => setMenu(null)} />}
      {menu === 'labels' && <LabelPicker anchor={anchors.labels.current} labels={meta.labels} selected={task.labels} onChange={labels => save({ labels })} onCreate={onCreateLabel} onClose={() => setMenu(null)} />}
      {menu === 'project' && (
        <ProjectPicker anchor={anchors.project.current} meta={meta} current={{ projectId: task.projectId, sectionId: task.sectionId }} onPick={t => void actions.move(task, t).catch(() => {})} onClose={() => setMenu(null)} />
      )}
    </Shell>
  )
}

/** The modal frame: a scrim over the list (click closes) and the dialog. */
function Shell({ onClose, children }: { onClose: () => void; children: React.ReactNode }) {
  return (
    <div className="td-task-modal-scrim" onMouseDown={e => { if (e.target === e.currentTarget) onClose() }}>
      <div className="td-task-modal" role="dialog" aria-label="Task details">{children}</div>
    </div>
  )
}

/** The update an editor's draft asks for, or null when nothing changed. An
 *  empty title is never saved (Todoist requires one). */
function draftChange(field: 'title' | 'description', draft: string, task: TaskRow): TaskPatch | null {
  if (field === 'title') {
    const value = draft.trim()
    return value && value !== task.content ? { content: value } : null
  }
  return draft !== task.description ? { description: draft } : null
}

function durationValue(duration: { amount: number; unit: 'minute' | 'day' }): string {
  if (duration.unit === 'day') return ''
  const h = Math.floor(duration.amount / 60)
  const m = duration.amount % 60
  const value = `${h ? `${h}h` : ''}${m ? `${m}m` : ''}`
  return DURATIONS.includes(value) ? value : ''
}
