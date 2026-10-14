// UI test harness page (uitests/). The REAL view module is mounted with a
// context whose runtime, storage and observation calls are forwarded to the
// Node test process through Playwright's exposed functions; Node runs the real
// runtime → service → td → fake Todoist (tests/support/host.mjs).
//
// The host's frame bootstrap is reproduced where it matters for behaviour:
// agent-code src/main/extensions/frameDocument.ts registers a `window` keydown
// listener BEFORE the view module is imported and treats an Escape it sees
// with defaultPrevented === false as "close this pane". The same listener is
// registered here, first, and reports to the test instead of closing.

type Bridge = {
  __request(name: string, input: unknown): Promise<unknown>
  __state(): Promise<unknown>
  __storageGet(key: string): Promise<unknown>
  __storageSet(key: string, value: unknown): Promise<void>
  __hostEscape(): Promise<void>
  __uiClose(): Promise<void>
  __sessions(): Promise<unknown>
  __publish?: (state: unknown) => void
}
const w = window as unknown as Bridge & Window

window.addEventListener('keydown', event => {
  if (event.key !== 'Escape' || event.defaultPrevented) return
  void w.__hostEscape()
})

const params = new URLSearchParams(location.search)
const which = params.get('view') ?? 'main'

const listeners = new Set<(state: unknown) => void>()
let current: unknown = await w.__state()
w.__publish = state => {
  current = state
  listeners.forEach(listener => listener(state))
}

const context = {
  api: {
    extension: { id: 'todoist', apiVersion: 2 },
    storage: {
      get: (key: string) => w.__storageGet(key),
      set: (key: string, value: unknown) => w.__storageSet(key, value),
      delete: async () => {},
      keys: async () => [],
    },
    ui: { close: () => w.__uiClose(), showToast: async () => {} },
    theme: { tokens: async () => ({}) },
    workspace: { observe: async () => ({ activeTabId: 'tab1', tabIds: ['tab1'], sessionCount: 2 }), subscribe: () => () => {} },
    sessions: { observe: () => w.__sessions(), subscribe: () => () => {} },
    panes: { observe: async () => [{ tabId: 'tab1', leafSessionIds: [] }], subscribe: () => () => {} },
    notifications: { show: async () => {} },
  },
  view: { id: which === 'modal' ? 'todoist.quickAdd' : which === 'window' ? 'todoist.window' : 'todoist.main', instanceId: 'uitest' },
  runtime: {
    state: () => current,
    request: (name: string, input: unknown) => w.__request(name, input),
    subscribe: (listener: (state: unknown) => void) => { listeners.add(listener); return () => listeners.delete(listener) },
  },
}

const viewModule = which === 'modal' ? await import('../src/quickAddView') : which === 'window' ? await import('../src/windowView') : await import('../src/view')
viewModule.default.mount(document.getElementById('frame')!, context as never)

export {}
