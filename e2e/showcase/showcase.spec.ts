import { test, expect, type Page } from '@playwright/test'
import { readFile } from 'node:fs/promises'

test.skip(({ baseURL }) => baseURL !== 'http://127.0.0.1:4181', 'Run with e2e/showcase/playwright.config.ts; separate from the React acceptance suite.')

const file = new URL('../../showcase/index.html', import.meta.url).href
const start = async (page: Page, mode = 'simple') => {
  await page.getByRole('button', { name: mode === 'simple' ? /Keep it simple/ : /Make it impossible/ }).click()
  await page.getByRole('button', { name: /^American/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  if (mode === 'impossible') {
    await page.getByRole('button', { name: 'Handhelds', exact: true }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await page.getByRole('button', { name: /Classic Cheeseburger/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
}

for (const [hosting, url] of [['file', file], ['subpath', '/showcase/index.html']]) {
  test(`${hosting}: simple flow, optional controls, upstream reset, completion and exports`, async ({ page }) => {
    const errors: string[] = []
    page.on('pageerror', error => errors.push(error.message))
    await page.goto(url)
    await start(page)
    await page.getByLabel('Beef', { exact: false }).selectOption('2')
    await expect(page.getByLabel('Running order summary')).toContainText('$18.00')
    await page.getByRole('button', { name: 'Back', exact: true }).click()
    await page.getByRole('button', { name: /Smoky Pulled Pork Sandwich/ }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await expect(page.getByLabel('Pork', { exact: false })).toHaveValue('1')
    await expect(page.getByLabel('Running order summary')).toContainText('$13.00')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: /House lemonade/ }).click()
    await page.getByLabel('Drink size').selectOption('Large')
    await page.getByRole('button', { name: /Mango sorbet/ }).click()
    await page.getByLabel('Dessert portion').selectOption('0.5')
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    await page.getByRole('button', { name: 'Complete mock order' }).click()
    await expect(page.getByRole('heading', { level: 1 })).toHaveText('Dinner decided. Nothing ordered.')
    await page.getByRole('button', { name: 'View local dashboard' }).click()
    await expect(page.getByRole('table')).toContainText('completed')
    for (const format of ['JSON', 'CSV']) {
      const downloadPromise = page.waitForEvent('download')
      await page.getByRole('button', { name: `Export ${format}` }).click()
      const download = await downloadPromise
      const path = `e2e/showcase/test-results/${hosting}-export.${format.toLowerCase()}`
      await download.saveAs(path)
      const content = await readFile(path, 'utf8')
      expect(content).toContain('completed')
      expect(content).not.toContain('Smoky')
      if (format === 'JSON') expect(JSON.parse(content).version).toBe(1)
    }
    expect(errors).toEqual([])
  })
}

test('impossible flow: conflicts, recovery, combo and upstream drink reset', async ({ page }) => {
  await page.goto('/showcase/index.html')
  await start(page, 'impossible')
  await page.getByRole('button', { name: /Large ·/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Beef', { exact: false }).selectOption('2')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /^Tofu/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Bread preference').selectOption('No bread')
  await expect(page.getByRole('status')).toContainText('removed bread quantities')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Cheese preference').selectOption('No cheese')
  await expect(page.getByRole('status')).toContainText('removed cheese')
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /Extra chicken/ }).click()
  await expect(page.getByRole('status')).toContainText('incompatible extra')
  await expect(page.getByRole('button', { name: /Extra chicken/ })).toHaveAttribute('aria-pressed', 'false')
  const conflictCount = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions[0].conflicts)
  expect(conflictCount).toBe(3)
  await page.getByRole('button', { name: /Avocado/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /Garden salad/ }).click()
  await page.getByLabel('Combo:').check()
  await expect(page.getByRole('status')).toContainText('replaced your side')
  await page.getByLabel('Combo:').uncheck()
  await expect(page.getByRole('button', { name: /None — skip/ })).toHaveAttribute('aria-pressed', 'true')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /Classic cola/ }).click()
  await page.getByLabel('Drink size').selectOption('Large')
  await page.getByRole('button', { name: /Still water/ }).click()
  await expect(page.getByLabel('Drink size')).toHaveValue('Medium')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Complete mock order' }).click()
  await expect(page.getByRole('heading', { level: 1 })).toContainText('Dinner decided')
})

test('validation, keyboard exit, interrupted visits, corrupt/denied storage and mobile', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.goto('/showcase/index.html')
  await page.getByRole('button', { name: /Keep it simple/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Please choose')
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true)
  await page.reload()
  await page.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await expect(page.getByRole('table')).toContainText('interrupted')
  await page.getByRole('button', { name: 'Return to menu' }).click()
  await page.getByRole('button', { name: /Keep it simple/ }).click()
  await page.getByRole('button', { name: 'Exit experiment' }).click()
  await page.keyboard.press('Escape')
  await expect(page.getByRole('dialog')).not.toBeVisible()
  await page.getByRole('button', { name: 'Exit experiment' }).click()
  await page.getByRole('button', { name: 'Leave experiment', exact: true }).click()
  await page.getByRole('button', { name: 'View local dashboard' }).click()
  await expect(page.getByRole('table')).toContainText('abandoned')
  await page.getByRole('button', { name: 'Clear showcase data' }).click()
  await page.getByRole('button', { name: 'Clear data', exact: true }).click()
  await expect(page.getByText('No showcase visits yet.', { exact: false })).toBeVisible()
  await page.addInitScript(() => localStorage.setItem('impossible-menu-showcase-v1', JSON.stringify({ version: 99, sessions: [{ mode: '<script>' }] })))
  await page.reload()
  await expect(page.getByText('Incompatible or corrupt showcase data was ignored.')).toBeVisible()
  await page.addInitScript(() => Object.defineProperty(window, 'localStorage', { get() { throw new Error('denied') } }))
  await page.reload()
  await expect(page.getByText(/uses memory only/)).toBeVisible()
  await start(page)
})

test('catalog coverage and pure, idempotent rules and scaled calculation', async ({ page }) => {
  await page.goto(file)
  const result = await page.evaluate(() => {
    const w = window as unknown as {
      MenuCatalog: { cuisines: string[]; dishes: { id: string; cuisine: string; ingredients: { id: string }[] }[] }
      MenuDomain: {
        empty: () => Record<string, unknown>
        resolve: (order: Record<string, unknown>) => { order: Record<string, unknown>; conflicts: unknown[] }
        calculate: (order: Record<string, unknown>) => { price: number; calories: number }
      }
      MenuAnalytics: { cell: (value: string) => string }
    }
    const input = { ...w.MenuDomain.empty(), dishId: 'classic-cheeseburger', portion: 'large', quantities: { 'protein-beef': 2 }, substitution: 'protein-tofu', extras: ['extra-chicken'], bread: 'No bread', cheese: 'No cheese' }
    const before = JSON.stringify(input)
    const catalogBefore = JSON.stringify(w.MenuCatalog)
    const resolved = w.MenuDomain.resolve(input)
    return {
      cuisines: w.MenuCatalog.cuisines.length, dishes: w.MenuCatalog.dishes.length,
      unique: new Set(w.MenuCatalog.dishes.map(d => d.id)).size,
      coverage: w.MenuCatalog.cuisines.map(c => w.MenuCatalog.dishes.filter(d => d.cuisine === c).length),
      pure: before === JSON.stringify(input) && catalogBefore === JSON.stringify(w.MenuCatalog),
      idempotent: JSON.stringify(resolved.order) === JSON.stringify(w.MenuDomain.resolve(resolved.order).order),
      conflicts: resolved.conflicts.length,
      totals: w.MenuDomain.calculate(input), cell: w.MenuAnalytics.cell(' =HYPERLINK("x")'),
    }
  })
  expect(result).toMatchObject({ cuisines: 12, dishes: 120, unique: 120, pure: true, idempotent: true, conflicts: 3 })
  expect(result.coverage).toEqual(Array(12).fill(10))
  // (13.5 + 4.5 - 1.7 - 1.2 + (2.5 - 4.5) * 2) * 1.5
  expect(result.totals).toMatchObject({ price: 16.65, calories: 600 })
  expect(result.cell).toBe('"\' =HYPERLINK(""x"")"')
})

test('measurement counts selections once and excludes hidden, unfocused and dashboard time', async ({ page }) => {
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.addInitScript(() => {
    Object.defineProperty(document, 'hasFocus', { value: () => true, configurable: true })
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
  })
  await page.goto('/showcase/index.html')
  await page.getByRole('button', { name: /Keep it simple/ }).click()
  await page.getByRole('button', { name: /^(✓ )?American/ }).click()
  await page.getByRole('button', { name: /^(✓ )?American/ }).click()
  await page.clock.runFor(2000)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: true, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.clock.runFor(5000)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hidden', { value: false, configurable: true })
    Object.defineProperty(document, 'hasFocus', { value: () => false, configurable: true })
    document.dispatchEvent(new Event('visibilitychange'))
  })
  await page.clock.runFor(5000)
  await page.evaluate(() => {
    Object.defineProperty(document, 'hasFocus', { value: () => true, configurable: true })
    window.dispatchEvent(new Event('focus'))
  })
  await page.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await page.clock.runFor(5000)
  const row = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions[0])
  expect(row).toMatchObject({ actions: 1, changes: 1, optionsShown: 12, backtracks: 0 })
  expect(row.activeMs).toBe(2000)
  await page.getByRole('button', { name: 'Return to current order' }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Back', exact: true }).click()
  await page.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  const revisited = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions[0])
  expect(revisited).toMatchObject({ actions: 1, optionsShown: 34, backtracks: 1 })
})

