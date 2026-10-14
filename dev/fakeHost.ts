import type { JsonValue, ViewContext } from 'agent-code-extension-api'

import type { HostState, ListQuery, Meta, ProjectRow, SetupStatus, TaskRow } from '../src/shared/types'

// A fake Agent Code host + fake td for the standalone preview (npm run preview /
// npm run shots). It implements the SAME request names the real runtime routes
// (src/runtime.ts) with an in-memory account, so the real view modules run
// unchanged. Sample data is invented for the preview only; tests use the SDK's
// own fixtures instead (tests/fixtures.mjs).

const day = (offset: number, time?: string) => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  const ymd = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`
  if (!time) return { date: ymd, datetime: null }
  const [h, m] = time.split(':').map(Number)
  d.setHours(h, m, 0, 0)
  return { date: ymd, datetime: d.toISOString() }
}

const projects: ProjectRow[] = [
  { id: 'p-inbox', name: 'Inbox', color: 'charcoal', parentId: null, order: 0, isFavorite: false, isInbox: true, isShared: false, viewStyle: 'list', url: 'https://app.todoist.com/app/project/p-inbox' },
  { id: 'p-ac', name: 'Agent Code', color: 'blue', parentId: null, order: 1, isFavorite: true, isInbox: false, isShared: false, viewStyle: 'list', url: 'https://app.todoist.com/app/project/p-ac' },
  { id: 'p-hack', name: 'Hackathons', color: 'orange', parentId: null, order: 2, isFavorite: false, isInbox: false, isShared: true, viewStyle: 'list', url: '' },
  { id: 'p-xmas', name: 'Christmas Game', color: 'berry_red', parentId: 'p-hack', order: 0, isFavorite: false, isInbox: false, isShared: false, viewStyle: 'list', url: '' },
  { id: 'p-home', name: 'Personal', color: 'lime_green', parentId: null, order: 3, isFavorite: false, isInbox: false, isShared: false, viewStyle: 'list', url: '' },
  { id: 'p-read', name: 'Reading list', color: 'grape', parentId: null, order: 4, isFavorite: true, isInbox: false, isShared: false, viewStyle: 'list', url: '' },
]

const meta: Meta = {
  projects,
  sections: [
    { id: 's-prog', projectId: 'p-ac', name: 'In progress', order: 1 },
    { id: 's-review', projectId: 'p-ac', name: 'Review', order: 2 },
    { id: 's-back', projectId: 'p-ac', name: 'Backlog', order: 3 },
  ],
  labels: [
    { id: 'l1', name: 'review', color: 'violet', isFavorite: true, order: 1 },
    { id: 'l2', name: 'deep-work', color: 'teal', isFavorite: false, order: 2 },
    { id: 'l3', name: 'waiting', color: 'orange', isFavorite: false, order: 3 },
    { id: 'l4', name: 'errand', color: 'lime_green', isFavorite: false, order: 4 },
  ],
  filters: [
    { id: 'f1', name: 'Priority 1', query: 'p1', color: 'red', isFavorite: false },
    { id: 'f2', name: 'Waiting on others', query: '@waiting', color: 'orange', isFavorite: false },
  ],
  user: { id: 'u1', email: 'you@example.com', fullName: 'Julius', readOnly: false },
}

let seq = 100
const task = (partial: Partial<TaskRow> & { content: string }): TaskRow => ({
  id: `t${seq++}`,
  description: '',
  priority: 1,
  due: null,
  deadline: null,
  duration: null,
  projectId: 'p-inbox',
  sectionId: null,
  parentId: null,
  labels: [],
  order: seq,
  commentCount: 0,
  completedAt: null,
  url: 'https://app.todoist.com/app/task/x',
  ...partial,
})

const due = (offset: number, string: string, time?: string, recurring = false) => ({ ...day(offset, time), string, recurring })

let tasks: TaskRow[] = [
  task({ content: 'Reply to Hermes VPS upgrade thread', priority: 3, due: due(-2, 'Oct 12'), projectId: 'p-ac', sectionId: 's-review', labels: ['waiting'] }),
  task({ content: 'Renew domain for hackathons.team', priority: 4, due: due(-1, 'yesterday'), projectId: 'p-hack' }),
  task({ content: 'Stand-up with the agent fleet', due: due(0, 'every weekday 9:30', '09:30', true), projectId: 'p-ac', labels: ['deep-work'], duration: { amount: 15, unit: 'minute' } }),
  task({ content: 'Review **PR #1484** — Send to Window', description: 'Check confirm-from-snapshot and the target re-claim rollback.\nhttps://github.com/Juliusolsson05/agent-code/pull/1484', priority: 4, due: due(0, 'today 14:00', '14:00'), projectId: 'p-ac', sectionId: 's-review', labels: ['review'], deadline: day(2).date, commentCount: 2 }),
  task({ content: 'Write the Todoist extension README', priority: 2, due: due(0, 'today'), projectId: 'p-ac', sectionId: 's-prog', duration: { amount: 45, unit: 'minute' } }),
  task({ content: 'Buy coffee beans', due: due(0, 'today'), projectId: 'p-home', labels: ['errand'] }),
  task({ content: 'Prep demo for Applied Agentic Hackathon', priority: 3, due: due(1, 'tomorrow 10:00', '10:00'), projectId: 'p-hack', description: 'Slides + live run of the orchestration loop.' }),
  task({ content: 'Pick the Christmas game theme', due: due(3, 'in 3 days'), projectId: 'p-xmas', priority: 2 }),
  task({ content: 'Read "Designing Data-Intensive Applications" ch. 5', due: due(4, 'sat'), projectId: 'p-read' }),
  task({ content: 'Rotate Deepgram API key', priority: 4, due: due(6, 'next tue'), projectId: 'p-ac', sectionId: 's-back', labels: ['deep-work'] }),
  task({ content: 'Call the bank about the card', projectId: 'p-inbox' }),
  task({ content: 'Idea: agent goals in the dock badge', projectId: 'p-inbox', description: 'Show completed-goal count on the dock icon.' }),
  task({ content: 'Profile renderer GC churn at 60 Hz', projectId: 'p-ac', sectionId: 's-back', priority: 2 }),
]
// subtasks
const parent = tasks.find(t => t.content.startsWith('Write the Todoist'))!
tasks.push(task({ content: 'Document the permissions', projectId: 'p-ac', sectionId: 's-prog', parentId: parent.id }))
tasks.push(task({ content: 'Add screenshots', projectId: 'p-ac', sectionId: 's-prog', parentId: parent.id, due: due(1, 'tomorrow') }))

const completed: TaskRow[] = [
  task({ content: 'Merge PR #1491 Hermes chat pane', projectId: 'p-ac', completedAt: new Date(Date.now() - 3_600_000).toISOString() }),
  task({ content: 'Book flights to Stockholm', projectId: 'p-home', completedAt: new Date(Date.now() - 26 * 3_600_000).toISOString() }),
]

const comments = [
  { id: 'c1', content: 'Rollback path looks right; one nit on the snapshot copy.', postedAt: new Date(Date.now() - 7_200_000).toISOString(), attachment: null },
  { id: 'c2', content: 'CI is green — waiting on owner merge.', postedAt: new Date(Date.now() - 1_800_000).toISOString(), attachment: null },
]

const today = day(0).date

function list(q: ListQuery): TaskRow[] {
  const open = tasks.filter(t => !t.completedAt)
  switch (q.kind) {
    case 'today': return open.filter(t => t.due && t.due.date <= today)
    case 'upcoming': return open.filter(t => t.due && t.due.date <= day(14).date)
    case 'inbox': return open.filter(t => t.projectId === 'p-inbox')
    case 'project': return open.filter(t => t.projectId === q.id)
    case 'label': return open.filter(t => t.labels.includes(q.query ?? ''))
    case 'filter': return q.query === 'p1' ? open.filter(t => t.priority === 4) : open.filter(t => t.labels.includes('waiting'))
    case 'search': return open.filter(t => t.content.toLowerCase().includes((q.query ?? '').toLowerCase()))
    case 'completed': return completed
  }
}

export function createFakeContext(setupState: string, modal: boolean): ViewContext {
  const listeners = new Set<(s: JsonValue) => void>()
  const setup: SetupStatus = {
    state: setupState === 'ready' ? 'ready' : setupState === 'signed-out' || setupState === 'login' ? 'signed-out' : 'td-missing',
    td: setupState === 'td-missing' || setupState === 'installing' ? null : { path: '/opt/homebrew/bin/td', version: '5.4.10', node: null },
    searched: ['/opt/homebrew/bin/td', '/usr/local/bin/td', '~/.local/bin/td'],
    brew: '/opt/homebrew/bin/brew',
    user: setupState === 'ready' ? meta.user : null,
    job: setupState === 'login' ? { kind: 'login', state: 'running', startedAt: Date.now() - 12_000, authorizeUrl: 'https://app.todoist.com/oauth/authorize?client_id=x', detail: null }
      : setupState === 'installing' ? { kind: 'install', state: 'running', startedAt: Date.now() - 41_000, authorizeUrl: null, detail: null } : null,
    error: null,
    checkedAt: Date.now(),
  }
  let state: HostState = { revision: 1, setup, settings: { tdPath: '', defaultView: 'today', dueReminders: false, reminderIntervalMinutes: 5 } }
  const publish = () => listeners.forEach(l => l(state as unknown as JsonValue))
  const bump = () => { state = { ...state, revision: state.revision + 1 }; publish() }
  const wait = (ms = 220) => new Promise(r => setTimeout(r, ms))
  const storage = new Map<string, JsonValue>()

  const request = async (name: string, input?: JsonValue): Promise<JsonValue | undefined> => {
    await wait()
    const p = (input ?? {}) as { id: string; text: string }
    const find = (id: string) => tasks.find(t => t.id === id) ?? completed.find(t => t.id === id)
    switch (name) {
      case 'status': publish(); return state.setup as unknown as JsonValue
      case 'meta': return meta as unknown as JsonValue
      case 'list': return { tasks: list(p as unknown as ListQuery), nextCursor: null, truncated: false } as unknown as JsonValue
      case 'task': {
        const t = find(p.id)!
        return { task: t, children: tasks.filter(c => c.parentId === t.id), comments: t.commentCount ? comments : [] } as unknown as JsonValue
      }
      case 'quickAdd': {
        const t = task({ content: String(p.text).replace(/\b(today|tomorrow)\b|p[1-4]|#\S+|@\S+/g, '').trim(), due: /today/.test(p.text) ? due(0, 'today') : null })
        tasks.push(t)
        bump()
        return t as unknown as JsonValue
      }
      case 'complete': { const t = find(p.id)!; t.completedAt = new Date().toISOString(); tasks = tasks.filter(x => x.id !== t.id); completed.unshift(t); bump(); return { ok: true } }
      case 'uncomplete': { const t = find(p.id)!; t.completedAt = null; tasks.push(t); bump(); return { ok: true } }
      case 'update': { const t = find(p.id)!; Object.assign(t, { ...(p as object), id: t.id }); bump(); return t as unknown as JsonValue }
      case 'openUrl': return { ok: true }
      default: bump(); return { ok: true }
    }
  }

  const agents = [
    { id: 'a1', kind: 'claude', cwd: '~/Desktop/Development/agent-code', title: 'Hermes chat pane fixes', activity: 'working' as const, notification: null },
    { id: 'a2', kind: 'codex', cwd: '~/Desktop/Development/agent-code', title: 'Send to Window review', activity: 'idle' as const, notification: null },
    { id: 'a3', kind: 'terminal', cwd: '~', title: 'zsh', activity: 'idle' as const, notification: null },
  ]

  return {
    api: {
      extension: { id: 'todoist', apiVersion: 2 },
      storage: {
        get: async (k: string) => storage.get(k) as never,
        set: async (k: string, v: JsonValue) => { storage.set(k, v) },
        delete: async (k: string) => { storage.delete(k) },
        keys: async () => [...storage.keys()],
      },
      ui: { close: async () => { console.log('[preview] ui.close') }, showToast: async () => {} },
      theme: { tokens: async () => ({}) },
      workspace: { observe: async () => ({ activeTabId: 'tab1', tabIds: ['tab1'], sessionCount: 3 }), subscribe: () => () => {} },
      sessions: { observe: async () => agents, subscribe: () => () => {} },
      panes: { observe: async () => [{ tabId: 'tab1', leafSessionIds: ['a1', 'a3'] }], subscribe: () => () => {} },
      files: {} as never,
      notifications: { show: async () => {} },
      services: {} as never,
      net: {} as never,
    },
    view: { id: modal ? 'todoist.quickAdd' : 'todoist.main', instanceId: 'preview' },
    runtime: {
      state: () => state as unknown as JsonValue,
      request: request as never,
      subscribe: (l: (s: JsonValue) => void) => { listeners.add(l); return () => listeners.delete(l) },
    },
  } as unknown as ViewContext
}
