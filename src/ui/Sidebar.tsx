import { useState } from 'react'

import { colorHex, COLOR_KEYS } from '../shared/colors'
import type { ListQuery, Meta, UserRow } from '../shared/types'
import { ChevronDownIcon, DoneIcon, FilterIcon, InboxIcon, LabelIcon, PlusIcon, SearchIcon, SignOutIcon, TodayIcon, UpcomingIcon } from './Icons'
import { projectTree } from './pickers'

// Navigation. Mirrors Todoist's sidebar order (Search, Inbox, Today, Upcoming,
// Completed; then Favorites, Projects, Labels, Filters) so a Todoist user finds
// things where their hands expect them.

export type ViewKey = ListQuery

export function sameView(a: ViewKey, b: ViewKey): boolean {
  return a.kind === b.kind && (a.id ?? null) === (b.id ?? null) && (a.query ?? null) === (b.query ?? null)
}

export function Sidebar({ meta, current, counts, user, onSelect, onSearch, onAddTask, onCreateProject, onCreateLabel, onSignOut }: {
  /** Opens the add-task editor (absent for read-only accounts). */
  onAddTask?: () => void
  meta: Meta | null
  current: ViewKey
  counts: { today: number | null; inbox: number | null }
  user: UserRow | null
  onSelect: (view: ViewKey) => void
  onSearch: () => void
  onCreateProject: (name: string, color: string) => Promise<boolean>
  onCreateLabel: (name: string) => Promise<boolean>
  onSignOut: () => void
}) {
  const [open, setOpen] = useState({ favorites: true, projects: true, labels: false, filters: false })
  const [adding, setAdding] = useState<null | 'project' | 'label'>(null)
  const [name, setName] = useState('')
  const [color, setColor] = useState('charcoal')
  const inbox = meta?.projects.find(p => p.isInbox)

  const item = (view: ViewKey, icon: React.ReactNode, label: string, count?: number | null, color?: string) => (
    <button
      key={`${view.kind}:${view.id ?? view.query ?? ''}`}
      className={`td-nav-item${sameView(current, view) ? ' is-active' : ''}`}
      onClick={() => onSelect(view)}
      title={label}
    >
      <span className="td-nav-icon" style={color ? { color } : undefined}>{icon}</span>
      <span className="td-nav-label">{label}</span>
      {count ? <span className="td-nav-count">{count}</span> : null}
    </button>
  )

  const favorites = [
    ...(meta?.projects.filter(p => p.isFavorite && !p.isInbox).map(p => item({ kind: 'project', id: p.id }, <span className="td-dot" style={{ background: colorHex(p.color) }} />, p.name)) ?? []),
    ...(meta?.labels.filter(l => l.isFavorite).map(l => item({ kind: 'label', query: l.name }, <LabelIcon />, l.name, null, colorHex(l.color))) ?? []),
    ...(meta?.filters.filter(f => f.isFavorite).map(f => item({ kind: 'filter', id: f.id, query: f.query }, <FilterIcon />, f.name, null, colorHex(f.color))) ?? []),
  ]

  const submitNew = async (event: React.FormEvent) => {
    event.preventDefault()
    const value = name.trim()
    if (!value) return
    const ok = adding === 'project' ? await onCreateProject(value, color) : adding === 'label' ? await onCreateLabel(value) : false
    // On failure (offline, duplicate name) keep the form and what was typed;
    // the error toast says why. Clearing it made the user retype (review).
    if (!ok) return
    setName('')
    setAdding(null)
  }

  return (
    <nav className="td-sidebar" aria-label="Todoist navigation">
      <div className="td-nav-group">
        {onAddTask && (
          <button className="td-nav-item td-nav-addtask" onClick={onAddTask} title="Add task (q)">
            <span className="td-nav-icon td-nav-add-icon"><PlusIcon size={14} /></span><span className="td-nav-label">Add task</span>
          </button>
        )}
        <button className="td-nav-item" onClick={onSearch} title="Search (/)">
          <span className="td-nav-icon"><SearchIcon /></span><span className="td-nav-label">Search</span><kbd>/</kbd>
        </button>
        {item({ kind: 'inbox' }, <InboxIcon />, 'Inbox', counts.inbox, '#246fe0')}
        {item({ kind: 'today' }, <TodayIcon />, 'Today', counts.today, '#058527')}
        {item({ kind: 'upcoming' }, <UpcomingIcon />, 'Upcoming', null, '#692fc2')}
        {item({ kind: 'completed' }, <DoneIcon />, 'Completed', null, '#eb8909')}
      </div>

      {favorites.length > 0 && (
        <Group title="Favorites" open={open.favorites} onToggle={() => setOpen(o => ({ ...o, favorites: !o.favorites }))}>
          {favorites}
        </Group>
      )}

      <Group
        title="My Projects"
        open={open.projects}
        onToggle={() => setOpen(o => ({ ...o, projects: !o.projects }))}
        onAdd={() => { setAdding('project'); setName(''); setOpen(o => ({ ...o, projects: true })) }}
      >
        {!meta && <SkeletonRows />}
        {meta && projectTree(meta.projects).filter(({ project }) => project.id !== inbox?.id).map(({ project, depth }) => (
          <div key={project.id} style={{ paddingLeft: depth * 12 }}>
            {item({ kind: 'project', id: project.id }, <span className="td-dot" style={{ background: colorHex(project.color) }} />, project.name)}
          </div>
        ))}
        {adding === 'project' && (
          <form className="td-nav-add" onSubmit={e => void submitNew(e)}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Project name" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setAdding(null) } }} />
            <div className="td-swatches">
              {COLOR_KEYS.map(key => (
                <button key={key} type="button" title={key.replace('_', ' ')} className={`td-swatch${key === color ? ' is-on' : ''}`} style={{ background: colorHex(key) }} onClick={() => setColor(key)} />
              ))}
            </div>
            <div className="td-nav-add-actions"><button type="button" className="td-btn td-btn-ghost" onClick={() => setAdding(null)}>Cancel</button><button className="td-btn td-btn-primary" disabled={!name.trim()}>Add project</button></div>
          </form>
        )}
      </Group>

      <Group
        title="Labels"
        open={open.labels}
        onToggle={() => setOpen(o => ({ ...o, labels: !o.labels }))}
        onAdd={() => { setAdding('label'); setName(''); setOpen(o => ({ ...o, labels: true })) }}
      >
        {meta?.labels.map(l => item({ kind: 'label', query: l.name }, <LabelIcon />, l.name, null, colorHex(l.color)))}
        {meta && !meta.labels.length && adding !== 'label' && <div className="td-nav-empty">No labels</div>}
        {adding === 'label' && (
          <form className="td-nav-add" onSubmit={e => void submitNew(e)}>
            <input autoFocus value={name} onChange={e => setName(e.target.value)} placeholder="Label name" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setAdding(null) } }} />
            <div className="td-nav-add-actions"><button type="button" className="td-btn td-btn-ghost" onClick={() => setAdding(null)}>Cancel</button><button className="td-btn td-btn-primary" disabled={!name.trim()}>Add label</button></div>
          </form>
        )}
      </Group>

      {meta && meta.filters.length > 0 && (
        <Group title="Filters" open={open.filters} onToggle={() => setOpen(o => ({ ...o, filters: !o.filters }))}>
          {meta.filters.map(f => item({ kind: 'filter', id: f.id, query: f.query }, <FilterIcon />, f.name, null, colorHex(f.color)))}
        </Group>
      )}

      {user && (
        <div className="td-account">
          <span className="td-avatar">{(user.fullName || user.email || '?').slice(0, 1).toUpperCase()}</span>
          <span className="td-account-text">
            <span>{user.fullName || user.email}</span>
            {user.readOnly && <span className="td-dim td-small">Read-only</span>}
          </span>
          <button className="td-icon-btn sm" title="Sign out of td" onClick={onSignOut}><SignOutIcon size={13} /></button>
        </div>
      )}
    </nav>
  )
}

function Group({ title, open, onToggle, onAdd, children }: { title: string; open: boolean; onToggle: () => void; onAdd?: () => void; children: React.ReactNode }) {
  return (
    <div className="td-nav-group">
      <div className="td-nav-heading">
        <button className="td-nav-heading-btn" onClick={onToggle} aria-expanded={open}>
          <ChevronDownIcon size={12} className={open ? '' : 'is-collapsed'} />
          {title}
        </button>
        {onAdd && <button className="td-icon-btn sm" title={`Add ${title.toLowerCase().replace('my ', '').replace(/s$/, '')}`} onClick={onAdd}><PlusIcon size={12} /></button>}
      </div>
      {open && children}
    </div>
  )
}

function SkeletonRows() {
  return <>{[70, 55, 80].map(w => <div key={w} className="td-nav-item"><span className="td-skel" style={{ width: `${w}%` }} /></div>)}</>
}
