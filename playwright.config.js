import { defineConfig, devices } from '@playwright/test';

const PORT = Number(process.env.PLAYWRIGHT_PORT || 4173);
const baseURL = `http://127.0.0.1:${PORT}`;

/** Preview server must already be running, or Playwright starts it once (no watch). */
const useExternalServer = process.env.PW_TEST_BASE_URL != null;

export default defineConfig({
  testDir: 'tests',
  testMatch: '**/*.spec.js',
  fullyParallel: false,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  globalTimeout: 8 * 60_000,
  timeout: 45_000,
  expect: { timeout: 10_000 },
  reporter: [['list']],
  use: {
    baseURL: process.env.PW_TEST_BASE_URL || baseURL,
    headless: true,
    actionTimeout: 15_000,
    navigationTimeout: 45_000,
    trace: 'off',
    screenshot: 'off',
    video: 'off',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
  webServer: useExternalServer
    ? undefined
    : {
        command: `npm run preview -- --host 127.0.0.1 --port ${PORT}`,
        url: baseURL,
        reuseExistingServer: true,
        timeout: 90_000,
        stdout: 'pipe',
        stderr: 'pipe',
      },
});
