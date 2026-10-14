import assert from 'node:assert/strict'
import { test } from 'node:test'

import { compactTask } from '../server/compact.ts'
import { countJsonValues, HOST_MAX_CHARS, HOST_MAX_VALUES, pageOf, toJson } from '../src/shared/budget.ts'
import { dueTone, formatDue, groupByDay, groupToday, parseLocalDate } from '../src/shared/dates.ts'
import { contentPreview, tokenize } from '../src/shared/quickAddTokens.ts'
import { sdk } from './sdk.mjs'

// Pure model code shared by the service and the views: bridge budgeting, due
// date semantics, and the quick-add hint layer.

// ---- budget ---------------------------------------------------------------

test('the host bounds this budget mirrors are Agent Code’s (extensionJson.ts)', () => {
  assert.equal(HOST_MAX_VALUES, 4096)
  assert.equal(HOST_MAX_CHARS, 128 * 1024)
})

test('a realistic busy list exceeds the bridge, and pageOf brings it back inside', () => {
  const rows = Array.from({ length: 300 }, (_, i) => compactTask({ ...sdk.task(), id: `t${i}` }))
  assert.ok(countJsonValues({ tasks: rows }) > HOST_MAX_VALUES, 'premise: unbudgeted, this reply would be rejected')
  const page = pageOf(rows, 'cursor')
  assert.equal(page.truncated, true)
  assert.ok(countJsonValues(page) < HOST_MAX_VALUES)
  assert.ok(JSON.stringify(page).length < HOST_MAX_CHARS)
  assert.deepEqual(page.tasks, rows.slice(0, page.tasks.length), 'trimming keeps the head of the list in order')
})

test('toJson removes undefined, which the host validator rejects', () => {
  const value = toJson({ a: 1, b: undefined, nested: [{ c: undefined, d: 'x' }], when: new Date(0) })
  assert.deepEqual(value, { a: 1, nested: [{ d: 'x' }], when: '1970-01-01T00:00:00.000Z' })
})

// ---- dates ----------------------------------------------------------------

const now = new Date(2026, 9, 14, 13, 0) // Wed Oct 14 2026, 13:00 local
const allDay = (ymd, string = ymd) => ({ date: ymd, datetime: null, string, recurring: false })
const timed = (date, string = 'x') => ({ date: date.toISOString().slice(0, 10), datetime: date.toISOString(), string, recurring: false })
const row = (id, due, priority = 1, order = 0) => ({ ...compactTask({ ...sdk.task(), id, priority }), due, order })

test('floating dates are local calendar days, not UTC midnight', () => {
  // new Date('2026-10-14') is UTC midnight = Oct 13 in the Americas; Todoist
  // all-day dates have no timezone and must stay on the 14th everywhere.
  assert.equal(parseLocalDate('2026-10-14').getDate(), 14)
  assert.equal(dueTone(allDay('2026-10-14'), now), 'today')
  assert.equal(dueTone(allDay('2026-10-13'), now), 'overdue')
  assert.equal(dueTone(allDay('2026-10-15'), now), 'tomorrow')
})

test('a timed task earlier today is overdue, later today is today', () => {
  assert.equal(dueTone(timed(new Date(2026, 9, 14, 9, 30)), now), 'overdue')
  assert.equal(dueTone(timed(new Date(2026, 9, 14, 16, 0)), now), 'today')
})

test('due labels read like Todoist: Today, Tomorrow, weekday, then date', () => {
  assert.equal(formatDue(allDay('2026-10-14'), now), 'Today')
  assert.equal(formatDue(allDay('2026-10-15'), now), 'Tomorrow')
  assert.equal(formatDue(allDay('2026-10-13'), now), 'Yesterday')
  assert.match(formatDue(allDay('2026-10-17'), now), /Saturday/)
  assert.match(formatDue(timed(new Date(2026, 9, 14, 16, 0)), now), /^Today .*4/)
})

test('Today groups Overdue first, then today by time, priority, manual order', () => {
  const groups = groupToday([
    row('plain-p4', allDay('2026-10-14'), 1, 1),
    row('plain-p1', allDay('2026-10-14'), 4, 2),
    row('at-16', timed(new Date(2026, 9, 14, 16, 0))),
    row('old', allDay('2026-10-10')),
  ], now)
  assert.deepEqual(groups.map(g => g.key), ['overdue', 'today'])
  assert.deepEqual(groups[0].tasks.map(t => t.id), ['old'])
  assert.deepEqual(groups[1].tasks.map(t => t.id), ['at-16', 'plain-p1', 'plain-p4'])
})

test('Upcoming groups one section per day in date order', () => {
  const groups = groupByDay([row('fri', allDay('2026-10-16')), row('thu', allDay('2026-10-15')), row('late', allDay('2026-10-01'))], now)
  assert.deepEqual(groups.map(g => g.title), ['Overdue', 'Tomorrow', 'Friday'])
})

// ---- quick add tokens -----------------------------------------------------

const kinds = text => tokenize(text).filter(t => t.kind !== 'text').map(t => [t.kind, t.text])

test('the hint layer marks what Todoist’s parser will consume', () => {
  assert.deepEqual(kinds('Review PR tomorrow 3pm p1 #Work @review'), [
    ['date', 'tomorrow 3pm'],
    ['priority', 'p1'],
    ['project', '#Work'],
    ['label', '@review'],
  ])
  assert.equal(contentPreview('Review PR tomorrow 3pm p1 #Work @review'), 'Review PR')
  assert.deepEqual(kinds('Water plants every other day'), [['date', 'every other day']])
})

test('markers inside ordinary words are left alone', () => {
  // Highlighting text Todoist will KEEP as the title is worse than not
  // highlighting: it tells the user their words will disappear.
  assert.deepEqual(kinds('Upgrade mp100 firmware'), [])
  assert.deepEqual(kinds('Email jane@example.com about the issue'), [])
  assert.deepEqual(kinds('See https://example.com/page#section today'), [['date', 'today']])
  assert.deepEqual(kinds('Monday.com migration'), [], 'a weekday glued to punctuation-in-a-word is not a date')
})
