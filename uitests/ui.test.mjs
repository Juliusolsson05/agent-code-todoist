import assert from 'node:assert/strict'
import { chmod, mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { after, before, test } from 'node:test'

import { dayFromToday } from '../tests/support/fakeTodoist.mjs'
import { seed } from '../tests/support/scenario.mjs'
import { eventually, startUi } from '../tests/support/ui.mjs'
import { startWorld } from '../tests/support/world.mjs'

// The views, in Chromium, against the real runtime → service → td 5.4.10 →
// fake Todoist. One test per UI defect from the review of PR #2: each drives
// the user's keys and clicks and asserts what Todoist received or what the
// host was told — none of these was covered before (no test imported src/ui).

let world
let ui
let s
before(async () => {
  world = await startWorld()
  s = seed(world.fake)
  ui = await startUi()
})
after(async () => {
  await ui?.close()
  await world?.close()
})

const task = id => world.fake.tasks.find(t => t.id === id)
const row = (page, text) => page.locator('.td-list [role="listitem"]', { hasText: text }).first()
const drawer = page => page.locator('aside[aria-label="Task details"]')
const recurringToday = content => world.fake.addTask({ content, due: { date: dayFromToday(0), datetime: null, is_recurring: true, lang: 'en', string: 'every day', timezone: null } })

async function withView(options, fn) {
  const view = await ui.open(options)
  try {
    await fn(view)
    assert.deepEqual(view.errors, [], 'no uncaught errors in the view')
  } finally {
    await view.close()
  }
}

test('Esc closes the innermost panel, never the whole pane; with nothing open it reaches the host', async () => {
  await withView({}, async ({ page, events }) => {
    await row(page, 'Overdue invoice').click()
    await drawer(page).waitFor()
    await page.keyboard.press('Escape')
    await drawer(page).waitFor({ state: 'detached' })
    assert.equal(events.hostEscapes, 0, 'the drawer took the Escape')

    await page.keyboard.press('?')
    await page.getByRole('dialog', { name: 'Keyboard shortcuts' }).waitFor()
    await page.keyboard.press('Escape')
    await page.getByRole('dialog', { name: 'Keyboard shortcuts' }).waitFor({ state: 'detached' })
    assert.equal(events.hostEscapes, 0, 'help took the Escape')

    // Search, then ↓ (which leaves the search field on purpose), then Esc.
    await page.keyboard.press('/')
    await page.getByPlaceholder('Search tasks').fill('passport')
    await row(page, 'Renew passport').waitFor()
    await page.getByPlaceholder('Search tasks').press('ArrowDown')
    await page.keyboard.press('Escape')
    await page.getByRole('heading', { name: 'Today' }).waitFor()
    assert.equal(events.hostEscapes, 0, 'search took the Escape and left the results')

    await page.keyboard.press('Escape')
    assert.equal(events.hostEscapes, 1, 'nothing open: Escape is the host’s, as Agent Code expects')
  })
})

test('Enter and Space on a focused button press that button, not the focused task', async () => {
  await withView({}, async ({ page, rt }) => {
    await row(page, 'Overdue invoice').waitFor()
    await page.keyboard.press('j') // focus a task
    const lists = () => rt.invokes.filter(n => n === 'list').length
    const before = lists()
    await page.getByTitle('Refresh (r)').focus()
    await page.keyboard.press('Enter')
    await eventually(() => lists() > before, { what: 'Refresh to reload the list' })
    await page.keyboard.press(' ')
    await eventually(() => lists() > before + 1, { what: 'Space to press Refresh too' })
    assert.equal(await drawer(page).count(), 0, 'the focused task was not opened')
    assert.equal(task(s.t.overdue.id).checked, false, 'nor completed')
  })
})

test('a double click on a recurring task’s checkbox completes it once', async () => {
  const daily = recurringToday('Water plants')
  await withView({}, async ({ page }) => {
    await row(page, 'Water plants').locator('button[aria-label="Complete task"]').dblclick()
    await page.locator('.td-toast', { hasText: 'Completed' }).waitFor()
    await new Promise(r => setTimeout(r, 1500))
    assert.equal(world.fake.requestsTo('POST', `/api/v1/tasks/${daily.id}/close`).length, 1, 'one occurrence, not two')
    assert.equal(task(daily.id).due.date, dayFromToday(1))
  })
})

test('the drawer checkbox shows what the server did: nothing on failure, the next date for a recurring task', async () => {
  const daily = recurringToday('Stretch')
  await withView({}, async ({ page }) => {
    world.fake.fail(r => r.path === `/api/v1/tasks/${s.t.overdue.id}/close`, { status: 500, times: 1 })
    await row(page, 'Overdue invoice').click()
    await drawer(page).locator('button[aria-label="Complete task"]').click()
    await page.locator('.td-toast.is-error').first().waitFor()
    await new Promise(r => setTimeout(r, 500))
    assert.equal(await drawer(page).locator('.td-checkbox.lg.is-checked').count(), 0, 'not painted as done')
    assert.equal(task(s.t.overdue.id).checked, false)

    await row(page, 'Stretch').click()
    await drawer(page).getByRole('heading', { name: 'Stretch' }).waitFor()
    await drawer(page).locator('button[aria-label="Complete task"]').click()
    await eventually(() => task(daily.id).due.date === dayFromToday(1), { what: 'roll forward' })
    await drawer(page).getByText('Tomorrow').first().waitFor()
    assert.equal(await drawer(page).locator('button[aria-label="Reopen task"]').count(), 0, 'still an open task, at its next date')
  })
})

test('quick add: a description stays a description and the task is still due today', async () => {
  await withView({}, async ({ page }) => {
    await page.getByLabel('Quick add task').fill('Fix login // see logs from prod')
    await page.getByLabel('Quick add task').press('Enter')
    await page.locator('.td-toast', { hasText: 'Added' }).waitFor()
    const created = await eventually(() => world.fake.tasks.find(t => t.content === 'Fix login' && t.due), { what: 'the scheduled task' })
    assert.equal(created.description, 'see logs from prod')
    assert.equal(created.due.date, dayFromToday(0))
  })
})

test('quick add in a project: an issue number does not send the task to Inbox; a failed move is reported once', async () => {
  await withView({}, async ({ page }) => {
    await page.getByRole('button', { name: 'Home', exact: true }).click()
    await page.getByRole('heading', { name: 'Home' }).waitFor()
    const input = page.getByLabel('Quick add task')
    await input.fill('Fix #123 crash')
    await input.press('Enter')
    const issue = await eventually(() => world.fake.tasks.find(t => t.content === 'Fix #123 crash' && t.project_id === s.home.id), { what: 'the task in Home' })
    assert.ok(issue)
    await page.locator('.td-toast', { hasText: 'Added “Fix #123 crash”' }).waitFor()

    world.fake.fail(r => /^\/api\/v1\/tasks\/[^/]+\/move$/.test(r.path), { status: 500, times: 1 })
    await input.fill('Half applied')
    await input.press('Enter')
    await page.locator('.td-toast.is-error', { hasText: 'could not move it' }).waitFor()
    assert.equal(await input.inputValue(), '', 'cleared, so Enter cannot add it twice')
    assert.equal(world.fake.tasks.filter(t => t.content === 'Half applied').length, 1)
  })
})

test('rapid entry: a line typed while the previous add is in flight is kept and added', async () => {
  await withView({}, async ({ page }) => {
    const input = page.getByLabel('Quick add task')
    await input.fill('Rapid one')
    await input.press('Enter')
    await input.fill('Rapid two') // immediately: the first add is still running
    await input.press('Enter')
    await eventually(() => ['Rapid one', 'Rapid two'].every(c => world.fake.tasks.some(t => t.content === c)), { what: 'both tasks' })
    await new Promise(r => setTimeout(r, 1000))
    assert.equal(await input.inputValue(), '')
    assert.equal(world.fake.tasks.filter(t => t.content.startsWith('Rapid')).length, 2)
  })
})

test('a failed add gives the text back', async () => {
  await withView({}, async ({ page }) => {
    world.fake.fail(r => r.path === '/api/v1/tasks/quick', { status: 500, times: 1 })
    const input = page.getByLabel('Quick add task')
    await input.fill('Comes back')
    await input.press('Enter')
    await page.locator('.td-toast.is-error').first().waitFor()
    assert.equal(await input.inputValue(), 'Comes back')
  })
})

test('acting on a task from page 2 keeps the loaded pages', async () => {
  const big = world.fake.addProject({ name: 'Big', color: 'red' })
  for (let i = 0; i < 130; i++) world.fake.addTask({ content: `Big ${String(i).padStart(3, '0')}`, project_id: big.id, child_order: i + 1 })
  await withView({}, async ({ page }) => {
    await page.getByRole('button', { name: 'Big', exact: true }).click()
    await page.getByRole('button', { name: 'Load more' }).click()
    await row(page, 'Big 129').waitFor()
    await row(page, 'Big 125').locator('button[aria-label="Complete task"]').click()
    await page.locator('.td-toast', { hasText: 'Task completed' }).waitFor()
    await new Promise(r => setTimeout(r, 3000)) // revision refetch
    assert.ok(await row(page, 'Big 129').isVisible(), 'page 2 is still there')
    assert.ok(await page.locator('.td-list [role="listitem"]').count() >= 128)
  })
})

test('the Todoist look is the default; "Use Agent Code\'s colours" switches live', async () => {
  await withView({}, async ({ page, rt }) => {
    await row(page, 'Stand-up').waitFor()
    const look = () => page.evaluate(() => ({ theme: document.documentElement.dataset.tdTheme, bg: getComputedStyle(document.body).backgroundColor, accent: getComputedStyle(document.documentElement).getPropertyValue('--td-accent').trim() }))
    // No host theme pushed: the frame falls back to dark → Todoist's dark palette.
    assert.deepEqual(await look(), { theme: 'todoist', bg: 'rgb(31, 31, 31)', accent: '#de4c4a' })
    // Agent Code switches to a light theme (it rewrites the inline --theme-* tokens).
    await page.evaluate(() => document.documentElement.style.setProperty('--theme-canvas', '#faf9f6'))
    await eventually(async () => (await look()).bg === 'rgb(255, 255, 255)', { what: 'Todoist light' })
    assert.equal((await look()).accent, '#dc4c3e')
    await rt.request('setSetting', { key: 'todoist.inheritTheme', value: true })
    await eventually(async () => (await look()).theme === 'agent-code', { what: 'the switch' })
    assert.notEqual((await look()).accent, '#dc4c3e', 'Agent Code\'s tokens apply')
    await rt.request('setSetting', { key: 'todoist.inheritTheme', value: false })
    await eventually(async () => (await look()).theme === 'todoist', { what: 'the switch back' })
  })
})

test('the "Open on" setting decides where the pane opens', async () => {
  await withView({ storage: { 'todoist.defaultView': 'inbox' } }, async ({ page }) => {
    await page.getByRole('heading', { name: 'Inbox' }).waitFor()
  })
})

test('"Open in Modal": the full workspace at a fixed natural size, closable by button and by Esc', async () => {
  await withView({ view: 'window', width: 1400 }, async ({ page, events, rt }) => {
    await row(page, 'Overdue invoice').waitFor()
    // The host sizes a modal from its content: the root must not depend on
    // the frame's own height (100vh), or the modal collapses.
    const box = await page.locator('.td-root').boundingBox()
    assert.deepEqual([box.width, box.height], [1100, 720])
    await row(page, 'Overdue invoice').click()
    await drawer(page).waitFor()
    await page.keyboard.press('Escape')
    await drawer(page).waitFor({ state: 'detached' })
    assert.equal(events.hostEscapes, 0, 'Esc closed the drawer, not the modal')
    await page.keyboard.press('Escape')
    assert.equal(events.hostEscapes, 1, 'nothing open: Esc closes the modal')
    // A change made elsewhere (another view) reaches the modal too.
    await rt.request('quickAdd', { text: 'Added from the pane today' })
    await row(page, 'Added from the pane').waitFor()
    await page.getByTitle('Close (Esc)').first().click()
    await eventually(() => events.closes === 1, { what: 'the close button to close the modal' })
  })
})

test('⌫ deletes the focused task after a confirmation; Esc cancels without closing the pane', async () => {
  const doomed = world.fake.addTask({ content: 'Delete me with backspace', due: { date: dayFromToday(0), datetime: null, is_recurring: false, lang: 'en', string: 'today', timezone: null } })
  const kept = world.fake.addTask({ content: 'Keep me please', due: { date: dayFromToday(0), datetime: null, is_recurring: false, lang: 'en', string: 'today', timezone: null } })
  await withView({}, async ({ page, events }) => {
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    // Esc cancels: nothing deleted, the host never saw the key.
    await row(page, 'Keep me please').click()
    await page.keyboard.press('Escape') // closes the drawer the click opened
    await page.keyboard.press('Backspace')
    await dialog.waitFor()
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'detached' })
    assert.equal(events.hostEscapes, 0)
    assert.equal(task(kept.id).is_deleted, false)

    // ⌫ then Enter (the focused Delete button) deletes.
    await row(page, 'Delete me with backspace').click()
    await page.keyboard.press('Escape')
    await page.keyboard.press('Backspace')
    await dialog.getByText('Delete me with backspace').waitFor()
    await page.keyboard.press('Enter')
    await eventually(() => task(doomed.id).is_deleted, { what: 'the delete' })
    await page.locator('.td-toast', { hasText: 'Deleted' }).waitFor()
    assert.equal(await row(page, 'Delete me with backspace').count(), 0)
    assert.equal(task(kept.id).is_deleted, false, 'only the focused task')
  })
})

