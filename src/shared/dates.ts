import type { DueRow, TaskRow } from './types'

// Due-date presentation and grouping.
//
// Every function takes `now` explicitly. WHY: the view re-renders on a timer
// (midnight rollover must move "Tomorrow" into "Today" without a refetch) and the
// tests pin a fixed clock; reading `new Date()` inside would make both wrong.
//
// Todoist dates come in two forms (SDK DueDateSchema): an all-day `date`
// (YYYY-MM-DD, floating, no timezone) and a timed `datetime` (ISO, maybe with a
// timezone). Floating dates are compared as LOCAL calendar days — parsing
// "2026-10-14" with `new Date()` would treat it as UTC midnight and show
// yesterday for anyone west of Greenwich.

export type DueTone = 'overdue' | 'today' | 'tomorrow' | 'week' | 'future' | 'none'

const DAY_MS = 86_400_000

/** Local calendar day index (days since epoch in LOCAL time). */
export function localDayIndex(date: Date): number {
  return Math.floor((Date.UTC(date.getFullYear(), date.getMonth(), date.getDate())) / DAY_MS)
}

/** Parse a floating YYYY-MM-DD as a local date. */
export function parseLocalDate(ymd: string): Date {
  const [y, m, d] = ymd.slice(0, 10).split('-').map(Number)
  return new Date(y, (m || 1) - 1, d || 1)
}

export function dueDayIndex(due: DueRow): number {
  return due.datetime ? localDayIndex(new Date(due.datetime)) : localDayIndex(parseLocalDate(due.date))
}

export function dueTone(due: DueRow | null, now: Date): DueTone {
  if (!due) return 'none'
  const today = localDayIndex(now)
  const day = dueDayIndex(due)
  if (day < today) return 'overdue'
  // A timed task earlier today that has passed is overdue too — Todoist shows it red.
  if (day === today && due.datetime && new Date(due.datetime).getTime() < now.getTime()) return 'overdue'
  if (day === today) return 'today'
  if (day === today + 1) return 'tomorrow'
  if (day < today + 7) return 'week'
  return 'future'
}

const TIME = new Intl.DateTimeFormat(undefined, { hour: 'numeric', minute: '2-digit' })
const WEEKDAY = new Intl.DateTimeFormat(undefined, { weekday: 'long' })
const SHORT = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric' })
const SHORT_YEAR = new Intl.DateTimeFormat(undefined, { month: 'short', day: 'numeric', year: 'numeric' })
const LONG = new Intl.DateTimeFormat(undefined, { weekday: 'short', month: 'short', day: 'numeric' })

/** "Today", "Tomorrow", "Yesterday", "Friday", "Oct 20", "Oct 20 2027" (+ " 3:00 PM"). */
export function formatDue(due: DueRow, now: Date): string {
  const today = localDayIndex(now)
  const day = dueDayIndex(due)
  const date = due.datetime ? new Date(due.datetime) : parseLocalDate(due.date)
  let label: string
  if (day === today) label = 'Today'
  else if (day === today + 1) label = 'Tomorrow'
  else if (day === today - 1) label = 'Yesterday'
  else if (day > today && day < today + 7) label = WEEKDAY.format(date)
  else if (date.getFullYear() === now.getFullYear()) label = SHORT.format(date)
  else label = SHORT_YEAR.format(date)
  return due.datetime ? `${label} ${TIME.format(date)}` : label
}

export function formatDeadline(ymd: string, now: Date): string {
  const date = parseLocalDate(ymd)
  const diff = localDayIndex(date) - localDayIndex(now)
  if (diff === 0) return 'Today'
  if (diff === 1) return 'Tomorrow'
  if (diff < 0) return `${SHORT.format(date)} (passed)`
  return date.getFullYear() === now.getFullYear() ? SHORT.format(date) : SHORT_YEAR.format(date)
}

export function formatDuration(duration: { amount: number; unit: 'minute' | 'day' }): string {
  if (duration.unit === 'day') return duration.amount === 1 ? '1 day' : `${duration.amount} days`
  const h = Math.floor(duration.amount / 60)
  const m = duration.amount % 60
  if (h && m) return `${h}h ${m}m`
  return h ? `${h}h` : `${m}m`
}

