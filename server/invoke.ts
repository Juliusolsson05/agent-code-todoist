import { randomUUID } from 'node:crypto'

import { fitsBridge, splitParts, toJson, type Chunked } from '../src/shared/budget'
import { handlers, withinBudget, type HandlerName } from './handlers'
import { TdError } from './run'

// The one door every service request goes through (server/service.ts registers
// `invoke` for each name). Two host limits are enforced HERE, once, instead of
// in each handler:
//
// - Time: the whole handler runs inside `withinBudget`, so all its td calls
//   share one 25 s deadline (see handlers.ts INVOKE_BUDGET_MS).
// - Size: a reply that would not pass the host's JSON validator is chunked
//   (see src/shared/budget.ts "Chunked replies"); the rest of it waits here
//   until the caller collects it with `chunk`.
//
// Tests drive this function, not the bare handlers, whenever they assert what
// crosses the bridge — it is what the host actually calls.

type Stash = { parts: string[]; timer: ReturnType<typeof setTimeout> }

const stash = new Map<string, Stash>()

/** A consumer reassembles a reply within milliseconds; a minute is generous
 *  and bounds memory if a view closes mid-collect. */
const STASH_TTL_MS = 60_000
/** Several views can be collecting at once (panel + modal + reminders). Old
 *  entries are evicted first; a stale collect then fails cleanly. */
const STASH_MAX = 16

function remember(parts: string[]): string {
  const id = randomUUID()
  while (stash.size >= STASH_MAX) {
    const [oldest] = stash.keys()
    clearTimeout(stash.get(oldest)!.timer)
    stash.delete(oldest)
  }
  const timer = setTimeout(() => stash.delete(id), STASH_TTL_MS)
  timer.unref?.()
  stash.set(id, { parts, timer })
  return id
}

export function chunk(params: unknown): { part: string } {
  const p = (params ?? {}) as { id?: unknown; index?: unknown }
  const entry = typeof p.id === 'string' ? stash.get(p.id) : undefined
  if (!entry || typeof p.index !== 'number' || !Number.isInteger(p.index) || p.index < 1 || p.index >= entry.parts.length) {
    // The service restarted (stash gone) or the id expired. The caller simply
    // asks again for the whole thing.
    throw new TdError('BAD_OUTPUT', 'Part of a large reply has expired; reload to try again.')
  }
  const part = entry.parts[p.index]
  if (p.index === entry.parts.length - 1) {
    clearTimeout(entry.timer)
    stash.delete(p.id as string)
  }
  return { part }
}

/** Make any reply bridge-legal: small ones pass through, large ones become a
 *  Chunked envelope carrying their first part. */
export function encodeReply(value: unknown): unknown {
  const json = toJson(value)
  if (fitsBridge(json)) return json
  const parts = splitParts(JSON.stringify(json))
  const envelope: Chunked = { chunked: { id: remember(parts), parts: parts.length }, part: parts[0] }
  return envelope
}

export async function invoke(name: string, params: unknown): Promise<unknown> {
  if (name === 'chunk') return chunk(params)
  const handler = (handlers as Record<string, (p: unknown) => Promise<unknown>>)[name]
  if (!handler) throw new TdError('INVALID', `Unknown request ${name}.`)
  return encodeReply(await withinBudget(() => handler(params)))
}

export const invokeNames: Array<HandlerName | 'chunk'> = [...(Object.keys(handlers) as HandlerName[]), 'chunk']
