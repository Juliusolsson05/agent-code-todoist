import { useCallback, useEffect, useMemo, useRef, useState } from 'react'

import { queryKey, type QueryContext } from '../shared/listModel'
import type { HostState, ListQuery, Meta, SectionRow, TaskPage } from '../shared/types'
import { tdErrorMessage } from '../shared/types'
import type { Bridge } from './bridge'
import { store } from './store'

// Data flow for one workspace frame: lists, meta, sections, the change feed
// and task details — all through the frame's store (store.ts), never through
// component state that a view switch would throw away.
//
// The rules that make it feel instant (from the snappiness evaluation):
// - A list the user has seen is shown from the store at once and revalidated
//   behind it; a list never seen asks the runtime's memory first (`cached`),
//   then Todoist.
// - Revalidation is QUIET: it never empties the list, hides the count or spins
//   anything. Only a list with nothing to show yet gets a skeleton, and only
//   after 150 ms (useDelayed in App).
// - A response is applied only if no newer request for the same list started
//   (per-list sequence), and it never overwrites a task edited after the
//   request began (store `touched`).

export function useListLoader(bridge: Bridge) {
  const seqs = useRef(new Map<string, number>())

  const revalidate = useCallback(async (query: ListQuery, options: { cacheFirst?: boolean } = {}) => {
    const key = queryKey(query)
    const seq = (seqs.current.get(key) ?? 0) + 1
    seqs.current.set(key, seq)
    const current = () => seqs.current.get(key) === seq
    const state = store.ensureQuery(query)
    const startedAt = Date.now()
    if (state.status === 'empty' && options.cacheFirst) {
      const cached = await bridge.call('list', { ...query, cursor: null, cached: true }).catch(() => null)
      if (cached && current() && store.query(key)?.status === 'empty') store.setPages(query, [cached], 'replace', startedAt)
    }
    store.setRefreshing(query, true)
    try {
      // As many pages as the user had loaded: acting on a task from page 2
      // must not snap the list back to page 1.
      const want = Math.max(1, store.query(key)?.pages ?? 1)
      const pages: TaskPage[] = []
      let cursor: string | null = null
      for (let i = 0; i < want; i++) {
        const page = (await bridge.call('list', { ...query, cursor })) as TaskPage
        pages.push(page)
        cursor = page.nextCursor
        if (!cursor || !current()) break
      }
      if (current()) store.setPages(query, pages, 'replace', startedAt)
    } catch (error) {
      if (current()) store.setError(query, tdErrorMessage(error))
      throw error
    }
  }, [bridge])

  const loadMore = useCallback(async (query: ListQuery) => {
    const key = queryKey(query)
    const state = store.query(key)
    // Never while the list is being revalidated: an append started then would
    // be concatenated to the OLD first page (review: a completed task stayed
    // on screen for good). The button is disabled meanwhile.
    if (!state?.cursor || state.refreshing) return
    const seq = seqs.current.get(key) ?? 0
    const startedAt = Date.now()
    const page = (await bridge.call('list', { ...query, cursor: state.cursor })) as TaskPage
    if ((seqs.current.get(key) ?? 0) !== seq) return
    store.setPages(query, [page], 'append', startedAt)
  }, [bridge])

  return { revalidate, loadMore }
}

/** Projects, labels, filters (cached first, refetched only when they can have
 *  changed) plus sections per project (cached, shared in-flight, refetched on
 *  metaRevision). */
export function useMeta(bridge: Bridge, metaRevision: number) {
  const [meta, setMeta] = useState<Meta | null>(null)
  const [sections, setSections] = useState<Record<string, SectionRow[]>>({})
  const inflight = useRef(new Map<string, Promise<void>>())
  const sectionRevision = useRef(metaRevision)

  useEffect(() => {
    let alive = true
    void (async () => {
      if (!meta) {
        const cached = await bridge.call('meta', { cached: true }).catch(() => null)
        if (cached && alive) setMeta(current => current ?? cached)
      }
      const fresh = await bridge.call('meta', {}).catch(() => null)
      if (fresh && alive) setMeta(fresh)
    })()
    return () => { alive = false }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [bridge, metaRevision])

  const ensureSections = useCallback((projectId: string, force = false) => {
    if (!force && (sections[projectId] || inflight.current.has(projectId))) return
    const run = bridge.call('sections', { projectId }).then(
      list => setSections(cache => (sameSections(cache[projectId], list) ? cache : { ...cache, [projectId]: list })),
      () => {},
    ).finally(() => inflight.current.delete(projectId))
    inflight.current.set(projectId, run)
  }, [bridge, sections])

  // A section was created (or the account changed): cached sections are stale.
  useEffect(() => {
    if (sectionRevision.current === metaRevision) return
    sectionRevision.current = metaRevision
    for (const projectId of Object.keys(sections)) ensureSections(projectId, true)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metaRevision])

  const merged = useMemo<Meta | null>(() => (meta ? { ...meta, sections: Object.values(sections).flat() } : null), [meta, sections])
  return { meta: merged, ensureSections, setMeta }
}

function sameSections(a: SectionRow[] | undefined, b: SectionRow[]): boolean {
  return !!a && a.length === b.length && a.every((s, i) => s.id === b[i].id && s.name === b[i].name && s.order === b[i].order)
}

/**
 * Apply the runtime's change feed to the store. If changes were missed (the
 * window moved past this frame's last seen seq — a long sleep, a burst of
 * edits elsewhere) the current list is revalidated instead.
 */
export function useChangeFeed(host: HostState, ctx: QueryContext, onGap: () => void) {
  const ctxRef = useRef(ctx)
  ctxRef.current = ctx
  const gapRef = useRef(onGap)
  gapRef.current = onGap
  const first = useRef(true)
  useEffect(() => {
    const changes = host.changes ?? []
    if (first.current) {
      // Mounting: everything before now is already reflected in what we load.
      first.current = false
      store.lastSeq = Math.max(store.lastSeq, host.changeSeq ?? 0)
      return
    }
    const oldest = changes[0]?.seq ?? (host.changeSeq ?? 0) + 1
    if (store.lastSeq > 0 && oldest > store.lastSeq + 1) gapRef.current()
    for (const change of changes) store.applyChange(change, ctxRef.current)
    store.lastSeq = Math.max(store.lastSeq, host.changeSeq ?? 0)
  }, [host.changeSeq, host.changes])
}

/** The open task's detail: rendered from the list row at once, extras loaded
 *  behind it. Debounced while j/k moves quickly (review: holding j with the
 *  task view open started 15 detail requests). */
export function useTaskDetail(bridge: Bridge, taskId: string | null, onError: (message: string) => void) {
  const [loading, setLoading] = useState(false)
  const errorRef = useRef(onError)
  errorRef.current = onError
  useEffect(() => {
    if (!taskId) return
    let alive = true
    const delay = store.detail(taskId) ? 0 : 120
    const timer = setTimeout(() => {
      const startedAt = Date.now()
      setLoading(!store.detail(taskId))
      bridge.call('task', { id: taskId }).then(
        detail => { if (alive) store.setDetail(detail, startedAt) },
        error => { if (alive && !store.detail(taskId)) errorRef.current(tdErrorMessage(error)) },
      ).finally(() => { if (alive) setLoading(false) })
    }, delay)
    return () => { alive = false; clearTimeout(timer) }
  }, [bridge, taskId])
  return { loading }
}
