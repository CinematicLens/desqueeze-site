// @ts-check
const { test, expect } = require('@playwright/test');

test.describe('device-lab responsive shell', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/device-lab.html');
  });

  test('mobile (iPhone class): menu opens drawer; desktop nav hidden', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('menu-button')).toBeVisible();
    await expect(page.getByTestId('desktop-nav')).toBeHidden();
    await expect(page.getByTestId('mobile-drawer')).toBeHidden();

    await page.getByTestId('menu-button').click();
    await expect(page.getByTestId('mobile-drawer')).toBeVisible();
    await expect(page.getByRole('navigation', { name: 'Mobile primary' })).toBeVisible();

    await page.getByTestId('drawer-close').click();
    await expect(page.getByTestId('mobile-drawer')).toBeHidden();
  });

  test('mobile: sidebar overlay toggles', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.getByTestId('sidebar-overlay')).toBeHidden();
    await page.getByTestId('sidebar-toggle').click();
    await expect(page.getByTestId('sidebar-overlay')).toBeVisible();
    await page.getByTestId('sidebar-close').click();
    await expect(page.getByTestId('sidebar-overlay')).toBeHidden();
  });

  test('tablet (iPad class): desktop sidebar hidden; toggle visible', async ({ page }) => {
    await page.setViewportSize({ width: 820, height: 1180 });
    await expect(page.getByTestId('sidebar-desktop')).toBeHidden();
    await expect(page.getByTestId('sidebar-toggle')).toBeVisible();
    await expect(page.getByTestId('desktop-nav')).toBeHidden();
  });

  test('desktop: top nav + left sidebar visible; chrome buttons hidden', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(page.getByTestId('desktop-nav')).toBeVisible();
    await expect(page.getByTestId('sidebar-desktop')).toBeVisible();
    await expect(page.getByTestId('menu-button')).toBeHidden();
    await expect(page.getByTestId('sidebar-toggle')).toBeHidden();
  });

  test('viewport readout tracks width', async ({ page }) => {
    await page.setViewportSize({ width: 834, height: 1112 });
    await expect(page.getByTestId('viewport-readout')).toContainText('834');
  });

  test('small phone width (375): menu control visible', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 });
    await expect(page.getByTestId('menu-button')).toBeVisible();
    await expect(page.getByTestId('desktop-nav')).toBeHidden();
  });
});
