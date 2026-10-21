import { expect, test } from '@playwright/test'

test.beforeEach(async ({ page }) => {
  await page.goto('/')
  await page.evaluate(() => localStorage.clear())
  await page.reload()
})

for (const mode of ['Simple Ordering', 'Impossible Menu']) {
  test(`${mode} can be completed without dead ends`, async ({ page }) => {
    await page.getByRole('button', { name: `Start ${mode}`, exact: true }).click()
    await page.getByRole('button', { name: /American 10 dishes/ }).first().click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    if (mode === 'Impossible Menu') {
      await page.locator('.choice-card').first().click()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
    }
    await page.locator('.dish-card').first().click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    // Follow the real stage graph, including the single dessert reconsideration.
    for (let stage = 0; stage < 20; stage++) {
      const complete = page.getByRole('button', { name: 'Complete simulated order' })
      if (await complete.isVisible()) {
        await complete.click()
        break
      }
      const noDessert = page.getByRole('button', { name: 'No dessert', exact: true })
      if (await noDessert.isVisible()) await noDessert.click()
      const stillNo = page.getByRole('button', { name: 'Still no dessert', exact: true })
      if (await stillNo.isVisible()) await stillNo.click()
      await page.getByRole('button', { name: 'Continue', exact: true }).click()
    }
    await expect(page.getByText(/completed/i).first()).toBeVisible()
    const sessions = await page.evaluate(() => {
      const entries = Object.values(localStorage)
      return entries.filter(value => value.includes('"status":"completed"'))
    })
    expect(sessions.length).toBeGreaterThan(0)
    await expect(page.getByRole('button', { name: 'Exit experiment' })).toHaveCount(0)
  })

  test(`${mode} can be abandoned at any stage`, async ({ page }) => {
    await page.getByRole('button', { name: `Start ${mode}`, exact: true }).click()
    await page.getByRole('button', { name: 'Exit experiment', exact: true }).click()
    await expect(page.getByText(/abandoned|manual exit/i).first()).toBeVisible()
    expect(await page.evaluate(() => Object.values(localStorage).some(value => value.includes('"status":"abandoned"')))).toBe(true)
  })
}

test('dessert reconsideration can be accepted and finished once', async ({ page }) => {
  await page.getByRole('button', { name: 'Start Impossible Menu', exact: true }).click()
  await page.getByRole('button', { name: /American 10 dishes/ }).first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.choice-card').first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.dish-card').first().click()
  for (let stage = 0; stage < 12; stage++) {
    const noDessert = page.getByRole('button', { name: 'No dessert', exact: true })
    if (await noDessert.isVisible()) { await noDessert.click(); await page.getByRole('button', { name: 'Continue', exact: true }).click(); break }
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Yes, explore desserts', exact: true }).click()
  await expect(page.getByLabel('Dessert', { exact: true })).toBeVisible()
  await page.getByLabel('Dessert', { exact: true }).selectOption({ index: 1 })
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Dessert sauce', { exact: true }).selectOption({ index: 1 })
  await page.getByLabel('Sauce quantity').selectOption('2')
  for (let stage = 0; stage < 5; stage++) {
    const complete = page.getByRole('button', { name: 'Complete simulated order' })
    if (await complete.isVisible()) { await complete.click(); break }
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await expect(page.getByText(/completed/i).first()).toBeVisible()
})

test('small-screen flow stays within the viewport and keeps exit available', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 })
  await page.getByRole('button', { name: 'Start Impossible Menu', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Exit experiment', exact: true })).toBeVisible()
  expect(await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth)).toBe(true)
})

