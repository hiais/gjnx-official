import { test, expect } from '@playwright/test';

test('homepage visual regression', async ({ page }) => {
    await page.goto('/');
    await expect(page).toHaveScreenshot('home-page.png');
});

test('article page visual regression', async ({ page }) => {
    await page.goto('/articles'); // List view
    await expect(page).toHaveScreenshot('articles-list.png');
});

test('404 visual regression', async ({ page }) => {
    await page.goto('/404');
    await expect(page).toHaveScreenshot('404-page.png');
});
