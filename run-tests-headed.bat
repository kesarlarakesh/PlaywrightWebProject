@echo off
echo Running tests in headed mode...

REM Run the tests in headed mode
npm run test:hotel:headed

echo Completed tests in headed mode.
echo To view the HTML report, run: npx playwright show-report
