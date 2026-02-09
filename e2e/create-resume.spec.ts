import { test, expect } from '@playwright/test'

test.describe('Create Resume Flow', () => {
  test('should create a new resume and navigate to editor', async ({ page }) => {
    await page.goto('/')

    // Click create button
    await page.click('text=Create New Resume')

    // Fill in name
    await page.fill('input[placeholder*="Software Engineer"]', 'Test Resume')

    // Select first template
    await page.click('button:has-text("Create Resume")')

    // Should navigate to editor
    await expect(page).toHaveURL(/\/editor\//)

    // Editor should be visible
    await expect(page.locator('text=Contact')).toBeVisible()
  })
})
