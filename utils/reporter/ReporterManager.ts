import { ReporterDescription } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';
import { LAMBDATEST_ENV_VARS, PLATFORM_IDENTIFIERS } from '../constants/LambdaTestConstants';

/**
 * Reporter Manager to handle setup and configuration of all reporters
 * This class centralizes reporter configuration to ensure consistency across the project
 * and provides timestamped reporting functionality with configurable output directories
 */
export class ReporterManager {
  // Static timestamp to ensure same folder name for entire test run
  private static runTimestamp: string | null = null;

  /**
   * Get configurable output directory for reports
   * @returns Base output directory for all reports (always absolute path)
   */
  static getOutputBaseDir(): string {
    const baseDir = process.env.PLAYWRIGHT_OUTPUT_DIR || process.env.PLAYWRIGHT_PROJECT_ROOT || process.cwd();
    // Ensure we always return an absolute path
    return path.isAbsolute(baseDir) ? baseDir : path.resolve(process.cwd(), baseDir);
  }

  /**
   * Get configurable test results directory
   * @returns Directory for test results (JSON, JUnit, etc.) as absolute path
   */
  static getTestResultsDir(): string {
    const baseDir = this.getOutputBaseDir();
    const resultsDir = process.env.PLAYWRIGHT_RESULTS_DIR || 'test-results';
    return path.join(baseDir, resultsDir);
  }

  /**
   * Resolve a path to absolute, ensuring consistency across different working directories
   * @param inputPath - Path to resolve (can be relative or absolute)
   * @returns Absolute path
   */
  private static resolveAbsolutePath(inputPath: string): string {
    return path.isAbsolute(inputPath) ? inputPath : path.resolve(process.cwd(), inputPath);
  }

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
    
    return `${year}-${month}-${day}_${hours}-${minutes}`;
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
   * @param baseFolder - Base folder name (default: 'report')
   * @returns Current report folder path with timestamp
   */
  static generateCurrentReportFolder(baseFolder: string = 'report'): string {
    const environment = process.env.TEST_ENV || 'prod';
    const useLambdaTest = process.env[LAMBDATEST_ENV_VARS.USE_LAMBDATEST] === 'true';
    const platform = useLambdaTest ? PLATFORM_IDENTIFIERS.LAMBDATEST : PLATFORM_IDENTIFIERS.LOCAL;
    const timestamp = this.getRunTimestamp();
    const outputBaseDir = this.getOutputBaseDir();
    
    const folderName = `${baseFolder}-${environment}-${platform}-${timestamp}`;
    return path.join(outputBaseDir, folderName);
  }

  /**
   * Clean up old report folders and create new directory
   * @param dirPath - Directory path to create (will be resolved to absolute path)
   */
  static ensureDirectoryExists(dirPath: string): void {
    // Ensure we work with absolute paths
    const absoluteDirPath = this.resolveAbsolutePath(dirPath);
    
    // Clean up any existing report folders from previous runs
    this.cleanupOldReports();
    
    if (!fs.existsSync(absoluteDirPath)) {
      fs.mkdirSync(absoluteDirPath, { recursive: true });
      console.log(`📁 Created report directory: ${absoluteDirPath}`);
    } else {
      console.log(`📁 Report directory already exists: ${absoluteDirPath}`);
    }
  }

  /**
   * Clean up old report folders to keep only the current run
   * Uses absolute paths to ensure reliability regardless of working directory changes
   */
  static cleanupOldReports(): void {
    try {
      const outputBaseDir = this.getOutputBaseDir(); // Now guaranteed to be absolute
      const currentReportFolder = this.generateCurrentReportFolder();
      const currentReportFolderName = path.basename(currentReportFolder);
      
      // Verify the base directory exists before attempting cleanup
      if (!fs.existsSync(outputBaseDir)) {
        console.log(`📁 Output directory does not exist, skipping cleanup: ${outputBaseDir}`);
        return;
      }
      
      console.log(`🧹 Cleaning up old reports in: ${outputBaseDir}`);
      
      const reportDirs = fs.readdirSync(outputBaseDir)
        .filter(dir => {
          if (!dir.startsWith('report-') || dir === currentReportFolderName) {
            return false;
          }
          try {
            const fullDirPath = path.join(outputBaseDir, dir);
            return fs.statSync(fullDirPath).isDirectory();
          } catch (error) {
            // Handle race condition where directory becomes inaccessible
            const errorMessage = error instanceof Error ? error.message : 'Unknown error';
            console.warn(`⚠️  Could not access directory ${dir}: ${errorMessage}`);
            return false;
          }
        });
      
      if (reportDirs.length === 0) {
        console.log(`✨ No old report directories to clean up`);
        return;
      }
      
      console.log(`🗑️  Found ${reportDirs.length} old report(s) to clean up`);
      
      reportDirs.forEach(dir => {
        try {
          const fullPath = path.join(outputBaseDir, dir);
          fs.rmSync(fullPath, { recursive: true, force: true });
          console.log(`✅ Cleaned up previous report: ${dir}`);
        } catch (error) {
          const errorMessage = error instanceof Error ? error.message : 'Unknown error';
          console.error(`❌ Error deleting ${dir}: ${errorMessage}`);
        }
      });
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error';
      console.warn(`⚠️  Cleanup operation failed: ${errorMessage}`);
    }
  }

  /**
   * Configure and setup reporters with current run folder
   * Only HTML reports are included in current run folder
   * @returns Configuration object for Playwright reporters
   */
  static getReporterConfig(): ReporterDescription[] {
    const currentReportFolder = this.generateCurrentReportFolder();
    const testResultsDir = this.getTestResultsDir();
    
    // Ensure directories exist
    this.ensureDirectoryExists(currentReportFolder);
    this.ensureDirectoryExists(testResultsDir);
    
    console.log(`📊 Report Configuration:`);
    console.log(`   HTML Reports: ${currentReportFolder}`);
    console.log(`   Test Results: ${testResultsDir}`);
    
    return [
      // Basic console reporter for real-time test progress
      ['list'],
      
      // HTML reporter with current folder
      ['html', { 
        open: 'never',
        outputFolder: currentReportFolder
      }],
      
      // JSON output in configurable location
      ['json', { 
        outputFile: path.join(testResultsDir, 'json-report.json')
      }],
      
      // JUnit reporter in configurable location
      ['junit', {
        outputFile: path.join(testResultsDir, 'junit-results.xml')
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
