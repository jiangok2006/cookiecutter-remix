import { expect, test } from '@playwright/test';

test('The page should show remix contacts', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  await expect(page.getByRole('heading', { name: 'Remix Contactss' })).toHaveCount(1);
});