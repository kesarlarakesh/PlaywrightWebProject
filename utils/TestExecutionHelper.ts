import { TestInfo } from '@playwright/test';
import { ConfigManager } from './ConfigManager';
import { ReportingUtils } from './ReportingUtils';

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
  static async initializeTest(testInfo: TestInfo, testData: any): Promise<void> {
    // Set up global test state
    this.testStartTime = Date.now();
    this.testStatus = this.createTestStatus();
    
    // Store test data for later use
    (testInfo as any).testData = testData;
    
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
    testData: any,
    page: any
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
      platform: process.env.USE_LAMBDATEST === 'true' ? 'LambdaTest' : 'Local',
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
        console.warn(`Warning: Could not take success screenshot: ${screenshotError.message}`);
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
    // Handle both signatures: (stepName, testStatus, stepFunction) and (stepName, stepFunction)
    let targetTestStatus: { success: boolean; failureReason: string; currentStep: string };
    let targetStepFunction: () => Promise<T>;
    
    if (typeof testStatusOrFunction === 'function') {
      // Using global state: executeStep(stepName, stepFunction)
      targetTestStatus = this.testStatus;
      targetStepFunction = testStatusOrFunction;
    } else {
      // Using provided testStatus: executeStep(stepName, testStatus, stepFunction)
      targetTestStatus = testStatusOrFunction;
      targetStepFunction = stepFunction!;
    }
    
    targetTestStatus.currentStep = stepName;
    try {
      return await targetStepFunction();
    } catch (error: any) {
      targetTestStatus.failureReason = `Failed at step '${stepName}': ${error.message}`;
      console.error(targetTestStatus.failureReason);
      throw error;
    }
  }

  /**
   * Take screenshot on failure with standardized naming
   */
  static async takeFailureScreenshot(testInfo: TestInfo, page: any): Promise<void> {
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
      console.warn(`Warning: Could not take failure screenshot: ${screenshotError.message}`);
      // Attach error details instead of screenshot
      await testInfo.attach('screenshot-error', {
        body: `Screenshot capture failed: ${screenshotError.message}`,
        contentType: 'text/plain'
      });
    }
  }

  // ========== GLOBAL HOOKS METHODS ==========

  /**
   * Global hook: Initialize test with automatic reporting setup (beforeEach equivalent)
   */
  static async beforeEach(testInfo: TestInfo, testData: any = {}): Promise<void> {
    await this.initializeTest(testInfo, testData);
  }

  /**
   * Global hook: Finalize test with automatic reporting (afterEach equivalent)
   */
  static async afterEach(testInfo: TestInfo, page: any, testData: any = {}): Promise<void> {
    await this.finalizeTest(testInfo, null, null, testData, page);
  }

  /**
   * Global hook: Handle test failure with screenshot (onFailure equivalent)
   */
  static async onFailure(testInfo: TestInfo, page: any): Promise<void> {
    await this.takeFailureScreenshot(testInfo, page);
  }

  /**
   * Check if page is valid and ready for operations
   */
  private static isPageValid(page: any): boolean {
    try {
      return page && typeof page.isClosed === 'function' && !page.isClosed();
    } catch (error) {
      return false;
    }
  }
}