test('dependency rework preserves choices and returns to the review without a loop', async ({ page }) => {
  await page.getByRole('button', { name: 'Start Impossible Menu', exact: true }).click()
  await page.getByRole('button', { name: /American 10 dishes/ }).first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Handhelds', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: /Classic Cheeseburger/ }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Bread preference').selectOption('Lettuce wrap')
  await expect(page.getByRole('status')).toContainText(/removes.*bread/i)
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByLabel('Brioche bun')).toBeDisabled()
  await page.getByLabel('Tomatoes').selectOption('2')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByLabel('Individual side', { exact: true }).selectOption('salad')
  await page.getByRole('checkbox', { name: /Make it a combo/ }).check()
  await expect(page.getByRole('status')).toContainText(/replaces/i)
  for (let stage = 0; stage < 15; stage++) {
    if (await page.getByRole('button', { name: 'Revisit customize', exact: true }).isVisible()) break
    const noDessert = page.getByRole('button', { name: 'No dessert', exact: true })
    if (await noDessert.isVisible()) await noDessert.click()
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
  }
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.getByRole('alert')).toContainText('Review each dependency change')
  await page.getByRole('button', { name: 'Revisit customize', exact: true }).click()
  await expect(page.getByLabel('Bread preference')).toHaveValue('Lettuce wrap')
  await page.getByRole('button', { name: 'Return to conflict review', exact: true }).click()
  await page.getByRole('button', { name: 'Revisit sides', exact: true }).click()
  await expect(page.getByRole('checkbox', { name: /Make it a combo/ })).toBeChecked()
  await expect(page.getByLabel('Individual side', { exact: true })).toHaveValue('combo')
  await page.getByRole('button', { name: 'Return to conflict review', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Complete simulated order', exact: true }).click()
  await expect(page.getByText('Status: Completed')).toBeVisible()
  const analytics = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu.analytics.v1') ?? '{}'))
  expect(analytics.sessions[0].revisits).toBe(2)
  expect(analytics.sessions[0].conflicts).toBe(2)
})

test('refresh distinguishes interrupted attempts from manual abandonment', async ({ page }) => {
  await page.getByRole('button', { name: 'Start Simple Ordering', exact: true }).click()
  await page.getByRole('button', { name: /American 10 dishes/ }).first().click()
  await page.reload()
  await page.getByRole('button', { name: /Research dashboard/ }).click()
  const analytics = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu.analytics.v1') ?? '{}'))
  expect(analytics.sessions[0].status).toBe('interrupted')
  expect(analytics.sessions[0].events.some((event: { type: string }) => event.type === 'experiment_abandoned')).toBe(false)
  await expect(page.getByRole('heading', { name: 'Your decision lab' })).toBeVisible()
})

test('beverage recommendations use the selected drink and stop after a response', async ({ page }) => {
  await page.getByRole('button', { name: 'Start Impossible Menu', exact: true }).click()
  await page.getByRole('button', { name: /American 10 dishes/ }).first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.choice-card').first().click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.locator('.dish-card').first().click()
  for (let stage = 0; stage < 6; stage++) {
    await page.getByRole('button', { name: 'Continue', exact: true }).click()
    if (await page.getByLabel('Beverage', { exact: true }).isVisible()) break
  }
  await page.getByLabel('Beverage', { exact: true }).selectOption('cola')
  await page.getByLabel('Beverage size', { exact: true }).selectOption('Small')
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await page.getByRole('button', { name: 'Continue', exact: true }).click()
  await expect(page.locator('.suggestion-panel')).toContainText('Classic Cola')
  const oldTotal = await page.locator('aside .cart-total strong').textContent()
  await page.getByRole('button', { name: 'Accept suggestion', exact: true }).click()
  expect(await page.locator('aside .cart-total strong').textContent()).not.toBe(oldTotal)
  await expect(page.locator('.suggestion-panel')).toContainText('Small Classic Cola')
  await page.getByRole('button', { name: 'Keep my choice', exact: true }).click()
  await expect(page.getByRole('button', { name: 'Accept suggestion', exact: true })).toHaveCount(0)
  await page.getByRole('button', { name: 'Exit experiment', exact: true }).click()
  const analytics = await page.evaluate(() => JSON.parse(localStorage.getItem('impossible-menu.analytics.v1') ?? '{}'))
  expect(analytics.sessions[0].recommendationsShown).toBe(2)
  expect(analytics.sessions[0].recommendationsAccepted).toBe(1)
  expect(analytics.sessions[0].recommendationsRejected).toBe(1)
})
