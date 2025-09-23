# Playwright Web Testing Project

This project implements automated end-to-end tests for hotel booking using Playwright and the Page Object Model design pattern. It supports both local test execution and cloud testing via LambdaTest.

## Project Structure

```
PlaywrightWebProject/
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
├── tests/                  # Test files
│   ├── hotel_e2e.spec.ts   # Hotel booking test file
│   └── testdata/           # Test data files
│       └── testdata.json   # Structured test data
│
├── utils/                  # Utility functions
│   ├── ConfigManager.ts    # Configuration management
│   ├── ReportingAdapter.ts # Adapter for reporting systems
│   └── ReportingUtils.ts   # Basic reporting utilities
│
├── playwright.config.ts    # Playwright configuration
└── package.json            # Project dependencies
```

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Playwright Test
- LambdaTest account (for cloud testing)

## Installation

```bash
# Install project dependencies
npm install

# Install Playwright browsers locally
npx playwright install

# For LambdaTest cloud execution
npm install @lambdatest/playwright-driver --save-dev
```

## Running Tests

### Running Tests with Different Environments

```bash
# Run all tests with default environment (prod)
npm run test

# Run hotel booking test with default environment
npm run test:hotel

# Run tests in headless mode (browser invisible, faster)
npm run test:hotel:headless

# Run tests in headed mode (browser visible, good for debugging)
npm run test:hotel:headed

# Run tests on LambdaTest cloud platform
npm run test:lambdatest

# Run hotel booking test on LambdaTest
npm run test:hotel:lambdatest

# Or use the batch files for local execution
run-tests-headless.bat
run-tests-headed.bat
```

### LambdaTest Integration

This project supports running tests on the LambdaTest cloud platform. To use LambdaTest:

1. Create a LambdaTest account at [lambdatest.com](https://www.lambdatest.com/)
2. Set up environment variables:
   - `LT_USERNAME` - Your LambdaTest username
   - `LT_ACCESS_KEY` - Your LambdaTest access key
   - `USE_LAMBDATEST=true` - To enable LambdaTest execution

The workflow will automatically run tests on both local browsers and LambdaTest cloud.

## Test Reports

The project uses the built-in Playwright HTML reporter for test reports. After running tests, you can find the reports in the `playwright-report` directory.

To open the HTML report manually after a test run:

```bash
npx playwright show-report
```


## Environment Configuration

The project supports multiple environments (dev, staging, prod) through the `config/config.json` file:

- **dev**: Development environment
- **staging**: Staging/QA environment
- **prod**: Production environment (default)
