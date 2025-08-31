/**
 * Global setup file for Playwright tests
 */
import path from 'path';
import { FullConfig } from '@playwright/test';

/**
 * Global setup function
 */
async function globalSetup(config: FullConfig) {
  console.log(`Running tests with environment: ${process.env.TEST_ENV || 'prod'}`);
  console.log(`Running tests in headless mode: ${process.env.HEADLESS !== 'false'}`);
  return;
}

export default globalSetup;
