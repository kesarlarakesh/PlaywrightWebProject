@echo off
echo Running tests in headless mode...

REM Run the tests in headless mode
npm run test:hotel:headless

echo Completed tests in headless mode.
echo To view the HTML report, run: npx playwright show-report