export type TaskGroup = { key: string; title: string; subtitle?: string; tone?: DueTone; tasks: TaskRow[] }

/** Sort key inside a day: timed tasks by time first, then priority (p1 first),
 *  then Todoist's manual order. Mirrors Todoist's default "smart" Today order. */
function dayCompare(a: TaskRow, b: TaskRow): number {
  const at = a.due?.datetime ? new Date(a.due.datetime).getTime() : Number.POSITIVE_INFINITY
  const bt = b.due?.datetime ? new Date(b.due.datetime).getTime() : Number.POSITIVE_INFINITY
  if (at !== bt) return at - bt
  if (a.priority !== b.priority) return b.priority - a.priority
  return a.order - b.order
}

/** Today view: "Overdue" then "Today". Tasks without a due date (td's today
 *  never returns them, but a refresh race can) land in Today. */
export function groupToday(tasks: TaskRow[], now: Date): TaskGroup[] {
  const overdue: TaskRow[] = []
  const today: TaskRow[] = []
  for (const task of tasks) (dueTone(task.due, now) === 'overdue' ? overdue : today).push(task)
  overdue.sort((a, b) => (a.due && b.due ? dueDayIndex(a.due) - dueDayIndex(b.due) : 0) || dayCompare(a, b))
  today.sort(dayCompare)
  const groups: TaskGroup[] = []
  if (overdue.length) groups.push({ key: 'overdue', title: 'Overdue', tone: 'overdue', tasks: overdue })
  groups.push({ key: 'today', title: 'Today', subtitle: LONG.format(now), tone: 'today', tasks: today })
  return groups
}

/** Upcoming view: one group per calendar day, overdue collapsed into one group
 *  at the top. Empty days are not rendered (Todoist shows them; in a narrow pane
 *  they push real tasks below the fold). */
export function groupByDay(tasks: TaskRow[], now: Date): TaskGroup[] {
  const today = localDayIndex(now)
  const byDay = new Map<number, TaskRow[]>()
  const overdue: TaskRow[] = []
  const undated: TaskRow[] = []
  for (const task of tasks) {
    if (!task.due) { undated.push(task); continue }
    const day = dueDayIndex(task.due)
    if (day < today) { overdue.push(task); continue }
    const list = byDay.get(day) ?? []
    list.push(task)
    byDay.set(day, list)
  }
  const groups: TaskGroup[] = []
  if (overdue.length) groups.push({ key: 'overdue', title: 'Overdue', tone: 'overdue', tasks: overdue.sort(dayCompare) })
  for (const day of [...byDay.keys()].sort((a, b) => a - b)) {
    const date = new Date(day * DAY_MS)
    const local = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    const title = day === today ? 'Today' : day === today + 1 ? 'Tomorrow' : WEEKDAY.format(local)
    groups.push({
      key: `day-${day}`,
      title,
      subtitle: LONG.format(local),
      tone: day === today ? 'today' : day === today + 1 ? 'tomorrow' : 'future',
      tasks: byDay.get(day)!.sort(dayCompare),
    })
  }
  if (undated.length) groups.push({ key: 'undated', title: 'No date', tasks: undated })
  return groups
}

/** Completed view: grouped by completion day, newest first. */
export function groupCompleted(tasks: TaskRow[], now: Date): TaskGroup[] {
  const today = localDayIndex(now)
  const byDay = new Map<number, TaskRow[]>()
  for (const task of tasks) {
    const day = task.completedAt ? localDayIndex(new Date(task.completedAt)) : today
    const list = byDay.get(day) ?? []
    list.push(task)
    byDay.set(day, list)
  }
  return [...byDay.keys()].sort((a, b) => b - a).map(day => {
    const date = new Date(day * DAY_MS)
    const local = new Date(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate())
    return {
      key: `done-${day}`,
      title: day === today ? 'Today' : day === today - 1 ? 'Yesterday' : LONG.format(local),
      tasks: byDay.get(day)!.sort((a, b) => (b.completedAt ?? '').localeCompare(a.completedAt ?? '')),
    }
  })
}