test('the row’s trash button asks before deleting', async () => {
  const doomed = world.fake.addTask({ content: 'Trash via hover', due: { date: dayFromToday(0), datetime: null, is_recurring: false, lang: 'en', string: 'today', timezone: null } })
  await withView({}, async ({ page }) => {
    await row(page, 'Trash via hover').hover()
    await row(page, 'Trash via hover').getByTitle('Delete (⌫)').click()
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    await dialog.getByRole('button', { name: 'Delete' }).click()
    await eventually(() => task(doomed.id).is_deleted, { what: 'the delete' })
  })
})

const todayDue = (offset = 0) => ({ date: dayFromToday(offset), datetime: null, is_recurring: false, lang: 'en', string: offset ? 'later' : 'today', timezone: null })

test('⌫ in a child’s drawer deletes that child, not the parent the list had focused', async () => {
  const parent = world.fake.addTask({ content: 'Drawer parent', due: todayDue() })
  const child = world.fake.addTask({ content: 'Drawer child', parent_id: parent.id, due: todayDue(1) })
  await withView({}, async ({ page }) => {
    await row(page, 'Drawer parent').click()
    await drawer(page).getByRole('button', { name: 'Drawer child' }).click()
    await drawer(page).getByRole('heading', { name: 'Drawer child' }).waitFor()
    await page.keyboard.press('Backspace')
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    await dialog.getByText('“Drawer child”').waitFor()
    await page.keyboard.press('Enter')
    await eventually(() => task(child.id).is_deleted, { what: 'the child to be deleted' })
    assert.equal(task(parent.id).is_deleted, false, 'the parent survives')
  })
})

