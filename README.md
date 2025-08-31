# Playwright Web Testing Project

This project implements automated end-to-end tests for hotel booking using Playwright and the Page Object Model design pattern.

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
├── screenshots/            # Test screenshots
│
├── tests/                  # Test files
│   ├── hotel_e2e.spec.ts   # Original test file
│   ├── hotel_e2e_pom.spec.ts # Refactored test using POM
│   └── testdata/           # Test data files
│       └── testdata.json   # Structured test data
│
├── utils/                  # Utility functions
│   ├── ConfigManager.ts    # Configuration management
│   └── TestUtils.ts        # Common test utilities
│
├── playwright.config.ts    # Playwright configuration
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

# Run hotel booking test in headed mode
npm run test:hotel:headed

# Debug tests
npm run test:debug
```

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
