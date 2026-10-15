// Vendor the parts of Todoist's official OpenAPI spec the integration tests
// serve, so test payloads come from Doist's own schema + examples instead of
// shapes we invented.
//
//   node dev/vendor-openapi.mjs            # from https://developer.todoist.com/openapi.json
//   node dev/vendor-openapi.mjs spec.json  # from a saved copy
//
// The full spec is ~1.2 MB; we keep the response schemas of the endpoints td
// calls for our handlers plus everything they reference, and record the source
// hash so a re-vendor shows exactly when Doist changed the contract.
import { createHash } from 'node:crypto'
import { readFile, writeFile } from 'node:fs/promises'

const SOURCE = 'https://developer.todoist.com/openapi.json'
const ROOTS = [
  'PaginatedList_ItemSyncView_', 'ItemSyncView',
  'PaginatedList_AnyProjectSyncViewResponse_', 'AnyProjectSyncViewResponse',
  'PaginatedList_SectionSyncView_', 'SectionSyncView',
  'PaginatedList_LabelRestView_', 'LabelRestView',
  'PaginatedList_NoteSyncView_', 'NoteSyncView',
  'UserJSON', 'TasksCompletedDateResponse',
]

const text = process.argv[2] ? await readFile(process.argv[2], 'utf8') : await (await fetch(SOURCE)).text()
const spec = JSON.parse(text)
const keep = new Set()
const visit = name => {
  if (keep.has(name)) return
  const schema = spec.components.schemas[name]
  if (!schema) throw new Error(`missing schema ${name}`)
  keep.add(name)
  JSON.stringify(schema, (key, value) => {
    if (key === '$ref' && typeof value === 'string') visit(value.replace('#/components/schemas/', ''))
    return value
  })
}
ROOTS.forEach(visit)

const pruned = {
  _provenance: {
    source: SOURCE,
    sha256: createHash('sha256').update(text).digest('hex'),
    title: spec.info.title,
    version: spec.info.version,
    vendoredAt: new Date().toISOString().slice(0, 10),
    roots: ROOTS,
  },
  components: { schemas: Object.fromEntries([...keep].sort().map(name => [name, spec.components.schemas[name]])) },
}
await writeFile(new URL('../tests/fixtures/todoist-openapi-v1.pruned.json', import.meta.url), `${JSON.stringify(pruned, null, 1)}\n`)
console.log(`kept ${keep.size} schemas`)
