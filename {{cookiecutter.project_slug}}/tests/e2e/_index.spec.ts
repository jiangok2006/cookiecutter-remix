import { expect, test } from '@playwright/test';
import { httpUrl } from '../common/setup';

test('The page should show remix contacts', async ({ page }) => {
  await page.goto(httpUrl);
  await expect(page.getByRole('heading', { name: 'Welcome to Remix' })).toHaveCount(1);
});