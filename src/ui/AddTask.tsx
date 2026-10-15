import { forwardRef, useImperativeHandle, useRef, useState } from 'react'

import { colorHex, PRIORITY_COLORS } from '../shared/colors'
import type { QuickAddIntent } from '../shared/quickAddPlan'
import { contentPreview, tokenize } from '../shared/quickAddTokens'
import type { ApiPriority, Meta } from '../shared/types'
import { CalendarIcon, FlagFilledIcon, InboxIcon, LabelIcon, PlusIcon } from './Icons'
import { DuePicker, LabelPicker, PriorityPicker, ProjectPicker, type ProjectTarget } from './pickers'

// "+ Add task" — Todoist's inline task editor, at the end of a list and of
// each project section.
//
// Same parser-first model as everywhere (src/shared/quickAddPlan.ts): the
// typed line goes to Todoist untouched (dates, p1, #project, @label, " //
// description" are Todoist's syntax, highlighted as you type), and what the
// pickers and the place you are adding in say is applied after, in the same
// request. The editor stays open after adding, cleared, so a list can be typed
// in one go — as in Todoist.

export type AddTaskHandle = { open: () => void }

export const AddTask = forwardRef<AddTaskHandle, {
  meta: Meta | null
  /** What the place you are adding in implies (Today → due today; a project
   *  section → that project and section; a label view → that label). */
  base: QuickAddIntent
  /** A short hint under the field ("Due today unless you type a date"). */
  hint?: string | null
  onSubmit: (text: string, intent: QuickAddIntent) => Promise<boolean>
  onLabelCreate?: (name: string) => Promise<void>
}>(function AddTask({ meta, base, hint, onSubmit, onLabelCreate }, ref) {
  const [open, setOpen] = useState(false)
  const [text, setText] = useState('')
  const [description, setDescription] = useState('')
  const [due, setDue] = useState('')
  const [priority, setPriority] = useState<ApiPriority>(1)
  const [labels, setLabels] = useState<string[]>([])
  const [target, setTarget] = useState<ProjectTarget | null>(null)
  const [menu, setMenu] = useState<null | 'due' | 'priority' | 'labels' | 'project'>(null)
  const input = useRef<HTMLInputElement>(null)
  const mirror = useRef<HTMLDivElement>(null)
  const anchors = { due: useRef<HTMLButtonElement>(null), priority: useRef<HTMLButtonElement>(null), labels: useRef<HTMLButtonElement>(null), project: useRef<HTMLButtonElement>(null) }

  useImperativeHandle(ref, () => ({
    open: () => {
      setOpen(true)
      requestAnimationFrame(() => {
        input.current?.focus()
        input.current?.scrollIntoView({ block: 'nearest' })
      })
    },
  }), [])

  const reset = () => {
    setText('')
    setDescription('')
    setDue('')
    setPriority(1)
    setLabels([])
    setTarget(null)
  }

  const close = () => {
    reset()
    setOpen(false)
    setMenu(null)
  }

  const submit = async () => {
    const value = text.trim()
    if (!value) return
    const intent: QuickAddIntent = {
      ...base,
      due: due || base.due || null,
      priority: priority > 1 ? priority : base.priority,
      labels: [...new Set([...(base.labels ?? []), ...labels])],
      projectId: target?.projectId ?? base.projectId ?? null,
      sectionId: target ? target.sectionId : base.sectionId ?? null,
      note: description.trim() || null,
    }
    // Clear at submit: the next task can be typed while this one is saved.
    const saved = { text, description, due, priority, labels, target }
    reset()
    input.current?.focus()
    if (!(await onSubmit(value, intent))) {
      // Nothing was created: give the text back unless a new line was started.
      setText(current => current || saved.text)
      setDescription(current => current || saved.description)
    }
  }

  if (!open) {
    return (
      <button className="td-add-task-btn" onClick={() => { setOpen(true); requestAnimationFrame(() => input.current?.focus()) }}>
        <span className="td-add-task-plus"><PlusIcon size={13} /></span> Add task
      </button>
    )
  }

  const tokens = tokenize(text)
  const preview = text && tokens.some(t => t.kind !== 'text') ? contentPreview(text) : ''
  const project = meta?.projects.find(p => p.id === (target?.projectId ?? base.projectId)) ?? meta?.projects.find(p => p.isInbox)
  const section = meta?.sections.find(sec => sec.id === (target ? target.sectionId : base.sectionId))

  return (
    <div className="td-add-editor" onKeyDown={e => { if (e.key === 'Escape' && !menu) { e.preventDefault(); e.stopPropagation(); close() } }}>
      <div className="td-quickadd-stack td-add-editor-title">
        <div ref={mirror} className="td-quickadd-mirror" aria-hidden="true">
          {tokens.map((token, index) => <span key={index} className={`tok-${token.kind}`}>{token.text}</span>)}{'​'}
        </div>
        <input
          ref={input}
          className="td-quickadd-input"
          value={text}
          spellCheck={false}
          placeholder="Task name"
          aria-label="Task name"
          onChange={e => { setText(e.target.value); requestAnimationFrame(() => { if (mirror.current && input.current) mirror.current.scrollLeft = input.current.scrollLeft }) }}
          onKeyDown={e => { if (e.key === 'Enter' && !e.nativeEvent.isComposing) { e.preventDefault(); void submit() } }}
        />
      </div>
      <textarea
        className="td-add-editor-desc"
        value={description}
        placeholder="Description"
        rows={description.includes('\n') ? 3 : 1}
        onChange={e => setDescription(e.target.value)}
        onKeyDown={e => { if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) { e.preventDefault(); void submit() } }}
      />
      {(preview || hint) && <div className="td-add-editor-hint">{preview ? <>Adds “<b>{preview}</b>”</> : hint}</div>}
      <div className="td-qa-chips">
        <button ref={anchors.due} type="button" className={`td-qa-chip${due ? ' is-set' : ''}`} onClick={() => setMenu('due')}><CalendarIcon size={13} />{due || 'Date'}</button>
        <button ref={anchors.priority} type="button" className={`td-qa-chip${priority > 1 ? ' is-set' : ''}`} onClick={() => setMenu('priority')}>
          <FlagFilledIcon size={13} color={priority === 1 ? 'var(--td-muted)' : PRIORITY_COLORS[priority]} />{priority > 1 ? `P${5 - priority}` : 'Priority'}
        </button>
        <button ref={anchors.labels} type="button" className={`td-qa-chip${labels.length ? ' is-set' : ''}`} onClick={() => setMenu('labels')}><LabelIcon size={13} />{labels.length ? labels.join(', ') : 'Labels'}</button>
      </div>
      <div className="td-add-editor-foot">
        <button ref={anchors.project} type="button" className="td-qa-project" onClick={() => setMenu('project')}>
          {project?.isInbox || !project ? <InboxIcon size={14} /> : <span className="td-dot" style={{ background: colorHex(project.color) }} />}
          {project?.name ?? 'Inbox'}{section ? <span className="td-dim"> / {section.name}</span> : null}
        </button>
        <span className="td-flex" />
        <button type="button" className="td-btn td-btn-ghost" onClick={close}>Cancel</button>
        <button type="button" className="td-btn td-btn-primary" disabled={!text.trim()} onClick={() => void submit()}>Add task</button>
      </div>
      {menu === 'due' && <DuePicker anchor={anchors.due.current} current={due} onPick={setDue} onClose={() => setMenu(null)} />}
      {menu === 'priority' && <PriorityPicker anchor={anchors.priority.current} current={priority} onPick={value => setPriority(value as ApiPriority)} onClose={() => setMenu(null)} />}
      {menu === 'labels' && meta && <LabelPicker anchor={anchors.labels.current} labels={meta.labels} selected={labels} onChange={setLabels} onCreate={onLabelCreate} onClose={() => setMenu(null)} />}
      {menu === 'project' && meta && <ProjectPicker anchor={anchors.project.current} meta={meta} current={target ?? undefined} onPick={setTarget} onClose={() => setMenu(null)} />}
    </div>
  )
})
