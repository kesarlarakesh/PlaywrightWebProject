import { TestInfo, Page } from '@playwright/test';
import { ConfigManager } from './ConfigManager';
import { ReportingUtils } from './ReportingUtils';
import {
  LAMBDATEST_ENV_VARS,
  LAMBDATEST_STATUS,
  LAMBDATEST_COMMANDS,
  PLATFORM_IDENTIFIERS,
  type LambdaTestStatus
} from './constants/LambdaTestConstants';
import { ERROR_MESSAGES, DYNAMIC_ERROR_GENERATORS, ERROR_UTILS } from './constants/ErrorMessageConstants';

// Extend TestInfo interface to include testData property
declare module '@playwright/test' {
  interface TestInfo {
    testData?: Record<string, any>;
  }
}

/**
 * Comprehensive helper class to handle test execution lifecycle and reporting
 * Combines both individual test utilities and global hooks functionality
 */
export class TestExecutionHelper {
  // Static properties for global test state management
  private static testStartTime: number;
  private static testStatus: { success: boolean; failureReason: string; currentStep: string };

  /**
   * Initialize test with metadata and data attachment (Hook: beforeEach)
   */
  static async initializeTest(testInfo: TestInfo, testData: Record<string, any>): Promise<void> {
    // Set up global test state
    this.testStartTime = Date.now();
    this.testStatus = this.createTestStatus();
    
    // Store test data for later use (now type-safe)
    testInfo.testData = testData;
    
    // Attach test metadata with timestamp information
    await ReportingUtils.attachTestMetadata(testInfo);
    
    // Attach test data to report
    await ReportingUtils.attachJson(testInfo, 'Test Data', testData);
  }

  /**
   * Finalize test with summary, screenshots, and reporting (Hook: afterEach)
   */
  static async finalizeTest(
    testInfo: TestInfo, 
    testStatus: { success: boolean; failureReason: string; currentStep: string } | null = null, 
    startTime: number | null = null,
    testData: Record<string, any>,
    page: Page | null
  ): Promise<void> {
    const config = ConfigManager.getInstance();
    
    // Use provided parameters or fall back to global state
    const finalTestStatus = testStatus || this.testStatus;
    const finalStartTime = startTime || this.testStartTime;
    
    // Mark as successful if no errors occurred and not explicitly set
    if (!finalTestStatus.failureReason && !finalTestStatus.success) {
      finalTestStatus.success = true;
      finalTestStatus.currentStep = 'Test completed successfully';
    }
    
    // Mark LambdaTest status if this is a LambdaTest run
    if (page && this.isLambdaTestRun()) {
      await this.markLambdaTestStatus(page, finalTestStatus.success);
    }
    
    // Calculate test duration
    const endTime = Date.now();
    const testDuration = endTime - finalStartTime;
    const durationSeconds = (testDuration / 1000).toFixed(1);

    // Create test summary
    const testSummary = {
      name: testInfo.title,
      status: finalTestStatus.success ? 'PASSED' : 'FAILED',
      failureReason: finalTestStatus.failureReason,
      duration: `${durationSeconds} seconds`,
      durationMs: testDuration,
      currentStep: finalTestStatus.currentStep,
      timestamp: new Date().toISOString(),
      environment: config.getEnvironment(),
      platform: process.env[LAMBDATEST_ENV_VARS.USE_LAMBDATEST] === 'true' ? PLATFORM_IDENTIFIERS.LAMBDATEST_DISPLAY : PLATFORM_IDENTIFIERS.LOCAL_DISPLAY,
      browser: testInfo.project.name,
      testData: testData
    };
    
    // Save test summary
    await ReportingUtils.saveTestSummary(testSummary);
    
    // Attach summary to report
    await ReportingUtils.attachJson(testInfo, 'Test Summary', testSummary);
    
    // Create final screenshot for successful tests
    if (finalTestStatus.success && page) {
      try {
        // Check if page is still valid
        if (this.isPageValid(page)) {
          const screenshotName = ReportingUtils.generateTimestampedScreenshotName(testInfo, 'final_success');
          await testInfo.attach(screenshotName, {
            body: await page.screenshot({ fullPage: true }),
            contentType: 'image/png'
          });
        } else {
          console.log('Page is closed, skipping success screenshot');
        }
      } catch (screenshotError: any) {
        console.warn(ERROR_UTILS.formatWarningMessage('Could not take success screenshot', screenshotError));
        // Don't throw error for screenshot failures in finalization
      }
    }
    
    // Log test results to console
    console.log(`\nTest Results:`);
    console.log(`Status: ${finalTestStatus.success ? 'PASSED ✅' : 'FAILED ❌'}`);
    if (!finalTestStatus.success) {
      console.log(`Failure: ${finalTestStatus.failureReason}`);
    }
    console.log(`Duration: ${durationSeconds} seconds`);
    console.log(`Current Step: ${finalTestStatus.currentStep}`);
    console.log('------------------------\n');
  }

