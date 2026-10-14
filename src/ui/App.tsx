import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { colorHex } from '../shared/colors'
import { groupByDay, groupCompleted, groupToday, type TaskGroup } from '../shared/dates'
import { applyFollowUps, PartialAdd, planFollowUps } from '../shared/quickAddPlan'
import type { ApiPriority, ListQuery, Meta, SectionRow, TaskRow } from '../shared/types'
import { tdErrorCode, tdErrorMessage } from '../shared/types'
import { useBridge, useHostState, useNow, usePersistent } from './bridge'
import { isActivatable, onKeyAfterReact } from './keys'
import { CloseIcon, ExternalIcon, InboxIcon, KeyboardIcon, PlusIcon, RefreshIcon, SearchIcon, SidebarIcon } from './Icons'
import { QuickAddBar, type QuickAddHandle } from './QuickAddBar'
import { SetupScreen } from './SetupScreen'
import { Sidebar, sameView } from './Sidebar'
import { TaskDetailPanel } from './TaskDetail'
import { TaskItem, type Lookup } from './TaskItem'

// The Todoist pane.
//
// State ownership, from slowest-changing to fastest:
//   host (runtime publication)  setup status, settings, `revision`
//   meta                        projects/sections/labels/filters — refetched on revision
//   view                        which list is shown — starts at the "Open on" setting
//   page                        the tasks of that list — refetched on view/revision,
//                               keeping as many pages as the user had loaded
//   completing / toasts / focus purely local UI
//
// The one rule that keeps this coherent: after ANY successful mutation, the
// runtime bumps `revision` and every open view refetches. Optimistic local
// changes only bridge the ~0.5–1.5 s a td round-trip takes.

type Toast = { id: number; message: string; tone?: 'error'; action?: { label: string; run: () => void } }

const COMPLETE_ANIMATION_MS = 650

export function App() {
  const bridge = useBridge()
  const host = useHostState(bridge)
  const now = useNow()
  const ready = host?.setup?.state === 'ready'

  // Kick a status check on mount: the runtime publishes the result to us.
  useEffect(() => { void bridge.call('status', {}).catch(() => {}) }, [bridge])

  if (!ready) {
    return (
      <div className="td-root">
        <SetupScreen setup={host?.setup ?? null} onRetry={async () => { await bridge.call('status', { refresh: true }) }} />
      </div>
    )
  }
  return <Workspace revision={host!.revision} defaultView={host!.settings.defaultView} now={now} user={host!.setup!.user} />
}

