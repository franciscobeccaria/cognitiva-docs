// @ts-check
const { defineConfig, devices } = require('@playwright/test');

module.exports = defineConfig({
  testDir: './tests',
  timeout: 20000,
  retries: 0,
  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
  ],
  webServer: {
    command: 'python3 -m http.server 3099 --directory .',
    url: 'http://localhost:3099',
    reuseExistingServer: true,
    timeout: 5000,
  },
  use: {
    baseURL: 'http://localhost:3099',
    headless: true,
    screenshot: 'on',
    video: 'on',
    trace: 'retain-on-failure',
    viewport: { width: 1440, height: 900 },
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
  ],
});
