import { ReportingUtils } from './ReportingUtils';
import { Page, TestInfo } from '@playwright/test';

/**
 * Adapter class that uses ReportingUtils to provide reporting capabilities
 */
export class ReportingAdapter {
  /**
   * @deprecated Screenshot functionality has been removed
   */
  static async captureScreenshot(
    page: Page, 
    testInfo: TestInfo, 
    name: string, 
    fullPage = false
  ): Promise<string> {
    console.log(`Screenshot functionality removed. Requested: ${name}`);
    return "";
  }

  /**
   * Report a step with status
   * @param name - Step name
   * @param status - Step status
   */
  static reportStep(name: string, status: 'passed' | 'failed' = 'passed'): void {
    console.log(`Step ${status}: ${name}`);
  }

  /**
   * Execute a step and track it
   * @param name - Step name
   * @param callback - Step function
   * @returns Result of the callback
   */
  static async step<T>(name: string, callback: () => Promise<T>): Promise<T> {
    console.log(`Step: ${name}`);
    try {
      const result = await callback();
      console.log(`Step completed: ${name}`);
      return result;
    } catch (error) {
      console.error(`Step failed: ${name}`, error);
      throw error;
    }
  }

  /**
   * Log a message to the report
   * @param message - Message to log
   * @param level - Log level
   */
  static log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    if (level === 'info') {
      console.log(message);
    } else if (level === 'warn') {
      console.warn(message);
    } else {
      console.error(message);
    }
  }

  /**
   * Attach JSON data to the report
   * @param testInfo - Test info object
   * @param name - Attachment name
   * @param data - JSON data to attach
   */
  static async attachJson(testInfo: TestInfo, name: string, data: any): Promise<void> {
    await ReportingUtils.attachJson(testInfo, name, data);
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
    // Add annotations to testInfo
    if (info.description) {
      testInfo.annotations.push({ type: 'description', description: info.description });
    }
    
    if (info.tags && info.tags.length > 0) {
      for (const tag of info.tags) {
        testInfo.annotations.push({ type: 'tag', description: tag });
      }
    }
  }
}
