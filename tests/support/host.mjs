import { invoke as serviceInvoke } from '../../server/invoke.ts'
import runtime from '../../src/runtime.ts'
import { crossBridge } from './bridge.mjs'
import { REAL_TD } from './world.mjs'

// A simulated Agent Code host around the REAL background runtime
// (src/runtime.ts). `services.invoke` reaches the service's real request door
// (server/invoke.ts: deadline + chunking) → real td → fake Todoist, unless a
// test scripts it with `invoke`. Every message crosses `crossBridge` (the
// host's JSON rules), so this exercises what views actually receive.
//
// Used by integration/runtime.test.mjs directly and by the UI suite, which
// forwards a browser page's view requests here (uitests/harness.mjs).

export function host({ storage = {}, invoke, onPublish } = {}) {
  const state = {
    published: [], requests: new Map(), commands: new Map(), notes: [], starts: 0, invokes: [],
    // The user-facing setting is how the runtime points the service at td;
    // tests point it at the pinned real binary.
    storage: new Map(Object.entries({ 'todoist.tdPath': REAL_TD, ...storage })),
    failNext: null,
  }
  const callService = async (name, params) => {
    state.invokes.push(name)
    if (state.failNext?.name === name) {
      const error = state.failNext.error
      state.failNext = null
      throw error
    }
    const handler = invoke ?? ((n, p) => serviceInvoke(n, p))
    return crossBridge(await handler(name, crossBridge(params, name)), name)
  }
  state.context = {
    api: {
      extension: { id: 'todoist', apiVersion: 2 },
      storage: {
        get: async key => structuredClone(state.storage.get(key)),
        set: async (key, value) => { state.storage.set(key, crossBridge(value, 'storage.set')) },
        delete: async key => { state.storage.delete(key) },
        keys: async () => [...state.storage.keys()],
      },
      services: {
        start: async () => { state.starts++; return { state: 'running', serviceId: 'todoist.td', pid: 1, endpoints: [] } },
        invoke: async (_id, name, params) => callService(name, params),
        stop: async () => {}, status: async () => ({ state: 'running' }), expose: async () => ({ lan: false }),
      },
      notifications: { show: async message => { state.notes.push(crossBridge(message, 'notifications.show')) } },
      files: {}, net: {},
    },
    subscriptions: [],
    registerCommand: (id, fn) => { state.commands.set(id, fn); return { dispose() {} } },
    registerRequest: (name, fn) => { state.requests.set(name, fn); return { dispose() {} } },
    views: {
      publish: async (viewId, value) => {
        const published = crossBridge(value, 'views.publish')
        state.published.push({ viewId, state: published })
        await onPublish?.(viewId, published)
      },
    },
  }
  state.request = async (name, input) => crossBridge(await state.requests.get(name)(crossBridge(input, name), { id: 'todoist.main', instanceId: 'test' }), name)
  state.last = viewId => state.published.filter(p => p.viewId === viewId).at(-1)?.state
  return state
}

export async function activate(options) {
  const state = host(options)
  await runtime.activate(state.context)
  return state
}

export const dispose = state => Promise.all(state.context.subscriptions.map(sub => sub.dispose()))
