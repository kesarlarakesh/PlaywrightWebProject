import { ReporterDescription } from '@playwright/test';

/**
 * Reporter Manager to handle setup and configuration of all reporters
 */
export class ReporterManager {
  /**
   * Configure and setup reporters
   * @returns Configuration object for Playwright reporters
   */
  static getReporterConfig(): ReporterDescription[] {
    return [
      ['list'],
      ['html', { open: 'never' }],
      ['json', { outputFile: 'test-results/json-report.json' }],
      ['allure-playwright', {
        detail: true,
        outputFolder: 'allure-results',
        suiteTitle: false
      }],
    ];
  }
}

export default ReporterManager;
