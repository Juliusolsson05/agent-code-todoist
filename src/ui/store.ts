import { useSyncExternalStore } from 'react'

import { applyChangeToIds, membership, queryKey, type QueryContext } from '../shared/listModel'
import type { Change, CommentRow, DueRow, ListQuery, TaskDetail, TaskPage, TaskRow } from '../shared/types'

// The frame's task store: every list the user has looked at, every task in
// them, and the optimistic state on top.
//
// WHY a store instead of "one list in component state" (beta.4): the seven
// evaluators traced the not-snappy feel to that model. Leaving a view threw
// its tasks away (every switch: empty-state flash → skeleton → 0.3–1.2 s),
// and a list could only become correct again by refetching it, so every tick
// of a checkbox waited on the server and blinked the header. Todoist's own app
// is local-first: views are queries over a local copy, edits apply locally at
// once and sync behind. This is that model at the size of a frame:
//
//   tasks     server truth per task id (from list pages and the change feed)
//   overlay   optimistic field edits, per task, until the server answers
//   hidden    tasks removed optimistically (completed, deleted) — kept out of
//             every list until the server confirms or the user undoes
//   queries   per list: ordered ids, cursor, status; never discarded on switch
//   details   the task view's extras (sub-tasks, comments), per task
//
// Everything is mutated through methods that bump `version`; React reads it
// with useSyncExternalStore, so one change re-renders only what reads it.

export type QueryStatus = 'empty' | 'ready' | 'error'

export type QueryState = {
  query: ListQuery
  ids: string[]
  cursor: string | null
  truncated: boolean
  status: QueryStatus
  error: string | null
  /** Pages loaded ("Load more" adds one); a revalidation reloads as many. */
  pages: number
  /** A background revalidation is running. Never shown as a spinner. */
  refreshing: boolean
  fetchedAt: number
}

export type CompletionPhase = 'checked' | 'collapsing'

export class TaskStore {
  private tasks = new Map<string, TaskRow>()
  private overlay = new Map<string, Partial<TaskRow>>()
  private pending = new Map<string, number>()
  private hidden = new Set<string>()
  private phases = new Map<string, CompletionPhase>()
  private queries = new Map<string, QueryState>()
  private details = new Map<string, TaskDetail>()
  /** Lists each hidden task was in, so Undo puts it back where it was. */
  private hiddenFrom = new Map<string, string[]>()
  private listeners = new Set<() => void>()
  private writeQueues = new Map<string, Promise<unknown>>()
  /** When each task last changed locally or through the feed. A list or
   *  detail response whose request STARTED before that is older than what we
   *  show, and must not overwrite it (review: an old detail reply undid a
   *  newer rename in the drawer). */
  private touched = new Map<string, number>()
  private removedAt = new Map<string, number>()
  version = 0
  lastSeq = 0

  subscribe = (listener: () => void) => {
    this.listeners.add(listener)
    return () => { this.listeners.delete(listener) }
  }

  getVersion = () => this.version

  private emit() {
    this.version++
    for (const listener of this.listeners) listener()
  }

  // ---- reading -------------------------------------------------------------

  /** A task as the user should see it: server truth plus pending edits. */
  task(id: string): TaskRow | undefined {
    const base = this.tasks.get(id)
    if (!base) return undefined
    const patch = this.overlay.get(id)
    return patch ? { ...base, ...patch } : base
  }

  query(key: string): QueryState | undefined {
    return this.queries.get(key)
  }

  isHidden(id: string): boolean {
    return this.hidden.has(id)
  }

  phase(id: string): CompletionPhase | undefined {
    return this.phases.get(id)
  }

  isPending(id: string): boolean {
    return (this.pending.get(id) ?? 0) > 0
  }

  detail(id: string): TaskDetail | undefined {
    return this.details.get(id)
  }

  /**
   * The rows a list shows right now. Pending edits are applied, hidden tasks
   * are left out, and a task an optimistic edit moved OUT of the list (Today →
   * tomorrow) leaves at once instead of waiting for the server.
   */
  rows(key: string, ctx: QueryContext): TaskRow[] {
    const state = this.queries.get(key)
    if (!state) return []
    const out: TaskRow[] = []
    for (const id of state.ids) {
      if (this.hidden.has(id) && !this.phases.has(id)) continue
      const task = this.task(id)
      if (!task) continue
      if (this.overlay.has(id) && membership(state.query, task, ctx) === 'out') continue
      out.push(task)
    }
    return out
  }