test('the confirmation counts sub-tasks the current view does not show', async () => {
  const parent = world.fake.addTask({ content: 'Hidden-child parent', due: todayDue() })
  const child = world.fake.addTask({ content: 'Hidden child', parent_id: parent.id, due: todayDue(1) }) // not in Today
  await withView({}, async ({ page }) => {
    await row(page, 'Hidden-child parent').hover()
    await row(page, 'Hidden-child parent').getByTitle('Delete (⌫)').click()
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    await dialog.getByText('and its 1 sub-task').waitFor()
    await dialog.getByRole('button', { name: 'Delete' }).click()
    await eventually(() => task(parent.id).is_deleted && task(child.id).is_deleted, { what: 'the subtree' })
  })
})

test('⌫ never opens a delete while typing or inside a picker, and Tab stays in the dialog', async () => {
  const t = world.fake.addTask({ content: 'Guarded task', due: todayDue() })
  await withView({}, async ({ page }) => {
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    await page.getByLabel('Quick add task').fill('abc')
    await page.getByLabel('Quick add task').press('Backspace')
    assert.equal(await page.getByLabel('Quick add task').inputValue(), 'ab', 'Backspace edits the text')
    await page.getByLabel('Quick add task').press('Escape') // clear
    await page.getByLabel('Quick add task').press('Escape') // blur

    await row(page, 'Guarded task').hover()
    await row(page, 'Guarded task').getByTitle('Priority (1–4)').click()
    await page.locator('.td-popover').waitFor()
    await page.keyboard.press('Backspace')
    await new Promise(r => setTimeout(r, 300))
    assert.equal(await dialog.count(), 0, 'no delete from inside a picker')
    await page.keyboard.press('Escape')

    await row(page, 'Guarded task').hover()
    await row(page, 'Guarded task').getByTitle('Delete (⌫)').click()
    await dialog.waitFor()
    for (let i = 0; i < 4; i++) await page.keyboard.press('Tab')
    assert.ok(await page.evaluate(() => !!document.activeElement?.closest('.td-delete')), 'focus stayed in the dialog')
    await page.keyboard.press('Escape')
    await dialog.waitFor({ state: 'detached' })
    assert.equal(await page.evaluate(() => document.activeElement?.getAttribute('title')), 'Delete (⌫)', 'focus went back to where it was')
    assert.equal(task(t.id).is_deleted, false)
  })
})

