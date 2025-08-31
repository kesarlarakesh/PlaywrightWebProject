import { test } from '@playwright/test';
import { Page, TestInfo } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Utility class for enhanced Allure reporting
 * Uses Playwright's built-in test.step for step reporting
 * and TestInfo for attachments
 */
export class AllureReporter {
  /**
   * Report a step with status
   * @param name - Step name
   * @param status - Step status (passed or failed)
   */
  static reportStep(name: string, status: 'passed' | 'failed' = 'passed'): void {
    test.step(name, async () => {
      if (status === 'failed') {
        console.error(`Step failed: ${name}`);
      }
    });
  }

  /**
   * Start and track a test step
   * @param name - Step name
   * @param callback - Step function
   * @returns Result of the callback
   */
  static async step<T>(name: string, callback: () => Promise<T>): Promise<T> {
    return await test.step(name, async () => {
      try {
        const result = await callback();
        return result;
      } catch (error) {
        console.error(`Step failed: ${name}`, error);
        throw error;
      }
    });
  }

  /**
   * Attach a screenshot to the Allure report
   * @param page - Playwright page
   * @param testInfo - Test info
   * @param name - Screenshot name
   * @param fullPage - Whether to take a full page screenshot
   */
  static async attachScreenshot(
    page: Page, 
    testInfo: TestInfo, 
    name: string, 
    fullPage = false
  ): Promise<void> {
    const screenshotPath = path.join(testInfo.outputDir, `${name}.png`);
    
    try {
      // Take screenshot with reduced timeout
      const buffer = await page.screenshot({ 
        path: screenshotPath, 
        fullPage,
        timeout: fullPage ? 10000 : 5000 // Use shorter timeouts
      }).catch(async (error) => {
        console.warn(`First screenshot attempt failed: ${error.message}`);
        // If fullPage fails, try without fullPage
        if (fullPage) {
          console.log("Trying without fullPage option...");
          return await page.screenshot({ 
            path: screenshotPath, 
            fullPage: false,
            timeout: 5000
          });
        }
        throw error;
      });
      
      // Attach to test report
      await testInfo.attach(name, { 
        path: screenshotPath, 
        contentType: 'image/png' 
      });
      
      // Save directly to allure-results folder for proper Allure integration
      const allureResultsDir = path.join(process.cwd(), 'allure-results');
      if (!fs.existsSync(allureResultsDir)) {
        fs.mkdirSync(allureResultsDir, { recursive: true });
      }
      
      // Generate unique attachment name for Allure
      const uuid = testInfo.testId || Date.now().toString();
      const allureAttachmentPath = path.join(allureResultsDir, `${uuid}-${name.replace(/\s+/g, '-')}-attachment.png`);
      
      // Write buffer directly to allure-results
      fs.writeFileSync(allureAttachmentPath, buffer);
      
      // Add a special file with attachment metadata for Allure
      const metadataPath = path.join(allureResultsDir, `${uuid}-attachment.json`);
      const metadata = {
        name,
        source: path.basename(allureAttachmentPath),
        type: 'image/png'
      };
      
      fs.writeFileSync(metadataPath, JSON.stringify(metadata));
      
      console.log(`Screenshot saved for Allure: ${name}`);
    } catch (error) {
      console.error(`Failed to attach screenshot '${name}':`, error);
    }
  }

  /**
   * Log information to the test report
   * @param message - Message to log
   * @param level - Log level
   */
  static log(message: string, level: 'info' | 'warn' | 'error' = 'info'): void {
    const prefix = {
      'info': '📝 INFO: ',
      'warn': '⚠️ WARNING: ',
      'error': '❌ ERROR: '
    }[level];
    
    test.step(`Log: ${prefix}${message}`, () => {});
    
    // Also log to console
    if (level === 'info') console.log(message);
    else if (level === 'warn') console.warn(message);
    else console.error(message);
  }

  /**
   * Attach JSON data to the test report
   * @param testInfo - Test info
   * @param name - Attachment name
   * @param data - JSON data
   */
  static async attachJson(testInfo: TestInfo, name: string, data: any): Promise<void> {
    const jsonString = JSON.stringify(data, null, 2);
    const jsonPath = path.join(testInfo.outputDir, `${name}.json`);
    
    fs.writeFileSync(jsonPath, jsonString);
    
    await testInfo.attach(name, {
      path: jsonPath,
      contentType: 'application/json'
    });
  }

  /**
   * Add test metadata as annotations
   * @param testInfo - Test info object
   * @param annotations - Key-value pairs to add as annotations
   */
  static addMetadata(testInfo: TestInfo, annotations: Record<string, string>): void {
    Object.entries(annotations).forEach(([key, value]) => {
      testInfo.annotations.push({ type: key, description: value });
    });
  }

  /**
   * Set test information
   * @param testInfo - Test info
   * @param info - Object containing test metadata
   */
  static setTestInfo(
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
    const annotations: Record<string, string> = {};
    
    if (info.description) {
      annotations['description'] = info.description;
    }
    
    if (info.story) {
      annotations['story'] = info.story;
    }
    
    if (info.severity) {
      annotations['severity'] = info.severity;
    }
    
    if (info.issue) {
      annotations['issue'] = `https://your-issue-tracker.com/issues/${info.issue}`;
    }
    
    if (info.testCase) {
      annotations['testCase'] = `https://your-test-management.com/tests/${info.testCase}`;
    }
    
    if (info.tags && info.tags.length > 0) {
      annotations['tags'] = info.tags.join(', ');
    }
    
    AllureReporter.addMetadata(testInfo, annotations);
  }
}
