import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ReporterManager } from './utils/reporter/ReporterManager';

// Get environment from TEST_ENV environment variable
const testEnv = process.env.TEST_ENV || 'prod';
console.log(`Running tests with environment: ${testEnv}`);

// Import the specific configuration file if it exists
const configPath = path.join(__dirname, 'config', 'config.json');
if (fs.existsSync(configPath)) {
  try {
    const config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    console.log(`Loaded configuration file from ${configPath}`);
    
    const envConfig = config.environments[testEnv] || config.environments[config.defaultEnvironment];
    if (envConfig) {
      console.log(`Using configuration for environment: ${testEnv || config.defaultEnvironment}`);
    } else {
      console.warn(`No configuration found for environment: ${testEnv}`);
    }
  } catch (e) {
    console.error(`Error loading configuration from ${configPath}:`, e);
  }
}

/**
 * See https://playwright.dev/docs/test-configuration.
 */
export default defineConfig({
  testDir: './tests',
  /* Maximum time one test can run for */
  timeout: 240000, // 4 minutes
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: ReporterManager.getReporterConfig(),
  /* Global setup for test run */
  globalSetup: path.join(__dirname, './global-setup.ts'),
  
  /* Global teardown for test run */
  globalTeardown: path.join(__dirname, './global-teardown.ts'),
  
  /* Get headless mode from environment variable or default to true */
  use: {
    /* Base URL to use in actions like `await page.goto('/')`. */
    // baseURL: 'http://localhost:3000',

    /* Collect trace when retrying the failed test. See https://playwright.dev/docs/trace-viewer */
    trace: 'on-first-retry',
    
    /* Maximum time each action like click() can take */
    actionTimeout: 60000, // 60 seconds timeout for actions
    
    /* Run tests in headless mode by default, but allow override via env var */
    headless: process.env.HEADLESS !== 'false', 
    
    /* Set viewport size for consistent rendering */
    viewport: { width: 1280, height: 720 },
    
    /* Add launch options to improve stability */
    launchOptions: {
      slowMo: 50, // Slow down Playwright operations by 50ms
    }
  },



  /* Configure projects for major browsers */
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
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

  /* Run your local dev server before starting the tests */
  // webServer: {
  //   command: 'npm run start',
  //   url: 'http://localhost:3000',
  //   reuseExistingServer: !process.env.CI,
  // },
});
