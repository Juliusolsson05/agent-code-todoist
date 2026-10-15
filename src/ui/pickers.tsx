import { useMemo, useState } from 'react'

import { colorHex, PRIORITY_COLORS, priorityLabel } from '../shared/colors'
import type { ApiPriority, LabelRow, Meta, ProjectRow } from '../shared/types'
import { CalendarIcon, CloseIcon, FlagFilledIcon, InboxIcon, LabelIcon, PlusIcon, TodayIcon, UpcomingIcon } from './Icons'
import { Popover, useMenuKeys } from './Popover'

// The four pickers the task row hover-actions, the detail drawer and the add
// form share. Each is a Popover with a search/typing input on top and an
// arrow-key navigable list, so every edit is reachable from the keyboard.

// ---------------------------------------------------------------------------
// Due date

/** Strings are Todoist natural language, sent verbatim as `--due`. We pick
 *  phrases Todoist's parser is documented to accept; the server decides the
 *  actual date (including the user's "start of week" setting for "next week"). */
const DUE_PRESETS: Array<{ label: string; value: string; hint: string; icon: 'today' | 'tomorrow' | 'weekend' | 'week' | 'none' }> = [
  { label: 'Today', value: 'today', hint: weekdayShort(0), icon: 'today' },
  { label: 'Tomorrow', value: 'tomorrow', hint: weekdayShort(1), icon: 'tomorrow' },
  { label: 'This weekend', value: 'saturday', hint: 'Sat', icon: 'weekend' },
  { label: 'Next week', value: 'next monday', hint: 'Mon', icon: 'week' },
  { label: 'No date', value: '', hint: '', icon: 'none' },
]

function weekdayShort(offset: number): string {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return d.toLocaleDateString(undefined, { weekday: 'short' })
}

