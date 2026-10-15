import assert from 'node:assert/strict'
import { test } from 'node:test'

import { TaskStore } from '../src/ui/store.ts'
import { compactTask } from '../server/compact.ts'
import { sdk } from './sdk.mjs'

// The view store's ordering rules (src/ui/store.ts). A list or detail
// response whose request STARTED before a newer local edit or feed change
// must not undo it (review of PR #2: an old detail reply put a renamed task's
// old title back; a refetch could resurrect a just-completed task).

const ctx = { now: new Date(), inboxId: 'inbox', userId: null }
const row = over => ({ ...compactTask({ ...sdk.task(), id: 't1', projectId: 'inbox', content: 'Old' }), ...over })
const query = { kind: 'inbox' }
const page = tasks => ({ tasks, nextCursor: null, truncated: false })

test('a response that started before a feed change cannot overwrite it', async () => {
  const store = new TaskStore()
  store.setPages(query, [page([row()])], 'replace')
  const startedAt = Date.now()
  await new Promise(r => setTimeout(r, 5))
  store.applyChange({ seq: 1, kind: 'upsert', task: row({ content: 'New' }) }, ctx)
  store.setPages(query, [page([row({ content: 'Old' })])], 'replace', startedAt)
  assert.equal(store.task('t1').content, 'New')
})

test('a response that started before a removal cannot bring the task back', async () => {
  const store = new TaskStore()
  store.setPages(query, [page([row()])], 'replace')
  const startedAt = Date.now()
  await new Promise(r => setTimeout(r, 5))
  store.applyChange({ seq: 1, kind: 'remove', id: 't1', reason: 'completed', task: null }, ctx)
  store.setPages(query, [page([row()])], 'replace', startedAt)
  assert.deepEqual(store.rows('inbox::', ctx).map(t => t.id), [])
})

test('a fresh response after the change is applied normally', async () => {
  const store = new TaskStore()
  store.applyChange({ seq: 1, kind: 'upsert', task: row({ content: 'New' }) }, ctx)
  await new Promise(r => setTimeout(r, 5))
  store.setPages(query, [page([row({ content: 'Newer from server' })])], 'replace', Date.now())
  assert.equal(store.task('t1').content, 'Newer from server')
})
