import { useEffect, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import { dueTone, formatDue, formatDuration } from '../shared/dates'
import type { ApiPriority, Meta, TaskDetail as Detail, TaskPatch, TaskRow } from '../shared/types'
import { tdErrorMessage } from '../shared/types'
import { useBridge } from './bridge'
import {
  CalendarIcon, ClockIcon, CloseIcon, CommentIcon, DeadlineIcon, ExternalIcon, FlagFilledIcon,
  InboxIcon, LabelIcon, MoveIcon, PlusIcon, RecurringIcon, SubtaskIcon, TrashIcon,
} from './Icons'
import { MarkdownBlock, renderInline } from './markdown'
import { DuePicker, LabelPicker, PriorityPicker, ProjectPicker } from './pickers'

// The task drawer: everything about one task, editable in place.
//
// Each field saves on its own (one `td task update` per change) instead of a
// form with a Save button: that is how Todoist itself behaves. The two text
// editors (title, description) hold a draft while open; switching to another
// task or closing the drawer SAVES that draft rather than dropping it (the
// description editor used to lose it silently — review of PR #2).
//
// Reconciliation: field edits are optimistic and replaced by td's returned
// task. Anything whose outcome only the server knows — completing (a recurring
// task rolls forward instead of closing), a failed save — reloads the task
// instead of painting a guess. And every revision bump (a change from the list,
// the modal, another pane) reloads it too, so the drawer never shows stale state.

const DURATIONS = ['15m', '30m', '45m', '1h', '1h30m', '2h', '3h', '4h']

export function TaskDetailPanel({ taskId, meta, now, revision, onClose, onToggle, onOpenTask, onError, onOpenUrl, onCreateLabel, onNeedSections }: {
  taskId: string
  meta: Meta
  now: Date
  /** The runtime's change counter: a new value means "reload". */
  revision: number
  onClose: () => void
  /** Resolves true when the server accepted the complete/reopen. */
  onToggle: (task: TaskRow) => Promise<boolean>
  onOpenTask: (id: string) => void
  onError: (message: string) => void
  onOpenUrl: (url: string) => void
  onCreateLabel: (name: string) => Promise<void>
  /** Load a project's sections into the shared cache (breadcrumb + picker). */
  onNeedSections: (projectId: string) => void
}) {
  const bridge = useBridge()
  const [detail, setDetail] = useState<Detail | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [editing, setEditingState] = useState<null | 'title' | 'description'>(null)
  const [draft, setDraftState] = useState('')
  // Mirrors read synchronously: by Enter's blur and by the unmount save, which
  // both run before React has re-rendered the state.
  const editingRef = useRef<null | 'title' | 'description'>(null)
  const draftRef = useRef('')
  const taskRef = useRef<TaskRow | null>(null)
  const setEditing = (value: null | 'title' | 'description') => { editingRef.current = value; setEditingState(value) }
  const setDraft = (value: string) => { draftRef.current = value; setDraftState(value) }
  const [menu, setMenu] = useState<null | 'due' | 'priority' | 'labels' | 'project'>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [comment, setComment] = useState('')
  const [subtask, setSubtask] = useState('')
  const [busy, setBusy] = useState(false)
  const anchors = { due: useRef<HTMLButtonElement>(null), priority: useRef<HTMLButtonElement>(null), labels: useRef<HTMLButtonElement>(null), project: useRef<HTMLButtonElement>(null) }

  const load = async () => {
    try {
      setLoadError(null)
      setDetail(await bridge.call('task', { id: taskId }))
    } catch (error) {
      setLoadError(tdErrorMessage(error))
    }
  }

  useEffect(() => {
    setDetail(null)
    setEditing(null)
    setConfirmDelete(false)
    setComment('')
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [taskId])

  const firstRevision = useRef(revision)
  useEffect(() => {
    if (revision === firstRevision.current) return
    void load()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [revision])

  taskRef.current = detail?.task ?? null

  // Leaving with an open editor (another task clicked, drawer closed) saves
  // the draft. The drawer is keyed by task id, so this runs on every switch.
  useEffect(() => () => {
    const field = editingRef.current
    const task = taskRef.current
    if (!field || !task) return
    const change = draftChange(field, draftRef.current, task)
    if (change) void bridge.call('update', { id: task.id, ...change }).catch(error => onError(tdErrorMessage(error)))
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  const patch = async (change: TaskPatch) => {
    if (!detail) return
    const before = detail
    // Optimistic: show the edit at once; td answers with the canonical task.
    setDetail({ ...detail, task: { ...detail.task, ...optimistic(change) } })
    try {
      const task = await bridge.call('update', { id: detail.task.id, ...change })
      setDetail(current => (current ? { ...current, task } : current))
    } catch (error) {
      // Reload rather than restore `before`: a second edit made while this
      // one was in flight may have succeeded, and `before` predates it.
      setDetail(before)
      void load()
      onError(tdErrorMessage(error))
    }
  }

  const move = async (projectId: string, sectionId: string | null) => {
    if (!detail) return
    try {
      await bridge.call('move', { id: detail.task.id, projectId, ...(sectionId ? { sectionId } : { noSection: true }) })
      setDetail({ ...detail, task: { ...detail.task, projectId, sectionId } })
    } catch (error) {
      onError(tdErrorMessage(error))
    }
  }

  const projectOfTask = detail?.task.projectId
  useEffect(() => {
    if (projectOfTask) onNeedSections(projectOfTask)
  }, [projectOfTask, onNeedSections])

  if (loadError) {
    return (
      <aside className="td-drawer">
        <div className="td-drawer-head"><span /><button className="td-icon-btn" onClick={onClose} title="Close (Esc)"><CloseIcon /></button></div>
        <div className="td-empty"><p>{loadError}</p><button className="td-btn" onClick={() => void load()}>Try again</button></div>
      </aside>
    )
  }
  if (!detail) {
    return (
      <aside className="td-drawer">
        <div className="td-drawer-head"><span className="td-skel" style={{ width: 120 }} /><button className="td-icon-btn" onClick={onClose} title="Close (Esc)"><CloseIcon /></button></div>
        <div className="td-drawer-body">
          <div className="td-skel" style={{ width: '80%', height: 20, marginBottom: 14 }} />
          <div className="td-skel" style={{ width: '60%' }} />
          <div className="td-skel" style={{ width: '40%', marginTop: 8 }} />
        </div>
      </aside>
    )
  }

  const { task, children, comments } = detail
  const project = meta.projects.find(p => p.id === task.projectId)
  const section = meta.sections.find(s => s.id === task.sectionId)
  const done = !!task.completedAt
  const tone = dueTone(task.due, now)

  const saveText = async () => {
    // Enter saves and unmounts the title editor; if the browser then fires
    // blur, this runs again — the ref is already cleared, so it is a no-op.
    const field = editingRef.current
    if (!field) return
    setEditing(null)
    const change = draftChange(field, draftRef.current, task)
    if (change) await patch(change)
  }

  return (
    <aside className="td-drawer" aria-label="Task details">
      <div className="td-drawer-head">
        <button ref={anchors.project} className="td-crumb" onClick={() => setMenu('project')} title="Move to project / section">
          {project?.isInbox ? <InboxIcon size={13} /> : <span className="td-dot sm" style={{ background: colorHex(project?.color) }} />}
          <span>{project?.name ?? 'Project'}</span>
          {section && <span className="td-dim">/ {section.name}</span>}
          <MoveIcon size={12} className="td-crumb-move" />
        </button>
        <div className="td-drawer-tools">
          <button className="td-icon-btn" title="Open in Todoist" onClick={() => onOpenUrl(task.url)}><ExternalIcon /></button>
          <button className="td-icon-btn danger" title="Delete task" onClick={() => setConfirmDelete(true)}><TrashIcon /></button>
          <button className="td-icon-btn" title="Close (Esc)" onClick={onClose}><CloseIcon /></button>
        </div>
      </div>

      {confirmDelete && (
        <div className="td-confirm">
          <span>Delete this task{children.length ? ` and its ${children.length} subtask${children.length > 1 ? 's' : ''}` : ''}? This cannot be undone.</span>
          <div>
            <button className="td-btn" onClick={() => setConfirmDelete(false)}>Cancel</button>
            <button
              className="td-btn td-btn-danger"
              autoFocus
              onClick={async () => {
                try {
                  await bridge.call('delete', { id: task.id })
                  onClose()
                } catch (error) {
                  onError(tdErrorMessage(error))
                }
              }}
            >Delete</button>
          </div>
        </div>
      )}

      <div className="td-drawer-body">
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
            onClick={async () => {
              // Only the server knows the result: a recurring task moves to its
              // next date instead of closing, and a failure changes nothing.
              if (await onToggle(task)) void load()
            }}
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
              onBlur={() => void saveText()}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); void saveText() }
                if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(null) }
              }}
            />
          ) : (
            <h2 className={`td-drawer-title${done ? ' is-done' : ''}`} onClick={() => { setDraft(task.content); setEditing('title') }} title="Click to edit">
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
                if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void saveText() }
                if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setEditing(null) }
              }}
            />
            <div className="td-edit-actions">
              <span className="td-dim">⌘↵ to save</span>
              <button className="td-btn" onClick={() => setEditing(null)}>Cancel</button>
              <button className="td-btn td-btn-primary" onClick={() => void saveText()}>Save</button>
            </div>
          </div>
        ) : task.description ? (
          <div className="td-desc" onClick={e => { if (!(e.target as HTMLElement).closest('a')) { setDraft(task.description); setEditing('description') } }} title="Click to edit">
            <MarkdownBlock text={task.description} open={onOpenUrl} />
          </div>
        ) : (
          <button className="td-add-desc" onClick={() => { setDraft(''); setEditing('description') }}>Add description</button>
        )}

        <div className="td-props">
          <span className="td-prop-label"><CalendarIcon size={13} />Due</span>
          <button ref={anchors.due} className={`td-prop-value tone-${tone}`} onClick={() => setMenu('due')}>
            {task.due ? <>{task.due.recurring && <RecurringIcon size={12} />}{formatDue(task.due, now)}<span className="td-dim td-prop-sub">{task.due.recurring ? task.due.string : ''}</span></> : <span className="td-dim">No date</span>}
          </button>

          <span className="td-prop-label"><DeadlineIcon size={13} />Deadline</span>
          <span className="td-prop-value-wrap">
            <input
              type="date"
              className={`td-date-input${task.deadline ? '' : ' is-empty'}`}
              value={task.deadline ?? ''}
              onChange={e => void patch({ deadline: e.target.value })}
              aria-label="Deadline"
            />
            {task.deadline && <button className="td-icon-btn sm" title="Clear deadline" onClick={() => void patch({ deadline: '' })}><CloseIcon size={12} /></button>}
          </span>

          <span className="td-prop-label"><ClockIcon size={13} />Duration</span>
          <select
            className="td-select"
            value={task.duration ? durationValue(task.duration) : ''}
            onChange={e => { if (e.target.value) void patch({ duration: e.target.value }) }}
            aria-label="Duration"
          >
            <option value="" disabled>{task.duration ? formatDuration(task.duration) : 'None'}</option>
            {DURATIONS.map(d => <option key={d} value={d}>{d.replace('h30m', 'h 30m')}</option>)}
          </select>

          <span className="td-prop-label"><FlagFilledIcon size={13} color="currentColor" />Priority</span>
          <button ref={anchors.priority} className="td-prop-value" onClick={() => setMenu('priority')}>
            <FlagFilledIcon size={13} color={task.priority === 1 ? 'var(--td-muted)' : PRIORITY_COLORS[task.priority]} />
            Priority {5 - task.priority}
          </button>

          <span className="td-prop-label"><LabelIcon size={13} />Labels</span>
          <div className="td-prop-labels">
            {task.labels.map(name => {
              const label = meta.labels.find(l => l.name === name)
              return (
                <span key={name} className="td-label-pill" style={{ '--label': colorHex(label?.color) } as React.CSSProperties}>
                  {name}
                  <button title={`Remove ${name}`} onClick={() => void patch({ labels: task.labels.filter(l => l !== name) })}><CloseIcon size={10} /></button>
                </span>
              )
            })}
            <button ref={anchors.labels} className="td-icon-btn sm" title="Add label" onClick={() => setMenu('labels')}><PlusIcon size={12} /></button>
          </div>
        </div>

        <section className="td-section-block">
          <h3><SubtaskIcon size={13} /> Sub-tasks <span className="td-count">{children.length || ''}</span></h3>
          {children.map(child => (
            <div key={child.id} className={`td-subtask${child.completedAt ? ' is-done' : ''}`}>
              <button
                type="button"
                className={`td-checkbox sm p${child.priority}`}
                style={{ '--prio': PRIORITY_COLORS[child.priority] } as React.CSSProperties}
                aria-label="Complete sub-task"
                onClick={async () => {
                  if (await onToggle(child)) void load()
                }}
              >
                <svg viewBox="0 0 16 16" aria-hidden="true"><path d="m4.6 8.3 2.3 2.3 4.6-4.9" /></svg>
              </button>
              <button className="td-subtask-title" onClick={() => onOpenTask(child.id)}>{renderInline(child.content, onOpenUrl, child.id)}</button>
              {child.due && <span className={`td-chip td-due tone-${dueTone(child.due, now)}`}>{formatDue(child.due, now)}</span>}
            </div>
          ))}
          <form
            className="td-inline-add"
            onSubmit={async e => {
              e.preventDefault()
              const content = subtask.trim()
              if (!content || busy) return
              setBusy(true)
              try {
                const created = await bridge.call('add', { content, parentId: task.id, projectId: task.projectId })
                setDetail(current => current ? { ...current, children: [...current.children, created] } : current)
                setSubtask('')
              } catch (error) {
                onError(tdErrorMessage(error))
              } finally {
                setBusy(false)
              }
            }}
          >
            <PlusIcon size={13} />
            <input value={subtask} onChange={e => setSubtask(e.target.value)} placeholder="Add sub-task" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); (e.target as HTMLInputElement).blur() } }} />
          </form>
        </section>

        <section className="td-section-block">
          <h3><CommentIcon size={13} /> Comments <span className="td-count">{comments.length || ''}</span></h3>
          {comments.map(c => (
            <div key={c.id} className="td-comment">
              <div className="td-comment-meta">{new Date(c.postedAt).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })}</div>
              {c.content && <MarkdownBlock text={c.content} open={onOpenUrl} />}
              {c.attachment && (
                <button className="td-attachment" onClick={() => c.attachment?.url && onOpenUrl(c.attachment.url)}>
                  📎 {c.attachment.name}
                </button>
              )}
            </div>
          ))}
          <form
            className="td-comment-form"
            onSubmit={async e => {
              e.preventDefault()
              const content = comment.trim()
              if (!content || busy) return
              setBusy(true)
              try {
                const created = await bridge.call('comment', { taskId: task.id, content })
                setDetail(current => current ? { ...current, comments: [...current.comments, created] } : current)
                setComment('')
              } catch (error) {
                onError(tdErrorMessage(error))
              } finally {
                setBusy(false)
              }
            }}
          >
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
            <button className="td-btn td-btn-primary" disabled={!comment.trim() || busy}>Comment</button>
          </form>
        </section>
      </div>

      {menu === 'due' && <DuePicker anchor={anchors.due.current} current={task.due?.string} onPick={due => void patch({ due })} onClose={() => setMenu(null)} />}
      {menu === 'priority' && <PriorityPicker anchor={anchors.priority.current} current={task.priority} onPick={priority => void patch({ priority })} onClose={() => setMenu(null)} />}
      {menu === 'labels' && (
        <LabelPicker
          anchor={anchors.labels.current}
          labels={meta.labels}
          selected={task.labels}
          onChange={labels => void patch({ labels })}
          onCreate={onCreateLabel}
          onClose={() => setMenu(null)}
        />
      )}
      {menu === 'project' && (
        <ProjectPicker anchor={anchors.project.current} meta={meta} current={{ projectId: task.projectId, sectionId: task.sectionId }} onPick={t => void move(t.projectId, t.sectionId)} onClose={() => setMenu(null)} />
      )}
    </aside>
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

/** What the drawer shows while td is saving. A new due STRING is deliberately
 *  not applied optimistically: it is natural language only Todoist's server can
 *  resolve to a date, and painting "Today" for "next fri" for a second would be
 *  a lie. Clearing it is unambiguous, so that one is immediate. */
function optimistic(change: TaskPatch): Partial<TaskRow> {
  const next: Partial<TaskRow> = {}
  if (change.content !== undefined) next.content = change.content
  if (change.description !== undefined) next.description = change.description
  if (change.priority !== undefined) next.priority = change.priority as ApiPriority
  if (change.labels !== undefined) next.labels = change.labels
  if (change.deadline !== undefined) next.deadline = change.deadline || null
  if (change.due === '') next.due = null
  return next
}
