// Agent Code's bridge validator, reproduced for tests.
//
// Source of truth: agent-code src/shared/types/extensionJson.ts
// `isExtensionJson` (at d0c3df99): ≤ 4096 nodes, depth ≤ 32, ≤ 128 Ki
// characters of strings+keys, finite numbers only, plain objects only — and
// anything else, notably `undefined`, is rejected. Every runtime↔service and
// runtime↔view message in the integration suites passes through
// `crossBridge`, so a reply the host would refuse fails the test the same way
// it would fail in the app. If the host's rules change, change this copy.
export function isExtensionJson(value, maxCharacters = 128 * 1024) {
  const pending = [{ value, depth: 0 }]
  let nodes = 0
  let characters = 0
  while (pending.length) {
    const item = pending.pop()
    if (++nodes > 4096 || item.depth > 32) return false
    const current = item.value
    if (typeof current === 'string') characters += current.length
    else if (typeof current === 'number') { if (!Number.isFinite(current)) return false }
    else if (current !== null && typeof current !== 'boolean') {
      if (typeof current !== 'object') return false
      if (Array.isArray(current)) {
        if (current.length + nodes + pending.length > 4096) return false
        for (const child of current) pending.push({ value: child, depth: item.depth + 1 })
      } else {
        const prototype = Object.getPrototypeOf(current)
        if (prototype !== Object.prototype && prototype !== null) return false
        for (const key in current) {
          if (!Object.prototype.hasOwnProperty.call(current, key)) continue
          characters += key.length
          if (characters > maxCharacters || nodes + pending.length >= 4096) return false
          pending.push({ value: current[key], depth: item.depth + 1 })
        }
      }
    }
    if (characters > maxCharacters) return false
  }
  return true
}

/** Structured-clone like Electron IPC, then validate like the host. */
export function crossBridge(value, label) {
  if (value === undefined) return undefined
  const cloned = structuredClone(value)
  if (!isExtensionJson(cloned)) throw new Error(`Invalid arguments for ${label}: the host would reject this payload`)
  return cloned
}
