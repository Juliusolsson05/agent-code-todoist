import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { colorHex } from '../shared/colors'
import { queryKey, type QueryContext } from '../shared/listModel'
import type { QuickAddIntent } from '../shared/quickAddPlan'
import type { ApiPriority, HostState, ListQuery, TaskRow, UserRow } from '../shared/types'
import { tdErrorCode, tdErrorMessage } from '../shared/types'
import { AddTask, type AddTaskHandle } from './AddTask'
import { useBridge, useHostState, useNow, usePersistent } from './bridge'
import { CloseIcon, ExternalIcon, InboxIcon, KeyboardIcon, PlusIcon, RefreshIcon, SearchIcon, SidebarIcon } from './Icons'
import { isActivatable, onKeyAfterReact } from './keys'
import { buildGroups, DeleteConfirm, EmptyState, ListSkeleton, ShortcutHelp, Toasts, useToasts, viewTitle, type Deleting } from './listParts'
import { SetupScreen } from './SetupScreen'
import { Sidebar, sameView } from './Sidebar'
import { useStore } from './store'
import { TaskDetailPanel } from './TaskDetail'
import { TaskItem, type Lookup, type RowActions } from './TaskItem'
import { useFlip } from './useFlip'
import { useTaskActions } from './useTaskActions'
import { useChangeFeed, useListLoader, useMeta } from './useWorkspaceData'

// The Todoist workspace (pane and modal).
//
// Local-first, like Todoist's own app (plan: "Rebuild for feel"):
//   store (store.ts)        every list seen, every task, optimistic state —
//                           survives view switches; views are reads of it
//   change feed (runtime)   what Todoist answered after ANY view's edit;
//                           applied in place, no refetch
//   revalidation            quiet: on view switch, focus, every 60 s, and
//                           when the feed has a gap — never empties a list,
//                           never hides the count, never spins
//   actions                 applied at once, synced behind (useTaskActions)

/** `modal`: the same workspace in a floating dialog (`todoist.window`). The
 *  host sizes a modal from its content, so the modal root has a fixed natural
 *  size (styles.css .td-window-root) instead of the pane's 100vh, and the
 *  header gets a close button (Esc with nothing open also closes it). */
export type AppVariant = 'pane' | 'modal'

export function App({ variant = 'pane' }: { variant?: AppVariant } = {}) {
  const bridge = useBridge()
  const host = useHostState(bridge)
  const now = useNow()
  const ready = host?.setup?.state === 'ready'

  // Kick a status check on mount: the runtime publishes the result to us.
  useEffect(() => { void bridge.call('status', {}).catch(() => {}) }, [bridge])

  if (!ready) {
    return (
      <div className={rootClass(variant)}>
        <SetupScreen setup={host?.setup ?? null} onRetry={async () => { await bridge.call('status', { refresh: true }) }} />
      </div>
    )
  }
  return <Workspace variant={variant} host={host!} now={now} user={host!.setup!.user} />
}

const rootClass = (variant: AppVariant, extra = '') => `td-root${variant === 'modal' ? ' td-window-root' : ''}${extra}`

/** True once `active` has stayed true for `ms` (a skeleton only for loads
 *  long enough to notice; fast loads show nothing instead of a flash). */
function useDelayed(active: boolean, ms: number): boolean {
  const [shown, setShown] = useState(false)
  useEffect(() => {
    if (!active) { setShown(false); return }
    const timer = setTimeout(() => setShown(true), ms)
    return () => clearTimeout(timer)
  }, [active, ms])
  return shown
}

