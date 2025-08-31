import { Page } from "@playwright/test";
import * as fs from "fs";
import * as path from "path";
import { ConfigManager } from "./ConfigManager";

/**
 * Utility class for common functions used across tests
 */
export class TestUtils {
  private static config = ConfigManager.getInstance();
  /**
   * Load test data from a JSON file
   * @param filePath - Path to the JSON file
   * @returns - Parsed JSON data
   */
  static loadTestData(filePath: string): any {
    try {
      const data = fs.readFileSync(filePath, "utf-8");
      return JSON.parse(data);
    } catch (error) {
      console.error(`Error loading test data from ${filePath}:`, error);
      throw error;
    }
  }
  
  /**
   * Format a date in dd/mm/yyyy format
   * @param date - Date to format
   * @returns - Formatted date string
   */
  static formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, "0");
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }
  
  /**
   * Calculate future date
   * @param daysFromNow - Number of days from today
   * @returns - Future date
   */
  static getFutureDate(daysFromNow: number): Date {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + daysFromNow);
    return futureDate;
  }
  
  /**
   * Generate a random number between min and max (inclusive)
   * @param min - Minimum value
   * @param max - Maximum value
   * @returns - Random integer
   */
  static getRandomInt(min: number, max: number): number {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min + 1)) + min;
  }
  
  /**
   * Wait for a specific element with retry logic
   * @param page - Playwright page
   * @param selector - CSS selector for the element
   * @param maxRetries - Maximum number of retry attempts
   * @param timeout - Timeout for each attempt in ms
   */
  static async waitForElementWithRetry(
    page: Page, 
    selector: string, 
    maxRetries = 3, 
    timeout = 10000
  ): Promise<void> {
    let retryCount = 0;
    
    while (retryCount < maxRetries) {
      try {
        await page.waitForSelector(selector, { state: "visible", timeout });
        return;
      } catch (error) {
        retryCount++;
        console.log(`Retry ${retryCount}/${maxRetries} waiting for element: ${selector}`);
        
        if (retryCount === maxRetries) {
          throw new Error(`Element ${selector} not found after ${maxRetries} retries`);
        }
        
        await page.waitForTimeout(2000); // Wait before retrying
      }
    }
  }
  
  /**
   * Take screenshot with unique name and save directly to allure-results
   * @param page - Playwright page
   * @param name - Base name for screenshot
   * @param location - Optional location/name suffix
   */
  static async takeScreenshot(page: Page, name: string, location?: string): Promise<void> {
    const timestamp = new Date().getTime();
    const fileName = location ? 
      `${timestamp}-${name}-${location}.png` : 
      `${timestamp}-${name}.png`;
    
    // Use allure-results directory for screenshots
    const screenshotPath = 'allure-results';
    
    // Create directory if it doesn't exist
    if (!fs.existsSync(screenshotPath)) {
      fs.mkdirSync(screenshotPath, { recursive: true });
    }
      
    // Take the screenshot
    await page.screenshot({
      path: path.join(screenshotPath, fileName)
    });
    
    // Create attachment metadata for Allure
    const attachmentJson = {
      name: location ? `${name} (${location})` : name,
      source: fileName,
      type: 'image/png'
    };
    
    fs.writeFileSync(
      path.join(screenshotPath, `${timestamp}-attachment.json`),
      JSON.stringify(attachmentJson)
    );
    
    console.log(`Screenshot saved to Allure results: ${fileName}`);
  }
  
  /**
   * Generate random test data for form filling
   * @returns Object containing random test data
   */
  static generateRandomTestData(): { firstName: string; lastName: string; email: string; phone: string } {
    const randomId = Math.floor(Math.random() * 10000);
    return {
      firstName: `Test${randomId}`,
      lastName: `User${randomId}`,
      email: `test${randomId}@example.com`,
      phone: `555${randomId.toString().padStart(7, '0')}`
    };
  }
}