export function DuePicker({ anchor, current, onPick, onClose, placeholder, inline }: {
  /** Render inside the layout instead of floating (the Quick Add modal: a
   *  floating menu there is clipped by the host's content-sized frame). */
  inline?: boolean
  anchor: HTMLElement | null
  current?: string
  onPick: (value: string) => void
  onClose: () => void
  placeholder?: string
}) {
  const [text, setText] = useState('')
  const presets = DUE_PRESETS
  const { active, setActive, onKeyDown } = useMenuKeys(presets.length, index => { onPick(presets[index].value); onClose() })
  return (
    <Popover anchor={anchor} inline={inline} onClose={onClose} width={250}>
      <form
        onSubmit={event => {
          event.preventDefault()
          if (text.trim()) { onPick(text.trim()); onClose() }
        }}
      >
        <input
          autoFocus
          className="td-popover-input"
          placeholder={placeholder ?? (current ? `Due: ${current}` : 'Type a date — "fri 3pm", "every mon"')}
          value={text}
          onChange={event => setText(event.target.value)}
          onKeyDown={event => { if (!text) onKeyDown(event) }}
        />
      </form>
      <div className="td-menu" role="menu">
        {presets.map((preset, index) => (
          <button
            key={preset.label}
            type="button"
            role="menuitem"
            className={`td-menu-item${index === active ? ' is-active' : ''}`}
            onMouseEnter={() => setActive(index)}
            onClick={() => { onPick(preset.value); onClose() }}
          >
            <span className={`td-menu-icon td-due-icon-${preset.icon}`}>
              {preset.icon === 'today' ? <TodayIcon /> : preset.icon === 'none' ? <CloseIcon /> : preset.icon === 'week' ? <UpcomingIcon /> : <CalendarIcon />}
            </span>
            <span className="td-menu-label">{preset.label}</span>
            <span className="td-menu-hint">{preset.hint}</span>
          </button>
        ))}
      </div>
      <div className="td-popover-foot">Todoist understands "every weekday 9am", "in 3 days", "Oct 20".</div>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Priority

export function PriorityPicker({ anchor, current, onPick, onClose, inline }: {
  /** Render inside the layout instead of floating (the Quick Add modal: a
   *  floating menu there is clipped by the host's content-sized frame). */
  inline?: boolean
  anchor: HTMLElement | null
  current: ApiPriority
  onPick: (value: ApiPriority) => void
  onClose: () => void
}) {
  const options: ApiPriority[] = [4, 3, 2, 1]
  const { active, setActive } = useMenuKeys(options.length, () => {})
  return (
    <Popover anchor={anchor} inline={inline} onClose={onClose} width={190}>
      <div className="td-menu" role="menu">
        {options.map((priority, index) => (
          <button
            key={priority}
            type="button"
            role="menuitemradio"
            aria-checked={priority === current}
            autoFocus={priority === current}
            className={`td-menu-item${index === active ? ' is-active' : ''}`}
            onMouseEnter={() => setActive(index)}
            onClick={() => { onPick(priority); onClose() }}
          >
            <span className="td-menu-icon"><FlagFilledIcon color={priority === 1 ? 'var(--td-muted)' : PRIORITY_COLORS[priority]} /></span>
            <span className="td-menu-label">Priority {5 - priority}</span>
            <span className="td-menu-hint">{priority === current ? '✓' : priorityLabel(priority)}</span>
          </button>
        ))}
      </div>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Labels (multi-select)

export function LabelPicker({ anchor, labels, selected, onChange, onCreate, onClose, inline }: {
  /** Render inside the layout instead of floating (the Quick Add modal: a
   *  floating menu there is clipped by the host's content-sized frame). */
  inline?: boolean
  anchor: HTMLElement | null
  labels: LabelRow[]
  selected: string[]
  onChange: (next: string[]) => void
  onCreate?: (name: string) => Promise<void>
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const [busy, setBusy] = useState(false)
  const q = query.trim().replace(/^@/, '').toLowerCase()
  const visible = labels.filter(label => !q || label.name.toLowerCase().includes(q))
  const exact = labels.some(label => label.name.toLowerCase() === q)
  const canCreate = !!onCreate && !!q && !exact
  const toggle = (name: string) => onChange(selected.includes(name) ? selected.filter(l => l !== name) : [...selected, name])
  const { active, setActive, onKeyDown } = useMenuKeys(visible.length + (canCreate ? 1 : 0), index => {
    if (index < visible.length) toggle(visible[index].name)
    else void create()
  })
  const create = async () => {
    if (!onCreate || !q || busy) return
    setBusy(true)
    try {
      await onCreate(query.trim().replace(/^@/, ''))
      onChange([...selected, query.trim().replace(/^@/, '')])
      setQuery('')
    } finally {
      setBusy(false)
    }
  }
  return (
    <Popover anchor={anchor} inline={inline} onClose={onClose} width={250}>
      <input autoFocus className="td-popover-input" placeholder="Type a label" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} />
      <div className="td-menu" role="menu">
        {visible.map((label, index) => (
          <button
            key={label.id}
            type="button"
            role="menuitemcheckbox"
            aria-checked={selected.includes(label.name)}
            className={`td-menu-item${index === active ? ' is-active' : ''}`}
            onMouseEnter={() => setActive(index)}
            onClick={() => toggle(label.name)}
          >
            <span className="td-menu-icon" style={{ color: colorHex(label.color) }}><LabelIcon /></span>
            <span className="td-menu-label">{label.name}</span>
            <span className={`td-check${selected.includes(label.name) ? ' is-on' : ''}`} />
          </button>
        ))}
        {canCreate && (
          <button type="button" className={`td-menu-item${active === visible.length ? ' is-active' : ''}`} onClick={() => void create()} disabled={busy}>
            <span className="td-menu-icon"><PlusIcon /></span>
            <span className="td-menu-label">Create label “{query.trim().replace(/^@/, '')}”</span>
          </button>
        )}
        {!visible.length && !canCreate && <div className="td-menu-empty">No labels yet. Type a name to create one.</div>}
      </div>
    </Popover>
  )
}

// ---------------------------------------------------------------------------
// Project / section

export type ProjectTarget = { projectId: string; sectionId: string | null }

export function ProjectPicker({ anchor, meta, current, onPick, onClose, inline }: {
  /** Render inside the layout instead of floating (the Quick Add modal: a
   *  floating menu there is clipped by the host's content-sized frame). */
  inline?: boolean
  anchor: HTMLElement | null
  meta: Meta
  current?: ProjectTarget
  onPick: (target: ProjectTarget) => void
  onClose: () => void
}) {
  const [query, setQuery] = useState('')
  const q = query.trim().replace(/^#/, '').toLowerCase()
  const rows = useMemo(() => {
    const out: Array<{ key: string; target: ProjectTarget; project: ProjectRow; section?: string; depth: number }> = []
    for (const { project, depth } of projectTree(meta.projects)) {
      const sections = meta.sections.filter(s => s.projectId === project.id)
      const projectMatch = !q || project.name.toLowerCase().includes(q)
      const matchingSections = sections.filter(s => !q || s.name.toLowerCase().includes(q) || projectMatch)
      if (projectMatch || matchingSections.length) out.push({ key: project.id, target: { projectId: project.id, sectionId: null }, project, depth })
      for (const section of matchingSections) {
        out.push({ key: `${project.id}/${section.id}`, target: { projectId: project.id, sectionId: section.id }, project, section: section.name, depth: depth + 1 })
      }
    }
    return out
  }, [meta, q])
  const { active, setActive, onKeyDown } = useMenuKeys(rows.length, index => { onPick(rows[index].target); onClose() })
  return (
    <Popover anchor={anchor} inline={inline} onClose={onClose} width={280}>
      <input autoFocus className="td-popover-input" placeholder="Type a project or section" value={query} onChange={e => setQuery(e.target.value)} onKeyDown={onKeyDown} />
      <div className="td-menu" role="menu">
        {rows.map((row, index) => {
          const isCurrent = current?.projectId === row.target.projectId && (current?.sectionId ?? null) === row.target.sectionId
          return (
            <button
              key={row.key}
              type="button"
              role="menuitemradio"
              aria-checked={isCurrent}
              className={`td-menu-item${index === active ? ' is-active' : ''}${row.section ? ' is-section' : ''}`}
              style={{ paddingLeft: 10 + row.depth * 14 }}
              onMouseEnter={() => setActive(index)}
              onClick={() => { onPick(row.target); onClose() }}
            >
              <span className="td-menu-icon">
                {row.section ? <span className="td-section-glyph" /> : row.project.isInbox ? <InboxIcon /> : <span className="td-dot" style={{ background: colorHex(row.project.color) }} />}
              </span>
              <span className="td-menu-label">{row.section ?? row.project.name}</span>
              <span className="td-menu-hint">{isCurrent ? '✓' : ''}</span>
            </button>
          )
        })}
        {!rows.length && <div className="td-menu-empty">No matching project.</div>}
      </div>
    </Popover>
  )
}

/** Projects in sidebar order: Inbox first, then the tree by childOrder. */
export function projectTree(projects: ProjectRow[]): Array<{ project: ProjectRow; depth: number }> {
  const byParent = new Map<string | null, ProjectRow[]>()
  const ids = new Set(projects.map(p => p.id))
  for (const project of projects) {
    // A parent we cannot see (archived, other workspace) must not hide its children.
    const parent = project.parentId && ids.has(project.parentId) ? project.parentId : null
    const list = byParent.get(parent) ?? []
    list.push(project)
    byParent.set(parent, list)
  }
  const out: Array<{ project: ProjectRow; depth: number }> = []
  const walk = (parent: string | null, depth: number) => {
    const children = (byParent.get(parent) ?? []).sort((a, b) => Number(b.isInbox) - Number(a.isInbox) || a.order - b.order)
    for (const child of children) {
      out.push({ project: child, depth })
      if (depth < 6) walk(child.id, depth + 1)
    }
  }
  walk(null, 0)
  return out
}
