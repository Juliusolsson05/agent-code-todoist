import assert from 'node:assert/strict'
import { test } from 'node:test'

import { compactComment, compactLabel, compactProject, compactSection, compactTask, resultsOf } from '../server/compact.ts'
import { priorityLabel } from '../src/shared/colors.ts'
import { sdk } from './sdk.mjs'

// server/compact.ts is the one place td's SDK entities become the rows every
// view renders. A wrong mapping here silently mislabels every task (wrong due
// day, lost labels, p1 shown as p4), so these assertions pin each field the UI
// reads against the SDK's own canonical entities (see tests/sdk.mjs).

test('a full SDK task keeps every field the list and drawer paint', () => {
  const raw = sdk.task()
  const row = compactTask(raw)
  assert.ok(row)
  assert.equal(row.id, raw.id)
  assert.equal(row.content, raw.content)
  assert.equal(row.description, raw.description)
  assert.equal(row.projectId, raw.projectId)
  assert.equal(row.sectionId, raw.sectionId)
  assert.equal(row.parentId, raw.parentId)
  assert.deepEqual(row.labels, raw.labels)
  assert.equal(row.deadline, raw.deadline.date)
  assert.deepEqual(row.duration, { amount: raw.duration.amount, unit: raw.duration.unit })
  assert.equal(row.order, raw.childOrder)
  assert.equal(row.url, raw.url, 'the SDK-built web URL is used, not a guessed one')
})

test('a timestamp in due.date is split into the calendar day and the time', () => {
  // The SDK's own default task carries a full ISO timestamp in `due.date`
  // ("2020-09-08T12:00:00Z") with no `datetime`. Treating that string as the
  // day key broke grouping (no "YYYY-MM-DD" match) and dropped the time.
  const raw = sdk.task()
  assert.match(raw.due.date, /T/, 'fixture premise: SDK default due.date carries a time')
  const row = compactTask(raw)
  assert.equal(row.due.date, raw.due.date.slice(0, 10))
  assert.equal(row.due.datetime, raw.due.date)
  assert.equal(row.due.string, raw.due.string)
  assert.equal(row.due.recurring, raw.due.isRecurring)
})

test('priority stays in API numbering end to end (4 is p1)', () => {
  // The UI shows p1..p4 but td, the API and our rows use 4..1. An inversion at
  // any hop turns urgent tasks into no-priority ones.
  const urgent = compactTask({ ...sdk.task(), priority: 4 })
  assert.equal(urgent.priority, 4)
  assert.equal(priorityLabel(urgent.priority), 'p1')
  assert.equal(priorityLabel(1), 'p4')
  assert.equal(compactTask({ ...sdk.task(), priority: 9 }).priority, 4, 'out-of-range values clamp instead of producing p0')
})

test('a task with every optional field null produces null, never undefined', () => {
  // Agent Code's bridge validator rejects `undefined` anywhere in a reply, so
  // one missing optional must not leave an undefined field in the row.
  const row = compactTask(sdk.taskWithNulls())
  for (const [key, value] of Object.entries(row)) assert.notEqual(value, undefined, `${key} is undefined`)
  assert.equal(row.due, null)
  assert.equal(row.deadline, null)
  assert.equal(row.duration, null)
})

test('a future td that renames or drops fields degrades one cell, not the list', () => {
  const row = compactTask({ id: 'abc', content: 'Only the basics' })
  assert.equal(row.content, 'Only the basics')
  assert.deepEqual(row.labels, [])
  assert.equal(row.priority, 1)
  assert.equal(compactTask({ content: 'no id' }), null, 'a row without an id cannot be acted on and is dropped')
  assert.equal(compactTask(null), null)
})

test('list descriptions are clipped so one pasted log cannot blow the bridge budget', () => {
  const row = compactTask({ ...sdk.task(), description: 'x'.repeat(10_000) })
  assert.ok(row.description.length <= 280)
})

test('projects, sections, labels and comments map from their SDK entities', () => {
  const rawProject = sdk.project()
  const project = compactProject(rawProject)
  assert.equal(project.id, rawProject.id)
  assert.equal(project.name, rawProject.name)
  assert.equal(project.color, rawProject.color)
  assert.equal(project.isFavorite, rawProject.isFavorite)
  assert.equal(project.isInbox, rawProject.inboxProject === true)
  assert.equal(compactProject({ ...rawProject, inboxProject: true }).isInbox, true, 'Inbox is recognised from inboxProject')

  const rawSection = sdk.section()
  assert.deepEqual(compactSection(rawSection), { id: rawSection.id, projectId: rawSection.projectId, name: rawSection.name, order: rawSection.sectionOrder })

  const rawLabel = sdk.label()
  assert.equal(compactLabel(rawLabel).name, rawLabel.name)

  const rawComment = sdk.comment()
  const comment = compactComment(rawComment)
  assert.equal(comment.content, rawComment.content)
  assert.equal(comment.postedAt, rawComment.postedAt)
})

test('lists accept td’s {results, nextCursor} envelope and a bare array', () => {
  const task = sdk.task()
  assert.deepEqual(resultsOf({ results: [task], nextCursor: 'c1' }), { results: [task], nextCursor: 'c1' })
  assert.deepEqual(resultsOf([task]), { results: [task], nextCursor: null })
  assert.deepEqual(resultsOf('garbage'), { results: [], nextCursor: null })
})
