import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import * as h from '../server/handlers.ts'
import { tdErrorCode, tdErrorMessage } from '../src/shared/types.ts'
import { seed } from '../tests/support/scenario.mjs'
import { startWorld } from '../tests/support/world.mjs'

// What the user sees when Todoist, the network or the token misbehave. Each
// scenario injects the fault at the API (the real td handles it as it would in
// production) and asserts the error class our UI branches on — and that no
// failure leaves state half-changed or hangs past the host's 30 s kill.

let world
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
})
after(() => world.close())

const code = async promise => {
  try {
    await promise
    return 'resolved'
  } catch (error) {
    return tdErrorCode(error) ?? `untyped: ${error.message}`
  }
}

test('a revoked token puts setup back to signed-out with td’s explanation', async () => {
  world.fake.token = 'rotated-elsewhere'
  try {
    assert.equal(await code(h.list({ kind: 'today' })), 'AUTH')
    const setup = await world.relocate()
    assert.equal(setup.state, 'signed-out')
    assert.match(setup.error, /401|Unauthorized|token/i)
  } finally {
    world.fake.token = (await import('../tests/support/fakeTodoist.mjs')).TOKEN
    await world.relocate()
  }
})

test('a persistent rate limit fails clearly and inside our deadline', async () => {
  world.fake.fail(r => r.path === '/api/v1/tasks/filter', { status: 429, body: { error: 'Too many requests', error_code: 35, http_code: 429 }, times: Infinity })
  const started = Date.now()
  try {
    const result = await code(h.list({ kind: 'today' }))
    assert.ok(['TD_FAILED', 'TIMEOUT'].includes(result), result)
    assert.ok(Date.now() - started < 25_000, 'never reaches the host’s 30 s service kill')
  } finally {
    world.fake.faults.length = 0
  }
})

test('a transient 5xx on a read is absorbed by the service’s one read retry', async () => {
  world.fake.fail(r => r.path === '/api/v1/projects', { status: 503, times: 1 })
  const meta = await h.meta({})
  assert.ok(meta.projects.length > 0)
  assert.ok(world.fake.requestsTo('GET', '/api/v1/projects').length >= 2, 'the read was retried')
})

test('a failing complete leaves the task open and reports the failure', async () => {
  const id = s.t.tomorrow.id
  world.fake.fail(r => r.path === `/api/v1/tasks/${id}/close`, { status: 500, times: Infinity })
  try {
    const before = world.fake.requestsTo('POST', `/api/v1/tasks/${id}/close`).length
    assert.notEqual(await code(h.complete({ id })), 'resolved')
    assert.equal(world.fake.tasks.find(t => t.id === id).checked, false)
    assert.equal(world.fake.requestsTo('POST', `/api/v1/tasks/${id}/close`).length - before, 1, 'a failed write is never replayed')
  } finally {
    world.fake.faults.length = 0
  }
  assert.equal(await code(h.complete({ id })), 'resolved', 'works again once the server recovers')
  await h.uncomplete({ id })
})

test('a 404 for a task deleted elsewhere is an error, not a crash', async () => {
  assert.notEqual(await code(h.task({ id: 'gone12345' })), 'resolved')
})

test('a malformed API response becomes a typed error', async () => {
  world.fake.fail(r => r.path === '/api/v1/labels', { status: 200, body: '<html>proxy error page</html>', times: 1 })
  // meta tolerates a failed label call (labels are optional decoration) —
  // the sidebar must still load.
  const meta = await h.meta({})
  assert.ok(meta.projects.length > 0)
  // times: 2 — the service retries a failed read once, so the fault has to
  // outlast the retry to reach the caller.
  world.fake.fail(r => r.path === '/api/v1/tasks/filter', { status: 200, body: { results: 'not-a-list' }, times: 2 })
  const result = await code(h.list({ kind: 'today' }))
  assert.ok(['TD_FAILED', 'BAD_OUTPUT'].includes(result), result)
})

test('fields the API adds later are ignored and missing optional ones are tolerated', async () => {
  const future = world.fake.addTask({
    content: 'From a newer API',
    project_id: s.home.id,
    some_future_field: { nested: [1, 2, 3] },
    ai_summary: 'new thing',
  })
  // Only fields the SDK treats as optional may go missing; dropping a field
  // the SDK requires (updated_at, checked …) breaks td itself, which is
  // Doist's contract, not something this extension can absorb.
  delete future.order_key
  delete future.completed_by_uid
  const row = (await h.list({ kind: 'project', id: s.home.id })).tasks.find(t => t.id === future.id)
  assert.equal(row.content, 'From a newer API')
  assert.ok(!('some_future_field' in row) && !('someFutureField' in row), 'unknown fields never reach the bridge')
})

test('a hanging API is cut at our 20 s deadline, before the host kills the service', { timeout: 40_000 }, async () => {
  world.fake.fail(r => r.path === '/api/v1/tasks/filter', { status: 200, body: { results: [], next_cursor: null }, delayMs: 26_000, times: 1 })
  const started = Date.now()
  try {
    const result = await code(h.list({ kind: 'today' }))
    const elapsed = Date.now() - started
    assert.ok(['TIMEOUT', 'TD_FAILED'].includes(result), result)
    assert.ok(elapsed < 25_000, `took ${elapsed} ms`)
  } finally {
    world.fake.faults.length = 0
  }
})

test('no fault scenario reached an endpoint the fake does not model', () => {
  assert.deepEqual(world.fake.unhandled, [])
})

test('the network disappearing mid-session is a typed failure, not a hang', { timeout: 40_000 }, async () => {
  await world.interceptor.close() // last: the world is unusable afterwards
  const started = Date.now()
  const result = await code(h.list({ kind: 'today' }))
  assert.ok(['TD_FAILED', 'TIMEOUT'].includes(result), result)
  assert.ok(Date.now() - started < 25_000)
  world.interceptor.close = async () => {}
})

test('error messages shown to the user never contain the API token', async () => {
  world.fake.token = 'another'
  try {
    await h.list({ kind: 'today' })
  } catch (error) {
    assert.ok(!tdErrorMessage(error).includes((await import('../tests/support/fakeTodoist.mjs')).TOKEN))
  }
})
