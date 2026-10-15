import { invoke } from '../../server/invoke.ts'
import { collect } from '../../src/shared/budget.ts'
import { crossBridge } from './bridge.mjs'

/**
 * Call the service the way a view does: through the service's real request
 * door (server/invoke.ts: deadline + chunking), across the host's JSON
 * validator on every hop, reassembled by the same `collect` the views use.
 * Records every message so tests can assert each one was legal on its own.
 */
export async function viaBridge(name, params, messages = []) {
  const reply = crossBridge(await invoke(name, crossBridge(params, name)), name)
  messages.push(reply)
  return collect(reply, async (id, index) => {
    const part = crossBridge(await invoke('chunk', { id, index }), 'chunk')
    messages.push(part)
    return part
  })
}
