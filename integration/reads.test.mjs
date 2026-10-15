import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import * as h from '../server/handlers.ts'
import { countJsonValues, HOST_MAX_VALUES } from '../src/shared/budget.ts'
import { dayFromToday } from '../tests/support/fakeTodoist.mjs'
import { seed } from '../tests/support/scenario.mjs'
import { startWorld } from '../tests/support/world.mjs'

// Real td 5.4.10 → fake Todoist API v1 (payloads from Doist's OpenAPI examples)
// → our service handlers. Every read the UI performs, checked on both sides:
// what td asked Todoist for, and the rows the views receive.

let world
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
})
after(() => world.close())

const ids = page => page.tasks.map(t => t.id).sort()

test('setup sees the real td, the token from the environment and the account', async () => {
  const setup = await world.relocate()
  assert.equal(setup.state, 'ready')
  assert.equal(setup.td.version, '5.4.10')
  assert.equal(setup.user.email, 'tester@example.com')
  assert.equal(setup.user.readOnly, false)
  assert.ok(world.interceptor.state.connects.length > 0, 'td really went through the interceptor')
  assert.ok(world.fake.requests.every(r => r.auth === `Bearer ${world.fake.token}`), 'every API call carried the token')
})

test('meta: project tree, labels and saved filters, Inbox first', async () => {
  const meta = await h.meta({})
  assert.equal(meta.projects[0].isInbox, true)
  const client = meta.projects.find(p => p.name === 'Client A')
  assert.equal(client.parentId, s.work.id, 'nesting survives')
  assert.equal(meta.projects.find(p => p.name === 'Work').isFavorite, true)
  assert.deepEqual(meta.labels.map(l => l.name), ['review', 'deep-work'])
  assert.deepEqual(meta.filters.map(f => [f.name, f.query]), [['Urgent', 'p1']])
  assert.deepEqual(meta.sections, [], 'sections come per project')
  assert.ok(countJsonValues(meta) < HOST_MAX_VALUES)
  assert.deepEqual(world.fake.unhandled, [])
})

test('sections load for one project, in order', async () => {
  const sections = await h.sections({ projectId: s.work.id })
  assert.deepEqual(sections.map(x => x.name), ['Doing', 'Review'])
  assert.ok(sections.every(x => x.projectId === s.work.id))
})

test('Today: overdue and today, mine or unassigned, nothing else', async () => {
  const page = await h.list({ kind: 'today' })
  assert.deepEqual(ids(page), [s.t.overdue.id, s.t.today.id, s.t.timed.id].sort())
  const call = world.fake.requestsTo('GET', '/api/v1/tasks/filter').at(-1)
  assert.equal(call.query.query, '(today | overdue) & (assigned to: me | !assigned)')
})

test('a task row carries every field the list paints, mapped from the wire', async () => {
  const row = (await h.list({ kind: 'today' })).tasks.find(t => t.id === s.t.today.id)
  assert.equal(row.content, s.t.today.content)
  assert.equal(row.priority, 4)
  assert.deepEqual(row.labels, ['review'])
  assert.equal(row.projectId, s.work.id)
  assert.equal(row.sectionId, s.doing.id)
  assert.equal(row.due.date, dayFromToday(0))
  assert.equal(row.deadline, dayFromToday(3))
  assert.deepEqual(row.duration, { amount: 45, unit: 'minute' })
  assert.match(row.description, /rollback path/)
  const timed = (await h.list({ kind: 'today' })).tasks.find(t => t.id === s.t.timed.id)
  assert.equal(timed.due.recurring, true)
  assert.ok(timed.due.datetime?.includes('09:30'), 'a timed due keeps its time')
})