  /**
   * Create a standardized test status tracker
   */
  static createTestStatus(): { success: boolean; failureReason: string; currentStep: string } {
    return {
      success: false,
      failureReason: '',
      currentStep: ''
    };
  }

  /**
   * Handle test step execution with error tracking
   * Can be used with global state or provided testStatus
   */
  static async executeStep<T>(
    stepName: string,
    testStatusOrFunction: { success: boolean; failureReason: string; currentStep: string } | (() => Promise<T>),
    stepFunction?: () => Promise<T>
  ): Promise<T> {
    // Handle both signatures: `executeStep(stepName, testStatus, stepFunction)` and `executeStep(stepName, stepFunction)`
    let targetTestStatus: { success: boolean; failureReason: string; currentStep: string };
    let targetStepFunction: () => Promise<T>;
    
    if (typeof testStatusOrFunction === 'function') {
      // Using global state: `executeStep(stepName, stepFunction)`
      targetTestStatus = this.testStatus;
      targetStepFunction = testStatusOrFunction;
    } else {
      // Using provided testStatus: `executeStep(stepName, testStatus, stepFunction)`
      targetTestStatus = testStatusOrFunction;
      
      // Validate that stepFunction is provided when using the three-parameter signature
      if (!stepFunction) {
        throw new Error(DYNAMIC_ERROR_GENERATORS.stepFunctionRequired(TestExecutionHelper.executeStep));
      }
      
      targetStepFunction = stepFunction;
    }
    
    targetTestStatus.currentStep = stepName;
    try {
      return await targetStepFunction();
    } catch (error: any) {
      const errorMessage = ERROR_UTILS.extractErrorMessage(error);
      targetTestStatus.failureReason = `Failed at step '${stepName}': ${errorMessage}`;
      console.error(targetTestStatus.failureReason);
      throw error;
    }
  }

  /**
   * Execute optional/non-critical steps that should not fail the test
   * Logs warnings on failure but continues test execution
   */
  static async executeOptionalStep<T>(
    stepName: string,
    testStatusOrFunction: { success: boolean; failureReason: string; currentStep: string } | (() => Promise<T>),
    stepFunction?: () => Promise<T>,
    defaultValue?: T
  ): Promise<T | undefined> {
    // Handle both signatures similar to `executeStep()`
    let targetTestStatus: { success: boolean; failureReason: string; currentStep: string };
    let targetStepFunction: () => Promise<T>;
    
    if (typeof testStatusOrFunction === 'function') {
      // Using global state: `executeOptionalStep(stepName, stepFunction)`
      targetTestStatus = this.testStatus;
      targetStepFunction = testStatusOrFunction;
    } else {
      // Using provided testStatus: `executeOptionalStep(stepName, testStatus, stepFunction)`
      targetTestStatus = testStatusOrFunction;
      
      // Validate that stepFunction is provided when using the three-parameter signature
      if (!stepFunction) {
        throw new Error(DYNAMIC_ERROR_GENERATORS.stepFunctionRequired(TestExecutionHelper.executeOptionalStep));
      }
      
      targetStepFunction = stepFunction;
    }
    
    targetTestStatus.currentStep = stepName;
    try {
      console.log(`🔄 Attempting optional step: ${stepName}`);
      const result = await targetStepFunction();
      console.log(`✅ Optional step completed successfully: ${stepName}`);
      return result;
    } catch (error: any) {
      // For optional steps, log warning but don't fail the test
      const errorMessage = ERROR_UTILS.extractErrorMessage(error);
      const warningMessage = `⚠️  Optional step '${stepName}' failed: ${errorMessage}`;
      console.warn(warningMessage);
      
      // Don't update test status failure reason for optional steps
      // but update current step for tracking
      return defaultValue;
    }
  }

  /**
   * Take screenshot on failure with standardized naming
   */
  static async takeFailureScreenshot(testInfo: TestInfo, page: Page | null): Promise<void> {
    try {
      // Check if page exists and is valid
      if (this.isPageValid(page)) {
        await testInfo.attach('failure-screenshot', {
          body: await page.screenshot({ fullPage: true }),
          contentType: 'image/png'
        });
      } else {
        console.log('Page is not available or closed, skipping failure screenshot');
        // Attach a text note instead of screenshot
        await testInfo.attach('failure-note', {
          body: 'Screenshot could not be captured - page was closed or unavailable',
          contentType: 'text/plain'
        });
      }
    } catch (screenshotError: any) {
      const errorMessage = ERROR_UTILS.extractErrorMessage(screenshotError);
      console.warn(`Warning: Could not take failure screenshot: ${errorMessage}`);
      // Attach error details instead of screenshot
      await testInfo.attach('screenshot-error', {
        body: `Screenshot capture failed: ${errorMessage}`,
        contentType: 'text/plain'
      });
    }
  }

