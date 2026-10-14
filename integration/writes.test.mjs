import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import * as h from '../server/handlers.ts'
import { dayFromToday } from '../tests/support/fakeTodoist.mjs'
import { due, seed } from '../tests/support/scenario.mjs'
import { startWorld } from '../tests/support/world.mjs'

// Every mutation the UI can trigger, through the real td binary. Each test
// asserts the exact request Todoist receives (the saved-payload contract) and
// the state the next read shows — so "the button worked" means the server
// state really changed, not just that a call returned.

let world
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
})
after(() => world.close())

const lastWrite = (method, prefix) => world.fake.requestsTo(method, prefix).at(-1)
const task = id => world.fake.tasks.find(t => t.id === id)

test('quick add sends the raw line as Todoist quick-add text, leading dash included', async () => {
  const row = await h.quickAdd({ text: '-p1 hotfix tomorrow p1 #Work @review' })
  assert.deepEqual(lastWrite('POST', '/api/v1/tasks/quick').body.text, '-p1 hotfix tomorrow p1 #Work @review')
  assert.equal(row.priority, 4)
  assert.equal(row.projectId, s.work.id)
  assert.deepEqual(row.labels, ['review'])
  assert.equal(row.due.date, dayFromToday(1))
})

test('structured add maps every field onto the API body', async () => {
  const row = await h.add({
    content: '-starts with dash; $(not a shell)',
    description: 'line 1\nline 2',
    priority: 3,
    projectId: s.work.id,
    sectionId: s.review.id,
    labels: ['review', 'deep-work'],
    due: 'tomorrow',
    deadline: dayFromToday(5),
    duration: '1h30m',
  })
  const body = lastWrite('POST', '/api/v1/tasks').body
  assert.equal(body.content, '-starts with dash; $(not a shell)')
  assert.equal(body.description, 'line 1\nline 2')
  assert.equal(body.priority, 3, 'UI p2 = API 3')
  assert.equal(body.project_id, s.work.id)
  assert.equal(body.section_id, s.review.id)
  assert.deepEqual(body.labels, ['review', 'deep-work'])
  assert.equal(body.due_string, 'tomorrow')
  assert.equal(body.deadline_date, dayFromToday(5))
  assert.equal(body.duration, 90)
  assert.equal(body.duration_unit, 'minute')
  assert.equal(row.content, '-starts with dash; $(not a shell)')
  assert.equal(row.sectionId, s.review.id)
})

test('a sub-task is created under its parent and shows in the parent’s drawer', async () => {
  const child = await h.add({ content: 'Nested step', parentId: s.t.tomorrow.id, projectId: s.client.id })
  assert.equal(lastWrite('POST', '/api/v1/tasks').body.parent_id, s.t.tomorrow.id)
  const detail = await h.task({ id: s.t.tomorrow.id })
  assert.ok(detail.children.some(c => c.id === child.id))
})

test('update changes fields and clearing uses the API’s "no date" / empty forms', async () => {
  const id = s.t.nextWeek.id
  await h.update({ id, content: 'Quarterly review (moved)', priority: 4, labels: ['review'], due: 'tomorrow' })
  let body = lastWrite('POST', `/api/v1/tasks/${id}`).body
  assert.deepEqual({ content: body.content, priority: body.priority, labels: body.labels, due: body.due_string }, { content: 'Quarterly review (moved)', priority: 4, labels: ['review'], due: 'tomorrow' })
  assert.equal(task(id).priority, 4)

  await h.update({ id, due: '', labels: [], deadline: '' })
  body = lastWrite('POST', `/api/v1/tasks/${id}`).body
  assert.equal(body.due_string, 'no date')
  assert.deepEqual(body.labels, [])
  assert.ok('deadline_date' in body && body.deadline_date === null, `deadline cleared: ${JSON.stringify(body)}`)
  const row = (await h.list({ kind: 'project', id: s.home.id })).tasks.find(t => t.id === id)
  assert.equal(row.due, null)
  assert.deepEqual(row.labels, [])
  assert.equal(row.deadline, null)
})

