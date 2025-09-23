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
  
  // Check if we're using LambdaTest
  const useLambdaTest = process.env.USE_LAMBDATEST === 'true';
  if (useLambdaTest) {
    console.log('Setting up LambdaTest execution environment');
    
    // Validate LambdaTest credentials
    if (!process.env.LT_USERNAME || !process.env.LT_ACCESS_KEY) {
      console.warn('LambdaTest credentials not found! Please set LT_USERNAME and LT_ACCESS_KEY environment variables.');
    } else {
      console.log(`LambdaTest configuration verified for user: ${process.env.LT_USERNAME}`);
    }
  }
  
  return;
}

export default globalSetup;