test('Upcoming covers two weeks; Inbox, project, label, filter and search each select the right tasks', async () => {
  const upcoming = await h.list({ kind: 'upcoming' })
  assert.ok(ids(upcoming).includes(s.t.nextWeek.id))
  assert.ok(!ids(upcoming).includes(s.t.farFuture.id))

  assert.deepEqual(ids(await h.list({ kind: 'inbox' })), [s.t.inbox.id])

  const project = await h.list({ kind: 'project', id: s.home.id })
  assert.deepEqual(ids(project), [s.t.nextWeek.id, s.t.farFuture.id, s.t.unicode.id, s.t.longDescription.id].sort())
  assert.equal(world.fake.requestsTo('GET', '/api/v1/tasks').at(-1).query.project_id, s.home.id, 'projects are fetched by id')

  assert.deepEqual(ids(await h.list({ kind: 'label', query: 'deep-work' })), [s.t.unicode.id])
  assert.deepEqual(ids(await h.list({ kind: 'filter', id: s.urgent.id })), [s.t.today.id], 'saved filter by id runs its query')
  assert.deepEqual(ids(await h.list({ kind: 'search', query: 'passport' })), [s.t.farFuture.id])
  assert.deepEqual(world.fake.unhandled, [])
})

test('search text cannot inject filter operators', async () => {
  // "a | b" would be an OR in Todoist's filter language; the handler strips
  // the operators so search stays a text search.
  await h.list({ kind: 'search', query: 'bank | p1 & !x, y' })
  const sent = world.fake.requestsTo('GET', '/api/v1/tasks/filter').at(-1).query.query
  assert.ok(!/[|&,]/.test(sent.replace(/^search:/, '')), sent)
})

test('Completed asks for the last two weeks, not just today', async () => {
  await h.complete({ id: s.t.inbox.id })
  const page = await h.list({ kind: 'completed' })
  assert.ok(ids(page).includes(s.t.inbox.id))
  assert.ok(page.tasks.find(t => t.id === s.t.inbox.id).completedAt)
  assert.equal(world.fake.requestsTo('GET', '/api/v1/tasks/completed/by_completion_date').at(-1).query.since, dayFromToday(-14))
  await h.uncomplete({ id: s.t.inbox.id })
})

test('unicode, markdown, quotes and backslashes survive td and the bridge byte-for-byte', async () => {
  const row = (await h.list({ kind: 'project', id: s.home.id })).tasks.find(t => t.id === s.t.unicode.id)
  assert.equal(row.content, s.t.unicode.content)
})

test('a 20 000-character description is clipped in lists and kept in the drawer', async () => {
  const listed = (await h.list({ kind: 'project', id: s.home.id })).tasks.find(t => t.id === s.t.longDescription.id)
  assert.ok(listed.description.length <= 280)
  const detail = await h.task({ id: s.t.longDescription.id })
  assert.ok(detail.task.description.length > 10_000 && detail.task.description.length <= 16_000)
})

test('task detail returns sub-tasks and comments in order', async () => {
  const detail = await h.task({ id: s.t.today.id })
  assert.deepEqual(detail.children.map(c => c.id), [s.t.child.id])
  assert.deepEqual(detail.comments.map(c => c.content), ['Rollback looks right; one nit.', 'CI is **green**.'])
  assert.ok(countJsonValues(detail) < HOST_MAX_VALUES)
})

test('a large account pages with td’s cursor, without gaps or duplicates', async () => {
  const bulk = Array.from({ length: 250 }, (_, i) => world.fake.addTask({ content: `Bulk ${i}`, due: { date: dayFromToday(0), is_recurring: false, lang: 'en', string: 'today', timezone: null } }))
  const seen = new Set()
  let page = await h.list({ kind: 'today' })
  let pages = 1
  for (;;) {
    page.tasks.forEach(t => { assert.ok(!seen.has(t.id), `duplicate ${t.id}`); seen.add(t.id) })
    assert.ok(countJsonValues(page) < HOST_MAX_VALUES, 'every page fits the bridge')
    if (!page.nextCursor) break
    page = await h.list({ kind: 'today', cursor: page.nextCursor })
    pages++
  }
  assert.ok(pages >= 3, `expected several pages, got ${pages}`)
  for (const task of bulk) assert.ok(seen.has(task.id), `missing ${task.content}`)
  for (const task of bulk) task.is_deleted = true
})
