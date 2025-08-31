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
├── generate-allure-report.bat # Script to generate Allure reports
└── package.json            # Project dependencies
```

## Environment Configuration

The project supports multiple environments (dev, staging, prod) through the `config/config.json` file:

- **dev**: Development environment
- **staging**: Staging/QA environment
- **prod**: Production environment (default)

## Running Tests

### Installation

```bash
npm install
npx playwright install
```

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

The project has been configured to use Allure for test reporting. Allure provides rich, interactive reports with detailed test execution information.

### Running Tests with Allure Reporting

```bash
# Run hotel booking test with Allure reporting
npm run test:hotel:allure

# Run all tests with Allure reporting
npm run test:allure
```

### Generating and Viewing Allure Reports

```bash
# Generate and open Allure report
.\generate-allure-report.bat

# Or use these individual commands
npm run allure:generate
npm run allure:open
```

For more details on Allure reporting, see [ALLURE-README.md](./ALLURE-README.md).

### Running with CLI Arguments

You can also specify the environment directly:

```bash
npx playwright test --env=dev
```

## Page Objects

- **BasePage**: Contains common methods for all pages
- **HomePage**: Handles actions on the AirAsia homepage
- **HotelListingPage**: Manages hotel search results and selection
- **HotelDetailsPage**: Handles room and rate plan selection
- **GuestDetailsPage**: Manages guest information forms
- **PaymentPage**: Handles payment form interactions

## Configuration Management

Environment-specific configuration is managed through the `ConfigManager` class:

```typescript
import { ConfigManager } from "../utils/ConfigManager";

// Get configuration instance
const config = ConfigManager.getInstance();

// Get base URL for current environment
const baseUrl = config.getBaseUrl();

// Get environment-specific value
const timeout = config.getEnvValue("timeout", 30000);

// Get current environment name
const env = config.getEnvironment();
```