function Workspace({ revision, defaultView, now, user }: { revision: number; defaultView: 'today' | 'upcoming' | 'inbox'; now: Date; user: import('../shared/types').UserRow | null }) {
  const bridge = useBridge()
  // Not persisted: Settings has an "Open on" row, and a remembered last view
  // made it do nothing after the first session (review of PR #2). Within one
  // open pane the view is plain state.
  const [view, setView] = useState<ListQuery>({ kind: defaultView })
  const [sidebarPref, setSidebarPref] = usePersistent<boolean>(bridge, 'todoist.ui.sidebar', true)
  const [baseMeta, setMeta] = useState<Meta | null>(null)
  // Sections arrive per project (td cannot list them account-wide; see
  // server/handlers.ts meta). Cached by project and merged into one Meta so
  // every consumer — grouping, row chips, pickers, drawer — reads one shape.
  const [sectionCache, setSectionCache] = useState<Record<string, SectionRow[]>>({})
  const [tasks, setTasks] = useState<TaskRow[]>([])
  const [cursor, setCursor] = useState<string | null>(null)
  const [truncated, setTruncated] = useState(false)
  const [loading, setLoading] = useState(true)
  const [loadingMore, setLoadingMore] = useState(false)
  const [listError, setListError] = useState<string | null>(null)
  const [counts, setCounts] = useState<{ today: number | null; inbox: number | null }>({ today: null, inbox: null })
  const [completing, setCompleting] = useState<Set<string>>(new Set())
  const [focusId, setFocusId] = useState<string | null>(null)
  const [openId, setOpenId] = useState<string | null>(null)
  const [toasts, setToasts] = useState<Toast[]>([])
  const [searching, setSearching] = useState(false)
  const [searchText, setSearchText] = useState('')
  const [width, setWidth] = useState(() => window.innerWidth)
  const [overlaySidebar, setOverlaySidebar] = useState(false)
  const [help, setHelp] = useState(false)
  const [addingSection, setAddingSection] = useState<string | null>(null)
  const quickAdd = useRef<QuickAddHandle>(null)
  const searchInput = useRef<HTMLInputElement>(null)
  const listRef = useRef<HTMLDivElement>(null)
  const requestSeq = useRef(0)
  /** Pages of the current list loaded so far ("Load more" adds one). A refetch
   *  after a mutation reloads the same number, so acting on a task from page 2
   *  does not snap the list back to page 1 and lose the user's place. */
  const pagesLoaded = useRef(1)
  /** Ids with a complete/reopen in flight. A ref, not state: the second click
   *  of a double click arrives before React re-renders, and two `complete`
   *  calls on a recurring task advance it twice (skipping an occurrence). */
  const toggling = useRef(new Set<string>())

  const narrow = width < 640
  const drawerOverlays = width < 820
  const sidebarVisible = narrow ? overlaySidebar : sidebarPref

  useEffect(() => {
    const onResize = () => setWidth(window.innerWidth)
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [])

  const toast = useCallback((message: string, extra: Partial<Toast> = {}) => {
    const id = Date.now() + Math.random()
    setToasts(list => [...list.slice(-2), { id, message, ...extra }])
    setTimeout(() => setToasts(list => list.filter(t => t.id !== id)), extra.action ? 6000 : extra.tone === 'error' ? 7000 : 3000)
  }, [])

  const fail = useCallback((error: unknown) => {
    // Sign-out / td removal are handled by the runtime re-checking setup (the
    // whole pane swaps to the setup screen); a toast would just flash first.
    const code = tdErrorCode(error)
    if (code === 'NO_TOKEN' || code === 'AUTH' || code === 'TD_NOT_FOUND') return
    toast(tdErrorMessage(error), { tone: 'error' })
  }, [toast])

  const openUrl = useCallback((url: string) => { void bridge.call('openUrl', { url }).catch(fail) }, [bridge, fail])

  // ---- data -------------------------------------------------------------
  useEffect(() => {
    let alive = true
    bridge.call('meta', {}).then(m => { if (alive) setMeta(m) }, fail)
    return () => { alive = false }
  }, [bridge, revision, fail])

  const ensureSections = useCallback((projectId: string) => {
    void bridge.call('sections', { projectId }).then(
      list => setSectionCache(cache => ({ ...cache, [projectId]: list })),
      () => {},
    )
  }, [bridge])

  const meta = useMemo<Meta | null>(
    () => (baseMeta ? { ...baseMeta, sections: Object.values(sectionCache).flat() } : null),
    [baseMeta, sectionCache],
  )

  const load = useCallback(async (query: ListQuery, mode: 'reset' | 'refresh' | 'append' = 'reset', from: string | null = null) => {
    const seq = ++requestSeq.current
    const append = mode === 'append'
    if (append) setLoadingMore(true)
    else setLoading(true)
    try {
      let page = await bridge.call('list', { ...query, cursor: append ? from : null })
      let rows = page.tasks
      if (mode === 'refresh') {
        // Reload as many pages as were showing before the change.
        for (let n = 1; n < pagesLoaded.current && page.nextCursor && seq === requestSeq.current; n++) {
          page = await bridge.call('list', { ...query, cursor: page.nextCursor })
          rows = [...rows, ...page.tasks.filter(t => !rows.some(r => r.id === t.id))]
        }
      }
      // A slower response for a view the user already left must not overwrite
      // the current one.
      if (seq !== requestSeq.current) return
      if (append) pagesLoaded.current += 1
      else if (mode === 'reset') pagesLoaded.current = 1
      setTasks(current => (append ? [...current, ...rows.filter(t => !current.some(c => c.id === t.id))] : rows))
      setCursor(page.nextCursor)
      setTruncated(page.truncated)
      setListError(null)
      if (!append && (query.kind === 'today' || query.kind === 'inbox')) {
        const open = rows.filter(t => !t.completedAt).length
        setCounts(c => ({ ...c, [query.kind]: page.nextCursor ? null : open }))
      }
    } catch (error) {
      if (seq !== requestSeq.current) return
      setListError(tdErrorMessage(error))
      fail(error)
    } finally {
      if (seq === requestSeq.current) {
        setLoading(false)
        setLoadingMore(false)
      }
    }
  }, [bridge, fail])

  const viewKey = JSON.stringify(view)
  const lastLoaded = useRef<string | null>(null)
  useEffect(() => {
    // Same view, new revision = something changed: keep the user's pages.
    const sameList = lastLoaded.current === viewKey
    lastLoaded.current = viewKey
    void load(view, sameList ? 'refresh' : 'reset')
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [viewKey, revision, load])

  // ---- lookups ----------------------------------------------------------
  const lookup: Lookup = useMemo(() => {
    const projects = new Map(meta?.projects.map(p => [p.id, p]))
    const sections = new Map(meta?.sections.map(s => [s.id, s]))
    const labels = new Map(meta?.labels.map(l => [l.name, l]))
    return {
      project: id => projects.get(id),
      section: id => (id ? sections.get(id) : undefined),
      label: name => labels.get(name),
    }
  }, [meta])

  const inboxProject = meta?.projects.find(p => p.isInbox)
  const currentProjectId = view.kind === 'project' ? view.id : view.kind === 'inbox' ? inboxProject?.id : undefined
  const currentProject = currentProjectId ? lookup.project(currentProjectId) : undefined

  useEffect(() => {
    if (currentProjectId) ensureSections(currentProjectId)
  }, [currentProjectId, revision, ensureSections])

  // ---- grouping ---------------------------------------------------------
  const { groups, depths, childCounts } = useMemo(() => buildGroups(view, tasks, now, meta, currentProjectId), [view, tasks, now, meta, currentProjectId])
  const flat = useMemo(() => groups.flatMap(g => g.tasks), [groups])

  // ---- actions ----------------------------------------------------------
  /** Complete or reopen. Resolves to whether the server accepted it, so the
   *  drawer can reload instead of painting a result that did not happen. */
  const toggle = useCallback(async (task: TaskRow): Promise<boolean> => {
    if (toggling.current.has(task.id)) return false
    toggling.current.add(task.id)
    const done = () => { toggling.current.delete(task.id) }
    if (task.completedAt) {
      try {
        await bridge.call('uncomplete', { id: task.id })
        toast('Task reopened')
        return true
      } catch (error) { fail(error); return false } finally { done() }
    }
    setCompleting(set => new Set(set).add(task.id))
    try {
      await bridge.call('complete', { id: task.id })
      toast(task.due?.recurring ? `Completed — next: ${task.due.string}` : 'Task completed', {
        action: task.due?.recurring ? undefined : {
          label: 'Undo',
          run: () => { void bridge.call('uncomplete', { id: task.id }).then(() => toast('Task reopened'), fail) },
        },
      })
      // Keep the guard up until the fade-out ends: the row still shows (as
      // "Reopen") and a click there must not send a second complete.
      setTimeout(() => {
        setCompleting(set => { const next = new Set(set); next.delete(task.id); return next })
        done()
      }, COMPLETE_ANIMATION_MS)
      return true
    } catch (error) {
      setCompleting(set => { const next = new Set(set); next.delete(task.id); return next })
      done()
      fail(error)
      return false
    }
  }, [bridge, toast, fail])

  const patch = useCallback(async (task: TaskRow, change: { due?: string; priority?: ApiPriority }) => {
    // Optimistic only for priority (unambiguous); due needs the server's parse.
    if (change.priority !== undefined) setTasks(list => list.map(t => (t.id === task.id ? { ...t, priority: change.priority! } : t)))
    try {
      await bridge.call('update', { id: task.id, ...change })
    } catch (error) {
      fail(error)
      void load(view, 'refresh')
    }
  }, [bridge, fail, load, view])

  const submitQuickAdd = useCallback(async (text: string): Promise<boolean> => {
    // The typed line goes to Todoist's parser untouched; making the task land
    // IN the current view (like Todoist's own per-view quick add) is done
    // afterwards from what the parser returned — see src/shared/quickAddPlan.ts.
    let created
    try {
      created = await bridge.call('quickAdd', { text })
    } catch (error) {
      fail(error)
      return false // nothing was created: keep the text for a retry
    }
    try {
      await applyFollowUps(created, planFollowUps(created, {
        due: view.kind === 'today' ? 'today' : null,
        labels: view.kind === 'label' && view.query ? [view.query] : [],
        projectId: view.kind === 'project' ? view.id : null,
        inboxId: inboxProject?.id ?? null,
      }), {
        update: input => bridge.call('update', input),
        move: input => bridge.call('move', input),
      })
      toast(`Added “${created.content}”`, { action: { label: 'Open', run: () => setOpenId(created.id) } })
    } catch (error) {
      // The task EXISTS. Clear the input anyway (return true): a retry would
      // create a duplicate. Say exactly what is missing and offer the task.
      const message = error instanceof PartialAdd ? `${error.message} ${tdErrorMessage(error.cause)}` : tdErrorMessage(error)
      toast(message, { tone: 'error', action: { label: 'Open', run: () => setOpenId(created.id) } })
    }
    return true
  }, [bridge, view, toast, fail, inboxProject?.id])

  const createLabel = useCallback(async (name: string) => {
    try {
      await bridge.call('createLabel', { name })
    } catch (error) { fail(error); throw error }
  }, [bridge, fail])

  const selectView = useCallback((next: ListQuery) => {
    setSearching(false)
    setOverlaySidebar(false)
    setFocusId(null)
    if (!sameView(next, view)) {
      setTasks([])
      setCursor(null)
      setView(next)
    } else {
      void load(next, 'reset')
    }
    listRef.current?.scrollTo({ top: 0 })
  }, [view, setView, load])

  // Search: debounce typing into a `search` view.
  useEffect(() => {
    if (!searching) return
    const q = searchText.trim()
    if (!q) return
    const id = setTimeout(() => {
      setTasks([])
      setView({ kind: 'search', query: q })
    }, 350)
    return () => clearTimeout(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchText, searching])

  const closeSearch = useCallback(() => {
    setSearching(false)
    setSearchText('')
    // Leaving search also leaves the search RESULTS, or the title would keep
    // saying "Search: foo" over a list the user dismissed.
    if (view.kind === 'search') { setTasks([]); setView({ kind: defaultView }) }
  }, [view.kind, defaultView])

  // ---- keyboard ---------------------------------------------------------
  useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement
      const typing = target.closest('input, textarea, select, [contenteditable="true"]')
      if (event.key === 'Escape') {
        // Something deeper (a popover, an input's own Escape) already used it.
        if (event.defaultPrevented) return
        // Our Escape, never the host's (which would close the pane): close the
        // innermost thing that is open. preventDefault is what tells the host
        // to stay out — see keys.ts for why this listener sits on `document`.
        if (help) { event.preventDefault(); setHelp(false); return }
        if (openId) { event.preventDefault(); setOpenId(null); return }
        if (searching || view.kind === 'search') { event.preventDefault(); closeSearch(); return }
        if (overlaySidebar) { event.preventDefault(); setOverlaySidebar(false); return }
        return
      }
      if (typing || event.metaKey || event.ctrlKey || event.altKey) return
      const index = flat.findIndex(t => t.id === focusId)
      const focused = index >= 0 ? flat[index] : null
      const move = (delta: number) => {
        if (!flat.length) return
        const next = flat[Math.max(0, Math.min(flat.length - 1, (index < 0 ? (delta > 0 ? -1 : flat.length) : index) + delta))]
        setFocusId(next.id)
        listRef.current?.querySelector(`[data-task-id="${CSS.escape(next.id)}"]`)?.scrollIntoView({ block: 'nearest' })
        if (openId) setOpenId(next.id)
      }
      const key = event.key
      // Enter and Space belong to a focused button or link (Refresh, Undo,
      // Delete…). Taking them for the focused TASK cancelled those buttons'
      // clicks (review of PR #2, reproduced in Chromium).
      if ((key === 'Enter' || key === ' ') && isActivatable(target)) return
      if (key === 'j' || key === 'ArrowDown') { event.preventDefault(); move(1) }
      else if (key === 'k' || key === 'ArrowUp') { event.preventDefault(); move(-1) }
      else if ((key === 'Enter' || key === 'o') && focused) { event.preventDefault(); setOpenId(focused.id) }
      else if ((key === 'x' || key === ' ') && focused) { event.preventDefault(); void toggle(focused) }
      else if (/^[1-4]$/.test(key) && focused) { event.preventDefault(); void patch(focused, { priority: (5 - Number(key)) as ApiPriority }) }
      else if (key === 't' && focused) { event.preventDefault(); void patch(focused, { due: 'today' }) }
      else if (key === 'q' || key === 'a') { event.preventDefault(); quickAdd.current?.focus() }
      else if (key === '/') { event.preventDefault(); setSearching(true); requestAnimationFrame(() => searchInput.current?.focus()) }
      else if (key === 'r') { event.preventDefault(); void load(view, 'refresh'); void bridge.call('meta', {}).then(setMeta, () => {}) }
      else if (key === '[') { event.preventDefault(); if (narrow) setOverlaySidebar(v => !v); else setSidebarPref(!sidebarPref) }
      else if (key === '?') { event.preventDefault(); setHelp(v => !v) }
      else if (key === 'g') { /* reserved for g-chords */ }
    }
    return onKeyAfterReact(onKey)
  }, [flat, focusId, openId, searching, overlaySidebar, help, toggle, patch, load, view, bridge, narrow, sidebarPref, setSidebarPref, closeSearch])

  // ---- render -----------------------------------------------------------
  const title = viewTitle(view, meta)
  const openCount = flat.filter(t => !t.completedAt && !completing.has(t.id)).length
  const quickAddContext = view.kind === 'today' ? 'Due today unless you type a date'
    : view.kind === 'project' && currentProject ? `Adds to #${currentProject.name}`
    : view.kind === 'label' ? `Tagged @${view.query}`
    : view.kind === 'inbox' ? 'Adds to Inbox' : null
  const canAdd = !user?.readOnly && view.kind !== 'completed'

  return (
    <div className={`td-root${narrow ? ' is-narrow' : ''}`}>
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
                {!loading && view.kind !== 'completed' && <span className="td-title-count">{openCount}{cursor ? '+' : ''}</span>}
              </div>
            )}
            <div className="td-header-tools">
              {currentProject && <button className="td-icon-btn" title="Open project in Todoist" onClick={() => openUrl(currentProject.url)}><ExternalIcon /></button>}
              <button className="td-icon-btn" title="Keyboard shortcuts (?)" onClick={() => setHelp(true)}><KeyboardIcon /></button>
              <button className={`td-icon-btn${loading ? ' is-spinning' : ''}`} title="Refresh (r)" onClick={() => { void load(view, 'refresh'); void bridge.call('meta', {}).then(setMeta, () => {}) }}>
                <RefreshIcon />
              </button>
            </div>
          </header>

          {canAdd && (
            <div className="td-add-row">
              <QuickAddBar
                ref={quickAdd}
                placeholder={narrow ? 'Add a task' : 'Add a task — "Review PR tomorrow 3pm p1 #Work @review"'}
                contextLabel={quickAddContext}
                onSubmit={submitQuickAdd}
              />
            </div>
          )}

          <div className="td-list" ref={listRef} role="list">
            {loading && !tasks.length ? (
              <ListSkeleton />
            ) : listError && !tasks.length ? (
              <div className="td-empty">
                <p>Couldn’t load this list.</p>
                <p className="td-dim td-small">{listError}</p>
                <button className="td-btn" onClick={() => void load(view, 'reset')}>Try again</button>
              </div>
            ) : !flat.length ? (
              <EmptyState view={view} />
            ) : (
              groups.map(group => (
                <section key={group.key} className="td-group">
                  {(groups.length > 1 || group.subtitle || group.key !== 'all') && group.title && (
                    <h2 className={`td-group-title${group.tone ? ` tone-${group.tone}` : ''}`}>
                      {group.title}
                      {group.subtitle && <span className="td-group-sub">{group.subtitle}</span>}
                      <span className="td-group-count">{group.tasks.length}</span>
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
                      completing={completing.has(task.id)}
                      depth={depths.get(task.id) ?? 0}
                      childCount={childCounts.get(task.id) ?? 0}
                      onToggle={toggle}
                      onOpen={t => { setFocusId(t.id); setOpenId(t.id) }}
                      onPatch={patch}
                      onFocus={t => setFocusId(t.id)}
                      onOpenUrl={openUrl}
                    />
                  ))}
                </section>
              ))
            )}

            {(cursor || truncated) && flat.length > 0 && (
              <div className="td-more">
                {cursor ? (
                  <button className="td-btn" disabled={loadingMore} onClick={() => void load(view, 'append', cursor)}>
                    {loadingMore ? <span className="td-spinner" /> : null} Load more
                  </button>
                ) : (
                  <span className="td-dim td-small">Showing the first {flat.length} tasks — this filter has more than can be loaded here. Open it in Todoist for the rest.</span>
                )}
              </div>
            )}

            {view.kind === 'project' && currentProject && !user?.readOnly && !loading && (
              addingSection !== null ? (
                <form
                  className="td-section-add"
                  onSubmit={async e => {
                    e.preventDefault()
                    if (!addingSection.trim()) return
                    try {
                      await bridge.call('createSection', { projectId: currentProject.id, name: addingSection.trim() })
                      setAddingSection(null)
                    } catch (error) { fail(error) }
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

        {openId && meta && (
          <>
            {drawerOverlays && <div className="td-scrim" onClick={() => setOpenId(null)} />}
            <TaskDetailPanel
              key={openId}
              taskId={openId}
              meta={meta}
              now={now}
              onClose={() => setOpenId(null)}
              onToggle={toggle}
              onOpenTask={id => setOpenId(id)}
              revision={revision}
              onError={message => toast(message, { tone: 'error' })}
              onOpenUrl={openUrl}
              onCreateLabel={createLabel}
              onNeedSections={ensureSections}
            />
          </>
        )}
      </div>

      <div className="td-toasts" aria-live="polite">
        {toasts.map(t => (
          <div key={t.id} className={`td-toast${t.tone === 'error' ? ' is-error' : ''}`}>
            <span>{t.message}</span>
            {t.action && <button onClick={() => { t.action!.run(); setToasts(list => list.filter(x => x.id !== t.id)) }}>{t.action.label}</button>}
          </div>
        ))}
      </div>

      {help && <ShortcutHelp onClose={() => setHelp(false)} />}
    </div>
  )
}

// ---------------------------------------------------------------------------

function viewTitle(view: ListQuery, meta: Meta | null): string {
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
function buildGroups(view: ListQuery, tasks: TaskRow[], now: Date, meta: Meta | null, projectId: string | undefined): { groups: TaskGroup[]; depths: Map<string, number>; childCounts: Map<string, number> } {
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

function EmptyState({ view }: { view: ListQuery }) {
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

function ListSkeleton() {
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

function ShortcutHelp({ onClose }: { onClose: () => void }) {
  const rows: Array<[string, string]> = [
    ['q / a', 'Quick add'],
    ['/', 'Search'],
    ['j / k  ↓ / ↑', 'Move between tasks'],
    ['Enter / o', 'Open task'],
    ['x / Space', 'Complete / reopen'],
    ['1 – 4', 'Set priority'],
    ['t', 'Schedule for today'],
    ['r', 'Refresh'],
    ['[', 'Toggle sidebar'],
    ['Esc', 'Close help / drawer / search'],
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
