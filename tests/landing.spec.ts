import { expect, test } from '@playwright/test';

test.describe('Filmmaking suite landing', () => {
  test('loads and shows hero CTA', async ({ page }) => {
    await page.goto('/');
    await expect(page.getByRole('heading', { level: 1 })).toContainText(/shoot with confidence/i);
    await page.getByTestId('cta-try-filmstudio').click();
    await expect(page.locator('#suite')).toBeVisible();
    await expect(page.locator('#suite')).toContainText(/one workflow/i);
  });

  test('shows three product sections', async ({ page }) => {
    await page.goto('/products');
    await expect(page.locator('#filmstudio')).toBeVisible();
    await expect(page.locator('#anamorphic')).toBeVisible();
    await expect(page.locator('#cinelut')).toBeVisible();
  });

  test('suite panes open and only one is expanded', async ({ page }) => {
    // Keep this test stable: prevent slow third‑party embeds from affecting it.
    await page.route(/.*(youtube\.com|youtu\.be|googlevideo\.com).*/i, (route) => route.abort());
    await page.goto('/products', { waitUntil: 'domcontentloaded' });

    const filmstudio = page.locator('#filmstudio [data-suite-trigger="filmstudio"]');
    const anamorphic = page.locator('#anamorphic [data-suite-trigger="anamorphic"]');
    const cinelut = page.locator('#cinelut [data-suite-trigger="cinelut"]');

    // Site script opens FilmStudio by default when there is no hash — first click would close it.
    await expect(filmstudio).toHaveAttribute('aria-expanded', 'true');
    await expect(page.locator('#pane-filmstudio')).toBeVisible();
    await expect(page.locator('#pane-anamorphic')).toBeHidden();

    await anamorphic.click();
    await expect(anamorphic).toHaveAttribute('aria-expanded', 'true');
    await expect(filmstudio).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#pane-anamorphic')).toBeVisible();
    await expect(page.getByRole('heading', { name: /anamorphic desqueezer/i })).toBeVisible();

    await cinelut.click();
    await expect(cinelut).toHaveAttribute('aria-expanded', 'true');
    await expect(anamorphic).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#pane-cinelut')).toBeVisible();
    await expect(page.locator('#pane-cinelut').locator('iframe[title="CineLut Live Grade demo"]')).toBeVisible();

    await filmstudio.click();
    await expect(filmstudio).toHaveAttribute('aria-expanded', 'true');
    await expect(cinelut).toHaveAttribute('aria-expanded', 'false');
    await expect(page.locator('#pane-filmstudio')).toBeVisible();
  });

  test('has no horizontal scrolling at common viewports', async ({ page }) => {
    await page.goto('/');
    const hasHorizontalScroll = await page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
    expect(hasHorizontalScroll).toBeFalsy();
  });

  test('shows scroll-to-top button after scrolling', async ({ page }) => {
    await page.goto('/', { waitUntil: 'domcontentloaded' });
    const btn = page.getByRole('button', { name: /scroll to top/i });
    await expect(btn).toBeHidden();
    await page.evaluate(() => window.scrollTo(0, 2000));
    await expect(btn).toBeVisible();
  });

  test('contact form has required fields and message length limit', async ({ page }) => {
    await page.goto('/#contact', { waitUntil: 'domcontentloaded' });
    await expect(page.getByRole('heading', { name: /contact us/i })).toBeVisible();
    const contactForm = page.locator('[data-contact-form]');
    await expect(contactForm.getByRole('textbox', { name: /^name$/i })).toHaveAttribute('required', '');
    await expect(contactForm.getByRole('textbox', { name: /email address/i })).toHaveAttribute('required', '');
    await expect(contactForm.getByRole('button', { name: /topic/i })).toBeVisible();
    const message = contactForm.getByRole('textbox', { name: /message/i });
    await expect(message).toHaveAttribute('required', '');
    await expect(message).toHaveAttribute('maxlength', '2000');
  });
});

