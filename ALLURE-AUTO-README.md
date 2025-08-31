# Automatic Allure Report Generation

This feature automatically generates Allure reports after test runs.

## How It Works

1. After all tests complete, the `global-teardown.ts` script runs automatically
2. It checks for test results in the `allure-results` directory
3. If results are found, it generates an HTML report in the `allure-report` directory
4. A quick-access shortcut file `test-report.html` is also created in the project root

## Accessing the Report

There are multiple ways to access the report:

1. **Open the HTML file directly**: 
   - Browse to `allure-report/index.html` and open it in your browser

2. **Use the open-report batch file**:
   - Run `.\open-report.bat` from the command line

3. **Use npm scripts**:
   - Run `npm run report:open` to open the report directly
   - Or click on `test-report.html` in the project root

4. **Continue using allure commands**:
   - Run `npm run allure:open` to open the report using Allure's built-in server

## Additional Features

- **Combined Test & Report**: Use `npm run test:with-report` to run tests and open the report automatically
- **Reports with Screenshots**: Use `npm run allure:with-screenshots` to enhance reports with screenshots

## Troubleshooting

If you don't see a report:
1. Check that tests were run with the Allure reporter (`--reporter=allure-playwright`)
2. Verify that the `allure-results` directory contains files
3. Run `npm run allure:generate` manually to regenerate the report
