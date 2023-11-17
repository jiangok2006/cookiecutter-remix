// import { Browser, Page, chromium, expect } from "@playwright/test";
// import { afterAll, beforeAll, describe, test } from "vitest";
// import { httpUrl } from '../common/setup';


// describe("playwright meets vitest", () => {
//   let page: Page;
//   let browser: Browser;
//   beforeAll(async () => {
//     browser = await chromium.launch();
//     let context = await browser.newContext();
//     page = await context.newPage();
//   });

//   afterAll(async () => {
//     await browser.close();
//   });

//   test('The page should show remix string', async () => {
//     await page.goto(httpUrl!);
//     await expect(page.getByText('Welcome to Remix', { exact: true })).toBeDefined()
//   });
// })