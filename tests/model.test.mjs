import assert from 'node:assert/strict'
import { test } from 'node:test'

import { compactTask } from '../server/compact.ts'
import { collect, countJsonValues, fitsBridge, HOST_MAX_CHARS, HOST_MAX_VALUES, isChunked, splitParts, toJson } from '../src/shared/budget.ts'
import { isAgentSession } from '../src/shared/agents.ts'
import { planFollowUps } from '../src/shared/quickAddPlan.ts'
import { chunk, encodeReply } from '../server/invoke.ts'
import { filterPage } from '../server/handlers.ts'
import { isExtensionJson } from './support/bridge.mjs'
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

test('a busy list too large for one message crosses the bridge in parts, losing nothing', async () => {
  // 300 SDK tasks: ~3x the host's 4096-value limit as one message. The first
  // version trimmed this to fit and dropped the cursor, stranding the rest.
  const rows = Array.from({ length: 300 }, (_, i) => compactTask({ ...sdk.task(), id: `t${i}` }))
  const page = { tasks: rows, nextCursor: 'cursor-2', truncated: false }
  assert.ok(!isExtensionJson(page), 'premise: as one message the host would reject it')
  const reply = encodeReply(page)
  assert.ok(isChunked(reply))
  assert.ok(isExtensionJson(reply), 'the envelope is legal')
  const parts = []
  const whole = await collect(reply, async (id, index) => {
    const part = chunk({ id, index })
    parts.push(part)
    return part
  })
  assert.ok(parts.every(part => isExtensionJson(part)), 'every part is legal')
  assert.deepEqual(whole, page, 'reassembled exactly, cursor included')
  assert.throws(() => chunk({ id: reply.chunked.id, index: 1 }), /expired/, 'parts are released once collected')
})

test('a reply that fits is passed through untouched (the normal path)', () => {
  const small = { tasks: [compactTask(sdk.task())], nextCursor: null, truncated: false }
  assert.deepEqual(encodeReply(small), small)
  assert.ok(fitsBridge(small))
})

test('parts never split a surrogate pair', () => {
  const json = JSON.stringify({ text: 'a'.repeat(9) + '🥛'.repeat(20) })
  const parts = splitParts(json, 10)
  assert.equal(parts.join(''), json)
  for (const part of parts) assert.ok(!/[\ud800-\udbff]$/.test(part), `part ends mid-pair: ${JSON.stringify(part)}`)
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

test('everything after " // " is the description: not a date, label or project', () => {
  // Todoist: " // description text" must be at the end of a quick-add line.
  assert.deepEqual(kinds('Fix login // see logs from prod today @ops'), [['description', '// see logs from prod today @ops']])
  assert.equal(contentPreview('Fix login tomorrow // notes'), 'Fix login')
  assert.deepEqual(kinds('Read https://example.com//path'), [], 'a URL’s // is not the marker')
  const tokens = tokenize('Ship it p1 // notes')
  assert.equal(tokens.map(t => t.text).join(''), 'Ship it p1 // notes', 'tokens still cover the whole input (the mirror overlay depends on it)')
})

// ---- quick add follow-ups --------------------------------------------------
//
// The parser's RESULT decides what still has to happen (quickAddPlan.ts).

const created = (over = {}) => ({ ...compactTask(sdk.task()), projectId: 'inbox', sectionId: null, labels: [], priority: 1, due: null, description: '', ...over })

test('Today view: a task the parser gave no date is scheduled today; a typed date wins', () => {
  assert.deepEqual(planFollowUps(created(), { due: 'today' }).update, { due: 'today' })
  assert.equal(planFollowUps(created({ due: { date: '2026-10-20', datetime: null, string: 'tue', recurring: false } }), { due: 'today' }).update, null)
})

test('project view: an unrouted task (Inbox) is moved; a #project the parser matched is left alone', () => {
  // "Fix #123 crash": #123 matched no project, Todoist kept it as text and
  // put the task in Inbox — it must still land in the open project.
  assert.deepEqual(planFollowUps(created({ content: 'Fix #123 crash' }), { projectId: 'p-work', inboxId: 'inbox' }).move, { projectId: 'p-work' })
  assert.equal(planFollowUps(created({ projectId: 'p-home' }), { projectId: 'p-work', inboxId: 'inbox' }).move, null)
  assert.equal(planFollowUps(created({ projectId: 'p-work' }), { projectId: 'p-work', inboxId: 'inbox' }).move, null)
  assert.deepEqual(planFollowUps(created({ projectId: 'p-work' }), { projectId: 'p-work', sectionId: 's1', inboxId: 'inbox' }).move, { sectionId: 's1' })
})

test('label view and pickers: only what the parser did not apply becomes an update', () => {
  assert.deepEqual(planFollowUps(created({ labels: ['a'] }), { labels: ['a', 'waiting on'] }).update, { labels: ['a', 'waiting on'] })
  assert.deepEqual(planFollowUps(created(), { priority: 4 }).update, { priority: 4 })
  assert.equal(planFollowUps(created({ priority: 3 }), { priority: 4 }).update, null, 'a typed p2 is not overridden by the picker')
  const note = planFollowUps(created({ description: 'from the line' }), { note: 'From agent: X' })
  assert.equal(note.update.description, 'from the line\n\nFrom agent: X')
  assert.equal(planFollowUps(created(), {}).update, null)
})

// ---- saved filters ---------------------------------------------------------

test('a multi-query saved filter is complete only when no section has more', () => {
  const t = id => ({ ...sdk.task(), id })
  // Shape: td 5.4.10 `filter view --json` for "p1, p2" (formatFilterSectionsJson).
  const complete = filterPage({ sections: [{ query: 'p1', results: [t('a'), t('b')], nextCursor: null }, { query: 'p2', results: [t('b'), t('c')], nextCursor: null }] })
  assert.deepEqual(complete.tasks.map(x => x.id), ['a', 'b', 'c'])
  assert.equal(complete.truncated, false)
  const more = filterPage({ sections: [{ query: 'p1', results: [t('a')], nextCursor: 'c1' }, { query: 'p2', results: [], nextCursor: null }] })
  assert.equal(more.truncated, true, 'td cannot continue a multi-section filter, so say it is partial')
  assert.equal(more.nextCursor, null)
})

test('a one-query filter keeps td’s cursor; a full page without one may have more', () => {
  const t = id => ({ ...sdk.task(), id })
  assert.deepEqual(filterPage({ results: [t('a')], nextCursor: 'c1' }).nextCursor, 'c1')
  const sorted = filterPage({ results: Array.from({ length: 1000 }, (_, i) => t(`t${i}`)), nextCursor: null })
  assert.equal(sorted.truncated, true, 'td slices a sorted filter to the limit and drops the cursor')
  assert.equal(filterPage({ results: [t('a')], nextCursor: null }).truncated, false)
})

test('agent sessions for "Link to agent": a kind-less session is an agent', () => {
  assert.ok(isAgentSession(null))
  assert.ok(isAgentSession(undefined))
  assert.ok(isAgentSession('claude') && isAgentSession('opencode') && isAgentSession('pi'))
  assert.ok(!isAgentSession('terminal'))
  assert.ok(!isAgentSession('extension-view'))
})
