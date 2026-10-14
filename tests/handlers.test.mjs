import assert from 'node:assert/strict'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, beforeEach, test } from 'node:test'

import { countJsonValues } from '../src/shared/budget.ts'
import { add, list, move, openUrl, quickAdd, status, update } from '../server/handlers.ts'
import { sdk } from './sdk.mjs'

// The RPC handlers are where UI intent becomes td argv. These tests point the
// service at a fake `td` (through the same `tdPath` setting a user would use)
// that logs every invocation and answers with SDK-shaped JSON, then assert on
// the exact command line td would have received.

const dir = await mkdtemp(join(tmpdir(), 'fake-td-handlers-'))
after(() => rm(dir, { recursive: true, force: true }))
const log = join(dir, 'calls.jsonl')
const td = join(dir, 'td')
const task = sdk.task()

await writeFile(td, `#!${process.execPath}
const fs = require('node:fs')
const args = process.argv.slice(2)
let stdin = ''
process.stdin.on('data', d => stdin += d).on('end', () => {
  fs.appendFileSync(${JSON.stringify(log)}, JSON.stringify({ args, stdin }) + '\\n')
  const has = (...words) => words.every(w => args.includes(w))
  if (args.includes('--version')) return process.stdout.write('5.4.10\\n')
  if (has('auth', 'status')) return process.stdout.write(JSON.stringify({ id: 'u1', email: 'a@b.c', fullName: 'A', authMode: 'read-write', authScope: 'data:read_write' }))
  if (has('today')) return process.stdout.write(JSON.stringify({ results: Array.from({ length: Number(process.env.FAKE_COUNT || 1) }, (_, i) => ({ ...${JSON.stringify(task)}, id: 't' + i })), nextCursor: 'next-1' }))
  if (has('task', 'move')) return process.stdout.write(JSON.stringify({ ok: true, command: 'move', messages: [] }))
  return process.stdout.write(JSON.stringify(${JSON.stringify(task)}))
})
`)
await chmod(td, 0o755)

const calls = async () => (await readFile(log, 'utf8').catch(() => '')).trim().split('\n').filter(Boolean).map(line => JSON.parse(line))
const lastArgs = async () => (await calls()).at(-1).args

beforeEach(async () => {
  await writeFile(log, '')
  await status({ tdPath: td })
})

test('status with a valid td reports ready with the signed-in user', async () => {
  const s = await status({ tdPath: td })
  assert.equal(s.state, 'ready')
  assert.equal(s.td.version, '5.4.10')
  assert.equal(s.user.email, 'a@b.c')
})

test('an explicit td path that does not exist is td-missing, not silently replaced', async () => {
  const s = await status({ tdPath: join(dir, 'nope') })
  assert.equal(s.state, 'td-missing')
  assert.deepEqual(s.searched, [join(dir, 'nope')])
})

test('add passes user text as --flag=value so a leading dash stays a value', async () => {
  await add({ content: '-v urgent; $(whoami)', description: 'line 1\nline 2', priority: 4, projectId: 'p1', sectionId: 's1', labels: ['work', 'needs,comma'], due: 'tomorrow 3pm' })
  const args = await lastArgs()
  assert.ok(args.includes('--content=-v urgent; $(whoami)'))
  assert.ok(args.includes('--description=line 1\nline 2'))
  assert.ok(args.includes('--priority=p1'), 'API priority 4 is td’s p1')
  assert.ok(args.includes('--project=id:p1'), 'projects are referenced by id, never by fuzzy name')
  assert.ok(args.includes('--section=id:s1'))
  assert.ok(args.includes('--labels=work,needs comma'), 'a comma inside a label name cannot split it into two labels')
  assert.ok(args.includes('--due=tomorrow 3pm'))
})

test('quick add sends the line on stdin, not argv', async () => {
  await quickAdd({ text: '-p1 deploy tomorrow #Ops' })
  const call = (await calls()).at(-1)
  assert.deepEqual(call.args, ['--no-spinner', 'task', 'quickadd', '--stdin', '--json'])
  assert.equal(call.stdin, '-p1 deploy tomorrow #Ops')
})

test('clearing a field uses td’s --no-* flag instead of an empty value', async () => {
  await update({ id: 'abc', due: '', deadline: '', labels: [] })
  const args = await lastArgs()
  assert.ok(args.includes('--no-due'))
  assert.ok(args.includes('--no-deadline'))
  assert.ok(args.includes('--no-labels'))
  assert.ok(args.includes('id:abc'))
})

test('ids are validated before they reach td', async () => {
  await assert.rejects(update({ id: '--yes', content: 'x' }), /INVALID/)
  await assert.rejects(move({ id: 'abc' }), /INVALID: Nowhere/)
})

test('a page too large for the bridge is trimmed and its cursor withheld', async () => {
  // td inherits the env captured when the service located it, so re-locate.
  process.env.FAKE_COUNT = '400'
  await status({ tdPath: td, refresh: true })
  try {
    const page = await list({ kind: 'today' })
    assert.equal(page.truncated, true)
    assert.equal(page.nextCursor, null, 'td’s cursor points after task 400, not after the last task we kept')
    assert.ok(countJsonValues(page) < 4096)
  } finally {
    delete process.env.FAKE_COUNT
  }
  await status({ tdPath: td, refresh: true })
  const small = await list({ kind: 'today' })
  assert.equal(small.truncated, false)
  assert.equal(small.nextCursor, 'next-1', 'an untrimmed page keeps td’s cursor for Load more')
})

test('openUrl refuses anything that is not a web URL', async () => {
  await assert.rejects(openUrl({ url: 'file:///etc/passwd' }), /INVALID/)
  await assert.rejects(openUrl({ url: 'vscode://anything' }), /INVALID/)
  await assert.rejects(openUrl({ url: 'not a url' }), /INVALID/)
})
