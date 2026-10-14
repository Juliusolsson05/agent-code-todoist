import assert from 'node:assert/strict'
import { after, before, test } from 'node:test'

import { isChunked } from '../src/shared/budget.ts'
import { isExtensionJson } from '../tests/support/bridge.mjs'
import { startWorld } from '../tests/support/world.mjs'
import { viaBridge } from '../tests/support/viaBridge.mjs'

// Large accounts, through real td and the host's real message rules.
//
// Review of PR #2 (both reproduced with real td 5.4.10): `meta` for 300
// projects + 200 labels was 4,521 JSON values, and a task with 50 comments of
// 4,000 characters was 204,631 characters. The host rejects such a reply and
// TERMINATES the service (serviceHost.ts), so the sidebar or that task killed
// the extension on every load. Separately, trimming a list page to fit dropped
// td's cursor, so the trimmed tasks could never be reached.
//
// These sizes are real-world: Todoist Pro allows 300 projects and 500 labels.

let world
before(async () => {
  world = await startWorld()
})
after(() => world.close())

test('a 300-project, 200-label account loads its whole sidebar', async () => {
  for (let i = 0; i < 300; i++) world.fake.addProject({ name: `Project ${String(i).padStart(3, '0')}`, color: 'blue', child_order: i + 1 })
  for (let i = 0; i < 200; i++) world.fake.addLabel({ name: `label-${i}`, color: 'teal', order: i + 1 })
  const messages = []
  const meta = await viaBridge('meta', {}, messages)
  // 4,521 values as one object (the review's measurement): over the host's
  // 4,096, so it travels as a chunk envelope — here a single 81k-char part.
  assert.ok(isChunked(messages[0]), 'premise: as an object it would not fit one message')
  assert.ok(messages.every(m => isExtensionJson(m)))
  assert.equal(meta.projects.length, 301, '300 + Inbox, none dropped')
  assert.equal(meta.labels.length, 200)
})

test('a task with 50 long comments opens with every comment whole', async () => {
  const task = world.fake.addTask({ content: 'Long discussion' })
  for (let i = 0; i < 50; i++) world.fake.addComment(task.id, { content: `${i}:`.padEnd(4000, 'x'), posted_at: `2026-01-01T00:${String(i).padStart(2, '0')}:00Z` })
  const messages = []
  const detail = await viaBridge('task', { id: task.id }, messages)
  assert.ok(messages.length > 1, '200k characters need several parts')
  assert.equal(detail.comments.length, 50)
  assert.ok(detail.comments.every(c => c.content.length === 4000))
  assert.ok(detail.comments[0].content.startsWith('0:'), 'in order')
})

test('a heavy Inbox page keeps its cursor, so Load more reaches every task', async () => {
  const project = world.fake.addProject({ name: 'Heavy', color: 'red' })
  for (let i = 0; i < 20; i++) world.fake.addLabel({ name: `tag${i}`, color: 'grape' })
  const labels = Array.from({ length: 20 }, (_, i) => `tag${i}`)
  for (let i = 0; i < 130; i++) world.fake.addTask({ content: `Heavy ${i}`, project_id: project.id, labels, description: 'd'.repeat(400) })
  const first = await viaBridge('list', { kind: 'project', id: project.id })
  assert.equal(first.truncated, false)
  assert.ok(first.nextCursor, 'the cursor survives a page too big for one message')
  const second = await viaBridge('list', { kind: 'project', id: project.id, cursor: first.nextCursor })
  const ids = [...first.tasks, ...second.tasks].map(t => t.id)
  assert.equal(new Set(ids).size, 130, 'all 130, no gaps, no duplicates')
})

test('a multi-query saved filter returns every match and says it is complete', async () => {
  const project = world.fake.addProject({ name: 'Filtered', color: 'red' })
  for (let i = 0; i < 6; i++) world.fake.addTask({ content: `p1 task ${i}`, priority: 4, project_id: project.id })
  for (let i = 0; i < 4; i++) world.fake.addTask({ content: `p2 task ${i}`, priority: 3, project_id: project.id })
  const filter = world.fake.addFilter({ name: 'Hot', query: 'p1, p2' })
  const page = await viaBridge('list', { kind: 'filter', id: filter.id })
  assert.equal(page.tasks.filter(t => t.projectId === project.id).length, 10)
  assert.equal(page.truncated, false)
  assert.equal(page.nextCursor, null)
})
