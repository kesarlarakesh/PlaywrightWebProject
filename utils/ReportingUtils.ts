import { TestInfo } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { ReporterManager } from './reporter/ReporterManager';
import { LAMBDATEST_ENV_VARS, PLATFORM_IDENTIFIERS } from './constants/LambdaTestConstants';

/**
 * Enhanced utility class for reporting functionalities with timestamped support
 */
export class ReportingUtils {
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
   * Add test execution metadata with timestamp
   * @param testInfo - TestInfo object from playwright test
   */
  static async attachTestMetadata(testInfo: TestInfo): Promise<void> {
    const metadata = {
      testTitle: testInfo.title,
      testFile: testInfo.file,
      startTime: new Date().toISOString(),
      environment: process.env.TEST_ENV || 'prod',
      platform: process.env[LAMBDATEST_ENV_VARS.USE_LAMBDATEST] === 'true' ? PLATFORM_IDENTIFIERS.LAMBDATEST_DISPLAY : PLATFORM_IDENTIFIERS.LOCAL_DISPLAY,
      browser: testInfo.project.name,
      timestamp: ReporterManager.generateTimestamp(),
      reportPaths: ReporterManager.getCurrentReportPaths()
    };

    await this.attachJson(testInfo, 'Test Metadata', metadata);
  }

  /**
   * Create a timestamped screenshot filename
   * @param testInfo - TestInfo object from playwright test
   * @param suffix - Optional suffix for the filename
   * @returns Timestamped screenshot filename
   */
  static generateTimestampedScreenshotName(testInfo: TestInfo, suffix: string = ''): string {
    const timestamp = ReporterManager.generateTimestamp();
    const testName = testInfo.title.replace(/[^a-zA-Z0-9]/g, '_');
    const suffixPart = suffix ? `_${suffix}` : '';
    return `screenshot_${testName}_${timestamp}${suffixPart}.png`;
  }

  /**
   * Save test execution summary to current HTML report folder
   * @param summary - Test execution summary object
   */
  static async saveTestSummary(summary: any): Promise<void> {
    try {
      const paths = ReporterManager.getCurrentReportPaths();
      const summaryPath = path.join(paths.reportFolder, 'test-summary.json');
      
      // Ensure directory exists
      ReporterManager.ensureDirectoryExists(paths.reportFolder);
      
      // Add timestamp to summary
      const timestampedSummary = {
        ...summary,
        generatedAt: new Date().toISOString(),
        timestamp: ReporterManager.generateTimestamp(),
        reportFolder: paths.reportFolder
      };
      
      fs.writeFileSync(summaryPath, JSON.stringify(timestampedSummary, null, 2));
      console.log(`Test summary saved to: ${summaryPath}`);
    } catch (error) {
      console.error('Error saving test summary:', error);
    }
  }
}
