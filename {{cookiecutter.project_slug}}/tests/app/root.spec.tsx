import { expect, test } from '@playwright/test';

test('The page should show remix contacts', async ({ page }) => {
  await page.goto('http://localhost:3000/');
  expect(page.getByRole('heading', { name: 'Remix Contacts' })).toBeVisible;
});