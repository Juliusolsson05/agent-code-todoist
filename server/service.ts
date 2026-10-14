import { defineService, runService, type JsonValue } from 'agent-code-extension-api'

import { invoke, invokeNames } from './invoke'
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
    // Every request goes through invoke(): one deadline per request and
    // chunking of replies too large for the host's JSON validator.
    for (const name of invokeNames) {
      context.onRequest(name, params => invoke(name, params) as Promise<JsonValue>)
    }
    context.ready()
  },
  stop() {
    // A sign-in waiting on its OAuth callback would otherwise keep port 8765
    // bound after Agent Code quits and make the next login fail.
    killJobs()
  },
}))
