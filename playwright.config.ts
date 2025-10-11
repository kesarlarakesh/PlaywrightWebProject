import { defineConfig, devices } from '@playwright/test';
import fs from 'fs';
import path from 'path';
import { ReporterManager } from './utils/reporter/ReporterManager';
import {
  LAMBDATEST_ENV_VARS,
  LAMBDATEST_CONFIG,
  LAMBDATEST_PLATFORMS,
  LAMBDATEST_TEST_NAMES,
  LAMBDATEST_PROJECT_CONFIG,
  BUILD_NAME_CONFIG
} from './utils/constants/LambdaTestConstants';

/**
 * Configure base directories - make them configurable through environment variables
 * This allows the configuration to be flexible and support different project structures
 */
const PROJECT_ROOT = process.env.PLAYWRIGHT_PROJECT_ROOT || __dirname;
const TEST_DIR = process.env.PLAYWRIGHT_TEST_DIR || 'tests';
const CONFIG_DIR = process.env.PLAYWRIGHT_CONFIG_DIR || 'config';
const UTILS_DIR = process.env.PLAYWRIGHT_UTILS_DIR || 'utils';
const GLOBAL_SETUP_FILE = process.env.PLAYWRIGHT_GLOBAL_SETUP || 'global-setup.ts';

console.log(`📁 Project Configuration:`);
console.log(`   Root: ${PROJECT_ROOT}`);
console.log(`   Tests: ${path.join(PROJECT_ROOT, TEST_DIR)}`);
console.log(`   Config: ${path.join(PROJECT_ROOT, CONFIG_DIR)}`);
console.log(`   Global Setup: ${path.join(PROJECT_ROOT, GLOBAL_SETUP_FILE)}`);

// Validate that required directories exist
const testDirPath = path.join(PROJECT_ROOT, TEST_DIR);
if (!fs.existsSync(testDirPath)) {
  console.warn(`⚠️  Test directory does not exist: ${testDirPath}`);
}

const globalSetupPath = path.join(PROJECT_ROOT, GLOBAL_SETUP_FILE);
if (!fs.existsSync(globalSetupPath)) {
  console.warn(`⚠️  Global setup file does not exist: ${globalSetupPath}`);
}

// Get environment from TEST_ENV environment variable
const testEnv = process.env.TEST_ENV || 'prod';
console.log(`🌍 Running tests with environment: ${testEnv}`);

// Check if we should use LambdaTest
const useLambdaTest = process.env[LAMBDATEST_ENV_VARS.USE_LAMBDATEST] === 'true';
console.log(`☁️  Using LambdaTest: ${useLambdaTest}`);

// Set up LambdaTest configuration
const LT_USERNAME = process.env[LAMBDATEST_ENV_VARS.USERNAME] || '';
const LT_ACCESS_KEY = process.env[LAMBDATEST_ENV_VARS.ACCESS_KEY] || '';

// Generate dynamic build name for LambdaTest
const generateBuildName = () => {
  const now = new Date();
  const timestamp = now.toISOString().replace(/[:.]/g, '-').substring(0, 19); // YYYY-MM-DDTHH-MM-SS
  const gitBranch = process.env.GITHUB_REF_NAME || process.env.BRANCH_NAME || BUILD_NAME_CONFIG.DEFAULT_BRANCH;
  const gitSha = process.env.GITHUB_SHA ? process.env.GITHUB_SHA.substring(0, 7) : BUILD_NAME_CONFIG.DEFAULT_SHA;
  const runId = process.env.GITHUB_RUN_ID || `${BUILD_NAME_CONFIG.LOCAL_RUN_PREFIX}${BUILD_NAME_CONFIG.SEPARATOR}${Math.floor(Math.random() * 10000)}`;
  const environment = testEnv.toUpperCase();
  
  // Format: PW-ENV-BRANCH-SHA-RUNID-TIMESTAMP
  return `${BUILD_NAME_CONFIG.PREFIX}${BUILD_NAME_CONFIG.SEPARATOR}${environment}${BUILD_NAME_CONFIG.SEPARATOR}${gitBranch}${BUILD_NAME_CONFIG.SEPARATOR}${gitSha}${BUILD_NAME_CONFIG.SEPARATOR}${runId}${BUILD_NAME_CONFIG.SEPARATOR}${timestamp}`;
};

