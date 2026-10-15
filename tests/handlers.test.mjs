import assert from 'node:assert/strict'
import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, beforeEach, test } from 'node:test'

import { move, openUrl, status, update } from '../server/handlers.ts'
import { sdk } from './sdk.mjs'

// The handlers' td-facing half: locating td and asking it who is signed in
// (setup), plus input validation that happens before anything reaches
// Todoist. Task reads and writes go through the SDK client now and are
// covered against the fake API in integration/ (exact request bodies there).
// These tests point the service at a fake `td` through the same `tdPath`
// setting a user would use.

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
  // Deadline scenarios: a read that fails slowly, or never answers.
  if (has('today') && process.env.FAKE_SLOW_FAIL_MS) return setTimeout(() => { process.stderr.write(JSON.stringify({ error: { code: 'API_ERROR', message: 'HTTP 503' } })); process.exit(1) }, Number(process.env.FAKE_SLOW_FAIL_MS))
  if (has('today') && process.env.FAKE_HANG) return setTimeout(() => {}, 60_000)
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

test('ids are validated before they reach Todoist', async () => {
  await assert.rejects(update({ id: '--yes', content: 'x' }), /INVALID/)
  await assert.rejects(move({ id: 'abc' }), /INVALID: Nowhere/)
})

test('openUrl refuses anything that is not a web URL', async () => {
  await assert.rejects(openUrl({ url: 'file:///etc/passwd' }), /INVALID/)
  await assert.rejects(openUrl({ url: 'vscode://anything' }), /INVALID/)
  await assert.rejects(openUrl({ url: 'not a url' }), /INVALID/)
})
