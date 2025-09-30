# Playwright Web Testing Project

Automated end-to-end tests using Playwright with Page Object Model design pattern. Features enhanced timestamped reporting system with single folder per test run and custom HTML report naming. Supports both local execution and cloud testing via LambdaTest.

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
│   ├── TestExecutionHelper.ts # Test lifecycle management
│   ├── ReportingAdapter.ts # Adapter for reporting systems
│   ├── ReportingUtils.ts   # Basic reporting utilities
│   └── reporter/           # Enhanced reporting system
│       └── ReporterManager.ts # Timestamped report management
│
├── global-setup.ts         # Consistent timestamp initialization
├── rename-report.js        # Post-test HTML report renaming
├── playwright.config.ts    # Playwright configuration
└── package.json            # Project dependencies
```

## Prerequisites
- Node.js (v14 or higher)
- npm (v6 or higher)
- Playwright Test
- LambdaTest account (optional, for cloud testing)

## Installation

```bash
# Install project dependencies
npm install

# Install Playwright browsers
npx playwright install

# For LambdaTest cloud execution (optional)
npm install @lambdatest/playwright-driver --save-dev
```

## Running Tests

### 🚀 Quick Start
```bash
# Run all tests with enhanced reporting
npm test

# Run specific hotel booking tests  
npm run test:hotel

# Run tests without report renaming (plain Playwright)
npm run test:plain
```

### 🖥️ Local Testing Options
```bash
# Run in headless mode (faster, no browser UI)
npm run test:hotel:headless

# Run in headed mode (visible browser, good for debugging)
npm run test:hotel:headed

# Force local execution (disable LambdaTest)
npm run test:hotel:local

# Run on specific environment
TEST_ENV=staging npm run test:hotel
```

### ☁️ Cloud Testing (LambdaTest)
```bash
# Run tests on LambdaTest cloud
npm run test:lambdatest
npm run test:hotel:lambdatest

# Setup required environment variables:
# LT_USERNAME=your_username
# LT_ACCESS_KEY=your_access_key
# USE_LAMBDATEST=true
```


### 📁 Batch Files (Windows)
```bash
run-tests-headless.bat
run-tests-headed.bat
```

## Environment Configuration

Supports multiple environments through `config/config.json`:
- **dev** - Development environment
- **staging** - QA/Staging environment  
- **prod** - Production environment (default)

Set environment: `TEST_ENV=staging npm run test:hotel`

## ☁️ LambdaTest Integration

For cloud testing setup:
1. Create account at [lambdatest.com](https://www.lambdatest.com/)
2. Set environment variables:
   - `LT_USERNAME` - Your LambdaTest username
   - `LT_ACCESS_KEY` - Your LambdaTest access key
   - `USE_LAMBDATEST=true` - Enable LambdaTest execution

Tests run automatically on both local browsers and LambdaTest cloud.
