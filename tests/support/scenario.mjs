import { dayFromToday } from './fakeTodoist.mjs'

// The standard account the integration suites run against. Each entity exists
// to exercise one thing the UI depends on; the comment says which.

export const due = (offset, string = 'date', extra = {}) => ({ date: dayFromToday(offset), is_recurring: false, lang: 'en', string, timezone: null, ...extra })

export function seed(fake) {
  const work = fake.addProject({ name: 'Work', color: 'blue', child_order: 1, is_favorite: true })
  const client = fake.addProject({ name: 'Client A', color: 'berry_red', parent_id: work.id, child_order: 1 }) // nesting
  const home = fake.addProject({ name: 'Home', color: 'lime_green', child_order: 2 })
  const doing = fake.addSection({ project_id: work.id, name: 'Doing', section_order: 1 })
  const review = fake.addSection({ project_id: work.id, name: 'Review', section_order: 2 })
  fake.addLabel({ name: 'review', color: 'violet', order: 1, is_favorite: true })
  fake.addLabel({ name: 'deep-work', color: 'teal', order: 2 })
  const urgent = fake.addFilter({ name: 'Urgent', query: 'p1' })

  const t = {
    overdue: fake.addTask({ content: 'Overdue invoice', due: due(-2, 'Oct 12'), project_id: work.id, section_id: review.id, priority: 3 }),
    today: fake.addTask({
      content: 'Review **PR #12** — https://github.com/acme/repo/pull/12',
      description: 'Check the rollback path.\n\n- step one\n- step two',
      due: due(0, 'today'), project_id: work.id, section_id: doing.id, labels: ['review'], priority: 4,
      deadline: { date: dayFromToday(3), lang: 'en' }, duration: { amount: 45, unit: 'minute' },
    }),
    timed: fake.addTask({ content: 'Stand-up', due: due(0, 'every weekday 9:30', { is_recurring: true, datetime: `${dayFromToday(0)}T09:30:00`, timezone: null }), project_id: work.id }),
    tomorrow: fake.addTask({ content: 'Prep demo', due: due(1, 'tomorrow'), project_id: client.id, priority: 2 }),
    nextWeek: fake.addTask({ content: 'Quarterly review', due: due(6, 'next tue'), project_id: home.id }),
    farFuture: fake.addTask({ content: 'Renew passport', due: due(60, 'in 2 months'), project_id: home.id }),
    inbox: fake.addTask({ content: 'Call the bank' }),
    unicode: fake.addTask({ content: 'Köp mjölk 🥛 — שלום — 日本語 `code` "quotes" \\ backslash', project_id: home.id, labels: ['deep-work'] }),
    longDescription: fake.addTask({ content: 'Paste of a long log', description: 'x'.repeat(20_000), project_id: home.id }),
    assignedToOther: fake.addTask({ content: 'Someone else’s task', due: due(0, 'today'), responsible_uid: 'u-other', project_id: work.id }),
  }
  t.child = fake.addTask({ content: 'Sub-step', parent_id: t.today.id, project_id: work.id, section_id: doing.id, due: due(1, 'tomorrow') })
  // Relative timestamps: the golden transcript normalises calendar days
  // relative to the run date, so an absolute date would drift day by day.
  fake.addComment(t.today.id, { content: 'Rollback looks right; one nit.', posted_at: `${dayFromToday(-1)}T08:00:00Z` })
  fake.addComment(t.today.id, { content: 'CI is **green**.', posted_at: `${dayFromToday(-1)}T09:00:00Z` })
  return { work, client, home, doing, review, urgent, t }
}
