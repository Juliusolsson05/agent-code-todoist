import assert from 'node:assert/strict'
import { after, before, beforeEach, test } from 'node:test'

import * as h from '../server/handlers.ts'
import runtime from '../src/runtime.ts'
import { crossBridge } from '../tests/support/bridge.mjs'
import { TOKEN } from '../tests/support/fakeTodoist.mjs'
import { seed } from '../tests/support/scenario.mjs'
import { REAL_TD, startWorld } from '../tests/support/world.mjs'

// The real background runtime (src/runtime.ts) inside a simulated Agent Code
// host whose `services.invoke` reaches the real handlers → real td → fake
// Todoist. Every message crosses `crossBridge` (the host's JSON rules), so
// this exercises what the views actually get: publications, revision bumps,
// setup transitions, retry policy and due toasts.

let world
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
})
after(() => world.close())

function host({ storage = {}, invoke } = {}) {
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
    const handler = invoke ?? ((n, p) => h.handlers[n](p))
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
    views: { publish: async (viewId, value) => { state.published.push({ viewId, state: crossBridge(value, 'views.publish') }) } },
  }
  state.request = async (name, input) => crossBridge(await state.requests.get(name)(crossBridge(input, name), { id: 'todoist.main', instanceId: 'test' }), name)
  state.last = viewId => state.published.filter(p => p.viewId === viewId).at(-1)?.state
  return state
}

const activate = async options => {
  const state = host(options)
  await runtime.activate(state.context)
  return state
}

const dispose = state => Promise.all(state.context.subscriptions.map(sub => sub.dispose()))

beforeEach(async () => {
  world.fake.token = TOKEN
  await world.relocate()
})

test('activation publishes to both views and starts nothing native', async () => {
  const state = await activate()
  try {
    assert.equal(state.starts, 0, 'no td process until something is asked for')
    assert.equal(state.last('todoist.main').revision, 1)
    assert.ok(state.last('todoist.quickAdd'), 'the modal gets the same state')
    assert.equal(state.last('todoist.main').settings.defaultView, 'today')
  } finally {
    await dispose(state)
  }
})

test('the first status starts the service once and moves every view to ready', async () => {
  const state = await activate()
  try {
    const setup = await state.request('status', {})
    assert.equal(setup.state, 'ready')
    await state.request('status', {})
    assert.equal(state.starts, 1, 'start is shared, not repeated per request')
    const published = state.last('todoist.main')
    assert.equal(published.setup.state, 'ready')
    assert.ok(published.revision > 1, 'becoming ready bumps the revision so views load data')
  } finally {
    await dispose(state)
  }
})

test('a mutation from one view bumps the revision every view refetches on', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    const before = state.last('todoist.main').revision
    await state.request('quickAdd', { text: 'From the modal p2' })
    assert.equal(state.last('todoist.main').revision, before + 1)
    assert.equal(state.last('todoist.quickAdd').revision, before + 1)
    const before2 = before + 1
    await state.request('list', { kind: 'today' })
    assert.equal(state.last('todoist.main').revision, before2, 'reads never bump')
  } finally {
    await dispose(state)
  }
})

test('after the host kills the service, a read restarts it and retries once', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    state.failNext = { name: 'list', error: new Error('Service process exited (code 1).') }
    const page = await state.request('list', { kind: 'today' })
    assert.ok(page.tasks.length > 0)
    assert.equal(state.starts, 2, 'restarted')
    assert.deepEqual(state.invokes.filter(n => n === 'list').length, 2)
  } finally {
    await dispose(state)
  }
})

test('a mutation is never replayed after a kill: its outcome is unknown', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    state.failNext = { name: 'complete', error: new Error('Service request timed out; its result is unknown.') }
    await assert.rejects(state.request('complete', { id: s.t.tomorrow.id }), /timed out/)
    assert.equal(state.invokes.filter(n => n === 'complete').length, 1)
    assert.equal(world.fake.requestsTo('POST', `/api/v1/tasks/${s.t.tomorrow.id}/close`).length, 0)
  } finally {
    await dispose(state)
  }
})

test('a td TIMEOUT on a mutation still bumps the revision: the change may have landed', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    const before = state.last('todoist.main').revision
    state.failNext = { name: 'update', error: new Error('TIMEOUT: td task update did not answer within 20 s.') }
    await assert.rejects(state.request('update', { id: s.t.tomorrow.id, content: 'x' }), /TIMEOUT/)
    assert.equal(state.last('todoist.main').revision, before + 1)
  } finally {
    await dispose(state)
  }
})

test('a token revoked mid-session sends every view back to the sign-in screen', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    world.fake.token = 'revoked'
    await assert.rejects(state.request('list', { kind: 'today' }), /AUTH/)
    for (let i = 0; i < 100 && state.last('todoist.main').setup.state === 'ready'; i++) await new Promise(r => setTimeout(r, 100))
    assert.equal(state.last('todoist.main').setup.state, 'signed-out')
    assert.equal(state.last('todoist.quickAdd').setup.state, 'signed-out')
  } finally {
    await dispose(state)
  }
})

test('settings: defaults, validation, and a td path change re-locates', async () => {
  const state = await activate({ storage: { 'todoist.defaultView': 'nonsense', 'todoist.reminderIntervalMinutes': -4 } })
  try {
    const settings = await state.request('settings')
    assert.equal(settings.defaultView, 'today', 'an invalid stored value falls back')
    assert.equal(settings.reminderIntervalMinutes, 5)
    await assert.rejects(state.request('setSetting', { key: 'todoist.somethingElse', value: 1 }), /INVALID/)
    await state.request('setSetting', { key: 'todoist.tdPath', value: '/nowhere/td' })
    assert.equal(state.last('todoist.main').setup.state, 'td-missing')
  } finally {
    await state.request('setSetting', { key: 'todoist.tdPath', value: REAL_TD }).catch(() => {})
    await dispose(state)
    await world.relocate()
  }
})

test('due-now toasts: once per task occurrence, only for timed tasks, only when enabled', async () => {
  const now = new Date()
  const justDue = new Date(now.getTime() - 60_000)
  const ymd = `${justDue.getFullYear()}-${String(justDue.getMonth() + 1).padStart(2, '0')}-${String(justDue.getDate()).padStart(2, '0')}`
  const timed = world.fake.addTask({ content: 'Call with Ana', due: { date: ymd, datetime: justDue.toISOString().replace(/\.\d+Z$/, 'Z'), is_recurring: false, lang: 'en', string: 'today', timezone: null } })

  const off = await activate()
  await new Promise(r => setTimeout(r, 300))
  assert.deepEqual(off.notes, [], 'disabled by default')
  await dispose(off)

  const on = await activate({ storage: { 'todoist.dueReminders': true, 'todoist.reminderIntervalMinutes': 5 } })
  try {
    for (let i = 0; i < 150 && !on.notes.length; i++) await new Promise(r => setTimeout(r, 100))
    assert.deepEqual(on.notes.filter(n => n.includes('Call with Ana')), ['Due now: Call with Ana'])
    assert.ok(!on.notes.some(n => n.includes(s.t.today.content)), 'all-day tasks never toast')
    // A settings change reschedules and re-checks immediately; the announced
    // set (persisted in storage) keeps it from repeating.
    await on.request('setSetting', { key: 'todoist.reminderIntervalMinutes', value: 6 })
    await new Promise(r => setTimeout(r, 4000))
    assert.equal(on.notes.filter(n => n.includes('Call with Ana')).length, 1)
    assert.ok(on.storage.get('todoist.announced').some(key => key.startsWith(timed.id)))
  } finally {
    await dispose(on)
  }
})
