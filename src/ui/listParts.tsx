import { useEffect, useRef, useState } from 'react'

import { groupByDay, groupCompleted, groupToday, type TaskGroup } from '../shared/dates'
import type { ListQuery, Meta, TaskRow } from '../shared/types'
import { CloseIcon, TrashIcon } from './Icons'

// Presentational pieces of the workspace (App.tsx): titles, grouping, empty
// and loading states, the shortcut sheet, the delete confirmation and the
// toast stack. No data fetching here.

export function viewTitle(view: ListQuery, meta: Meta | null): string {
  switch (view.kind) {
    case 'today': return 'Today'
    case 'upcoming': return 'Upcoming'
    case 'inbox': return 'Inbox'
    case 'completed': return 'Completed'
    case 'search': return `Search: ${view.query ?? ''}`
    case 'label': return `@${view.query ?? ''}`
    case 'filter': return meta?.filters.find(f => f.id === view.id)?.name ?? 'Filter'
    case 'project': return meta?.projects.find(p => p.id === view.id)?.name ?? 'Project'
  }
}

/** Groups for the current view plus subtask depth (project views nest
 *  subtasks under their parent like Todoist; date views stay flat because a
 *  subtask can be due on a different day than its parent). */
export function buildGroups(view: ListQuery, tasks: TaskRow[], now: Date, meta: Meta | null, projectId: string | undefined): { groups: TaskGroup[]; depths: Map<string, number>; childCounts: Map<string, number> } {
  const depths = new Map<string, number>()
  const childCounts = new Map<string, number>()
  const ids = new Set(tasks.map(t => t.id))
  for (const task of tasks) if (task.parentId && ids.has(task.parentId)) childCounts.set(task.parentId, (childCounts.get(task.parentId) ?? 0) + 1)

  if (view.kind === 'today') return { groups: groupToday(tasks, now), depths, childCounts }
  if (view.kind === 'upcoming') return { groups: groupByDay(tasks, now), depths, childCounts }
  if (view.kind === 'completed') return { groups: groupCompleted(tasks, now), depths, childCounts }

  if ((view.kind === 'project' || view.kind === 'inbox') && projectId) {
    const sections = (meta?.sections ?? []).filter(s => s.projectId === projectId)
    const bySection = new Map<string | null, TaskRow[]>()
    for (const task of tasks) {
      const key = task.sectionId && sections.some(s => s.id === task.sectionId) ? task.sectionId : null
      const list = bySection.get(key) ?? []
      list.push(task)
      bySection.set(key, list)
    }
    const nest = (list: TaskRow[]): TaskRow[] => {
      const inList = new Set(list.map(t => t.id))
      const roots = list.filter(t => !t.parentId || !inList.has(t.parentId)).sort((a, b) => a.order - b.order)
      const out: TaskRow[] = []
      const walk = (task: TaskRow, depth: number) => {
        out.push(task)
        depths.set(task.id, depth)
        list.filter(c => c.parentId === task.id).sort((a, b) => a.order - b.order).forEach(c => walk(c, Math.min(depth + 1, 4)))
      }
      roots.forEach(r => walk(r, 0))
      return out
    }
    const groups: TaskGroup[] = []
    const unsectioned = bySection.get(null) ?? []
    if (unsectioned.length || !sections.length) groups.push({ key: 'all', title: '', tasks: nest(unsectioned) })
    for (const section of sections) {
      groups.push({ key: section.id, title: section.name, tasks: nest(bySection.get(section.id) ?? []) })
    }
    return { groups: groups.filter(g => g.tasks.length || g.key !== 'all'), depths, childCounts }
  }

  // label / filter / search: Todoist orders by priority, then date.
  const sorted = [...tasks].sort((a, b) => b.priority - a.priority || (a.due?.date ?? '9999').localeCompare(b.due?.date ?? '9999') || a.order - b.order)
  return { groups: [{ key: 'all', title: '', tasks: sorted }], depths, childCounts }
}