test('export URLs are revoked and persisted markup is rejected without execution', async ({ page }) => {
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.addInitScript(() => {
    const create = URL.createObjectURL.bind(URL)
    const revoke = URL.revokeObjectURL.bind(URL)
    const state = { created: 0, revoked: 0 }
    Object.defineProperty(window, 'exportChecks', { value: state })
    URL.createObjectURL = blob => { state.created++; return create(blob) }
    URL.revokeObjectURL = url => { state.revoked++; revoke(url) }
    localStorage.setItem('impossible-menu-showcase-v1', JSON.stringify({
      version: 1,
      sessions: [{
        id: '<img src=x onerror=alert(1)>', mode: 'simple', status: 'completed',
        startedAt: new Date().toISOString(), endedAt: new Date().toISOString(),
        actions: 1, changes: 1, backtracks: 0, optionsShown: 12, conflicts: 0, activeMs: 1000,
      }],
    }))
  })
  const dialogs: string[] = []
  page.on('dialog', dialog => { dialogs.push(dialog.message()); void dialog.dismiss() })
  await page.goto('/showcase/index.html')
  await expect(page.getByText('Incompatible or corrupt showcase data was ignored.')).toBeVisible()
  await page.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await expect(page.locator('img')).toHaveCount(0)
  for (const format of ['JSON', 'CSV']) {
    const downloaded = page.waitForEvent('download')
    await page.getByRole('button', { name: `Export ${format}` }).click()
    await downloaded
  }
  await page.clock.runFor(1500)
  const urls = await page.evaluate(() => (window as unknown as { exportChecks: { created: number; revoked: number } }).exportChecks)
  expect(urls).toEqual({ created: 2, revoked: 2 })
  expect(dialogs).toEqual([])
})

