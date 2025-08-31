# Playwright Web Testing Project

This project implements automated end-to-end tests for hotel booking using Playwright and the Page Object Model design pattern.

## Project Structure

```
PlaywrightWebProject/
│
├── allure-results/         # Allure test results data
├── allure-report/          # Generated Allure HTML reports
│
├── config/                 # Configuration files
│   └── config.json         # Environment-specific configuration
│
├── pages/                  # Page Objects
│   ├── BasePage.ts         # Base page with common functionality
│   ├── HomePage.ts         # AirAsia homepage
│   ├── HotelListingPage.ts # Hotel search results page
│   ├── HotelDetailsPage.ts # Hotel details page
│   ├── GuestDetailsPage.ts # Guest information page
│   ├── PaymentPage.ts      # Payment details page
│   └── index.ts            # Exports all page objects
│
├── screenshots/            # Test screenshots
│
├── tests/                  # Test files
│   ├── hotel_e2e.spec.ts   # Hotel booking test file
│   └── testdata/           # Test data files
│       └── testdata.json   # Structured test data
│
├── utils/                  # Utility functions
│   ├── AllureReporter.ts   # Allure reporting utilities
│   ├── ConfigManager.ts    # Configuration management
│   ├── ReportingAdapter.ts # Adapter for reporting systems
│   ├── ReportingUtils.ts   # Basic reporting utilities
│   └── TestUtils.ts        # Common test utilities
│
├── playwright.config.ts    # Playwright configuration
├── allure-utils.js         # Unified Allure utility functions
├── allure-utils.bat        # Batch file for Allure operations
└── package.json            # Project dependencies
```

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Playwright Test
- Allure Commandline (for report generation)

## Installation

```bash
npm install
npx playwright install
```

## Running Tests

### Running Tests with Different Environments

```bash
# Run all tests with default environment (prod)
npm run test

# Run all tests in specific environments
npm run test:dev
npm run test:staging
npm run test:prod

# Run hotel booking test with default environment
npm run test:hotel

# Run hotel booking test in development environment
npm run test:hotel:dev

# Run hotel booking test in staging environment
npm run test:hotel:staging

# Run tests in headless mode (browser invisible, faster)
npm run test:hotel:headless

# Run tests in headed mode (browser visible, good for debugging)
npm run test:hotel:headed

# Or use the batch files
run-tests-headless.bat
run-tests-headed.bat

# Debug tests
npm run test:debug
```

## Allure Reporting

The project uses Allure for comprehensive test reporting. All screenshots are saved directly to the `allure-results` directory and automatically included in reports.

### Allure Utilities

Use the unified `allure-utils.js` script to handle all Allure-related operations:

```bash
# Full Allure report process (import, clean, generate, open)
npm run allure:full

# Import screenshots to Allure results
npm run allure:import

# Clean old Allure results
npm run allure:clean

# Generate Allure report
npm run allure:generate

# Open Allure report
npm run allure:open
```

### Viewing Allure Reports

Due to browser security restrictions, Allure reports cannot be viewed directly from the file system. They must be served by a web server.

To view the report:

1. Run the batch file:
   ```
   ./view-report.bat
   ```
   
   Or run the Node.js script directly:
   ```
   node view-report.js
   ```

2. The report will open automatically in your default browser
3. When done viewing, close the browser tab and press Ctrl+C in the terminal

## Screenshot Management

The project has been updated to save screenshots directly to the `allure-results` folder, which improves workflow and makes reports more reliable:

- All screenshots are now saved directly to the `allure-results` directory
- Screenshot filenames include timestamps to prevent conflicts
- Allure metadata is created automatically for each screenshot
- No need for multiple screenshot copying operations

## Environment Configuration

The project supports multiple environments (dev, staging, prod) through the `config/config.json` file:

- **dev**: Development environment
- **staging**: Staging/QA environment
- **prod**: Production environment (default)