export function EmptyState({ view }: { view: ListQuery }) {
  const copy: Record<string, [string, string]> = {
    today: ['You’re all done for today', 'Enjoy the rest of your day — or add something below.'],
    upcoming: ['Nothing scheduled in the next two weeks', 'Tasks with a due date show up here.'],
    inbox: ['Inbox zero', 'New tasks without a project land here.'],
    completed: ['No completed tasks yet', 'Tasks you complete show up here.'],
    search: ['No matching tasks', 'Search looks at task names.'],
  }
  const [title, body] = copy[view.kind] ?? ['No tasks here', 'Add one with the bar above.']
  return (
    <div className="td-empty">
      <svg width="96" height="72" viewBox="0 0 96 72" aria-hidden="true" className="td-empty-art">
        <rect x="14" y="10" width="68" height="52" rx="10" fill="var(--td-surface-hi)" />
        <circle cx="32" cy="30" r="6" fill="none" stroke="var(--td-accent)" strokeWidth="2.5" />
        <path d="m29.4 30.2 2 2 3.6-3.8" fill="none" stroke="var(--td-accent)" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
        <rect x="44" y="27" width="26" height="5" rx="2.5" fill="var(--td-border-hi)" />
        <rect x="26" y="44" width="44" height="5" rx="2.5" fill="var(--td-border)" />
      </svg>
      <p className="td-empty-title">{title}</p>
      <p className="td-dim">{body}</p>
    </div>
  )
}

export function ListSkeleton() {
  return (
    <div className="td-skeleton-list" aria-busy="true">
      {[78, 52, 64, 40, 70].map((w, i) => (
        <div key={i} className="td-task is-skeleton">
          <span className="td-checkbox" />
          <div className="td-task-main"><span className="td-skel" style={{ width: `${w}%` }} /><span className="td-skel sm" style={{ width: `${w / 2}%` }} /></div>
        </div>
      ))}
    </div>
  )
}

export type Deleting = { id: string; task: TaskRow | null; subtasks: number | null }

/**
 * The delete confirmation. It owns the keyboard while open:
 * - Escape: its own `document` CAPTURE listener, registered after any open
 *   picker's, so one Escape closes a picker left open underneath AND cancels
 *   (the picker stops propagation, not immediate propagation). In the bubble
 *   phase it never ran when a picker was open, leaving Delete armed (review).
 * - Tab cycles between its two buttons instead of escaping to the sidebar.
 * - Focus returns to where it was when the dialog closes.
 */
export function DeleteConfirm({ target, onCancel, onConfirm }: { target: Deleting; onCancel: () => void; onConfirm: () => void }) {
  const dialog = useRef<HTMLDivElement>(null)
  // Mount-once effect reading the latest callback: re-running it on each
  // render (the sub-task count arrives a moment later) would restore focus to
  // the background and disarm the focused Delete button.
  const cancel = useRef(onCancel)
  cancel.current = onCancel
  // Captured during the FIRST render, before the Delete button's autoFocus
  // runs in the commit; read in an effect it was already the Delete button,
  // so focus "returned" to a removed element and was lost.
  const [previous] = useState(() => document.activeElement as HTMLElement | null)
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        event.preventDefault()
        event.stopPropagation()
        cancel.current()
      } else if (event.key === 'Tab') {
        const buttons = [...(dialog.current?.querySelectorAll<HTMLButtonElement>('button') ?? [])]
        if (!buttons.length) return
        event.preventDefault()
        const at = buttons.indexOf(document.activeElement as HTMLButtonElement)
        buttons[(at + (event.shiftKey ? -1 : 1) + buttons.length) % buttons.length].focus()
      }
    }
    document.addEventListener('keydown', onKey, true)
    return () => {
      document.removeEventListener('keydown', onKey, true)
      if (previous?.isConnected) previous.focus()
    }
  }, [])
  const { task, subtasks } = target
  const scope = subtasks === null ? ' and any sub-tasks' : subtasks > 0 ? ` and its ${subtasks} sub-task${subtasks > 1 ? 's' : ''} (with anything nested under them)` : ''
  return (
    <div className="td-modal-scrim" onClick={onCancel}>
      <div ref={dialog} className="td-help td-delete" onClick={e => e.stopPropagation()} role="dialog" aria-modal="true" aria-label="Delete task">
        <div className="td-help-head"><h2>Delete task?</h2></div>
        <p>{task ? `“${task.content}”` : 'This task'}{scope} will be deleted. This cannot be undone.</p>
        <div className="td-delete-actions">
          <button className="td-btn" onClick={onCancel}>Cancel</button>
          <button className="td-btn td-btn-danger" autoFocus onClick={onConfirm}><TrashIcon size={13} /> Delete</button>
        </div>
      </div>
    </div>
  )
}

