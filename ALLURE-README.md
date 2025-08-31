# Playwright Hotel Booking Test Automation

## Overview
This project is a Playwright-based test automation framework for testing hotel booking flows. It uses the Page Object Model pattern and includes comprehensive reporting with Allure.

## Features
- End-to-end hotel booking tests
- Page Object Model architecture
- Allure reporting integration
- Screenshot capture on key steps and failures
- Configurable test environments

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Playwright Test
- Allure Commandline (for report generation)

## Installation
1. Clone the repository
2. Install dependencies:
```
npm install
```

## Configuration
The test framework uses configuration files located in the `config` directory.

### Environment Configuration
You can specify which environment to use by setting the `TEST_ENV` environment variable:
```
$env:TEST_ENV="prod" # PowerShell
```
or
```
set TEST_ENV=prod # CMD
```

## Running Tests

### Run all tests
```
npm test
```

### Run hotel booking tests
```
npm run test:hotel
```

### Run tests with Allure reporting
```
npm run test:hotel:allure
```

## Reporting

This project uses Allure for test reporting, which provides rich, interactive reports with detailed test execution information.

### Run tests with Allure reporting
```
npm run test:hotel:allure
```

### Generate and open Allure report
After running tests with the Allure reporter, you can generate and open the report using the unified utilities:

```bash
# Full workflow: import screenshots from test-results, generate and open report
npm run allure:full

# Or if you prefer the batch file:
allure-utils.bat full
```

Individual steps are also available:
```bash
# Import screenshots from test-results
npm run allure:import

# Generate the report
npm run allure:generate

# Open the report in a browser
npm run allure:open
```

### Screenshots in Allure Reports

Screenshots are automatically captured during test execution at key steps and on failures. They are now saved directly to the `allure-results` directory for better integration with Allure reports.

```bash
npm run test:hotel:allure
```

Or use the batch file:
```bash
.\run-allure-tests.bat
```

### How Screenshots are Handled

The framework captures screenshots at these key points:
- Initial page load
- Search results page
- Guest details form
- Payment page
- Final state of the test
- On any test failure

All screenshots are saved directly to the `/allure-results` directory with proper Allure metadata, eliminating the need for a separate `/screenshots` directory. This approach:

1. Reduces file system overhead
2. Ensures screenshots are properly linked in reports
3. Simplifies the overall workflow
4. Reduces Git repository size by avoiding duplicate storage

The import script (`import-screenshots.js`) still runs to capture any screenshots that might be saved to the `test-results` directory by Playwright's automatic failure captures.

## Project Structure
- `/pages` - Page Object Model classes
- `/tests` - Test files
- `/utils` - Utility functions and helpers
- `/config` - Environment configuration
- `/testdata` - Test data files
- `/allure-results` - Allure report data and screenshots
- `/allure-report` - Generated Allure report
- `/test-results` - Playwright test results and failure screenshots

## Key Features of Allure Reports
1. **Test Overview** - Summary of test execution with pass/fail statistics
2. **Detailed Test Steps** - Chronological listing of test steps with status
3. **Screenshots** - Visual evidence at key points in the test
4. **Environment Information** - Test environment details
5. **History Trends** - Test execution history over time
6. **Categories** - Tests grouped by failure types
7. **Timeline** - Visual representation of test execution time

## Customizing Reports
You can add additional metadata to tests using the ReportingAdapter:

```typescript
ReportingAdapter.addTestInfo(testInfo, {
  description: 'Detailed test description',
  story: 'User story reference',
  severity: 'critical',
  issue: 'JIRA-1234',
  testCase: 'TC-5678',
  tags: ['regression', 'booking-flow']
});
```
