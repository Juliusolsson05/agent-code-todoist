import { defineService, runService, type JsonValue } from 'agent-code-extension-api'

import { handlers } from './handlers'
import { killJobs } from './jobs'

// Entry of the `todoist.td` service: a Node child Agent Code forks as an Electron
// utilityProcess once the runtime calls services.start('todoist.td').
//
// No loopback endpoint: everything goes through the host's request/result RPC
// (services.invoke). We need neither `service.transport` nor `net.listen`, and
// asking for fewer permissions makes the install consent dialog shorter and more
// honest. The one native power this service uses is spawning the user's own
// `td` (and `brew`/`open` during setup).
runService(defineService({
  start(context) {
    for (const [name, handler] of Object.entries(handlers)) {
      context.onRequest(name, params => (handler as (p: unknown) => Promise<unknown>)(params) as Promise<JsonValue>)
    }
    context.ready()
  },
  stop() {
    // A sign-in waiting on its OAuth callback would otherwise keep port 8765
    // bound after Agent Code quits and make the next login fail.
    killJobs()
  },
}))
