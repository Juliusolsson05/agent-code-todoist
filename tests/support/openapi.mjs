// Wire payloads from Todoist's official OpenAPI spec.
//
// Every property in Doist's spec carries `examples`; `exampleOf` assembles a full
// entity from them, so a fake-API response has exactly the fields, nesting and
// value styles the real API documents (snake_case, string ids, ISO dates).
// Scenarios then override only the fields a test is about. If Doist changes the
// contract, re-vendoring the spec (dev/vendor-openapi.mjs) changes these
// payloads and the real td binary in the integration tests re-validates them
// with the SDK's zod schemas.
import { readFileSync } from 'node:fs'
import { join } from 'node:path'

const spec = JSON.parse(readFileSync(join(__PROJECT_ROOT__, 'tests/fixtures/todoist-openapi-v1.pruned.json'), 'utf8'))
export const provenance = spec._provenance
const schemas = spec.components.schemas

const resolve = schema => (schema?.$ref ? schemas[schema.$ref.replace('#/components/schemas/', '')] : schema)

export function exampleOf(nameOrSchema, depth = 0) {
  const schema = resolve(typeof nameOrSchema === 'string' ? schemas[nameOrSchema] : nameOrSchema)
  if (!schema) throw new Error(`unknown schema ${nameOrSchema}`)
  if (depth > 12) return null
  if (schema.examples?.length) return structuredClone(schema.examples[0])
  if (schema.example !== undefined) return structuredClone(schema.example)
  const variants = schema.anyOf ?? schema.oneOf
  if (variants) {
    // Prefer the documented non-null shape: a nullable field still has a
    // concrete form, and that is what the code has to parse.
    const concrete = variants.map(resolve).find(v => v && v.type !== 'null') ?? variants[0]
    return exampleOf(concrete, depth + 1)
  }
  if (schema.allOf) return Object.assign({}, ...schema.allOf.map(part => exampleOf(part, depth + 1)))
  if (schema.const !== undefined) return schema.const
  if (schema.enum) return schema.enum[0]
  if (schema.default !== undefined) return structuredClone(schema.default)
  switch (schema.type) {
    case 'object': {
      const out = {}
      for (const [key, prop] of Object.entries(schema.properties ?? {})) out[key] = exampleOf(prop, depth + 1)
      return out
    }
    case 'array': return schema.items ? [exampleOf(schema.items, depth + 1)] : []
    case 'string': return schema.format === 'date-time' ? '2026-10-14T09:00:00.000000Z' : schema.format === 'date' ? '2026-10-14' : 'example'
    case 'integer': case 'number': return 0
    case 'boolean': return false
    case 'null': return null
    default: return null
  }
}

/** Property names a schema documents (for "the fake serves every documented field" checks). */
export function documentedFields(name) {
  return Object.keys(resolve(schemas[name]).properties ?? {})
}
