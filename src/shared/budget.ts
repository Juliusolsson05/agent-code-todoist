// Fitting replies through Agent Code's bounded JSON bridge.
//
// The host validates every runtime/view message: at most 4096 JSON values, depth
// 32, 128 Ki characters (docs/extensions/authoring.md §2; enforced in
// agent-code src/shared/types/extensionJson.ts). An over-budget message is
// REJECTED, so a large Today view would surface as a failed request rather than a
// short list. We therefore measure with the same notion of "value" (every
// primitive, array and object counts once) and chunk BEFORE sending.
//
// Headroom: the envelope around our payload (request id, wrapper object, the
// runtime's own re-wrapping when it forwards a service reply to a view) costs a
// handful of values and a few hundred characters. 3500 / 110 000 leaves a wide
// margin. Anything larger is chunked (below), never trimmed.

export const HOST_MAX_VALUES = 4096
export const HOST_MAX_CHARS = 128 * 1024
export const PAGE_MAX_VALUES = 3500
export const PAGE_MAX_CHARS = 110_000

/** Count JSON values the way the host does: one per primitive, array, object. */
export function countJsonValues(value: unknown): number {
  if (value === null || typeof value !== 'object') return 1
  let count = 1
  if (Array.isArray(value)) {
    for (const item of value) count += countJsonValues(item)
  } else {
    for (const item of Object.values(value as Record<string, unknown>)) {
      if (item !== undefined) count += countJsonValues(item)
    }
  }
  return count
}

// ---------------------------------------------------------------------------
// Chunked replies
//
// WHY chunking instead of trimming: an earlier version trimmed task pages to fit
// and dropped td's cursor when it cut, which made the cut tasks unreachable; and
// it never bounded `meta` (300 projects + 200 labels = 4.5k values) or a task's
// comments (50 x 4000 chars = 200k chars) at all. An over-budget reply is not a
// soft failure: the host terminates the SERVICE on an invalid result
// (serviceHost.ts), rejecting every other pending request with it, and the next
// load of the same account repeats the crash. Review of PR #2 found both.
//
// So nothing is dropped. A reply that would not fit is serialized once and
// handed out as numbered string parts: each part is ONE JSON value of at most
// CHUNK_CHARS characters, legal at every hop (service -> runtime -> view). The
// consumer reassembles with `collect`, asking for the remaining parts by id.
// Small replies (nearly all of them) pass through untouched, so the common path
// costs nothing and stays readable in logs and the golden transcript.

export const CHUNK_CHARS = 96_000

export type Chunked = { chunked: { id: string; parts: number }; part: string }

export function isChunked(value: unknown): value is Chunked {
  return !!value && typeof value === 'object' && !Array.isArray(value)
    && typeof (value as Chunked).part === 'string'
    && !!(value as Chunked).chunked && typeof (value as Chunked).chunked.id === 'string'
}

/** Does this value cross the bridge as-is? Same counting rules as the host,
 *  with headroom for the envelopes the runtime and host wrap around it. */
export function fitsBridge(value: unknown): boolean {
  return countJsonValues(value) <= PAGE_MAX_VALUES && JSON.stringify(value ?? null).length <= PAGE_MAX_CHARS
}

/** Split serialized JSON into parts, never between the two halves of a
 *  surrogate pair (a lone surrogate survives structured clone but would turn
 *  an emoji into two replacement characters if a hop ever re-encoded it). */
export function splitParts(json: string, size = CHUNK_CHARS): string[] {
  const parts: string[] = []
  let at = 0
  while (at < json.length) {
    let end = Math.min(json.length, at + size)
    const code = json.charCodeAt(end - 1)
    if (end < json.length && code >= 0xd800 && code <= 0xdbff) end--
    parts.push(json.slice(at, end))
    at = end
  }
  return parts.length ? parts : ['']
}

/** Reassemble a reply that may be chunked. `fetchPart` asks the producer for
 *  part `index` (1-based: part 0 travelled with the envelope). */
export async function collect<T>(value: unknown, fetchPart: (id: string, index: number) => Promise<unknown>): Promise<T> {
  if (!isChunked(value)) return value as T
  const parts = [value.part]
  for (let index = 1; index < value.chunked.parts; index++) {
    const next = await fetchPart(value.chunked.id, index)
    if (!next || typeof (next as { part?: unknown }).part !== 'string') throw new Error('BAD_OUTPUT: A large reply could not be reassembled.')
    parts.push((next as { part: string }).part)
  }
  return JSON.parse(parts.join('')) as T
}

/**
 * Make a value bridge-legal: drop `undefined`, turn Dates into ISO strings.
 *
 * WHY: the host's validator (agent-code src/shared/types/extensionJson.ts
 * `isExtensionJson`) walks the structured-clone, where an `undefined` property
 * SURVIVES the clone and is then rejected as "not JSON" — the whole reply fails
 * with "Invalid arguments". An optional field left as `undefined` anywhere in a
 * nested row is enough. Round-tripping through JSON at every boundary we own is
 * the cheap, total fix (anything large is chunked anyway, see above).
 */
export function toJson<T>(value: T): T {
  return value === undefined ? (null as T) : (JSON.parse(JSON.stringify(value)) as T)
}

/** Long descriptions are the one field that can make a single task huge (people
 *  paste logs into Todoist). Lists only need a preview; the detail drawer
 *  fetches the task on its own and gets a larger slice. */
export const LIST_DESCRIPTION_CHARS = 280
export const DETAIL_DESCRIPTION_CHARS = 16_000
export const COMMENT_CHARS = 4_000
