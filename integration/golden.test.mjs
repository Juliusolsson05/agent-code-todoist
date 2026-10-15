import assert from 'node:assert/strict'
import { readFile, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { after, before, test } from 'node:test'

import * as h from '../server/handlers.ts'
import { dayFromToday } from '../tests/support/fakeTodoist.mjs'
import { provenance } from '../tests/support/openapi.mjs'
import { seed } from '../tests/support/scenario.mjs'
import { startWorld } from '../tests/support/world.mjs'

// Saved payload transcript: for one fixed scenario, every UI operation's
// exact API traffic (what the service's SDK client sends Todoist) and the rows our service returns,
// committed under tests/fixtures/golden/. It turns "we bumped td" or "Doist
// changed the spec" into a reviewable diff instead of a silent behaviour
// change.
//
//   UPDATE_GOLDEN=1 npm run test:integration   # re-record after a deliberate change
//
// Volatile values are normalised: relative calendar days become <day±n>,
// wall-clock timestamps <now>, so the file is stable across runs and dates.

const FILE = join(__PROJECT_ROOT__, 'tests/fixtures/golden/service-api-v1.json')
const TD_VERSION = '5.4.10'

let world
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
})
after(() => world.close())

function normalise(value) {
  const days = new Map(Array.from({ length: 121 }, (_, i) => [dayFromToday(i - 60), `<day${i - 60 >= 0 ? '+' : ''}${i - 60}>`]))
  return JSON.parse(JSON.stringify(value), (_key, v) => {
    if (typeof v !== 'string') return v
    let out = v
    // Timestamps produced at run time (posted_at, completed_at) → <now>.
    // Only zoned ones (…Z / ±hh:mm): those are what the server stamps. A
    // FLOATING datetime like a task due "today 09:30" is fixture data, and
    // matching it by closeness to the clock made the file depend on the hour
    // it was recorded in (seen when re-recording at 09:3x).
    if (/^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?(Z|[+-]\d{2}:\d{2})$/.test(out) && Math.abs(Date.parse(out) - Date.now()) < 3_600_000) return '<now>'
    for (const [day, token] of days) out = out.split(day).join(token)
    return out
  })
}

test('the recorded transcript matches what the service sends Todoist today', async () => {
  const operations = [
    ['meta', {}],
    ['sections', { projectId: s.work.id }],
    ['list', { kind: 'today' }],
    ['list', { kind: 'upcoming' }],
    ['list', { kind: 'inbox' }],
    ['list', { kind: 'project', id: s.work.id }],
    ['list', { kind: 'label', query: 'review' }],
    ['list', { kind: 'filter', id: s.urgent.id }],
    ['list', { kind: 'search', query: 'passport' }],
    ['task', { id: s.t.today.id }],
    ['quickAdd', { text: 'Golden quick add tomorrow p1 #Work @review' }],
    ['add', { content: 'Golden structured', description: 'Body', priority: 2, projectId: s.work.id, sectionId: s.review.id, labels: ['deep-work'], due: 'tomorrow', deadline: dayFromToday(4), duration: '45m' }],
    ['update', { id: s.t.nextWeek.id, content: 'Renamed', priority: 3, due: '', labels: [], deadline: '' }],
    ['move', { id: s.t.inbox.id, projectId: s.home.id }],
    ['complete', { id: s.t.tomorrow.id }],
    ['list', { kind: 'completed' }],
    ['uncomplete', { id: s.t.tomorrow.id }],
    ['comment', { taskId: s.t.tomorrow.id, content: 'Golden comment' }],
    ['createProject', { name: 'Golden project', color: 'grape' }],
    ['createLabel', { name: 'golden', color: 'teal' }],
    ['delete', { id: s.t.farFuture.id }],
  ]
  const transcript = []
  for (const [name, params] of operations) {
    const start = world.fake.requests.length
    let result
    try {
      result = { ok: await h.handlers[name](params) }
    } catch (error) {
      result = { error: error.message }
    }
    transcript.push({
      operation: name,
      params,
      // Sorted: handlers like meta run several td processes concurrently, so
      // arrival order varies run to run and is not part of any contract.
      api: world.fake.requests.slice(start)
        .map(({ method, path, query, body }) => ({ method, path, ...(Object.keys(query).length ? { query } : {}), ...(body ? { body } : {}) }))
        .sort((a, b) => JSON.stringify(a).localeCompare(JSON.stringify(b))),
      result,
    })
  }
  // Only the spec HASH: its vendoring date is absolute and would be rewritten
  // as a relative day by normalise(), drifting the file every day.
  const recorded = normalise({ td: TD_VERSION, spec: { sha256: provenance.sha256 }, transcript })

  if (process.env.UPDATE_GOLDEN) {
    // Never save a transcript containing failures: a re-record on a loaded
    // machine once captured td TIMEOUTs as the "expected" behaviour.
    const failed = recorded.transcript.filter(entry => entry.result.error)
    assert.deepEqual(failed.map(f => `${f.operation}: ${f.result.error}`), [], 'refusing to record a transcript with failures')
    await writeFile(FILE, `${JSON.stringify(recorded, null, 2)}\n`)
    return
  }
  const saved = JSON.parse(await readFile(FILE, 'utf8'))
  for (const [i, entry] of recorded.transcript.entries()) {
    assert.deepEqual(entry, saved.transcript[i], `operation #${i} ${entry.operation} drifted — if intended, re-record with UPDATE_GOLDEN=1 and review the diff`)
  }
  assert.equal(recorded.transcript.length, saved.transcript.length)
  assert.ok(recorded.transcript.every(entry => !entry.result.error), 'no operation in the golden scenario fails')
})
