/**
 * LambdaTest Configuration Constants
 * 
 * This file contains all LambdaTest-related constants to improve maintainability
 * and reduce the risk of typos in configuration strings.
 */

// Environment Variables
export const LAMBDATEST_ENV_VARS = {
  USE_LAMBDATEST: 'USE_LAMBDATEST',
  USERNAME: 'LT_USERNAME',
  ACCESS_KEY: 'LT_ACCESS_KEY',
} as const;

// LambdaTest Status Commands
export const LAMBDATEST_STATUS = {
  PASSED: 'passed',
  FAILED: 'failed',
} as const;

// LambdaTest JavaScript Commands
export const LAMBDATEST_COMMANDS = {
  STATUS_SCRIPT_PREFIX: 'lambda-status=',
  EXECUTE_SCRIPT_FUNCTION: 'executeScript',
  LAMBDATEST_FUNCTION: 'lambdatest',
  LAMBDA_OBJECT: 'lambda',
} as const;

// LambdaTest WebSocket Configuration
export const LAMBDATEST_CONFIG = {
  WS_ENDPOINT_BASE: 'wss://cdp.lambdatest.com/playwright',
  BROWSER_NAME: 'Chrome',
  BROWSER_VERSION: 'latest',
} as const;

// LambdaTest Platform Names
export const LAMBDATEST_PLATFORMS = {
  WINDOWS_10: 'Windows 10',
  MACOS_VENTURA: 'MacOS Ventura',
} as const;

// LambdaTest Test Names
export const LAMBDATEST_TEST_NAMES = {
  WINDOWS_CHROME: 'Hotel Booking E2E - Windows Chrome',
  MACOS_CHROME: 'Hotel Booking E2E - MacOS Chrome',
} as const;

// LambdaTest Project Configuration
export const LAMBDATEST_PROJECT_CONFIG = {
  PROJECT_NAME: 'PlaywrightWebProject',
  SMART_UI_PROJECT: 'PlaywrightWebProject',
  NETWORK: true,
  VIDEO: true,
  CONSOLE: true,
  TUNNEL: false,
} as const;

// Platform Identifier for Reporting
export const PLATFORM_IDENTIFIERS = {
  LAMBDATEST: 'lambdatest',
  LOCAL: 'local',
  LAMBDATEST_DISPLAY: 'LambdaTest',
  LOCAL_DISPLAY: 'Local',
} as const;

// LambdaTest Build Name Components
export const BUILD_NAME_CONFIG = {
  PREFIX: 'PW',
  SEPARATOR: '-',
  DEFAULT_BRANCH: 'local',
  DEFAULT_SHA: 'dev',
  LOCAL_RUN_PREFIX: 'local',
} as const;

export type LambdaTestStatus = typeof LAMBDATEST_STATUS[keyof typeof LAMBDATEST_STATUS];
export type LambdaTestPlatform = typeof LAMBDATEST_PLATFORMS[keyof typeof LAMBDATEST_PLATFORMS];