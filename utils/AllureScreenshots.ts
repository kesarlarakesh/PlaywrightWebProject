import { test } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Helper class to add screenshots directly to the Allure report
 * This is a simpler approach that works reliably with Allure
 */
export class AllureScreenshots {
  /**
   * Take a screenshot and add it to the Allure report
   * @param name - Name of the screenshot
   * @param takeScreenshot - Function that returns a Buffer containing the screenshot
   */
  static async addScreenshot(name: string, takeScreenshot: () => Promise<Buffer>): Promise<void> {
    await test.step(`Screenshot: ${name}`, async () => {
      const screenshotBuffer = await takeScreenshot();
      
      // Save to allure-results folder
      const allureResultsDir = path.join(process.cwd(), 'allure-results');
      if (!fs.existsSync(allureResultsDir)) {
        fs.mkdirSync(allureResultsDir, { recursive: true });
      }
      
      // Create a unique filename using timestamp
      const timestamp = new Date().getTime();
      const filename = `${timestamp}-${name.replace(/\s+/g, '-')}.png`;
      const filepath = path.join(allureResultsDir, filename);
      
      // Write the screenshot to file
      fs.writeFileSync(filepath, screenshotBuffer);
      
      // Create attachment metadata for Allure
      const attachmentJson = {
        name: name,
        source: filename,
        type: 'image/png'
      };
      
      fs.writeFileSync(
        path.join(allureResultsDir, `${timestamp}-attachment.json`),
        JSON.stringify(attachmentJson)
      );
      
      console.log(`Screenshot "${name}" saved for Allure report`);
    });
  }
}
