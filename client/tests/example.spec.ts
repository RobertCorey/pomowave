import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');
  
  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Pomowave/);
});

test('app loads correctly', async ({ page }) => {
  await page.goto('/');
  
  // Example assertion - update based on your actual app
  const mainContent = page.locator('main');
  await expect(mainContent).toBeVisible();
});