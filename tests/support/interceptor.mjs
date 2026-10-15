// Route the REAL td binary's HTTPS traffic for api.todoist.com to an in-process
// server, with no account and no network.
//
// How: td's SDK sends requests through undici's EnvHttpProxyAgent, which honours
// HTTPS_PROXY, and Node trusts extra roots from NODE_EXTRA_CA_CERTS. We mint a
// throwaway CA plus an api.todoist.com leaf with openssl, run an HTTP proxy that
// answers CONNECT itself, terminate TLS with the leaf, and hand the decrypted
// socket to the fake API's http.Server.
//
// Trap (found the hard way): undici reads the LOWERCASE proxy variables first.
// An inherited `https_proxy` (CI runners, sandboxes, corporate machines) beat
// our HTTPS_PROXY and sent test traffic to the real Todoist API. We therefore
// set every case and clear NO_PROXY. As a backstop, the fake token is not a
// valid Todoist token, and `connects` counts tunnels so a test can assert td
// really came through us.
import { execFileSync } from 'node:child_process'
import { copyFileSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import http from 'node:http'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import tls from 'node:tls'

export async function startInterceptor(apiServer) {
  const dir = mkdtempSync(join(tmpdir(), 'todoist-intercept-'))
  const openssl = (...args) => execFileSync('openssl', args, { cwd: dir, stdio: 'pipe' })
  // The runner's CA (dev/test.mjs) when present: this process already trusts
  // it through NODE_EXTRA_CA_CERTS, which the in-process SDK client needs.
  const shared = process.env.TODOIST_TEST_CA_DIR
  if (shared) {
    copyFileSync(join(shared, 'ca.key'), join(dir, 'ca.key'))
    copyFileSync(join(shared, 'ca.pem'), join(dir, 'ca.pem'))
  } else {
    openssl('req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '2', '-subj', '/CN=agent-code-todoist test CA')
  }
  openssl('req', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'leaf.key', '-out', 'leaf.csr', '-subj', '/CN=api.todoist.com')
  writeFileSync(join(dir, 'san.cnf'), 'subjectAltName=DNS:api.todoist.com,DNS:todoist.com,DNS:app.todoist.com\n')
  openssl('x509', '-req', '-in', 'leaf.csr', '-CA', 'ca.pem', '-CAkey', 'ca.key', '-CAcreateserial', '-out', 'leaf.pem', '-days', '2', '-extfile', 'san.cnf')
  const secureContext = tls.createSecureContext({ key: readFileSync(join(dir, 'leaf.key')), cert: readFileSync(join(dir, 'leaf.pem')) })

  const state = { connects: [] }
  const proxy = http.createServer((_req, res) => { res.statusCode = 405; res.end('CONNECT only') })
  proxy.on('connect', (req, socket) => {
    state.connects.push(req.url)
    if (!/^(api\.)?todoist\.com:443$/.test(req.url)) {
      // Anything else td might reach (telemetry, update checks) is refused, so
      // a test can never silently talk to the internet.
      socket.end('HTTP/1.1 403 Forbidden\r\n\r\n')
      return
    }
    socket.write('HTTP/1.1 200 Connection Established\r\n\r\n')
    apiServer.emit('connection', new tls.TLSSocket(socket, { isServer: true, secureContext }))
  })
  await new Promise(resolve => proxy.listen(0, '127.0.0.1', resolve))
  const url = `http://127.0.0.1:${proxy.address().port}`
  const home = join(dir, 'home')
  return {
    state,
    env: {
      HTTPS_PROXY: url, https_proxy: url,
      HTTP_PROXY: url, http_proxy: url,
      NO_PROXY: '', no_proxy: '',
      NODE_EXTRA_CA_CERTS: join(dir, 'ca.pem'),
      // Isolate td from the developer's real config and stored accounts.
      HOME: home, XDG_CONFIG_HOME: join(home, '.config'),
    },
    async close() {
      await new Promise(resolve => proxy.close(resolve))
      proxy.closeAllConnections?.()
      rmSync(dir, { recursive: true, force: true })
    },
  }
}
