# Allure Report Guide

## Understanding the Issue

Allure reports are web applications that use JavaScript to display interactive test reports. Due to browser security restrictions (CORS policies), these reports **cannot be viewed directly** by opening the HTML files from your file system.

## How to View Allure Reports

### Option 1: Using the Batch File (Easiest)

1. After tests complete, run the `view-report.bat` file:
   ```
   .\view-report.bat
   ```

2. This will start a local web server and automatically open the report in your browser.
3. When finished viewing, close the browser tab and press `Ctrl+C` in the terminal window.

### Option 2: Using npm Scripts

You can also use these npm scripts:

```
npm run report:serve     # Start the Allure report server
npm run allure:open      # Alternative way to open the report
```

### Option 3: View Reports After Testing

Run tests and immediately view the report with:

```
npm run test:with-report
```

## Allure Report Features

The Allure report provides several useful views:

1. **Overview** - Summary of test execution
2. **Categories** - Tests grouped by failure types
3. **Suites** - Tests organized by test suite
4. **Graphs** - Visual representation of test results
5. **Timeline** - Test execution timeline
6. **Behaviors** - Tests organized by features and stories

## Troubleshooting

If you encounter any issues:

1. **Report not generating**: Check if there are test results in the `allure-results` folder.
2. **Server won't start**: Ensure port 8080 is not in use by another application.
3. **Blank report**: Try running `npm run allure:generate` to regenerate the report.

## Technical Background

The Allure report consists of static HTML/JS files that load data from JSON files. To bypass CORS restrictions, we need to serve these files from a web server. The `allure open` command starts a simple server on port 8080 that properly serves the report files.