test('move to a section and back out', async () => {
  const id = s.t.overdue.id
  await h.move({ id, sectionId: s.doing.id })
  assert.equal(lastWrite('POST', `/api/v1/tasks/${id}/move`).body.section_id, s.doing.id)
  assert.equal(task(id).section_id, s.doing.id)
  await h.move({ id, projectId: s.home.id, noSection: true })
  assert.equal(task(id).project_id, s.home.id)
  assert.equal(task(id).section_id, null)
})

test('complete → gone from Today, in Completed; reopen → back', async () => {
  const id = s.t.today.id
  await h.complete({ id })
  assert.ok(lastWrite('POST', `/api/v1/tasks/${id}/close`))
  assert.ok(!(await h.list({ kind: 'today' })).tasks.some(t => t.id === id))
  assert.ok((await h.list({ kind: 'completed' })).tasks.some(t => t.id === id))
  await h.uncomplete({ id })
  assert.ok(lastWrite('POST', `/api/v1/tasks/${id}/reopen`))
  assert.ok((await h.list({ kind: 'today' })).tasks.some(t => t.id === id))
})

test('completing a recurring task rolls it forward instead of closing it', async () => {
  const id = s.t.timed.id
  await h.complete({ id })
  const next = (await h.list({ kind: 'upcoming' })).tasks.find(t => t.id === id)
  assert.ok(next, 'still open')
  assert.equal(next.due.date, dayFromToday(1))
})

test('delete removes the task and its sub-tasks', async () => {
  const parent = await h.add({ content: 'Temporary parent', projectId: s.home.id })
  const child = await h.add({ content: 'Temporary child', parentId: parent.id, projectId: s.home.id })
  await h.handlers.delete({ id: parent.id }) // the RPC name; `delete` is reserved as an export
  assert.ok(lastWrite('DELETE', `/api/v1/tasks/${parent.id}`))
  const ids = (await h.list({ kind: 'project', id: s.home.id })).tasks.map(t => t.id)
  assert.ok(!ids.includes(parent.id) && !ids.includes(child.id))
})

test('comment posts to the task and appears in the drawer', async () => {
  const comment = await h.comment({ taskId: s.t.tomorrow.id, content: 'Looks **good** — merging\nsecond line' })
  const body = lastWrite('POST', '/api/v1/comments').body
  assert.equal(body.task_id, s.t.tomorrow.id)
  assert.equal(body.content, 'Looks **good** — merging\nsecond line')
  const detail = await h.task({ id: s.t.tomorrow.id })
  assert.ok(detail.comments.some(c => c.id === comment.id && c.content === body.content))
})

test('create project, section and label', async () => {
  const project = await h.createProject({ name: 'Side project', color: 'grape', parentId: s.work.id, favorite: true })
  assert.deepEqual(lastWrite('POST', '/api/v1/projects').body, { name: 'Side project', color: 'grape', parent_id: s.work.id, is_favorite: true })
  assert.equal(project.parentId, s.work.id)

  const section = await h.createSection({ projectId: project.id, name: 'Ideas' })
  assert.deepEqual(lastWrite('POST', '/api/v1/sections').body, { name: 'Ideas', project_id: project.id })
  assert.deepEqual((await h.sections({ projectId: project.id })).map(x => x.id), [section.id])

  const label = await h.createLabel({ name: '@waiting', color: 'orange' })
  assert.deepEqual(lastWrite('POST', '/api/v1/labels').body, { name: 'waiting', color: 'orange' }, 'a typed @ is not part of the stored name')
  assert.ok((await h.meta({})).labels.some(l => l.id === label.id))
})

test('no write reached an endpoint the fake does not model', () => {
  assert.deepEqual(world.fake.unhandled, [])
  assert.ok(world.fake.tasks.some(t => t.due?.date === due(1).date))
})