test('Delete removes the whole subtree at once and focus moves to the next surviving task', async () => {
  const parent = world.fake.addTask({ content: 'Focus parent', child_order: 900 })
  world.fake.addTask({ content: 'Focus child', parent_id: parent.id, child_order: 901 })
  world.fake.addTask({ content: 'Focus survivor', child_order: 902 })
  await withView({}, async ({ page }) => {
    await page.getByRole('button', { name: 'Inbox', exact: true }).first().click()
    await row(page, 'Focus parent').click()
    await page.keyboard.press('Escape') // close the drawer the click opened
    await page.keyboard.press('Delete') // the forward-delete key works too
    const dialog = page.getByRole('dialog', { name: 'Delete task' })
    await dialog.waitFor()
    await page.keyboard.press('Enter')
    await row(page, 'Focus child').waitFor({ state: 'detached' })
    const focused = page.locator('.td-task.is-focused')
    await focused.waitFor()
    assert.match(await focused.innerText(), /Focus survivor/, 'the next surviving task has focus')
  })
})

test('a failed delete restores the CURRENT view, not the one the delete started in', async () => {
  const doomed = world.fake.addTask({ content: 'Fails slowly', due: todayDue(), project_id: s.home.id }) // in Today, not in Inbox
  await withView({}, async ({ page }) => {
    world.fake.fail(r => r.method === 'DELETE' && r.path === `/api/v1/tasks/${doomed.id}`, { status: 500, delayMs: 2500, times: 1 })
    await row(page, 'Fails slowly').hover()
    await row(page, 'Fails slowly').getByTitle('Delete (⌫)').click()
    await page.getByRole('dialog', { name: 'Delete task' }).getByRole('button', { name: 'Delete' }).click()
    await page.getByRole('button', { name: 'Inbox', exact: true }).first().click()
    await page.getByRole('heading', { name: 'Inbox' }).waitFor()
    await page.locator('.td-toast.is-error').first().waitFor({ timeout: 20_000 })
    await new Promise(r => setTimeout(r, 2500))
    assert.equal(await row(page, 'Fails slowly').count(), 0, 'Today’s task did not appear in Inbox')
    assert.equal(task(doomed.id).is_deleted, false)
  })
})

