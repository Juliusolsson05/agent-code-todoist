// A stateful fake of the Todoist API v1 — the endpoints td calls for our
// handlers — serving payloads built from Doist's OpenAPI examples
// (./openapi.mjs). The real td binary talks to it through ./interceptor.mjs.
//
// Two jobs:
// 1. Behave enough like Todoist that a sequence of td commands round-trips
//    (create → list → update → complete → reopen) with real state.
// 2. Record every request exactly as it arrived (method, path, query, JSON
//    body, auth header) so tests assert on the CONTRACT td sends Todoist for
//    each UI action — that is the "saved payload" half of the suite.
//
// Anything td asks for that is not implemented answers 501 and is recorded in
// `unhandled`; every integration test asserts that list is empty, so a td
// upgrade that starts calling a new endpoint fails loudly instead of being
// served a silent empty answer.
import http from 'node:http'

import { exampleOf } from './openapi.mjs'

const TOKEN = 'test-token-not-a-real-todoist-token'

let idSeq = 0
const nextId = prefix => `${prefix}${(++idSeq).toString(36).padStart(6, '0')}`

const ymd = date => `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
export const dayFromToday = offset => {
  const d = new Date()
  d.setDate(d.getDate() + offset)
  return ymd(d)
}

/** Resolve the subset of Todoist due strings the tests send. Unknown strings
 *  keep today's date, like a lenient parser would, and keep the text. */
function resolveDue(text) {
  if (text === undefined || text === null) return null
  const lower = String(text).toLowerCase().trim()
  if (!lower || lower === 'no date') return null
  let date
  if (/^\d{4}-\d{2}-\d{2}$/.test(lower)) date = lower
  else if (/^(today|tod)\b/.test(lower) || /^every\b/.test(lower)) date = dayFromToday(0)
  else if (/^(tomorrow|tom)\b/.test(lower)) date = dayFromToday(1)
  else if (lower.startsWith('yesterday')) date = dayFromToday(-1)
  else if (/^next (week|mon|tue|wed|thu|fri|sat|sun)/.test(lower)) date = dayFromToday(7)
  else if (/^in \d+ days?$/.test(lower)) date = dayFromToday(Number(lower.match(/\d+/)[0]))
  else {
    // Todoist rejects a due string it cannot parse. Resolving every unknown
    // string to "today" (the first version) made a bad date look like a
    // successful save in every suite.
    throw Object.assign(new Error(`Date is invalid: ${text}`), { status: 400, body: { error: 'Date is invalid', error_code: 46, http_code: 400 } })
  }
  return { date, is_recurring: /^every\b/.test(lower), lang: 'en', string: String(text), timezone: null }
}

export class FakeTodoist {
  constructor() {
    this.requests = []
    this.unhandled = []
    this.faults = []
    this.token = TOKEN
    this.reset()
  }

  // ---- world building ----------------------------------------------------

  reset() {
    // tz_info: Doist's spec example omits hours/minutes and types is_dst as a
    // boolean, but the SDK's schema (what td validates with) requires numbers.
    // The spec example is wrong, not td — so the fake sends what the live API
    // and the SDK agree on. Found by the first real-td run.
    this.user = {
      ...exampleOf('UserJSON'),
      id: 'u-1', email: 'tester@example.com', full_name: 'Test User',
      tz_info: { timezone: 'Europe/Stockholm', hours: 2, minutes: 0, is_dst: 1, gmt_string: '+02:00' },
    }
    this.projects = []
    this.sections = []
    this.labels = []
    this.tasks = []
    this.comments = []
    this.filters = []
    this.inbox = this.addProject({ name: 'Inbox', inbox_project: true, child_order: 0 })
    // td inbox resolves the Inbox through /user's inbox_project_id, not the
    // project flag; the spec example carries an unrelated id.
    this.user.inbox_project_id = this.inbox.id
    this.requests.length = 0
    this.unhandled.length = 0
    this.faults.length = 0
  }

  addProject(overrides = {}) {
    const project = { ...exampleOf('AnyProjectSyncViewResponse'), id: nextId('p'), parent_id: null, is_archived: false, is_deleted: false, inbox_project: false, is_favorite: false, ...overrides }
    this.projects.push(project)
    return project
  }

  addSection(overrides = {}) {
    const section = { ...exampleOf('SectionSyncView'), id: nextId('s'), project_id: this.inbox.id, archived_at: null, is_archived: false, is_deleted: false, ...overrides }
    this.sections.push(section)
    return section
  }

  addLabel(overrides = {}) {
    const label = { ...exampleOf('LabelRestView'), id: nextId('l'), ...overrides }
    this.labels.push(label)
    return label
  }

  addTask(overrides = {}) {
    const base = exampleOf('ItemSyncView')
    const task = {
      ...base,
      id: nextId('t'),
      project_id: this.inbox.id,
      section_id: null,
      parent_id: null,
      labels: [],
      deadline: null,
      duration: null,
      checked: false,
      is_deleted: false,
      completed_at: null,
      completed_by_uid: null,
      due: null,
      priority: 1,
      description: '',
      responsible_uid: null,
      assigned_by_uid: null,
      child_order: this.tasks.length + 1,
      ...overrides,
    }
    this.tasks.push(task)
    return task
  }

  addComment(taskId, overrides = {}) {
    const comment = { ...exampleOf('NoteSyncView'), id: nextId('c'), item_id: taskId, project_id: undefined, file_attachment: null, ...overrides }
    delete comment.project_id
    this.comments.push(comment)
    return comment
  }

  addFilter(overrides = {}) {
    const filter = { id: nextId('f'), name: 'Filter', query: 'p1', color: 'red', item_order: 1, is_deleted: false, is_favorite: false, is_frozen: false, ...overrides }
    this.filters.push(filter)
    return filter
  }

  /** Make the next `times` requests matching `match` fail with `status`. */
  fail(match, { status = 500, body = { error: 'Fake failure' }, times = Infinity, delayMs = 0 } = {}) {
    this.faults.push({ match, status, body, times, delayMs })
  }

  requestsTo(method, pathPrefix) {
    return this.requests.filter(r => r.method === method && r.path.startsWith(pathPrefix))
  }

  // ---- query evaluation ----------------------------------------------------

  /** A small evaluator for Todoist's filter language: enough for the queries
   *  td builds (today/overdue/assigned) and the ones our handlers pass
   *  (`search: text`, `@label`, `#project`, `p1`, saved filter queries). */
  matches(task, query) {
    const tokens = query.match(/\(|\)|\||&|!|search:\s*[^&|()]+|[^&|()!]+/g)?.map(t => t.trim()).filter(Boolean) ?? []
    let pos = 0
    const today = dayFromToday(0)
    const atom = text => {
      const t = text.toLowerCase()
      const due = task.due?.date?.slice(0, 10)
      if (t === 'today') return due === today
      if (t === 'overdue') return !!due && due < today
      if (t === 'no date') return !due
      if (/^(\d+) days$/.test(t) || /^next (\d+) days$/.test(t)) {
        const n = Number(t.match(/\d+/)[0])
        return !!due && due >= today && due <= dayFromToday(n)
      }
      if (t.startsWith('due before:')) {
        // td's Upcoming sends "due before: 14 days" (relative); absolute dates too.
        const arg = t.slice(11).trim()
        const relative = arg.match(/^(\d+) days?$/)
        return !!due && due < (relative ? dayFromToday(Number(relative[1])) : arg)
      }
      if (t === 'assigned to: me') return task.responsible_uid === this.user.id
      if (t === 'assigned') return !!task.responsible_uid
      if (t.startsWith('search:')) return task.content.toLowerCase().includes(t.slice(7).trim())
      if (t.startsWith('@')) return task.labels.some(l => l.toLowerCase() === t.slice(1).replace(/"/g, ''))
      if (t.startsWith('##') || t.startsWith('#')) {
        const name = t.replace(/^#+/, '').replace(/"/g, '')
        return this.projects.find(p => p.id === task.project_id)?.name.toLowerCase() === name
      }
      if (/^p[1-4]$/.test(t)) return task.priority === 5 - Number(t[1])
      if (t === 'recurring') return !!task.due?.is_recurring
      if (t === 'subtask') return !!task.parent_id
      if (t === '*' || t === 'all') return true
      throw Object.assign(new Error(`fake cannot evaluate filter atom "${text}"`), { status: 400 })
    }
    const parsePrimary = () => {
      const token = tokens[pos++]
      if (token === '!') return !parsePrimary()
      if (token === '(') {
        const value = parseOr()
        pos++ // ')'
        return value
      }
      return atom(token)
    }
    const parseAnd = () => {
      let value = parsePrimary()
      while (tokens[pos] === '&') { pos++; value = parsePrimary() && value }
      return value
    }
    const parseOr = () => {
      let value = parseAnd()
      while (tokens[pos] === '|') { pos++; value = parseAnd() || value }
      return value
    }
    return parseOr()
  }

  // ---- HTTP ----------------------------------------------------------------

  createServer() {
    return http.createServer((req, res) => {
      let raw = ''
      req.on('data', chunk => { raw += chunk })
      req.on('end', () => {
        const url = new URL(req.url, 'https://api.todoist.com')
        let body = null
        if (raw) {
          try { body = JSON.parse(raw) } catch { body = Object.fromEntries(new URLSearchParams(raw)) }
        }
        const entry = { method: req.method, path: url.pathname, query: Object.fromEntries(url.searchParams), body, auth: req.headers.authorization ?? null }
        this.requests.push(entry)
        const send = (status, payload) => {
          res.statusCode = status
          if (payload === undefined) return res.end()
          res.setHeader('content-type', 'application/json')
          res.end(JSON.stringify(payload))
        }
        const fault = this.faults.find(f => f.times > 0 && f.match(entry))
        if (fault) {
          fault.times--
          return setTimeout(() => send(fault.status, fault.body), fault.delayMs)
        }
        if (entry.auth !== `Bearer ${this.token}`) return send(401, { error: 'Unauthorized', error_code: 477, http_code: 401 })
        try {
          const result = this.route(entry)
          if (result === undefined) {
            this.unhandled.push(`${entry.method} ${entry.path}`)
            return send(501, { error: `fake does not implement ${entry.method} ${entry.path}` })
          }
          send(result.status ?? 200, result.body)
        } catch (error) {
          send(error.status ?? 500, { error: error.message })
        }
      })
    })
  }

  route({ method, path, query, body }) {
    const m = path.match(/^\/api\/v1\/(.+?)\/?$/)
    if (!m) return undefined
    const parts = m[1].split('/')
    const ok = value => ({ body: value })
    const open = () => this.tasks.filter(t => !t.checked && !t.is_deleted)
    const findTask = id => this.tasks.find(t => t.id === id) ?? notFound('task')
    const notFound = what => { throw Object.assign(new Error(`${what} not found`), { status: 404 }) }

    if (method === 'GET' && path === '/api/v1/user') return ok(this.user)

    if (parts[0] === 'projects') {
      if (method === 'GET' && parts.length === 1) return ok(this.page(this.projects.filter(p => !p.is_archived), query))
      if (method === 'GET' && parts.length === 2) return ok(this.projects.find(p => p.id === parts[1]) ?? notFound('project'))
      if (method === 'POST' && parts.length === 1) return ok(this.addProject({ name: body.name, color: body.color ?? 'charcoal', parent_id: body.parent_id ?? null, is_favorite: !!body.is_favorite }))
    }
    if (parts[0] === 'sections') {
      if (method === 'GET' && parts.length === 1) return ok(this.page(this.sections.filter(s => !query.project_id || s.project_id === query.project_id), query))
      if (method === 'GET' && parts.length === 2) return ok(this.sections.find(s => s.id === parts[1]) ?? notFound('section'))
      if (method === 'POST' && parts.length === 1) return ok(this.addSection({ name: body.name, project_id: body.project_id }))
    }
    if (parts[0] === 'labels') {
      if (method === 'GET' && parts.length === 1) return ok(this.page(this.labels, query))
      if (method === 'GET' && parts[1] === 'shared') return ok(this.page([], query))
      if (method === 'POST' && parts.length === 1) return ok(this.addLabel({ name: body.name, color: body.color ?? 'charcoal' }))
    }
    if (parts[0] === 'comments') {
      if (method === 'GET') return ok(this.page(this.comments.filter(c => c.item_id === query.task_id), query))
      if (method === 'POST') return ok(this.addComment(body.task_id, { content: body.content, posted_at: new Date().toISOString() }))
    }
    if (parts[0] === 'sync' && method === 'POST') {
      return ok({ full_sync: true, sync_token: 'fake-sync-token', filters: this.filters, temp_id_mapping: {}, sync_status: {} })
    }
    if (parts[0] === 'tasks') {
      if (parts[1] === 'filter' && method === 'GET') return ok(this.page(open().filter(t => this.matches(t, query.query ?? '')), query))
      if (parts[1] === 'completed' && parts[2] === 'by_completion_date') {
        const items = this.tasks.filter(t => t.checked)
        const p = this.page(items, query)
        return ok({ items: p.results, next_cursor: p.next_cursor })
      }
      if (parts[1] === 'quick' && method === 'POST') return ok(this.quickAdd(body.text))
      if (parts.length === 1 && method === 'GET') {
        const ids = query.ids?.split(',')
        let list = open()
        if (ids) list = this.tasks.filter(t => ids.includes(t.id))
        if (query.project_id) list = list.filter(t => t.project_id === query.project_id)
        if (query.section_id) list = list.filter(t => t.section_id === query.section_id)
        if (query.parent_id) list = list.filter(t => t.parent_id === query.parent_id)
        if (query.label) list = list.filter(t => t.labels.includes(query.label))
        return ok(this.page(list, query))
      }
      if (parts.length === 1 && method === 'POST') return ok(this.createTask(body))
      const task = findTask(parts[1])
      if (parts.length === 2 && method === 'GET') return ok(task)
      if (parts.length === 2 && method === 'POST') return ok(this.updateTask(task, body))
      if (parts.length === 2 && method === 'DELETE') {
        // Todoist deletes the whole subtree, not just direct children.
        const doomed = new Set([task.id])
        for (let grew = true; grew;) {
          grew = false
          for (const t of this.tasks) if (t.parent_id && doomed.has(t.parent_id) && !doomed.has(t.id)) { doomed.add(t.id); grew = true }
        }
        for (const t of this.tasks) if (doomed.has(t.id)) t.is_deleted = true
        return ok({})
      }
      if (parts[2] === 'close' && method === 'POST') {
        if (task.due?.is_recurring) {
          // Recurring tasks roll forward instead of closing, like Todoist.
          task.due = { ...task.due, date: dayFromToday(1) }
        } else {
          task.checked = true
          task.completed_at = new Date().toISOString()
        }
        // The spec declares 200 + application/json `{}` (schema {}). The SDK
        // accepts any 2xx and an empty body too; faults.test covers 204.
        return ok({})
      }
      if (parts[2] === 'reopen' && method === 'POST') {
        task.checked = false
        task.completed_at = null
        return ok({})
      }
      if (parts[2] === 'move' && method === 'POST') {
        if (body.project_id) Object.assign(task, { project_id: body.project_id, section_id: null, parent_id: null })
        if (body.section_id) {
          const section = this.sections.find(s => s.id === body.section_id) ?? notFound('section')
          Object.assign(task, { project_id: section.project_id, section_id: section.id, parent_id: null })
        }
        if (body.parent_id) {
          const parent = findTask(body.parent_id)
          Object.assign(task, { project_id: parent.project_id, section_id: parent.section_id, parent_id: parent.id })
        }
        return ok(task)
      }
    }
    return undefined
  }

  page(items, query) {
    const limit = Math.max(1, Math.min(200, Number(query.limit) || 50))
    const offset = query.cursor ? Number(Buffer.from(query.cursor, 'base64url').toString()) : 0
    const slice = items.slice(offset, offset + limit)
    const next = offset + limit < items.length ? Buffer.from(String(offset + limit)).toString('base64url') : null
    return { results: slice, next_cursor: next }
  }

  createTask(body) {
    if (!body?.content) throw Object.assign(new Error('content required'), { status: 400 })
    const parent = body.parent_id ? this.tasks.find(t => t.id === body.parent_id) : null
    return this.addTask({
      content: body.content,
      description: body.description ?? '',
      project_id: body.project_id ?? parent?.project_id ?? this.inbox.id,
      section_id: body.section_id ?? null,
      parent_id: body.parent_id ?? null,
      labels: body.labels ?? [],
      priority: body.priority ?? 1,
      due: resolveDue(body.due_string ?? body.due_date),
      deadline: body.deadline_date ? { date: body.deadline_date, lang: 'en' } : null,
      duration: body.duration ? { amount: body.duration, unit: body.duration_unit ?? 'minute' } : null,
    })
  }

  updateTask(task, body) {
    if (body.content !== undefined) task.content = body.content
    if (body.description !== undefined) task.description = body.description
    if (body.priority !== undefined) task.priority = body.priority
    if (body.labels !== undefined) task.labels = body.labels
    if ('due_string' in body) task.due = resolveDue(body.due_string)
    if ('due_date' in body && body.due_date === null) task.due = null
    if ('deadline_date' in body) task.deadline = body.deadline_date ? { date: body.deadline_date, lang: 'en' } : null
    if (body.duration !== undefined) task.duration = body.duration ? { amount: body.duration, unit: body.duration_unit ?? 'minute' } : null
    return task
  }

  /**
   * Server-side quick-add parse, following the OpenAPI spec's description of
   * /api/v1/tasks/quick (the parts our UI relies on):
   * - " // description text" must be at the end; everything after it is the
   *   description and is NOT parsed (a date there stays text).
   * - "If parsing fails for any element, the task is still created (with
   *   unparsed text remaining in the content)": a #project that matches no
   *   project stays in the title and the task lands in the Inbox.
   * Dates: only today/tomorrow (all the suites type). An earlier version
   * stripped any "#word" and parsed dates anywhere, which hid two real UI
   * bugs (review of PR #2).
   */
  quickAdd(text) {
    const raw = String(text ?? '')
    const marker = /(?:^|\s)\/\/(?=\s|$)/.exec(raw)
    let content = marker ? raw.slice(0, marker.index) : raw
    const description = marker ? raw.slice(marker.index + marker[0].length).trim() : ''
    const take = re => {
      const match = content.match(re)
      if (match) content = content.replace(match[0], ' ')
      return match
    }
    const priority = take(/(?:^|\s)p([1-4])(?=\s|$)/)
    const projectToken = content.match(/(?:^|\s)#(\S+)/)
    const target = projectToken ? this.projects.find(p => p.name.toLowerCase() === projectToken[1].toLowerCase()) : null
    if (target) content = content.replace(projectToken[0], ' ')
    const labels = []
    for (let label = take(/(?:^|\s)@(\S+)/); label; label = take(/(?:^|\s)@(\S+)/)) labels.push(label[1])
    const due = take(/(?:^|\s)(today|tomorrow)(?=\s|$)/i)
    return this.addTask({
      content: content.replace(/\s+/g, ' ').trim(),
      description,
      priority: priority ? 5 - Number(priority[1]) : 1,
      project_id: target?.id ?? this.inbox.id,
      labels,
      due: due ? resolveDue(due[1]) : null,
    })
  }
}

export { TOKEN }
