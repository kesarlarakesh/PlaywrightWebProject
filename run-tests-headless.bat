@echo off
echo Running tests in headless mode...

REM Run the tests with Allure reporter in headless mode
npm run test:hotel:headless

echo Completed tests in headless mode.