const buildName = useLambdaTest ? generateBuildName() : '';
if (useLambdaTest) {
  console.log(`LambdaTest Build Name: ${buildName}`);
}

// Import the specific configuration file if it exists
const configPath = path.join(PROJECT_ROOT, CONFIG_DIR, 'config.json');
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
  testDir: path.join(PROJECT_ROOT, TEST_DIR),
  /* Maximum time one test can run for */
  timeout: 240000, // 4 minutes
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 1 : 0,
  /* Opt out of parallel tests on CI. */
  workers: process.env.CI ? 1 : undefined,
  /* Reporter to use. See https://playwright.dev/docs/test-reporters */
  reporter: ReporterManager.getReporterConfig(),
  /* Global setup for test run */
  globalSetup: path.join(PROJECT_ROOT, GLOBAL_SETUP_FILE),
  
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
  projects: useLambdaTest ? [
    // LambdaTest Cloud Configurations
    {
      name: `chrome:latest:${LAMBDATEST_PLATFORMS.WINDOWS_10}@lambda`,
      use: {
        connectOptions: {
          wsEndpoint: `${LAMBDATEST_CONFIG.WS_ENDPOINT_BASE}?capabilities={"browserName":"${LAMBDATEST_CONFIG.BROWSER_NAME}","browserVersion":"${LAMBDATEST_CONFIG.BROWSER_VERSION}","LT:Options":{"platform":"${LAMBDATEST_PLATFORMS.WINDOWS_10}","build":"${buildName}","name":"${LAMBDATEST_TEST_NAMES.WINDOWS_CHROME}","project":"${LAMBDATEST_PROJECT_CONFIG.PROJECT_NAME}","user":"${encodeURIComponent(LT_USERNAME)}","accessKey":"${encodeURIComponent(LT_ACCESS_KEY)}","network":${LAMBDATEST_PROJECT_CONFIG.NETWORK},"video":${LAMBDATEST_PROJECT_CONFIG.VIDEO},"console":${LAMBDATEST_PROJECT_CONFIG.CONSOLE},"tunnel":${LAMBDATEST_PROJECT_CONFIG.TUNNEL},"smartUI.project":"${LAMBDATEST_PROJECT_CONFIG.SMART_UI_PROJECT}"}}`,
        },
      },
    },
    {
      name: `chrome:latest:${LAMBDATEST_PLATFORMS.MACOS_VENTURA}@lambda`,
      use: {
        connectOptions: {
          wsEndpoint: `${LAMBDATEST_CONFIG.WS_ENDPOINT_BASE}?capabilities={"browserName":"${LAMBDATEST_CONFIG.BROWSER_NAME}","browserVersion":"${LAMBDATEST_CONFIG.BROWSER_VERSION}","LT:Options":{"platform":"${LAMBDATEST_PLATFORMS.MACOS_VENTURA}","build":"${buildName}","name":"${LAMBDATEST_TEST_NAMES.MACOS_CHROME}","project":"${LAMBDATEST_PROJECT_CONFIG.PROJECT_NAME}","user":"${encodeURIComponent(LT_USERNAME)}","accessKey":"${encodeURIComponent(LT_ACCESS_KEY)}","network":${LAMBDATEST_PROJECT_CONFIG.NETWORK},"video":${LAMBDATEST_PROJECT_CONFIG.VIDEO},"console":${LAMBDATEST_PROJECT_CONFIG.CONSOLE},"tunnel":${LAMBDATEST_PROJECT_CONFIG.TUNNEL},"smartUI.project":"${LAMBDATEST_PROJECT_CONFIG.SMART_UI_PROJECT}"}}`,
        },
      },
    }
  ] : [
    // Local Browser Configurations
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    
    // Uncomment these for additional browsers when needed
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
