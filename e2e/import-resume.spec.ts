import { test, expect } from '@playwright/test'

test.describe('Import Resume', () => {
  test('should show import modal', async ({ page }) => {
    // First create a resume to get to editor
    await page.goto('/')
    await page.click('text=Create New Resume')
    await page.click('button:has-text("Create Resume")')
    await expect(page).toHaveURL(/\/editor\//)

    // Click import button
    await page.click('[title="Import resume"]')

    // Modal should appear
    await expect(page.locator('text=Import Resume')).toBeVisible()
    await expect(page.locator('text=Drag & drop your resume here')).toBeVisible()
  })
})
