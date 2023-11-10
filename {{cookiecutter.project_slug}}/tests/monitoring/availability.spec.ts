import { Browser, Page, chromium } from "@playwright/test";
import { afterAll, beforeAll, describe, expect, test } from "vitest";
import { httpUrl } from "../common/setup";


const stageHttpUrl = "https://head.cookiecutter-remix.pages.dev/"

describe("playwright meets vitest", () => {
    let page: Page;
    let browser: Browser;
    beforeAll(async () => {
        browser = await chromium.launch();
        let context = await browser.newContext();
        page = await context.newPage();
    });

    afterAll(async () => {
        await browser.close();
    });

    test('The page should show remix contacts', async () => {
        await page.goto(httpUrl!);
        await expect(page.getByRole('heading', { name: 'Welcome to Remix' })).toBeDefined();
    });
})