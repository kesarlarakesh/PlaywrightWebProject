import { Page, TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Enhanced utility class for reporting functionalities
 */
export class ReportingUtils {
  /**
   * Take a screenshot and attach it to the test report
   * @param page - Playwright page
   * @param testInfo - TestInfo object from playwright test
   * @param name - Optional name for the screenshot
   * @returns - Path to the captured screenshot
   */
  static async captureScreenshot(page: Page, testInfo: TestInfo, name?: string): Promise<string> {
    const screenshotName = name || `screenshot-${Date.now()}`;
    const screenshotPath = path.join(testInfo.outputDir, `${screenshotName}.png`);
    
    // Ensure directory exists
    const screenshotDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    // Take screenshot
    await page.screenshot({ path: screenshotPath, fullPage: false });
    
    // Attach to test report
    await testInfo.attach(screenshotName, {
      path: screenshotPath,
      contentType: 'image/png'
    });
    
    return screenshotPath;
  }
  
  /**
   * Take a full page screenshot and attach it to the test report
   * @param page - Playwright page
   * @param testInfo - TestInfo object from playwright test
   * @param name - Optional name for the screenshot
   * @returns - Path to the captured screenshot
   */
  static async captureFullPageScreenshot(page: Page, testInfo: TestInfo, name?: string): Promise<string> {
    const screenshotName = name || `fullpage-${Date.now()}`;
    const screenshotPath = path.join(testInfo.outputDir, `${screenshotName}.png`);
    
    // Ensure directory exists
    const screenshotDir = path.dirname(screenshotPath);
    if (!fs.existsSync(screenshotDir)) {
      fs.mkdirSync(screenshotDir, { recursive: true });
    }
    
    try {
      // First try with fullPage set to true
      await page.screenshot({ path: screenshotPath, fullPage: true, timeout: 10000 });
    } catch (error) {
      console.warn(`Full page screenshot failed, falling back to viewport screenshot: ${error instanceof Error ? error.message : 'Unknown error'}`);
      try {
        // Fall back to viewport screenshot if full page fails
        await page.screenshot({ path: screenshotPath, fullPage: false, timeout: 5000 });
      } catch (fallbackError) {
        console.error(`Both screenshot methods failed: ${fallbackError instanceof Error ? fallbackError.message : 'Unknown error'}`);
        // Create a text file explaining the error instead of failing
        fs.writeFileSync(
          screenshotPath.replace('.png', '-error.txt'),
          `Screenshot failed: ${new Date().toISOString()}\nError: ${error instanceof Error ? error.message : 'Unknown error'}`
        );
        // Don't fail the test because of screenshot issues
        return screenshotPath;
      }
    }
    
    // Attach to test report if the screenshot was created
    if (fs.existsSync(screenshotPath)) {
      await testInfo.attach(screenshotName, {
        path: screenshotPath,
        contentType: 'image/png'
      }).catch(attachError => {
        console.warn(`Failed to attach screenshot: ${attachError instanceof Error ? attachError.message : 'Unknown error'}`);
      });
    }
    
    return screenshotPath;
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
