import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4321',
    trace: 'on-first-retry',
    // Avoid Playwright browser downloads where possible by using installed Chrome.
    // GitHub Actions runners have Chrome available; locally this uses your Chrome install.
    channel: 'chrome',
  },
  webServer: {
    command: 'npm run dev -- --host 127.0.0.1 --port 4321',
    url: 'http://127.0.0.1:4321',
    reuseExistingServer: !process.env.CI,
  },
  projects: [
    { name: 'desktop-chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } },
    { name: 'mobile-chromium', use: { ...devices['Pixel 7'], browserName: 'chromium' } },
    { name: 'tablet-chromium', use: { ...devices['iPad (gen 7)'], browserName: 'chromium' } },
  ],
});

