// One integration "world": fake Todoist API + TLS interceptor + the real td
// binary from node_modules, wired into the service handlers through the same
// `tdPath` setting a user would set.
import { join } from 'node:path'

import * as handlers from '../../server/handlers.ts'
import { FakeTodoist, TOKEN } from './fakeTodoist.mjs'
import { startInterceptor } from './interceptor.mjs'

export const REAL_TD = join(__PROJECT_ROOT__, 'node_modules/.bin/td')

export async function startWorld() {
  const fake = new FakeTodoist()
  const server = fake.createServer()
  const interceptor = await startInterceptor(server)
  // The service builds td's env from process.env when it locates td, so the
  // proxy/CA/token must be in place before status() runs.
  const saved = Object.fromEntries(Object.keys({ ...interceptor.env, TODOIST_API_TOKEN: '' }).map(k => [k, process.env[k]]))
  Object.assign(process.env, interceptor.env, { TODOIST_API_TOKEN: TOKEN })
  const setup = await handlers.status({ tdPath: REAL_TD, refresh: true })
  return {
    fake,
    handlers,
    setup,
    interceptor,
    async relocate() { return handlers.status({ tdPath: REAL_TD, refresh: true }) },
    async close() {
      await interceptor.close()
      server.closeAllConnections?.()
      for (const [key, value] of Object.entries(saved)) {
        if (value === undefined) delete process.env[key]
        else process.env[key] = value
      }
    },
  }
}