  // ---- server data ---------------------------------------------------------

  ensureQuery(query: ListQuery): QueryState {
    const key = queryKey(query)
    let state = this.queries.get(key)
    if (!state) {
      state = { query: { kind: query.kind, id: query.id, query: query.query }, ids: [], cursor: null, truncated: false, status: 'empty', error: null, pages: 0, refreshing: false, fetchedAt: 0 }
      this.queries.set(key, state)
    }
    return state
  }

  setRefreshing(query: ListQuery, refreshing: boolean) {
    const state = this.ensureQuery(query)
    if (state.refreshing === refreshing) return
    this.queries.set(queryKey(query), { ...state, refreshing })
    this.emit()
  }

  /**
   * Install fetched pages. `pages` is the full set fetched for a refresh (so
   * the ids are exactly the server's), or one page to append.
   */
  setPages(query: ListQuery, pages: TaskPage[], mode: 'replace' | 'append', startedAt = Date.now()) {
    const state = this.ensureQuery(query)
    const newer = (id: string) => (this.touched.get(id) ?? 0) > startedAt
    for (const page of pages) for (const task of page.tasks) if (!newer(task.id)) this.tasks.set(task.id, task)
    const fetched = pages.flatMap(page => page.tasks.map(task => task.id)).filter(id => !((this.removedAt.get(id) ?? 0) > startedAt))
    const last = pages.at(-1)
    // Rows that joined this list AFTER the request started (a quick add, a
    // reschedule into Today) are not in the response yet; keep them.
    const joined = mode === 'replace' ? state.ids.filter(id => newer(id) && !fetched.includes(id)) : []
    const ids = mode === 'append' ? [...state.ids, ...fetched.filter(id => !state.ids.includes(id))] : dedupe([...fetched, ...joined])
    // A task removed optimistically stays out until the server agrees: if the
    // fresh list no longer has it, the removal is confirmed.
    for (const id of [...this.hidden]) if (!this.phases.has(id) && !ids.includes(id)) this.forgetHidden(id)
    this.queries.set(queryKey(query), {
      ...state,
      ids,
      cursor: last?.nextCursor ?? null,
      truncated: last?.truncated ?? false,
      status: 'ready',
      error: null,
      pages: mode === 'append' ? state.pages + 1 : Math.max(1, pages.length),
      refreshing: false,
      fetchedAt: Date.now(),
    })
    this.emit()
  }

  setError(query: ListQuery, message: string) {
    const state = this.ensureQuery(query)
    this.queries.set(queryKey(query), { ...state, error: message, refreshing: false, status: state.status === 'ready' ? 'ready' : 'error' })
    this.emit()
  }

  setDetail(detail: TaskDetail, startedAt = Date.now()) {
    const newer = (id: string) => (this.touched.get(id) ?? 0) > startedAt
    const current = this.details.get(detail.task.id)
    if (!newer(detail.task.id)) this.tasks.set(detail.task.id, detail.task)
    for (const child of detail.children) if (!newer(child.id)) this.tasks.set(child.id, child)
    const task = this.tasks.get(detail.task.id) ?? detail.task
    // Comments and sub-tasks that arrived through the feed after the request
    // started are kept (upserted by id, never duplicated).
    let comments = detail.comments
    for (const comment of current?.comments ?? []) comments = upsertComment(comments, comment)
    this.details.set(detail.task.id, { task, children: detail.children.map(child => this.tasks.get(child.id) ?? child), comments })
    this.emit()
  }

