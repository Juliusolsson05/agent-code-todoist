import assert from 'node:assert/strict'
import { chmod, mkdir, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { envFor } from '../server/locate.ts'
import { runTd } from '../server/run.ts'
import { tdErrorCode, tdErrorMessage } from '../src/shared/types.ts'

// runTd is the only door to td. These tests drive it against small fake `td`
// executables so the real process boundary (argv, stdout/stderr, exit codes,
// signals) is exercised, not a mock of child_process.

const dir = await mkdtemp(join(tmpdir(), 'fake-td-'))
after(() => rm(dir, { recursive: true, force: true }))

const recordedSignedOut = await readFile(join(__PROJECT_ROOT__, 'tests/fixtures/td-5.4.10-signed-out-today.stderr'), 'utf8')

async function fakeTd(name, body) {
  const path = join(dir, name)
  await writeFile(path, `#!${process.execPath}\n${body}\n`)
  await chmod(path, 0o755)
  return path
}

const env = { ...process.env }

test('td’s recorded signed-out envelope becomes NO_TOKEN with its own message', async () => {
  const td = await fakeTd('signed-out', `process.stderr.write(${JSON.stringify(recordedSignedOut)}); process.exit(1)`)
  await assert.rejects(runTd(td, ['today', '--json'], { env }), error => {
    assert.equal(tdErrorCode(error), 'NO_TOKEN')
    assert.match(tdErrorMessage(error), /No API token found/)
    return true
  })
})

test('a successful call returns td’s parsed JSON', async () => {
  const td = await fakeTd('ok', `process.stdout.write(JSON.stringify({ results: [{ id: 'a' }], nextCursor: null }))`)
  assert.deepEqual(await runTd(td, ['today', '--json'], { env }), { results: [{ id: 'a' }], nextCursor: null })
})

test('user text reaches td as single argv elements, never through a shell', async () => {
  // Task titles are arbitrary user text. If anything here went through a
  // shell, `$(…)`, `;` and quotes would execute or split.
  const td = await fakeTd('echo-argv', `process.stdout.write(JSON.stringify(process.argv.slice(2)))`)
  const hostile = `--content=-v; rm -rf ~ $(whoami) "quoted" 'single' \`tick\``
  const argv = await runTd(td, ['task', 'add', hostile, '--json'], { env })
  assert.deepEqual(argv, ['--no-spinner', 'task', 'add', hostile, '--json'])
})

test('stdin carries quick-add text so it is never parsed as a flag', async () => {
  const td = await fakeTd('echo-stdin', `let s='';process.stdin.on('data',d=>s+=d).on('end',()=>process.stdout.write(JSON.stringify({stdin:s})))`)
  assert.deepEqual(await runTd(td, ['task', 'quickadd', '--stdin', '--json'], { env, stdin: '-p1 starts with a dash' }), { stdin: '-p1 starts with a dash' })
})

test('a hung td is killed at our deadline and reported as TIMEOUT, before the host’s 30 s kill', async () => {
  const td = await fakeTd('hang', `setInterval(() => {}, 1000)`)
  const started = Date.now()
  await assert.rejects(runTd(td, ['today', '--json'], { env, timeoutMs: 300 }), error => tdErrorCode(error) === 'TIMEOUT')
  assert.ok(Date.now() - started < 3000)
})

test('a missing binary is TD_NOT_FOUND, not a generic failure', async () => {
  await assert.rejects(runTd(join(dir, 'does-not-exist'), ['--version'], { env, expectJson: false }), error => tdErrorCode(error) === 'TD_NOT_FOUND')
})

test('td found but Node missing (Finder-launched app) is reported as a setup problem', async () => {
  const td = await fakeTd('no-node', `process.stderr.write('env: node: No such file or directory\\n'); process.exit(127)`)
  await assert.rejects(runTd(td, ['today', '--json'], { env }), error => {
    assert.equal(tdErrorCode(error), 'TD_NOT_FOUND')
    assert.match(tdErrorMessage(error), /Node\.js/)
    return true
  })
})

test('non-JSON stdout is BAD_OUTPUT instead of a crash in the caller', async () => {
  const td = await fakeTd('prose', `process.stdout.write('Signed in as you')`)
  await assert.rejects(runTd(td, ['today', '--json'], { env }), error => tdErrorCode(error) === 'BAD_OUTPUT')
})

test('td runs with its own directory first on PATH, so its `env node` shebang finds the Node it was installed with', async () => {
  // npm/nvm/volta install td as `#!/usr/bin/env node` next to that Node. An
  // app launched from Finder has a minimal PATH without it; envFor puts td's
  // directory first. The fixture's interpreter exists ONLY in td's directory.
  const bin = join(dir, 'version-manager-bin')
  await mkdir(bin, { recursive: true })
  const interpreter = join(bin, 'td-fixture-node')
  await writeFile(interpreter, '#!/bin/sh\necho \'{"results":[],"nextCursor":null}\'\n')
  await chmod(interpreter, 0o755)
  const td = join(bin, 'td')
  await writeFile(td, '#!/usr/bin/env td-fixture-node\n')
  await chmod(td, 0o755)
  const finderEnv = { ...process.env, PATH: '/usr/bin:/bin' }
  await assert.rejects(runTd(td, ['today', '--json'], { env: finderEnv }), 'premise: without td’s directory the interpreter is not found')
  const saved = process.env.PATH
  process.env.PATH = '/usr/bin:/bin'
  try {
    assert.deepEqual(await runTd(td, ['today', '--json'], { env: envFor(td, null) }), { results: [], nextCursor: null })
  } finally {
    process.env.PATH = saved
  }
})
