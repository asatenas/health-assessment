import { defineConfig, devices } from '@playwright/test';

/**
 * Read environment variables from file.
 * https://github.com/motdotla/dotenv
 */
import { config } from 'dotenv';

config({
  path: '.env.local',
});

/* Use process.env.PORT by default and fallback to port 3000 */
const PORT = process.env.PORT || 3000;

/**
 * Set webServer.url and use.baseURL with the location
 * of the WebServer respecting the correct set port
 */
const localURL = `http://localhost:${PORT}`;

/**
 * Smoke tests can target a deployed URL instead of the local dev server.
 * When SMOKE_BASE_URL is set, the local webServer is not started.
 */
const smokeBaseURL = process.env.SMOKE_BASE_URL;
const baseURL = smokeBaseURL || localURL;

/* Optional: Vercel "Protection Bypass for Automation" secret for previews */
const smokeBypassSecret = process.env.SMOKE_VERCEL_BYPASS_SECRET;

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 2 : 8,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: 'html',
  /* Shared settings for all the projects below. See https://playwright.dev/docs/api/class-testoptions. */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    baseURL,

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'retain-on-failure',
  },

  /* Configure global timeout for each test */
  timeout: 240 * 1000, // 120 seconds
  expect: {
    timeout: 240 * 1000,
  },

  /* Configure projects */
  projects: [
    {
      name: 'e2e',
      testMatch: /e2e\/.*.test.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'routes',
      testMatch: /routes\/.*.test.ts/,
      use: {
        ...devices['Desktop Chrome'],
      },
    },
    {
      name: 'smoke',
      testMatch: /smoke\/.*\.spec\.ts/,
      use: {
        ...devices['Desktop Chrome'],
        ...(smokeBypassSecret && {
          extraHTTPHeaders: {
            'x-vercel-protection-bypass': smokeBypassSecret,
            'x-vercel-set-bypass-cookie': 'true',
          },
        }),
      },
    },

    // {
    //   name: 'firefox',
    //   use: { ...devices['Desktop Firefox'] },
    // },

    // {
    //   name: 'webkit',
    //   use: { ...devices['Desktop Safari'] },
    // },

    /* Test against mobile viewports. */
    // {
    //   name: 'Mobile Chrome',
    //   use: { ...devices['Pixel 5'] },
    // },
    // {
    //   name: 'Mobile Safari',
    //   use: { ...devices['iPhone 12'] },
    // },

    /* Test against branded browsers. */
    // {
    //   name: 'Microsoft Edge',
    //   use: { ...devices['Desktop Edge'], channel: 'msedge' },
    // },
    // {
    //   name: 'Google Chrome',
    //   use: { ...devices['Desktop Chrome'], channel: 'chrome' },
    // },
  ],

  /* Run your local dev server before starting the tests, unless targeting a deployed URL */
  webServer: smokeBaseURL
    ? undefined
    : {
        command: 'pnpm dev',
        url: `${localURL}/ping`,
        timeout: 120 * 1000,
        reuseExistingServer: !process.env.CI,
      },
});