  /** Apply one change from the runtime's feed (another view's edit, or this
   *  view's own edit confirmed). Idempotent: applying it twice is harmless. */
  applyChange(change: Change, ctx: QueryContext) {
    if (change.seq <= this.lastSeq) return
    this.lastSeq = change.seq
    if (change.kind === 'meta') return
    const now = Date.now()
    if (change.kind === 'upsert') this.touched.set(change.task.id, now)
    if (change.kind === 'remove') { this.touched.set(change.id, now); this.removedAt.set(change.id, now) }
    if (change.kind === 'comment') {
      const task = this.tasks.get(change.taskId)
      if (task) this.tasks.set(task.id, { ...task, commentCount: task.commentCount + 1 })
      const detail = this.details.get(change.taskId)
      if (detail) this.details.set(change.taskId, { ...detail, comments: upsertComment(detail.comments, change.comment) })
      this.emit()
      return
    }
    if (change.kind === 'upsert') {
      const previous = this.tasks.get(change.task.id)
      // The feed carries a description preview; keep a fuller one we have.
      const task = previous && previous.description.length > change.task.description.length && change.task.description.endsWith('…') ? { ...change.task, description: previous.description } : change.task
      this.tasks.set(task.id, task)
      const detail = this.details.get(task.id)
      if (detail) this.details.set(task.id, { ...detail, task })
      // A sub-task appearing or changing updates its parent's open task view.
      if (task.parentId) {
        const parent = this.details.get(task.parentId)
        if (parent) this.details.set(task.parentId, { ...parent, children: upsertRow(parent.children, task) })
      }
    }
    if (change.kind === 'remove') {
      if (change.task) this.tasks.set(change.id, change.task)
      for (const detail of this.details.values()) {
        if (detail.children.some(child => child.id === change.id)) {
          this.details.set(detail.task.id, { ...detail, children: detail.children.filter(child => child.id !== change.id) })
        }
      }
    }
    for (const [key, state] of this.queries) {
      const ids = applyChangeToIds(state.ids, state.query, change, ctx, id => this.tasks.get(id)?.parentId ?? null)
      if (ids !== state.ids) this.queries.set(key, { ...state, ids })
    }
    if (change.kind === 'remove' && !this.phases.has(change.id)) this.forgetHidden(change.id)
    this.emit()
  }

  /** A comment this view just posted (the feed may deliver it too; upserted
   *  by id either way). */
  addComment(taskId: string, comment: CommentRow) {
    const detail = this.details.get(taskId)
    if (detail) this.details.set(taskId, { ...detail, comments: upsertComment(detail.comments, comment) })
    this.emit()
  }

  /** A sub-task this view just created. */
  addChild(parentId: string, child: TaskRow) {
    this.tasks.set(child.id, child)
    this.touched.set(child.id, Date.now())
    const detail = this.details.get(parentId)
    if (detail) this.details.set(parentId, { ...detail, children: upsertRow(detail.children, child) })
    this.emit()
  }

  /** Put a task into a list now (a quick add's pending row, a server row we
   *  know belongs there). */
  insert(query: ListQuery, task: TaskRow) {
    const state = this.ensureQuery(query)
    this.tasks.set(task.id, task)
    this.touched.set(task.id, Date.now())
    if (!state.ids.includes(task.id)) this.queries.set(queryKey(query), { ...state, ids: [...state.ids, task.id] })
    this.emit()
  }

  /** Drop a task everywhere (a pending row being replaced by the real one). */
  drop(id: string) {
    this.tasks.delete(id)
    for (const [key, state] of this.queries) if (state.ids.includes(id)) this.queries.set(key, { ...state, ids: state.ids.filter(x => x !== id) })
    this.emit()
  }

  // ---- optimistic edits ----------------------------------------------------

  /**
   * Show an edit at once and run it in order with the task's other writes.
   *
   * Writes to one task are SERIALIZED: pressing 1 then 4 must leave the task
   * at p4 on the server, which two concurrent requests do not guarantee
   * (review: they landed p1). The overlay stays until the task's last write
   * settles; by then the change feed has delivered the server's version.
   */
  edit<T>(id: string, patch: Partial<TaskRow>, send: () => Promise<T>): Promise<T> {
    this.overlay.set(id, { ...this.overlay.get(id), ...patch })
    this.pending.set(id, (this.pending.get(id) ?? 0) + 1)
    this.touched.set(id, Date.now())
    this.emit()
    return this.serialize(id, send).finally(() => {
      const left = (this.pending.get(id) ?? 1) - 1
      if (left > 0) { this.pending.set(id, left); return }
      this.pending.delete(id)
      this.overlay.delete(id)
      this.emit()
    })
  }

