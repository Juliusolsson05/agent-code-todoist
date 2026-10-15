import assert from 'node:assert/strict'
import { after, before, beforeEach, mock, test } from 'node:test'

import * as h from '../server/handlers.ts'
import { SETTINGS_WATCH_MS } from '../src/runtime.ts'
import { activate, dispose } from '../tests/support/host.mjs'
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

test('a mutation from one view reaches every view as a change; reads publish nothing', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    const before = state.last('todoist.main')
    await state.request('quickAdd', { text: 'From the modal p2' })
    for (const view of ['todoist.main', 'todoist.quickAdd', 'todoist.window']) {
      assert.equal(state.last(view).changeSeq, before.changeSeq + 1)
      assert.equal(state.last(view).changes.at(-1).kind, 'upsert')
    }
    const published = state.published.length
    await state.request('list', { kind: 'today' })
    assert.equal(state.published.length, published, 'reads never publish')
  } finally {
    await dispose(state)
  }
})

test('after the host kills the service, a read restarts it and retries once', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    // Let the ready-time prefetch (meta + three lists) finish first.
    for (let i = 0; i < 50 && state.invokes.filter(n => n === 'list').length < 3; i++) await new Promise(r => setTimeout(r, 20))
    await new Promise(r => setTimeout(r, 200))
    const starts = state.starts
    const lists = state.invokes.filter(n => n === 'list').length
    state.failNext = { name: 'list', error: new Error('Service process exited (code 1).') }
    const page = await state.request('list', { kind: 'today' })
    assert.ok(page.tasks.length > 0)
    assert.equal(state.starts - starts, 1, 'restarted once')
    assert.equal(state.invokes.filter(n => n === 'list').length - lists, 2, 'and retried once')
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

// ---- runtime decisions with a scripted service --------------------------
//
// These cases are about what the runtime DOES with service answers (ordering,
// identity, paging, timing), so the service is scripted: real td cannot be
// made to answer status slowly for one account and quickly for another.

const ready = (user, path = '/td/a') => ({ state: 'ready', td: { path, version: '5.4.10', node: null }, searched: [], brew: null, user: { id: user, email: `${user}@x`, fullName: user, readOnly: false }, job: null, error: null, checkedAt: 0 })
const flush = async () => { for (let i = 0; i < 20; i++) await new Promise(r => setImmediate(r)) }
const ymd = d => `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
const timedRow = (id, at, content = id) => ({
  id, content, description: '', priority: 1, projectId: 'p', sectionId: null, parentId: null, labels: [], order: 1, commentCount: 0, completedAt: null, url: '', deadline: null, duration: null,
  due: { date: ymd(at), datetime: at.toISOString(), string: 'x', recurring: false },
})

test('switching td to another account reloads every view even though both are ready', async () => {
  let user = 'A'
  const state = await activate({ invoke: async name => (name === 'status' ? ready(user, `/td/${user}`) : { ok: true }) })
  try {
    await state.request('status', {})
    const before = state.last('todoist.main').revision
    user = 'B'
    await state.request('setSetting', { key: 'todoist.tdPath', value: '/td/B' })
    assert.equal(state.last('todoist.main').setup.user.id, 'B')
    assert.ok(state.last('todoist.main').revision > before, 'A’s lists must not stay under B’s header')
  } finally {
    await dispose(state)
  }
})

test('an older status answer arriving last does not overwrite the newer one', async () => {
  let n = 0
  const state = await activate({
    invoke: async name => {
      if (name !== 'status') return { ok: true }
      const call = ++n
      if (call === 1) { await new Promise(r => setTimeout(r, 300)); return ready('OLD') }
      return ready('NEW')
    },
  })
  try {
    const slow = state.request('status', {})
    await new Promise(r => setTimeout(r, 50))
    await state.request('status', {})
    await slow
    assert.equal(state.last('todoist.main').setup.user.id, 'NEW')
  } finally {
    await dispose(state)
  }
})

test('a td path changed on Agent Code’s Settings page re-locates td; a reminders toggle there takes effect', async () => {
  mock.timers.enable({ apis: ['setInterval'] })
  const statuses = []
  const lists = []
  const state = await activate({
    invoke: async (name, params) => {
      if (name === 'status') { statuses.push(params.tdPath); return ready('A', params.tdPath) }
      if (name === 'list') { lists.push(params); return { tasks: [], nextCursor: null, truncated: false } }
      return { ok: true }
    },
  })
  try {
    await state.request('status', {})
    // Settings writes our storage directly; no request reaches the runtime.
    state.storage.set('todoist.tdPath', '/opt/other/td')
    state.storage.set('todoist.dueReminders', true)
    mock.timers.tick(SETTINGS_WATCH_MS)
    await flush()
    assert.equal(statuses.at(-1), '/opt/other/td', 'the service was pointed at the new td')
    assert.equal(state.last('todoist.main').settings.dueReminders, true)
    assert.ok(lists.some(p => p.kind === 'today'), 'reminders started checking without a restart')
  } finally {
    mock.timers.reset()
    await dispose(state)
  }
})

test('due reminders read every page of Today, and only announce what is due now', async () => {
  const now = Date.now()
  const allDay = Array.from({ length: 120 }, (_, i) => ({ ...timedRow(`d${i}`, new Date(now)), due: { date: ymd(new Date(now)), datetime: null, string: 'today', recurring: false } }))
  const pages = {
    first: { tasks: [...allDay, timedRow('soon', new Date(now + 10 * 60_000), 'Not yet')], nextCursor: 'c2', truncated: false },
    c2: { tasks: [timedRow('due', new Date(now - 60_000), 'Second page call')], nextCursor: null, truncated: false },
  }
  const state = await activate({
    storage: { 'todoist.dueReminders': true },
    invoke: async (name, params) => (name === 'status' ? ready('A') : name === 'list' ? pages[params.cursor ?? 'first'] : { ok: true }),
  })
  try {
    for (let i = 0; i < 50 && !state.notes.length; i++) await new Promise(r => setTimeout(r, 50))
    assert.deepEqual(state.notes, ['Due now: Second page call'])
    assert.ok(!state.notes.some(n => n.includes('Not yet')), 'a task due in 10 minutes is not "due now"')
  } finally {
    await dispose(state)
  }
})

test('a rescheduled task is announced again at its new time', async () => {
  const now = Date.now()
  let at = new Date(now - 60_000)
  mock.timers.enable({ apis: ['setInterval'] })
  const state = await activate({
    storage: { 'todoist.dueReminders': true, 'todoist.reminderIntervalMinutes': 1 },
    invoke: async name => (name === 'status' ? ready('A') : name === 'list' ? { tasks: [timedRow('r', at, 'Call')], nextCursor: null, truncated: false } : { ok: true }),
  })
  try {
    await flush()
    assert.equal(state.notes.length, 1)
    mock.timers.tick(60_000)
    await flush()
    assert.equal(state.notes.length, 1, 'same occurrence: once')
    at = new Date(now - 30_000) // moved by a few seconds = a new occurrence
    mock.timers.tick(60_000)
    await flush()
    assert.equal(state.notes.length, 2)
  } finally {
    mock.timers.reset()
    await dispose(state)
  }
})

test('the "Open on" setting is passed through when valid', async () => {
  const state = await activate({ storage: { 'todoist.defaultView': 'inbox' }, invoke: async name => (name === 'status' ? ready('A') : { ok: true }) })
  try {
    assert.equal(state.last('todoist.main').settings.defaultView, 'inbox')
  } finally {
    await dispose(state)
  }
})

test('a read is not retried after a SLOW failure: the view’s own 30 s would run out', async () => {
  let lists = 0
  const state = await activate({
    invoke: async name => {
      if (name === 'status') return ready('A')
      lists++
      await new Promise(r => setTimeout(r, 2_500))
      throw new Error('Service process exited (code 1).')
    },
  })
  try {
    await assert.rejects(state.request('list', { kind: 'today' }), /exited/)
    assert.equal(lists, 1)
  } finally {
    await dispose(state)
  }
})

test('a large reply crosses runtime and bridge in parts and arrives whole', async () => {
  const many = Array.from({ length: 400 }, (_, i) => timedRow(`t${i}`, new Date()))
  const parts = []
  const state = await activate({
    invoke: async (name, params) => {
      // Run the real chunker on a reply too big for one message.
      const { encodeReply, chunk } = await import('../server/invoke.ts')
      if (name === 'status') return ready('A')
      if (name === 'chunk') { parts.push(params.index); return chunk(params) }
      return encodeReply({ tasks: many, nextCursor: 'n', truncated: false })
    },
  })
  try {
    const first = await state.request('list', { kind: 'today' })
    assert.ok(first.chunked, 'the view receives the envelope')
    const { collect } = await import('../src/shared/budget.ts')
    const page = await collect(first, (id, index) => state.request('chunk', { id, index }))
    assert.equal(page.tasks.length, 400)
    assert.ok(parts.length >= 1)
  } finally {
    await dispose(state)
  }
})

// ---- the change feed (plan "Rebuild for feel") ---------------------------

test('a completion publishes one typed change to every view and refetches nothing', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    const before = state.last('todoist.main')
    const id = s.t.nextWeek.id
    state.invokes.length = 0
    await state.request('complete', { id })
    assert.deepEqual(state.invokes, ['complete'], 'no list, meta or section reloads behind it')
    for (const view of ['todoist.main', 'todoist.quickAdd', 'todoist.window']) {
      const published = state.last(view)
      assert.equal(published.revision, before.revision, 'not a "reload everything" signal')
      assert.equal(published.changeSeq, before.changeSeq + 1)
      assert.deepEqual(published.changes.at(-1), { kind: 'remove', id, reason: 'completed', task: published.changes.at(-1).task, seq: before.changeSeq + 1 })
      assert.ok(published.changes.at(-1).task.completedAt, 'carries the completed row for the Completed list')
    }
    await state.request('uncomplete', { id })
    assert.equal(state.last('todoist.main').changes.at(-1).kind, 'upsert')
  } finally {
    await dispose(state)
  }
})

test('the runtime answers a list from memory at once and keeps it current with the feed', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    await state.request('list', { kind: 'today' })
    const cached = await state.request('list', { kind: 'today', cached: true })
    assert.ok(cached.tasks.some(t => t.id === s.t.today.id))
    await state.request('update', { id: s.t.today.id, due: 'tomorrow' })
    const after = await state.request('list', { kind: 'today', cached: true })
    assert.ok(!after.tasks.some(t => t.id === s.t.today.id), 'moved out of Today in the cache too')
    await state.request('update', { id: s.t.today.id, due: 'today' })
  } finally {
    await dispose(state)
  }
})

test('creating a project bumps metaRevision only', async () => {
  const state = await activate()
  try {
    await state.request('status', {})
    const before = state.last('todoist.main')
    await state.request('createProject', { name: 'Feed project' })
    const after = state.last('todoist.main')
    assert.equal(after.metaRevision, before.metaRevision + 1)
    assert.equal(after.revision, before.revision)
  } finally {
    await dispose(state)
  }
})
