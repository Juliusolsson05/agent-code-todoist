// Bundle the TS sources each test imports and run Node's test runner — the
// Skitgubbe pattern. esbuild (already used by Vite) strips types; no ts-node,
// no fake DOM, and the shipped dist/ stays untouched. npm packages stay
// external so tests load the real @doist/todoist-sdk from node_modules.
import { spawnSync } from 'node:child_process'
import { mkdirSync } from 'node:fs'
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
    // Tests read fixtures relative to their SOURCE location.
    define: { 'import.meta.dirname': JSON.stringify(new URL(`../${dir}`, import.meta.url).pathname) },
  })
  const result = spawnSync(process.execPath, ['--test', ...files.map(f => join(out, f))], { stdio: 'inherit' })
  process.exitCode = result.status ?? 1
} finally {
  await rm(out, { recursive: true, force: true })
}
