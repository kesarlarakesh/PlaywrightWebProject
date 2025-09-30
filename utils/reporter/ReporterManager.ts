import { ReporterDescription } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

/**
 * Reporter Manager to handle setup and configuration of all reporters
 * This class centralizes reporter configuration to ensure consistency across the project
 * and provides timestamped reporting functionality
 */
export class ReporterManager {
  // Static timestamp to ensure same folder name for entire test run
  private static runTimestamp: string | null = null;

  /**
   * Generate a timestamp string for folder naming
   * @returns Formatted timestamp string (YYYY-MM-DD_HH-MM-SS)
   */
  static generateTimestamp(): string {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    const day = String(now.getDate()).padStart(2, '0');
    const hours = String(now.getHours()).padStart(2, '0');
    const minutes = String(now.getMinutes()).padStart(2, '0');
    const seconds = String(now.getSeconds()).padStart(2, '0');
    
    return `${year}-${month}-${day}_${hours}-${minutes}-${seconds}`;
  }

  /**
   * Get or generate run timestamp (same for entire test run)
   * Uses environment variable to ensure consistency across workers
   * @returns Consistent timestamp for the current test run
   */
  static getRunTimestamp(): string {
    // Check if timestamp is already set in environment variable
    if (process.env.PLAYWRIGHT_RUN_TIMESTAMP) {
      return process.env.PLAYWRIGHT_RUN_TIMESTAMP;
    }
    
    // Check static variable first
    if (!this.runTimestamp) {
      this.runTimestamp = this.generateTimestamp();
      // Store in environment variable for sharing across workers
      process.env.PLAYWRIGHT_RUN_TIMESTAMP = this.runTimestamp;
      console.log(`🕒 Generated run timestamp: ${this.runTimestamp}`);
    }
    return this.runTimestamp;
  }

  /**
   * Generate current report folder path with consistent timestamp
   * @param baseFolder - Base folder name (default: 'playwright-web-report')
   * @returns Current report folder path with timestamp
   */
  static generateCurrentReportFolder(baseFolder: string = 'playwright-web-report'): string {
    const environment = process.env.TEST_ENV || 'prod';
    const useLambdaTest = process.env.USE_LAMBDATEST === 'true';
    const platform = useLambdaTest ? 'lambdatest' : 'local';
    const timestamp = this.getRunTimestamp();
    
    return `${baseFolder}-${environment}-${platform}-${timestamp}`;
  }

  /**
   * Clean up old report folders and create new directory
   * @param dirPath - Directory path to create
   */
  static ensureDirectoryExists(dirPath: string): void {
    // Clean up any existing report folders from previous runs
    this.cleanupOldReports();
    
    if (!fs.existsSync(dirPath)) {
      fs.mkdirSync(dirPath, { recursive: true });
      console.log(`Created report directory: ${dirPath}`);
    }
  }

  /**
   * Clean up old report folders to keep only the current run
   */
  static cleanupOldReports(): void {
    try {
      const currentReportFolder = this.generateCurrentReportFolder();
      const reportDirs = fs.readdirSync('.')
        .filter(dir => 
          dir.startsWith('playwright-web-report-') && 
          fs.statSync(dir).isDirectory() &&
          dir !== currentReportFolder  // Don't delete current run's folder
        );
      
      reportDirs.forEach(dir => {
        try {
          fs.rmSync(dir, { recursive: true, force: true });
          console.log(`🗑️  Cleaned up previous report: ${dir}`);
        } catch (error) {
          console.error(`❌ Error deleting ${dir}:`, error);
        }
      });
    } catch (error) {
      // Ignore errors if no previous reports exist
    }
  }

  /**
   * Configure and setup reporters with current run folder
   * Only HTML reports are included in current run folder
   * @returns Configuration object for Playwright reporters
   */
  static getReporterConfig(): ReporterDescription[] {
    const currentReportFolder = this.generateCurrentReportFolder();
    
    // Ensure HTML report directory exists (cleans up old reports)
    this.ensureDirectoryExists(currentReportFolder);
    
    console.log(`HTML reports will be generated in: ${currentReportFolder}`);
    
    return [
      // Basic console reporter for real-time test progress
      ['list'],
      
      // HTML reporter with current folder
      ['html', { 
        open: 'never',
        outputFolder: currentReportFolder
      }],
      
      // JSON output in default location
      ['json', { 
        outputFile: 'test-results/json-report.json'
      }],
      
      // JUnit reporter in default location
      ['junit', {
        outputFile: 'test-results/junit-results.xml'
      }],
    ];
  }

  /**
   * Get the current folder paths for external use
   * @returns Object containing current paths
   */
  static getCurrentReportPaths() {
    return {
      reportFolder: this.generateCurrentReportFolder(),
      timestamp: this.getRunTimestamp()
    };
  }
}

export default ReporterManager;
