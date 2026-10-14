// Record live `td` output from YOUR signed-in account into tests/fixtures/live/,
// redacted, so compaction can be checked against real-account variety (fields
// the SDK defaults never exercise: recurring dues, shared projects, workspace
// projects, attachments).
//
//   td auth login        # once
//   npm run record
//
// Redaction replaces every human-authored string (task titles, descriptions,
// comment text, project/section/label/filter names, emails, names, URLs) with
// same-length filler, keeping ids, dates, enums, numbers and booleans — the
// shape and lengths the code depends on, none of the content. Read the files
// before committing them anyway.
import { execFileSync } from 'node:child_process'
import { mkdirSync, writeFileSync } from 'node:fs'

const td = process.env.TD ?? 'td'
const out = new URL('../tests/fixtures/live/', import.meta.url)
mkdirSync(out, { recursive: true })

const PRIVATE = new Set(['content', 'description', 'name', 'email', 'fullName', 'url', 'webUrl', 'fileName', 'fileUrl', 'query', 'string', 'title'])
const filler = text => text.replace(/[^\s]/g, 'x')
const redact = (value, key) => {
  if (Array.isArray(value)) return value.map(item => redact(item, key === 'labels' ? 'name' : key))
  if (value && typeof value === 'object') return Object.fromEntries(Object.entries(value).map(([k, v]) => [k, redact(v, k)]))
  return typeof value === 'string' && PRIVATE.has(key) ? filler(value) : value
}

const commands = {
  today: ['today', '--json', '--full', '--limit=50'],
  upcoming: ['upcoming', '14', '--json', '--full', '--limit=50'],
  inbox: ['inbox', '--json', '--full', '--limit=50'],
  completed: ['completed', 'list', '--json', '--full', '--limit=30'],
  projects: ['project', 'list', '--all', '--json', '--full'],
  sections: ['section', 'list', '--all', '--json', '--full'],
  labels: ['label', 'list', '--all', '--json', '--full'],
  filters: ['filter', 'list', '--json', '--full'],
  status: ['auth', 'status', '--json'],
}

for (const [name, args] of Object.entries(commands)) {
  try {
    const raw = JSON.parse(execFileSync(td, ['--no-spinner', ...args], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 }))
    writeFileSync(new URL(`${name}.json`, out), `${JSON.stringify(redact(raw), null, 2)}\n`)
    console.log(`recorded ${name}`)
  } catch (error) {
    console.error(`skipped ${name}: ${String(error.stderr ?? error.message).trim().slice(0, 200)}`)
  }
}