export function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ['q / a', 'Add task'],
    ['/', 'Search'],
    ['j / k  ↓ / ↑', 'Move between tasks'],
    ['Enter / o', 'Open task'],
    ['x / Space', 'Complete / reopen'],
    ['1 – 4', 'Set priority'],
    ['t', 'Schedule for today'],
    ['⌫ / Delete', 'Delete task (asks first)'],
    ['r', 'Refresh'],
    ['[', 'Toggle sidebar'],
    ['Esc', 'Close help / task / search'],
    ['⌘⌥T', 'Quick Add from anywhere in Agent Code'],
  ]
  return (
    <div className="td-modal-scrim" onClick={onClose}>
      <div className="td-help" onClick={e => e.stopPropagation()} role="dialog" aria-label="Keyboard shortcuts">
        <div className="td-help-head"><h2>Keyboard shortcuts</h2><button className="td-icon-btn" onClick={onClose}><CloseIcon /></button></div>
        <dl>{rows.map(([k, v]) => <div key={k}><dt>{k.split('  ').map(part => <kbd key={part}>{part}</kbd>)}</dt><dd>{v}</dd></div>)}</dl>
      </div>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Toasts

export type ToastAction = { label: string; run: () => void }
export type Toast = { id: number; message: string; tone?: 'error'; action?: ToastAction; undos?: Array<() => void>; leaving?: boolean }
export type ToastOptions = { tone?: 'error'; action?: ToastAction; completion?: string }

/**
 * The toast stack, Todoist-style: bottom-left, and consecutive completions
 * MERGE into one "3 tasks completed · Undo" whose Undo restores all of them.
 * beta.4 stacked one toast per completion and dropped the oldest — the one
 * with the first Undo — within 0.65 s (evaluator 4). Toasts also fade out
 * instead of vanishing in one frame.
 */
export function useToasts() {
  const [toasts, setToasts] = useState<Toast[]>([])
  const timers = useRef(new Map<number, ReturnType<typeof setTimeout>>())

  const dismiss = (id: number) => {
    clearTimeout(timers.current.get(id))
    setToasts(list => list.map(t => (t.id === id ? { ...t, leaving: true } : t)))
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), 160)
  }
  const schedule = (id: number, ms: number) => {
    clearTimeout(timers.current.get(id))
    timers.current.set(id, setTimeout(() => dismiss(id), ms))
  }

  const toast = (message: string, options: ToastOptions = {}) => {
    const ms = options.action ? 6000 : options.tone === 'error' ? 7000 : 3000
    if (options.completion && options.action) {
      const undo = options.action.run
      let merged: number | null = null
      setToasts(list => {
        const open = list.find(t => t.undos && !t.leaving)
        if (!open) return list
        merged = open.id
        const undos = [...open.undos!, undo]
        return list.map(t => (t.id === open.id ? { ...t, message: `${undos.length} tasks completed`, undos, action: { label: 'Undo', run: () => undos.forEach(fn => fn()) } } : t))
      })
      if (merged !== null) { schedule(merged, ms); return }
      const id = Date.now() + Math.random()
      setToasts(list => [...list.filter(t => !t.leaving).slice(-2), { id, message, tone: options.tone, action: options.action, undos: [undo] }])
      schedule(id, ms)
      return
    }
    const id = Date.now() + Math.random()
    setToasts(list => [...list.filter(t => !t.leaving).slice(-2), { id, message, tone: options.tone, action: options.action }])
    schedule(id, ms)
  }

  useEffect(() => () => { for (const timer of timers.current.values()) clearTimeout(timer) }, [])
  return { toasts, toast, dismiss }
}

export function Toasts({ toasts, onDismiss }: { toasts: Toast[]; onDismiss: (id: number) => void }) {
  return (
    <div className="td-toasts" aria-live="polite">
      {toasts.map(t => (
        <div key={t.id} className={`td-toast${t.tone === 'error' ? ' is-error' : ''}${t.leaving ? ' is-leaving' : ''}`}>
          <span>{t.message}</span>
          {t.action && <button onClick={() => { t.action!.run(); onDismiss(t.id) }}>{t.action.label}</button>}
          <button className="td-toast-close" aria-label="Dismiss" onClick={() => onDismiss(t.id)}><CloseIcon size={11} /></button>
        </div>
      ))}
    </div>
  )
}
