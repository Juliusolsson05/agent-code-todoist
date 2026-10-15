// Screenshot the real view modules in the fake host, for UI review without
// launching Agent Code. Output: dev/shots/*.png (git-ignored).
//
//   npm run shots
import { mkdir } from 'node:fs/promises'
import { chromium } from 'playwright'
import { createServer } from 'vite'

// Any free port: 5199 is often held by a running `npm run preview`.
const server = await createServer({ configFile: new URL('../vite.dev.config.ts', import.meta.url).pathname, logLevel: 'error', server: { port: 5400 + Math.floor(Math.random() * 400), strictPort: false } })
await server.listen()
const base = server.resolvedUrls.local[0]
await mkdir(new URL('./shots/', import.meta.url), { recursive: true })
const out = name => new URL(`./shots/${name}.png`, import.meta.url).pathname

const browser = await chromium.launch()
const errors = []
async function shot(name, query, size, act) {
  const page = await browser.newPage({ viewport: size, deviceScaleFactor: 2 })
  page.on('pageerror', e => errors.push(`${name}: ${e.message}`))
  page.on('console', m => { if (m.type() === 'error') errors.push(`${name}: ${m.text()}`) })
  await page.goto(`${base}?${query}`)
  await page.waitForTimeout(900)
  if (act) await act(page)
  await page.screenshot({ path: out(name) })
  await page.close()
}

const wide = { width: 1180, height: 760 }
const pane = { width: 760, height: 720 }
const narrow = { width: 420, height: 760 }

await shot('today-nord-wide', 'theme=nord', wide)
await shot('today-light-wide', 'theme=light', wide)
await shot('drawer-nord', 'theme=nord', wide, async p => { await p.getByText('Review PR #1484', { exact: false }).first().click(); await p.waitForTimeout(700) })
await shot('drawer-light', 'theme=light', wide, async p => { await p.getByText('Review PR #1484', { exact: false }).first().click(); await p.waitForTimeout(700) })
await shot('project-nord', 'theme=nord', wide, async p => { await p.getByRole('button', { name: 'Agent Code' }).first().click(); await p.waitForTimeout(700) })
await shot('upcoming-nord', 'theme=nord', pane, async p => { await p.getByRole('button', { name: 'Upcoming' }).click(); await p.waitForTimeout(700) })
await shot('narrow-nord', 'theme=nord', narrow)
await shot('narrow-drawer-nord', 'theme=nord', narrow, async p => { await p.getByText('Write the Todoist', { exact: false }).first().click(); await p.waitForTimeout(700) })
await shot('quickadd-typing-nord', 'theme=nord', pane, async p => { await p.getByLabel('Quick add task').fill('Review PR tomorrow 3pm p1 #Work @review'); await p.waitForTimeout(200) })
await shot('due-picker-nord', 'theme=nord', wide, async p => { await p.locator('.td-task').nth(2).hover(); await p.locator('.td-task').nth(2).getByTitle('Schedule (t = today)').click(); await p.waitForTimeout(300) })
await shot('modal-nord', 'view=modal&theme=nord', { width: 760, height: 460 }, async p => { await p.locator('textarea').fill('Follow up on agent output tomorrow p2 @review'); await p.getByText('Hermes chat pane fixes').click(); await p.waitForTimeout(200) })
await shot('modal-light', 'view=modal&theme=light', { width: 760, height: 460 })
await shot('setup-missing-nord', 'state=td-missing&theme=nord', pane)
await shot('setup-signedout-light', 'state=signed-out&theme=light', pane)
await shot('setup-login-nord', 'state=login&theme=nord', pane)
await shot('help-nord', 'theme=nord', wide, async p => { await p.keyboard.press('?'); await p.waitForTimeout(200) })
// "Use Agent Code's colours" on: the host's Nord theme instead of Todoist's look.
await shot('inherit-nord-wide', 'theme=nord&inherit=1', wide)
await shot('inherit-setup-nord', 'state=signed-out&theme=nord&inherit=1', pane)

await browser.close()
await server.close()
if (errors.length) {
  console.error(errors.join('\n'))
  process.exit(1)
}
console.log('screenshots in dev/shots/')