test('two tabs preserve live/completed visits and propagate clear without resurrection', async ({ page, context }) => {
  await page.goto('/showcase/index.html')
  await start(page)
  const other = await context.newPage()
  await other.goto('/showcase/index.html')
  await other.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await expect(other.getByRole('table')).toContainText('running')
  await expect(other.getByRole('table')).not.toContainText('interrupted')
  await other.getByRole('button', { name: 'Return to menu' }).click()
  await other.getByRole('button', { name: /Keep it simple/ }).click()
  await page.bringToFront()
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Complete mock order' }).click()
  await other.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await expect(other.getByRole('table')).toContainText('completed')
  await expect(other.getByRole('table')).toContainText('running')
  await page.waitForTimeout(1200)
  const retained = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions)
  expect(retained).toHaveLength(2)
  expect(retained.filter((row: { status: string }) => row.status === 'completed')).toHaveLength(1)
  await page.getByRole('button', { name: 'Try another journey' }).click()
  await page.getByRole('button', { name: /Keep it simple/ }).click()
  await other.getByRole('button', { name: 'Clear showcase data' }).click()
  await other.getByRole('button', { name: 'Clear data', exact: true }).click()
  await expect(page.getByRole('button', { name: /Keep it simple/ })).toBeVisible()
  await expect(page.getByText(/current order was canceled/)).toBeVisible()
  await expect(other.getByText(/No showcase visits yet/)).toBeVisible()
  await page.waitForTimeout(1200)
  const cleared = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions)
  expect(cleared).toEqual([])
  await page.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await expect(page.getByText(/No showcase visits yet/)).toBeVisible()
  await other.close()
})

test('a clear arriving before its storage event cannot produce false completion', async ({ page, context }) => {
  await page.clock.install()
  await page.clock.pauseAt(new Date())
  await page.addInitScript(() => {
    const gate = { enabled: false }
    Object.defineProperty(window, 'storageEventGate', { value: gate })
    window.addEventListener('storage', event => { if (gate.enabled) event.stopImmediatePropagation() })
  })
  await page.goto('/showcase/index.html')
  await start(page)
  for (let i = 0; i < 3; i++) await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.evaluate(() => { (window as unknown as { storageEventGate: { enabled: boolean } }).storageEventGate.enabled = true })
  const other = await context.newPage()
  await other.goto('/showcase/index.html')
  await other.getByRole('button', { name: 'Local dashboard', exact: true }).click()
  await other.getByRole('button', { name: 'Clear showcase data' }).click()
  await other.getByRole('button', { name: 'Clear data', exact: true }).click()
  await page.getByRole('button', { name: 'Complete mock order' }).evaluate(node => (node as HTMLButtonElement).click())
  await expect(page.getByRole('button', { name: /Keep it simple/ })).toBeVisible()
  await expect(page.getByText(/current order was canceled/)).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Dinner decided. Nothing ordered.' })).toHaveCount(0)
  const rows = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu-showcase-v1')!).sessions)
  expect(rows).toEqual([])
  await other.close()
})
