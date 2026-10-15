// Bundle the TS sources each test imports and run Node's test runner — the
// Skitgubbe pattern. esbuild (already used by Vite) strips types; no ts-node,
// no fake DOM, and the shipped dist/ stays untouched. npm packages stay
// external so tests load the real @doist/todoist-sdk from node_modules.
import { execFileSync, spawnSync } from 'node:child_process'
import { mkdirSync, mkdtempSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { mkdtemp, readdir, rm } from 'node:fs/promises'
import { join } from 'node:path'

import { build } from 'esbuild'

// Bundles live under node_modules so bare imports (@doist/todoist-sdk,
// agent-code-extension-api) resolve from the project's node_modules.
mkdirSync(new URL('../node_modules/.cache/', import.meta.url), { recursive: true })
const dir = process.argv[2] ?? 'tests'
const files = (await readdir(new URL(`../${dir}/`, import.meta.url))).filter(f => f.endsWith('.test.mjs'))
const out = await mkdtemp(join(new URL('../node_modules/.cache/', import.meta.url).pathname, 'todoist-tests-'))
try {
  await build({
    entryPoints: files.map(f => `${dir}/${f}`),
    outdir: out,
    outExtension: { '.js': '.mjs' },
    bundle: true,
    packages: 'external',
    platform: 'node',
    format: 'esm',
    target: 'node22',
    logLevel: 'warning',
    // Bundling moves every module into one temp file, so module-relative
    // paths are meaningless there. Tests and helpers resolve files from the
    // project root instead, injected as a constant.
    define: { __PROJECT_ROOT__: JSON.stringify(new URL('..', import.meta.url).pathname) },
  })
  // Integration files each drive many real td processes (~0.4 s of Node
  // start-up apiece) and assert our 20 s per-call deadline. Running them in
  // parallel on a busy machine pushed td past that deadline and produced
  // load-dependent failures, so they run one file at a time.
  const concurrency = dir === 'integration' || dir === 'uitests' ? ['--test-concurrency=1'] : []
  // TEST_NAME_PATTERN=… runs only matching tests (e.g. one UI case while
  // mutation-checking it); the suites are too slow to rerun whole each time.
  const only = process.env.TEST_NAME_PATTERN ? [`--test-name-pattern=${process.env.TEST_NAME_PATTERN}`] : []
  // The service now talks to Todoist IN-PROCESS (the SDK), not only through
  // td child processes. Node reads NODE_EXTRA_CA_CERTS once, at start-up, so
  // the interception CA must exist BEFORE the test process starts; the
  // interceptor (tests/support/interceptor.mjs) signs its leaf with it.
  const caDir = mkdtempSync(join(tmpdir(), 'todoist-test-ca-'))
  execFileSync('openssl', ['req', '-x509', '-newkey', 'rsa:2048', '-nodes', '-keyout', 'ca.key', '-out', 'ca.pem', '-days', '2', '-subj', '/CN=agent-code-todoist test CA'], { cwd: caDir, stdio: 'pipe' })
  const env = { ...process.env, TODOIST_TEST_CA_DIR: caDir, NODE_EXTRA_CA_CERTS: join(caDir, 'ca.pem') }
  const result = spawnSync(process.execPath, ['--test', ...concurrency, ...only, ...files.map(f => join(out, f))], { stdio: 'inherit', env })
  await rm(caDir, { recursive: true, force: true })
  process.exitCode = result.status ?? 1
} finally {
  await rm(out, { recursive: true, force: true })
}
