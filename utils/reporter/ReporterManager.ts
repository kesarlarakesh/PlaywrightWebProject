import { ReporterDescription } from '@playwright/test';

/**
 * Reporter Manager to handle setup and configuration of all reporters
 * This class centralizes reporter configuration to ensure consistency across the project
 */
export class ReporterManager {
  /**
   * Configure and setup reporters
   * @returns Configuration object for Playwright reporters
   */
  static getReporterConfig(): ReporterDescription[] {
    return [
      // Basic console reporter for real-time test progress
      ['list'],
      
      // HTML reporter for local viewing (won't auto-open)
      ['html', { open: 'never' }],
      
      // JSON output for programmatic consumption
      ['json', { outputFile: 'test-results/json-report.json' }],
      
      // Allure reporter for rich interactive reports
      ['allure-playwright', {
        detail: true, // Include detailed test steps
        outputFolder: 'allure-results',
        suiteTitle: false // Don't use suite titles to reduce clutter
      }],
    ];
  }
}

export default ReporterManager;