  // ========== GLOBAL HOOKS METHODS ==========

  /**
   * Global hook: Initialize test with automatic reporting setup (beforeEach equivalent)
   */
  static async beforeEach(testInfo: TestInfo, testData: Record<string, any> = {}): Promise<void> {
    await this.initializeTest(testInfo, testData);
  }

  /**
   * Global hook: Finalize test with automatic reporting (afterEach equivalent)
   */
  static async afterEach(testInfo: TestInfo, page: Page | null, testData: Record<string, any> = {}): Promise<void> {
    // Mark LambdaTest status before finalizing test
    if (page && this.isLambdaTestRun()) {
      await this.markLambdaTestStatus(page, this.testStatus.success);
    }
    
    await this.finalizeTest(testInfo, null, null, testData, page);
  }

  /**
   * Global hook: Handle test failure with screenshot (onFailure equivalent)
   */
  static async onFailure(testInfo: TestInfo, page: Page | null): Promise<void> {
    // Mark test as failed in LambdaTest before taking screenshot
    if (page && this.isLambdaTestRun()) {
      await this.markLambdaTestStatus(page, false);
    }
    
    await this.takeFailureScreenshot(testInfo, page);
  }

  /**
   * Check if current test run is on LambdaTest
   */
  private static isLambdaTestRun(): boolean {
    return process.env[LAMBDATEST_ENV_VARS.USE_LAMBDATEST] === 'true';
  }

  /**
   * Mark test status in LambdaTest using JavaScript executor
   */
  private static async markLambdaTestStatus(page: Page, passed: boolean): Promise<void> {
    try {
      if (this.isPageValid(page)) {
        const status: LambdaTestStatus = passed ? LAMBDATEST_STATUS.PASSED : LAMBDATEST_STATUS.FAILED;
        
        // Set the lambda object status
        await page.evaluate((status: string) => {
          const lambdaObj = LAMBDATEST_COMMANDS.LAMBDA_OBJECT;
          (window as any)[lambdaObj] = (window as any)[lambdaObj] || {};
          (window as any)[lambdaObj].status = status;
        }, status);
        
        // Execute the LambdaTest status command
        await page.evaluate((statusValue: string) => {
          const lambdaObj = 'lambda';
          const statusPrefix = 'lambda-status=';
          const executeScriptFunc = 'executeScript';
          const lambdatestFunc = 'lambdatest';
          
          if (typeof (window as any)[lambdaObj] !== 'undefined') {
            try {
              // Use LambdaTest's JavaScript executor to mark status
              const script = `${statusPrefix}${statusValue}`;
              if ((window as any)[executeScriptFunc]) {
                (window as any)[executeScriptFunc](script);
              } else if ((window as any)[lambdatestFunc]) {
                (window as any)[lambdatestFunc][executeScriptFunc](script);
              }
            } catch (error) {
              console.log(`LambdaTest status marking failed: ${error}`);
            }
          }
        }, status);
        
        console.log(`✅ LambdaTest status marked as: ${status.toUpperCase()}`);
      }
    } catch (error: any) {
      console.warn(ERROR_UTILS.formatWarningMessage('Could not mark LambdaTest status', error));
    }
  }

  /**
   * Check if page is valid and ready for operations
   */
  private static isPageValid(page: Page | null): page is Page {
    try {
      return page !== null && typeof page.isClosed === 'function' && !page.isClosed();
    } catch (error) {
      return false;
    }
  }

  // ========== LAMBDATEST INTEGRATION ==========

  /**
   * Explicitly mark test status in LambdaTest (can be called during test execution)
   */
  static async markTestStatus(page: Page, passed: boolean): Promise<void> {
    if (this.isLambdaTestRun()) {
      await this.markLambdaTestStatus(page, passed);
    } else {
      console.log('Not running on LambdaTest, skipping status marking');
    }
  }

  /**
   * Mark test as passed in LambdaTest
   */
  static async markTestPassed(page: Page): Promise<void> {
    await this.markTestStatus(page, true);
  }

  /**
   * Mark test as failed in LambdaTest
   */
  static async markTestFailed(page: Page): Promise<void> {
    await this.markTestStatus(page, false);
  }
}