test('Quick Add lists agent sessions saved without a kind, and no terminals', async () => {
  const sessions = [
    { id: 'a1', kind: null, title: 'Legacy agent', cwd: '/work', activity: 'idle', notification: null },
    { id: 'a2', kind: 'terminal', title: 'zsh', cwd: '~', activity: 'idle', notification: null },
  ]
  await withView({ view: 'modal', sessions }, async ({ page }) => {
    await page.getByRole('button', { name: /Legacy agent/ }).waitFor()
    assert.equal(await page.getByRole('button', { name: /zsh/ }).count(), 0)
  })
})

test('a description draft is saved, not lost, when another task is opened', async () => {
  await withView({}, async ({ page }) => {
    await row(page, 'Overdue invoice').click()
    await drawer(page).getByRole('button', { name: 'Add description' }).click()
    await drawer(page).locator('textarea.td-edit-desc').fill('Half-written note')
    await row(page, 'Stand-up').click()
    await eventually(() => task(s.t.overdue.id).description === 'Half-written note', { what: 'the draft to be saved' })
  })
})

test('Enter in the title editor saves once', async () => {
  await withView({}, async ({ page }) => {
    await row(page, 'Overdue invoice').click()
    await drawer(page).locator('h2.td-drawer-title').click()
    await drawer(page).locator('textarea.td-edit-title').fill('Overdue invoice (renamed)')
    await drawer(page).locator('textarea.td-edit-title').press('Enter')
    await eventually(() => task(s.t.overdue.id).content === 'Overdue invoice (renamed)', { what: 'the rename' })
    await new Promise(r => setTimeout(r, 1000))
    const renames = world.fake.requestsTo('POST', `/api/v1/tasks/${s.t.overdue.id}`).filter(r => r.body?.content === 'Overdue invoice (renamed)')
    assert.equal(renames.length, 1)
  })
})

