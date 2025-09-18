import { Page, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Enhanced utility class for reporting functionalities
 */
export class ReportingUtils {
  /**
   * @deprecated Screenshot functionality has been removed
   */
  static async captureScreenshot(page: Page, testInfo: TestInfo, name?: string): Promise<string> {
    console.log(`Screenshot functionality removed. Requested: ${name || 'unnamed'}`);
    return "";
  }
  
  /**
   * @deprecated Screenshot functionality has been removed
   */
  static async captureFullPageScreenshot(page: Page, testInfo: TestInfo, name?: string): Promise<string> {
    console.log(`Full page screenshot functionality removed. Requested: ${name || 'unnamed'}`);
    return "";
  }
  
  /**
   * Add a text attachment to the test report
   * @param testInfo - TestInfo object from playwright test
   * @param name - Name for the attachment
   * @param content - Text content to attach
   */
  static async attachText(testInfo: TestInfo, name: string, content: string): Promise<void> {
    await testInfo.attach(name, {
      body: content,
      contentType: 'text/plain'
    });
  }
  
  /**
   * Add a JSON attachment to the test report
   * @param testInfo - TestInfo object from playwright test
   * @param name - Name for the attachment
   * @param content - Object to attach as JSON
   */
  static async attachJson(testInfo: TestInfo, name: string, content: any): Promise<void> {
    await testInfo.attach(name, {
      body: JSON.stringify(content, null, 2),
      contentType: 'application/json'
    });
  }
  
  /**
   * Add an HTML attachment to the test report
   * @param testInfo - TestInfo object from playwright test
   * @param name - Name for the attachment
   * @param content - HTML content to attach
   */
  static async attachHtml(testInfo: TestInfo, name: string, content: string): Promise<void> {
    await testInfo.attach(name, {
      body: content,
      contentType: 'text/html'
    });
  }
}