function Workspace({ variant, host, now, user }: { variant: AppVariant; host: HostState; now: Date; user: UserRow | null }) {
  const bridge = useBridge()
  const s = useStore()
  // Not persisted: Settings has an "Open on" row (review of PR #2).
  const [view, setView] = useState<ListQuery>({ kind: host.settings.defaultView })
  const key = queryKey(view)
  const [sidebarPref, setSidebarPref] = usePersistent<boolean>(bridge, 'todoist.ui.sidebar', true)
  const { meta, ensureSections, setMeta } = useMeta(bridge, host.metaRevision)
  const [focusId, setFocusId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [width, setWidth] = useState(() => window.innerWidth)
  const [overlaySidebar, setOverlaySidebar] = useState(false)
  const [help, setHelp] = useState(false)
  const [deleting, setDeleting] = useState<Deleting | null>(null)
  const [addingSection, setAddingSection] = useState<string | null>(null)
  const sectionSubmitting = useRef(false)
  const addTask = useRef<AddTaskHandle>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const viewRef = useRef(view)
  viewRef.current = view
  const { toasts, toast, dismiss } = useToasts()

  const narrow = width < 640
  const sidebarVisible = narrow ? overlaySidebar : sidebarPref

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const fail = useCallback((error: unknown) => {
    // Sign-out / td removal: the runtime re-checks setup and the whole pane
    // swaps to the setup screen; a toast would just flash first.
    const code = tdErrorCode(error)
    if (code === 'NO_TOKEN' || code === 'AUTH' || code === 'TD_NOT_FOUND') return
    toast(tdErrorMessage(error), { tone: 'error' })
  }, [toast])

  const openUrl = useCallback((url: string) => { void bridge.call('openUrl', { url }).catch(fail) }, [bridge, fail])

  const inboxId = meta?.projects.find(p => p.isInbox)?.id ?? null
  const ctx: QueryContext = useMemo(() => ({ now, inboxId, userId: user?.id ?? null }), [now, inboxId, user?.id])

  // ---- data ---------------------------------------------------------------
  const { revalidate, loadMore } = useListLoader(bridge)
  const quietly = useCallback((query: ListQuery, cacheFirst = false) => { void revalidate(query, { cacheFirst }).catch(() => {}) }, [revalidate])

  // Switching list: show what the store has, ask behind it.
  useEffect(() => { quietly(view, true) }, [key]) // eslint-disable-line react-hooks/exhaustive-deps
  // Everything may be stale (account/td change, explicit refresh).
  const firstRevision = useRef(host.revision)
  useEffect(() => {
    if (host.revision === firstRevision.current) return
    firstRevision.current = host.revision
    quietly(viewRef.current)
  }, [host.revision, quietly])
  // Changes made in Todoist itself (phone, web): revalidate on focus and
  // every minute while visible — quietly.
  useEffect(() => {
    const again = () => { if (document.visibilityState === 'visible') quietly(viewRef.current) }
    window.addEventListener('focus', again)
    document.addEventListener('visibilitychange', again)
    const timer = setInterval(again, 60_000)
    return () => { window.removeEventListener('focus', again); document.removeEventListener('visibilitychange', again); clearInterval(timer) }
  }, [quietly])
  useChangeFeed(host, ctx, () => quietly(viewRef.current))

  const currentProjectId = view.kind === 'project' ? view.id : view.kind === 'inbox' ? inboxId ?? undefined : undefined
  const currentProject = currentProjectId ? meta?.projects.find(p => p.id === currentProjectId) : undefined
  useEffect(() => { if (currentProjectId) ensureSections(currentProjectId) }, [currentProjectId, ensureSections])

  // ---- the list ----------------------------------------------------------
  const state = s.query(key)
  const rows = s.rows(key, ctx)
  const showSkeleton = useDelayed(!state || state.status === 'empty', 150)
  const lookup: Lookup = useMemo(() => {
    const projects = new Map(meta?.projects.map(p => [p.id, p]))
    const sections = new Map(meta?.sections.map(sec => [sec.id, sec]))
    const labels = new Map(meta?.labels.map(l => [l.name, l]))
    return {
      project: id => projects.get(id),
      section: id => (id ? sections.get(id) : undefined),
      label: name => labels.get(name),
    }
  }, [meta])
  const { groups, depths, childCounts } = useMemo(() => buildGroups(view, rows, now, meta, currentProjectId), [view, rows, now, meta, currentProjectId])
  const flat = useMemo(() => groups.flatMap(g => g.tasks), [groups])
  useFlip(listRef, flat.map(t => t.id).join(','), key)

  // Sidebar counts from the store (always the same numbers as the lists).
  const todayState = s.query('today::')
  const inboxState = s.query('inbox::')
  const counts = {
    today: todayState?.status === 'ready' && !todayState.cursor ? s.rows('today::', ctx).filter(t => !s.phase(t.id)).length : null,
    inbox: inboxState?.status === 'ready' && !inboxState.cursor ? s.rows('inbox::', ctx).filter(t => !s.phase(t.id)).length : null,
  }

  // ---- actions ------------------------------------------------------------
  const flatRef = useRef(flat)
  flatRef.current = flat
  const actions = useTaskActions(bridge, {
    toast,
    fail,
    onGone: id => {
      // Keep a usable selection: the next surviving row, else the previous.
      setFocusId(current => {
        if (current !== id) return current
        const list = flatRef.current
        const index = list.findIndex(t => t.id === id)
        const next = list.slice(index + 1).find(t => !s.isHidden(t.id)) ?? list.slice(0, Math.max(0, index)).reverse().find(t => !s.isHidden(t.id))
        return next?.id ?? null
      })
      setOpenId(current => (current === id && !s.task(id)?.due?.recurring ? null : current))
    },
  })

  const requestDelete = useCallback((id: string, row?: TaskRow) => {
    setDeleting({ id, task: row ?? s.task(id) ?? null, subtasks: null })
    bridge.call('task', { id }).then(
      detail => setDeleting(current => (current?.id === id ? { id, task: detail.task, subtasks: detail.children.length } : current)),
      () => {},
    )
  }, [bridge, s])

  const rowActions: RowActions = useMemo(() => ({
    toggle: task => actions.complete(task),
    open: task => { setFocusId(task.id); setOpenId(task.id) },
    focus: task => setFocusId(task.id),
    patch: (task, patch) => { void actions.update(task, patch).catch(() => {}) },
    remove: user?.readOnly ? undefined : task => { setFocusId(task.id); requestDelete(task.id, task) },
    openUrl,
  }), [actions, user?.readOnly, requestDelete, openUrl])

  /** What adding a task HERE implies: Today → due today; a project (or one
   *  of its sections) → that project; a label view → that label. */
  const intentHere = useCallback((sectionId?: string | null): QuickAddIntent => ({
    due: view.kind === 'today' ? 'today' : null,
    labels: view.kind === 'label' && view.query ? [view.query] : [],
    projectId: view.kind === 'project' ? view.id ?? null : null,
    sectionId: sectionId ?? null,
    inboxId,
  }), [view, inboxId])

  const submitAdd = useCallback((text: string, intent: QuickAddIntent) => actions.add(text, intent, viewRef.current), [actions])

  const createLabel = useCallback(async (name: string) => {
    try {
      await bridge.call('createLabel', { name })
    } catch (error) { fail(error); throw error }
  }, [bridge, fail])

  const selectView = useCallback((next: ListQuery) => {
    setSearching(false)
    setOverlaySidebar(false)
    setFocusId(null)
    if (sameView(next, viewRef.current)) quietly(next)
    else setView(next)
    listRef.current?.scrollTo({ top: 0 })
  }, [quietly])

  // Search: debounce typing into a `search` view.
  useEffect(() => {
    if (!searching) return
    const q = searchText.trim()
    if (!q) return
    const timer = setTimeout(() => setView({ kind: 'search', query: q }), 250)
    return () => clearTimeout(timer)
  }, [searchText, searching])

  const closeSearch = useCallback(() => {
    setSearching(false)
    setSearchText('')
    if (viewRef.current.kind === 'search') setView({ kind: host.settings.defaultView })
  }, [host.settings.defaultView])

  const refreshAll = useCallback(() => {
    quietly(viewRef.current)
    void bridge.call('meta', {}).then(m => { if (m) setMeta(m) }, () => {})
  }, [bridge, quietly, setMeta])

  // ---- keyboard -----------------------------------------------------------
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = target.closest('input, textarea, select, [contenteditable="true"]')
      if (event.key === 'Escape') {
        // (The delete confirmation and pickers handle their own Escape.)
        if (event.defaultPrevented) return
        // Our Escape, never the host's (which closes the pane): close the
        // innermost thing that is open. See keys.ts for why this is on document.
        if (help) { event.preventDefault(); setHelp(false); return }
        if (openId) { event.preventDefault(); setOpenId(null); return }
        if (searching || viewRef.current.kind === 'search') { event.preventDefault(); closeSearch(); return }
        if (overlaySidebar) { event.preventDefault(); setOverlaySidebar(false); return }
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      if (deleting) return
      const list = flatRef.current
      const index = list.findIndex(t => t.id === focusId)
      const focused = index >= 0 ? list[index] : null
      const move = (delta: number) => {
        if (!list.length) return
        const next = list[Math.max(0, Math.min(list.length - 1, (index < 0 ? (delta > 0 ? -1 : list.length) : index) + delta))]
        setFocusId(next.id)
        listRef.current?.querySelector(`[data-task-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({ block: 'nearest' })
        if (openId) setOpenId(next.id)
      }
      const key = event.key
      // Enter and Space belong to a focused button or link.
      if ((key === 'Enter' || key === ' ') && isActivatable(target)) return
      if (key === 'j' || key === 'ArrowDown') { event.preventDefault(); move(1) }
      else if (key === 'k' || key === 'ArrowUp') { event.preventDefault(); move(-1) }
      else if ((key === 'Enter' || key === 'o') && focused) { event.preventDefault(); setOpenId(focused.id) }
      else if ((key === 'x' || key === ' ') && focused) { event.preventDefault(); actions.complete(focused) }
      else if (/^[1-4]$/.test(key) && focused) { event.preventDefault(); void actions.update(focused, { priority: (5 - Number(key)) as ApiPriority }).catch(() => {}) }
      else if (key === 't' && focused) { event.preventDefault(); void actions.update(focused, { due: 'today' }).catch(() => {}) }
      else if ((key === 'Backspace' || key === 'Delete') && !user?.readOnly && !target.closest('.td-popover, [role="dialog"]:not(.td-task-modal)')) {
        // The task the user is looking at: the open one, else the focused row.
        const id = openId ?? focused?.id
        if (id) { event.preventDefault(); requestDelete(id, s.task(id)) }
      }
      else if ((key === 'q' || key === 'a') && !user?.readOnly) { event.preventDefault(); addTask.current?.open() }
      else if (key === '/') { event.preventDefault(); setSearching(true); requestAnimationFrame(() => searchInput.current?.focus()) }
      else if (key === 'r') { event.preventDefault(); refreshAll() }
      else if (key === '[') { event.preventDefault(); if (narrow) setOverlaySidebar(v => !v); else setSidebarPref(!sidebarPref) }
      else if (key === '?') { event.preventDefault(); setHelp(v => !v) }
    }
    return onKeyAfterReact(onKey)
  }, [focusId, openId, searching, overlaySidebar, help, actions, narrow, sidebarPref, setSidebarPref, closeSearch, deleting, user?.readOnly, requestDelete, refreshAll, s])

  // ---- render -------------------------------------------------------------
  const title = viewTitle(view, meta)
  const openCount = flat.filter(t => !t.completedAt && !s.phase(t.id)).length
  const canAdd = !user?.readOnly && view.kind !== 'completed'
  const addHint = view.kind === 'today' ? 'Due today unless you type a date'
    : view.kind === 'label' ? `Tagged @${view.query}` : null
  const ready = state?.status === 'ready'
  const projectView = (view.kind === 'project' || view.kind === 'inbox') && !!currentProjectId

  return (
    <div className={rootClass(variant, narrow ? ' is-narrow' : '')}>
      <div className={`td-layout${sidebarVisible && !narrow ? ' has-sidebar' : ''}`}>
        {sidebarVisible && (
          <>
            {narrow && <div className="td-scrim" onClick={() => setOverlaySidebar(false)} />}
            <Sidebar
              meta={meta}
              current={view}
              counts={counts}
              user={user}
              onSelect={selectView}
              onAddTask={canAdd ? () => { setOverlaySidebar(false); addTask.current?.open() } : undefined}
              onSearch={() => { setSearching(true); setOverlaySidebar(false); requestAnimationFrame(() => searchInput.current?.focus()) }}
              onCreateProject={async (name, color) => {
                try {
                  const project = await bridge.call('createProject', { name, color })
                  selectView({ kind: 'project', id: project.id })
                  return true
                } catch (error) { fail(error); return false }
              }}
              onCreateLabel={async name => { try { await createLabel(name); return true } catch { return false /* toast shown */ } }}
              onSignOut={() => { void bridge.call('logout', {}).catch(fail) }}
            />
          </>
        )}

        <main className="td-main">
          <header className="td-header">
            <button className="td-icon-btn" title={sidebarVisible ? 'Hide sidebar ([)' : 'Show sidebar ([)'} onClick={() => (narrow ? setOverlaySidebar(v => !v) : setSidebarPref(!sidebarPref))}>
              <SidebarIcon />
            </button>
            {searching ? (
              <div className="td-search">
                <SearchIcon />
                <input
                  ref={searchInput}
                  value={searchText}
                  onChange={e => setSearchText(e.target.value)}
                  placeholder="Search tasks"
                  onKeyDown={e => {
                    if (e.key === 'Escape') { e.preventDefault(); closeSearch() }
                    if (e.key === 'ArrowDown') { e.preventDefault(); (e.target as HTMLInputElement).blur(); if (flat[0]) setFocusId(flat[0].id) }
                  }}
                />
                <button className="td-icon-btn sm" onClick={closeSearch} title="Close search"><CloseIcon size={12} /></button>
              </div>
            ) : (
              <div className="td-title">
                {view.kind === 'project' && currentProject && <span className="td-dot lg" style={{ background: colorHex(currentProject.color) }} />}
                {view.kind === 'inbox' && <InboxIcon />}
                <h1>{title}</h1>
                {ready && view.kind !== 'completed' && <span className="td-title-count">{openCount}{state?.cursor ? '+' : ''}</span>}
              </div>
            )}
            <div className="td-header-tools">
              {currentProject && !currentProject.isInbox && <button className="td-icon-btn" title="Open project in Todoist" onClick={() => openUrl(currentProject.url)}><ExternalIcon /></button>}
              <button className="td-icon-btn" title="Keyboard shortcuts (?)" onClick={() => setHelp(true)}><KeyboardIcon /></button>
              <button className="td-icon-btn" title="Refresh (r)" onClick={refreshAll}><RefreshIcon /></button>
              {variant === 'modal' && (
                <button className="td-icon-btn" title="Close (Esc)" onClick={() => void bridge.context.api.ui.close()}><CloseIcon /></button>
              )}
            </div>
          </header>

          <div className="td-list" ref={listRef} role="list">
            {!ready && !rows.length ? (
              state?.status === 'error' ? (
                <div className="td-empty">
                  <p>Couldn’t load this list.</p>
                  <p className="td-dim td-small">{state.error}</p>
                  <button className="td-btn" onClick={() => quietly(view)}>Try again</button>
                </div>
              ) : showSkeleton ? <ListSkeleton /> : null
            ) : (
              <>
                {!flat.length && <EmptyState view={view} />}
                {groups.map(group => (
                  <section key={group.key} className="td-group">
                    {(groups.length > 1 || group.subtitle || group.key !== 'all') && group.title && (
                      <h2 className={`td-group-title${group.tone ? ` tone-${group.tone}` : ''}`}>
                        {group.title}
                        {group.subtitle && <span className="td-group-sub">{group.subtitle}</span>}
                        <span className="td-group-count">{group.tasks.filter(t => !s.phase(t.id)).length}</span>
                      </h2>
                    )}
                    {group.tasks.map(task => (
                      <TaskItem
                        key={task.id}
                        task={task}
                        lookup={lookup}
                        now={now}
                        showProject={view.kind !== 'project' && view.kind !== 'inbox'}
                        focused={focusId === task.id || openId === task.id}
                        phase={s.phase(task.id)}
                        pending={s.isPending(task.id)}
                        depth={depths.get(task.id) ?? 0}
                        childCount={childCounts.get(task.id) ?? 0}
                        actions={rowActions}
                      />
                    ))}
                    {projectView && canAdd && group.key !== 'all' && (
                      <AddTask meta={meta} base={intentHere(group.key)} onSubmit={submitAdd} onLabelCreate={createLabel} />
                    )}
                  </section>
                ))}
              </>
            )}

            {canAdd && (ready || rows.length > 0) && (
              <AddTask ref={addTask} meta={meta} base={intentHere(null)} hint={addHint} onSubmit={submitAdd} onLabelCreate={createLabel} />
            )}

            {(state?.cursor || state?.truncated) && flat.length > 0 && (
              <div className="td-more">
                {state.cursor ? (
                  <button className="td-btn" disabled={state.refreshing} onClick={() => void loadMore(view).catch(fail)}>
                    Load more
                  </button>
                ) : (
                  <span className="td-dim td-small">Showing the first {flat.length} tasks — this filter has more than can be loaded here. Open it in Todoist for the rest.</span>
                )}
              </div>
            )}

            {view.kind === 'project' && currentProject && !user?.readOnly && ready && (
              addingSection !== null ? (
                <form
                  className="td-section-add"
                  onSubmit={async e => {
                    e.preventDefault()
                    const name = addingSection.trim()
                    // One submit at a time: a double click created two
                    // identical sections (review).
                    if (!name || sectionSubmitting.current) return
                    sectionSubmitting.current = true
                    try {
                      await bridge.call('createSection', { projectId: currentProject.id, name })
                      setAddingSection(null)
                    } catch (error) { fail(error) } finally { sectionSubmitting.current = false }
                  }}
                >
                  <input autoFocus value={addingSection} onChange={e => setAddingSection(e.target.value)} placeholder="Section name" onKeyDown={e => { if (e.key === 'Escape') { e.preventDefault(); e.stopPropagation(); setAddingSection(null) } }} />
                  <button className="td-btn td-btn-primary" disabled={!addingSection.trim()}>Add section</button>
                  <button type="button" className="td-btn td-btn-ghost" onClick={() => setAddingSection(null)}>Cancel</button>
                </form>
              ) : (
                <button className="td-add-section" onClick={() => setAddingSection('')}><PlusIcon size={12} /> Add section</button>
              )
            )}
          </div>
        </main>
      </div>

      {openId && meta && (
        <TaskDetailPanel
          taskId={openId}
          meta={meta}
          now={now}
          actions={actions}
          readOnly={!!user?.readOnly}
          onClose={() => setOpenId(null)}
          onOpenTask={id => setOpenId(id)}
          onDelete={task => requestDelete(task.id, task)}
          onError={message => toast(message, { tone: 'error' })}
          onOpenUrl={openUrl}
          onCreateLabel={createLabel}
          onNeedSections={ensureSections}
        />
      )}

      <Toasts toasts={toasts} onDismiss={dismiss} />

      {help && <ShortcutHelp onClose={() => setHelp(false)} />}
      {deleting && (
        <DeleteConfirm
          target={deleting}
          onCancel={() => setDeleting(null)}
          onConfirm={() => {
            const target = deleting
            setDeleting(null)
            setOpenId(current => (current === target.id ? null : current))
            actions.remove(target.id, target.task?.content ?? 'task')
          }}
        />
      )}
    </div>
  )
}
