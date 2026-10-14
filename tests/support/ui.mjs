import { join } from 'node:path'

import { chromium } from 'playwright'
import { createServer } from 'vite'

import { activate, dispose } from './host.mjs'

// Drives the REAL view modules in Chromium (dev/harness.html) against the real
// runtime → service → td → fake Todoist. Each `open()` is one view instance
// with its own runtime, like a pane in Agent Code.

export async function startUi() {
  const server = await createServer({
    configFile: join(__PROJECT_ROOT__, 'vite.dev.config.ts'),
    logLevel: 'error',
    server: { port: 5300 + Math.floor(Math.random() * 500), strictPort: false },
  })
  await server.listen()
  const base = server.resolvedUrls.local[0]
  const browser = await chromium.launch()

  async function open({ view = 'main', storage = {}, sessions = [], width = 1180 } = {}) {
    const viewId = view === 'modal' ? 'todoist.quickAdd' : 'todoist.main'
    const page = await browser.newPage({ viewport: { width, height: 820 } })
    const errors = []
    page.on('pageerror', error => errors.push(error.message))
    const events = { hostEscapes: 0, closes: 0 }
    let ready = false
    const rt = await activate({
      storage,
      onPublish: async (id, state) => {
        if (id === viewId && ready) await page.evaluate(s => window.__publish?.(s), state).catch(() => {})
      },
    })
    await page.exposeFunction('__request', (name, input) => rt.request(name, input))
    await page.exposeFunction('__state', () => rt.last(viewId) ?? null)
    await page.exposeFunction('__storageGet', key => rt.storage.get(key) ?? null)
    await page.exposeFunction('__storageSet', (key, value) => { rt.storage.set(key, value) })
    await page.exposeFunction('__hostEscape', () => { events.hostEscapes++ })
    await page.exposeFunction('__uiClose', () => { events.closes++ })
    await page.exposeFunction('__sessions', () => sessions)
    await page.goto(`${base}harness.html?view=${view}`)
    ready = true
    await page.evaluate(s => window.__publish?.(s), rt.last(viewId) ?? null)
    return {
      page,
      rt,
      events,
      errors,
      async close() {
        await page.close()
        await dispose(rt)
      },
    }
  }

  return {
    open,
    async close() {
      await browser.close()
      await server.close()
    },
  }
}

/** Poll a Node-side condition (fake API state) the UI should bring about. */
export async function eventually(check, { timeout = 15_000, what = 'condition' } = {}) {
  const start = Date.now()
  for (;;) {
    let last
    try {
      const value = await check()
      if (value) return value
    } catch (error) {
      last = error
    }
    if (Date.now() - start > timeout) throw last ?? new Error(`timed out waiting for ${what}`)
    await new Promise(r => setTimeout(r, 100))
  }
}
