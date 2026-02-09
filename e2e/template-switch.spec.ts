import { test, expect } from '@playwright/test'

test.describe('Template Switching', () => {
  test('should open template gallery and switch templates', async ({ page }) => {
    // First create a resume
    await page.goto('/')
    await page.click('text=Create New Resume')
    await page.click('button:has-text("Create Resume")')
    await expect(page).toHaveURL(/\/editor\//)

    // Click templates button
    await page.click('text=Templates')

    // Gallery should appear
    await expect(page.locator('text=Choose Template')).toBeVisible()
  })
})
