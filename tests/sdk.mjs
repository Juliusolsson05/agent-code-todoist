// Signed-in td output, built from Doist's own sources instead of invented literals.
//
// Provenance: `td <cmd> --json --full` prints SDK entities that went through
// @doist/todoist-sdk's zod schemas and then JSON.stringify (Dates → ISO strings).
// The SDK ships its own canonical test entities (dist/esm/test-utils/
// test-defaults.js — not in its package `exports`, so it is imported by file
// path). Running those through the SDK's exported schemas and JSON.stringify
// reproduces td's stdout shape byte-for-byte for these entities, pinned to the
// SDK version td 5.4.10 depends on (15.3.1, see package.json).
//
// What this cannot give us: fields the real API returns that the SDK strips,
// and real-account variety. `npm run record` captures live output for that.
import { createRequire } from 'node:module'
import { dirname, join } from 'node:path'
import { pathToFileURL } from 'node:url'

import { CommentSchema, LabelSchema, ProjectSchema, SectionSchema, TaskSchema } from '@doist/todoist-sdk'

const require = createRequire(import.meta.url)
const sdkRoot = dirname(dirname(dirname(require.resolve('@doist/todoist-sdk'))))
const defaults = await import(pathToFileURL(join(sdkRoot, 'dist/esm/test-utils/test-defaults.js')).href)

/** What td prints for one entity under --json --full. */
export const asTdJson = (schema, entity) => JSON.parse(JSON.stringify(schema.parse(entity)))

export const sdk = {
  task: () => asTdJson(TaskSchema, defaults.DEFAULT_TASK),
  taskWithNulls: () => asTdJson(TaskSchema, defaults.TASK_WITH_OPTIONALS_AS_NULL),
  project: () => asTdJson(ProjectSchema, defaults.DEFAULT_PROJECT),
  section: () => asTdJson(SectionSchema, defaults.DEFAULT_SECTION),
  label: () => asTdJson(LabelSchema, defaults.DEFAULT_LABEL),
  // CommentSchema takes the RAW comment (itemId) and transforms it to taskId,
  // exactly as the SDK client does on the wire; DEFAULT_COMMENT is the
  // already-transformed form and fails the schema's itemId/projectId check.
  comment: () => asTdJson(CommentSchema, defaults.DEFAULT_RAW_COMMENT),
  defaults,
}
