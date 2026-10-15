import assert from 'node:assert/strict'
import { EventEmitter } from 'node:events'
import { access, readdir, readFile, stat } from 'node:fs/promises'
import { join } from 'node:path'
import { test } from 'node:test'
import { pathToFileURL } from 'node:url'

// The install-time contract with Agent Code, checked against the BUILT bundle
// (run via `npm run test:extension`, which builds first).
//
// Each assertion is a way this extension can install cleanly and then do
// nothing: a command without its view, a view without an activation event, a
// manifest entry pointing at a file that was never committed, or a service that
// never speaks the host's ready/request/shutdown protocol.

const root = __PROJECT_ROOT__
const manifest = JSON.parse(await readFile(join(root, 'agent-code.extension.json'), 'utf8'))

test('manifest ids are namespaced and every view is reachable', () => {
  assert.equal(manifest.apiVersion, 2)
  const ns = `${manifest.id}.`
  const contributed = [
    ...manifest.contributes.commands, ...manifest.contributes.views, ...manifest.contributes.settings, ...manifest.contributes.services,
  ]
  for (const item of contributed) assert.ok(item.id.startsWith(ns), `${item.id} must start with ${ns}`)
  for (const view of manifest.contributes.views) {
    // The host opens a view from a command with the SAME id, and only starts
    // the runtime for it when onView:<id> is declared.
    assert.ok(manifest.contributes.commands.some(c => c.id === view.id), `no command opens ${view.id}`)
    assert.ok(manifest.activationEvents.includes(`onView:${view.id}`), `${view.id} lacks onView activation`)
  }
  for (const binding of manifest.contributes.keybindings) {
    assert.ok(manifest.contributes.commands.some(c => c.id === binding.command), `keybinding for undeclared ${binding.command}`)
  }
})

test('the permission list is exactly what the code uses', () => {
  // Every extra permission lengthens the consent dialog; a missing one makes
  // the broker reject the call at runtime.
  assert.deepEqual([...manifest.permissions].sort(), ['notifications.show', 'panes.observe', 'service.run', 'sessions.observe', 'workspace.observe'])
  assert.equal(manifest.networkOrigins, undefined, 'all network goes through td in the service; the frames need none')
})

test('every manifest entry exists in the committed build and exports its contract', async () => {
  const runtime = await import(pathToFileURL(join(root, manifest.entry)).href)
  assert.equal(typeof runtime.default.activate, 'function')
  for (const view of manifest.contributes.views) {
    await access(join(root, view.entry))
    // View modules touch `document` only inside mount(), so importing them
    // under Node proves the module evaluates and exports mount.
    const module = await import(pathToFileURL(join(root, view.entry)).href)
    assert.equal(typeof module.default.mount, 'function', `${view.entry} must export mount`)
  }
  for (const file of await readdir(join(root, 'dist'))) {
    const text = await readFile(join(root, 'dist', file), 'utf8')
    assert.ok(!text.includes('jsxDEV'), `${file} contains the dev JSX runtime (build with NODE_ENV=production)`)
    assert.ok((await stat(join(root, 'dist', file))).size < 16 * 1024 * 1024)
  }
})

test('the built service speaks the SDK protocol and reports a missing td', async () => {
  const port = new EventEmitter()
  const messages = []
  port.postMessage = message => { messages.push(message); port.emit('outgoing', message) }
  const wait = predicate => new Promise((resolve, reject) => {
    const prior = messages.find(predicate)
    if (prior) return resolve(prior)
    const timer = setTimeout(() => reject(new Error('service did not answer')), 15_000)
    port.on('outgoing', message => { if (predicate(message)) { clearTimeout(timer); resolve(message) } })
  })
  process.parentPort = port
  try {
    await import(pathToFileURL(join(root, manifest.contributes.services[0].entry)).href)
    await wait(m => m.kind === 'ready')
    // An explicit path that does not exist must be reported, not replaced by
    // whatever td happens to be on this machine's PATH.
    port.emit('message', { data: { kind: 'request', id: 's1', name: 'status', params: { tdPath: '/nonexistent/td' } } })
    const status = await wait(m => m.kind === 'result' && m.id === 's1')
    assert.equal(status.ok, true)
    assert.equal(status.value.state, 'td-missing')
    port.emit('message', { data: { kind: 'request', id: 'bad', name: 'update', params: { id: 'x' } } })
    const rejected = await wait(m => m.kind === 'result' && m.id === 'bad')
    assert.equal(rejected.ok, false)
    assert.match(rejected.error, /^(INVALID|TD_NOT_FOUND):/)
  } finally {
    port.emit('message', { data: { kind: 'shutdown', id: 'stop' } })
    await wait(m => m.kind === 'stopped' && m.id === 'stop')
    delete process.parentPort
  }
})
