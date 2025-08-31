import { ReportingUtils } from './ReportingUtils';
import { AllureReporter } from './AllureReporter';
import { Page, TestInfo } from '@playwright/test';

/**
 * Adapter class that uses both the ReportingUtils and AllureReporter
 * to provide comprehensive reporting capabilities
 */
export class ReportingAdapter {
  /**
   * Capture screenshot and add to reports
   * @param page - Playwright page
   * @param testInfo - Test info object
   * @param name - Screenshot name
   * @param fullPage - Whether to take a full page screenshot
   */
  static async captureScreenshot(
    page: Page, 
    testInfo: TestInfo, 
    name: string, 
    fullPage = false
  ): Promise<string> {
    // First handle Allure reporting (primary reporting mechanism)
    await AllureReporter.attachScreenshot(page, testInfo, name, fullPage);
    
    // Then handle legacy reporting mechanism
    const path = fullPage 
      ? await ReportingUtils.captureFullPageScreenshot(page, testInfo, name)
      : await ReportingUtils.captureScreenshot(page, testInfo, name);
    
    return path;
  }

  /**
   * Report a step with status
   * @param name - Step name
   * @param status - Step status
   */
  static reportStep(name: string, status: 'passed' | 'failed' = 'passed'): void {
    AllureReporter.reportStep(name, status);
  }

  /**
   * Execute a step and track it
   * @param name - Step name
   * @param callback - Step function
   * @returns Result of the callback
   */
  static async step<T>(name: string, callback: () => Promise<T>): Promise<T> {
    return AllureReporter.step(name, callback);
  }

  /**
   * Log a message to the report
   * @param message - Message to log
   * @param level - Log level
   */
  static log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    AllureReporter.log(message, level);
  }

  /**
   * Attach JSON data to the report
   * @param testInfo - Test info object
   * @param name - Attachment name
   * @param data - JSON data to attach
   */
  static async attachJson(testInfo: TestInfo, name: string, data: any): Promise<void> {
    await ReportingUtils.attachJson(testInfo, name, data);
    await AllureReporter.attachJson(testInfo, name, data);
  }

  /**
   * Attach text to the report
   * @param testInfo - Test info object
   * @param name - Attachment name
   * @param content - Text content
   */
  static async attachText(testInfo: TestInfo, name: string, content: string): Promise<void> {
    await ReportingUtils.attachText(testInfo, name, content);
  }

  /**
   * Add test metadata
   * @param testInfo - Test info object
   * @param info - Test metadata
   */
  static addTestInfo(
    testInfo: TestInfo,
    info: {
      description?: string;
      story?: string;
      severity?: string;
      issue?: string;
      testCase?: string;
      tags?: string[];
    }
  ): void {
    AllureReporter.setTestInfo(testInfo, info);
  }
}
