import assert from 'node:assert/strict'
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, test } from 'node:test'

import { accountUser, status } from '../server/handlers.ts'

// Own file = own service module state (node --test runs each file in its own
// process). Two td installs signed into different accounts: A answers
// `auth status` slowly, B at once. Review of PR #2 reproduced A's late answer
// overwriting the cached user after the user had switched to B, so the sidebar
// showed B's projects under A's name.

const dir = await mkdtemp(join(tmpdir(), 'td-race-'))
after(() => rm(dir, { recursive: true, force: true }))

async function account(name, delayMs, marker = null) {
  const path = join(dir, name, 'td')
  await (await import('node:fs/promises')).mkdir(join(dir, name), { recursive: true })
  await writeFile(path, `#!${process.execPath}
const args = process.argv.slice(2)
const out = value => process.stdout.write(JSON.stringify(value))
if (args.includes('--version')) process.stdout.write('5.4.10\\n')
else if (args.includes('auth')) ${marker ? `require('node:fs').writeFileSync(${JSON.stringify(marker)}, 'x'), ` : ''}setTimeout(() => out({ id: ${JSON.stringify(name)}, email: '${name}@example.com', fullName: '${name}' }), ${delayMs})
else out({ results: [], nextCursor: null })
`)
  await chmod(path, 0o755)
  return path
}

test('a late status answer from the previous td does not replace the new account’s user', async () => {
  const marker = join(dir, 'a-auth-started')
  const a = await account('A', 1500, marker)
  const b = await account('B', 0)
  const slow = status({ tdPath: a })
  // Switch only once A's `auth status` is really in flight (the review's
  // sequence); switching earlier just re-routes A's call to td B.
  const { existsSync } = await import('node:fs')
  for (let i = 0; i < 100 && !existsSync(marker); i++) await new Promise(r => setTimeout(r, 25))
  assert.ok(existsSync(marker), 'premise: A is answering auth status')
  const fresh = await status({ tdPath: b })
  assert.equal(fresh.user.id, 'B')
  await slow
  assert.equal(accountUser()?.id, 'B', 'the service keeps the account td B is signed into')
})
