import type { JsonValue, ViewContext } from 'agent-code-extension-api'
import { createContext, useContext, useEffect, useState } from 'react'

import type {
  CommentRow,
  HostState,
  LabelRow,
  ListQuery,
  Meta,
  ProjectRow,
  SectionRow,
  SetupStatus,
  Settings,
  TaskDetail,
  TaskDraft,
  TaskPage,
  TaskPatch,
  TaskRow,
} from '../shared/types'

// Typed client over `context.runtime.request`.
//
// One table maps request names to their input/output types so a component
// cannot call `complete` with a draft or read a TaskPage as a Meta. The runtime
// (src/runtime.ts) forwards these names to the service unchanged; this file is
// the view-side half of the plan's "Service RPC contract".

type Calls = {
  status: [{ refresh?: boolean } | undefined, SetupStatus]
  login: [{ readOnly?: boolean }, SetupStatus]
  install: [Record<string, never>, SetupStatus]
  cancelJob: [Record<string, never>, SetupStatus]
  logout: [Record<string, never>, SetupStatus]
  openUrl: [{ url: string }, { ok: true }]
  meta: [Record<string, never>, Meta]
  list: [ListQuery, TaskPage]
  task: [{ id: string }, TaskDetail]
  quickAdd: [{ text: string }, TaskRow]
  add: [TaskDraft, TaskRow]
  update: [{ id: string } & TaskPatch, TaskRow]
  move: [{ id: string; projectId?: string; sectionId?: string; parentId?: string; noSection?: boolean; noParent?: boolean }, { ok: true }]
  complete: [{ id: string }, { ok: true }]
  uncomplete: [{ id: string }, { ok: true }]
  delete: [{ id: string }, { ok: true }]
  comment: [{ taskId: string; content: string }, CommentRow]
  createProject: [{ name: string; color?: string; parentId?: string; favorite?: boolean }, ProjectRow]
  createSection: [{ projectId: string; name: string }, SectionRow]
  createLabel: [{ name: string; color?: string }, LabelRow]
  settings: [undefined, Settings]
  setSetting: [{ key: string; value: JsonValue }, Settings]
}

export type CallName = keyof Calls

export type Bridge = {
  context: ViewContext<HostState & JsonValue>
  call<N extends CallName>(name: N, input: Calls[N][0]): Promise<Calls[N][1]>
}

export function createBridge(context: ViewContext): Bridge {
  const typed = context as unknown as ViewContext<HostState & JsonValue>
  return {
    context: typed,
    async call(name, input) {
      // Strip undefined before it reaches the host validator — an optional
      // field left undefined makes the WHOLE request invalid (budget.ts toJson).
      const payload = input === undefined ? undefined : (JSON.parse(JSON.stringify(input)) as JsonValue)
      return (await typed.runtime.request(name, payload)) as never
    },
  }
}

export const BridgeContext = createContext<Bridge | null>(null)

export function useBridge(): Bridge {
  const bridge = useContext(BridgeContext)
  if (!bridge) throw new Error('Bridge missing')
  return bridge
}

/** Latest runtime publication. `state()` may be undefined until the runtime's
 *  first publish lands (it publishes during activate, so usually immediately). */
export function useHostState(bridge: Bridge): HostState | undefined {
  const [state, setState] = useState<HostState | undefined>(() => bridge.context.runtime.state() as HostState | undefined)
  useEffect(() => {
    setState(bridge.context.runtime.state() as HostState | undefined)
    return bridge.context.runtime.subscribe(next => setState(next as HostState))
  }, [bridge])
  return state
}

/** Re-render every minute (and at local midnight) so "Today/Tomorrow/overdue"
 *  labels roll over without a refetch. */
export function useNow(): Date {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const id = setInterval(() => setNow(new Date()), 60_000)
    return () => clearInterval(id)
  }, [])
  return now
}

/** Persisted per-viewer convenience (last view, collapsed sidebar). Uses the
 *  extension's own storage, which survives reloads and is shared by panes —
 *  acceptable for "where was I", never used for data. */
export function usePersistent<T extends JsonValue>(bridge: Bridge, key: string, initial: T): [T, (value: T) => void, boolean] {
  const [value, setValue] = useState<T>(initial)
  const [loaded, setLoaded] = useState(false)
  useEffect(() => {
    let alive = true
    bridge.context.api.storage.get<T>(key).then(stored => {
      if (!alive) return
      if (stored !== undefined && stored !== null) setValue(stored)
      setLoaded(true)
    }, () => setLoaded(true))
    return () => { alive = false }
  }, [bridge, key])
  const update = (next: T) => {
    setValue(next)
    void bridge.context.api.storage.set(key, next).catch(() => {})
  }
  return [value, update, loaded]
}