test('a failed project create keeps the form and the typed name', async () => {
  await withView({}, async ({ page }) => {
    world.fake.fail(r => r.method === 'POST' && r.path === '/api/v1/projects', { status: 500, times: 1 })
    await page.getByTitle('Add project').click()
    await page.getByPlaceholder('Project name').fill('Garden')
    await page.getByPlaceholder('Project name').press('Enter')
    await page.locator('.td-toast.is-error').first().waitFor()
    assert.equal(await page.getByPlaceholder('Project name').inputValue(), 'Garden')
  })
})

test('a sign-in that never shows a URL can still be cancelled', async () => {
  // A td whose login waits silently: no authorize URL is ever printed.
  const dir = await mkdtemp(join(tmpdir(), 'td-login-'))
  const td = join(dir, 'td')
  await writeFile(td, `#!${process.execPath}
const args = process.argv.slice(2)
if (args.includes('--version')) process.stdout.write('5.4.10\\n')
else if (args.includes('login')) setTimeout(() => {}, 120000)
else { process.stderr.write(JSON.stringify({ error: { code: 'NO_TOKEN', message: 'Not signed in.' } })); process.exit(1) }
`)
  await chmod(td, 0o755)
  try {
    await withView({ storage: { 'todoist.tdPath': td } }, async ({ page }) => {
      await page.getByRole('button', { name: 'Sign in with Todoist' }).click()
      await page.getByText('Waiting for you to approve access').waitFor()
      await page.getByRole('button', { name: 'Cancel' }).click()
      await page.getByRole('button', { name: 'Sign in with Todoist' }).waitFor({ timeout: 15_000 })
    })
  } finally {
    await rm(dir, { recursive: true, force: true })
    await world.relocate()
  }
})