  /** Run `send` after every earlier write to the same task. */
  serialize<T>(id: string, send: () => Promise<T>): Promise<T> {
    const before = this.writeQueues.get(id) ?? Promise.resolve()
    const run = before.then(send, send)
    const tail = run.catch(() => {})
    this.writeQueues.set(id, tail)
    void tail.then(() => { if (this.writeQueues.get(id) === tail) this.writeQueues.delete(id) })
    return run
  }

  setPhase(id: string, phase: CompletionPhase | null) {
    if (phase) this.phases.set(id, phase)
    else this.phases.delete(id)
    this.emit()
  }

  /** Take a task (and its sub-tasks) out of every list until confirmed or undone. */
  hide(id: string) {
    const doomed = new Set([id])
    for (let grew = true; grew;) {
      grew = false
      for (const task of this.tasks.values()) if (task.parentId && doomed.has(task.parentId) && !doomed.has(task.id)) { doomed.add(task.id); grew = true }
    }
    for (const each of doomed) {
      this.touched.set(each, Date.now())
      this.hidden.add(each)
      this.hiddenFrom.set(each, [...this.queries].filter(([, state]) => state.ids.includes(each)).map(([key]) => key))
    }
    this.emit()
    return [...doomed]
  }

  /** Undo / failure: the task comes back to the lists it was in, at once. */
  unhide(id: string) {
    const ids = [id, ...[...this.hidden].filter(other => this.isDescendant(other, id))]
    for (const each of ids) {
      this.hidden.delete(each)
      this.phases.delete(each)
      for (const key of this.hiddenFrom.get(each) ?? []) {
        const state = this.queries.get(key)
        if (state && !state.ids.includes(each)) this.queries.set(key, { ...state, ids: [...state.ids, each] })
      }
      this.hiddenFrom.delete(each)
    }
    this.emit()
  }

  private forgetHidden(id: string) {
    this.hidden.delete(id)
    this.hiddenFrom.delete(id)
  }

  private isDescendant(id: string, ancestor: string): boolean {
    for (let current = this.tasks.get(id)?.parentId; current; current = this.tasks.get(current)?.parentId) {
      if (current === ancestor) return true
    }
    return false
  }
}

function dedupe(ids: string[]): string[] {
  return [...new Set(ids)]
}

function upsertComment(list: CommentRow[], comment: CommentRow): CommentRow[] {
  // By id: the change feed and the request's own reply can both deliver it
  // (review: one comment rendered twice when the refetch won the race).
  return list.some(c => c.id === comment.id) ? list.map(c => (c.id === comment.id ? comment : c)) : [...list, comment]
}

function upsertRow(list: TaskRow[], task: TaskRow): TaskRow[] {
  if (task.completedAt) return list.filter(t => t.id !== task.id)
  return list.some(t => t.id === task.id) ? list.map(t => (t.id === task.id ? task : t)) : [...list, task]
}

export { upsertComment }

/** One store per frame. Views in the same frame share it; other frames (the
 *  modal, another pane) have their own and stay in step through the feed. */
export const store = new TaskStore()

export function useStore(): TaskStore {
  useSyncExternalStore(store.subscribe, store.getVersion)
  return store
}

/**
 * The due a preset or keyboard shortcut will produce, computed locally so the
 * row can show it at once. Only for phrases with one obvious meaning; free
 * text waits for Todoist's parser. "next monday"/"saturday" follow Todoist's
 * own reading (the coming one).
 */
export function presetDue(value: string, now = new Date()): DueRow | null | undefined {
  const day = (offset: number) => {
    const d = new Date(now)
    d.setDate(d.getDate() + offset)
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  }
  const v = value.trim().toLowerCase()
  if (v === '' || v === 'no date') return null
  if (v === 'today') return { date: day(0), datetime: null, string: 'today', recurring: false }
  if (v === 'tomorrow') return { date: day(1), datetime: null, string: 'tomorrow', recurring: false }
  const weekday = now.getDay() // 0 Sun … 6 Sat
  if (v === 'saturday') return { date: day(((6 - weekday + 7) % 7) || 7), datetime: null, string: 'Saturday', recurring: false }
  if (v === 'next monday') return { date: day(((1 - weekday + 7) % 7) || 7), datetime: null, string: 'next Monday', recurring: false }
  return undefined
}

