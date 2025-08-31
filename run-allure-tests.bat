@echo off
echo Running tests with Allure reporter...

REM Clean old results
if exist "allure-results" rmdir /s /q "allure-results"
if exist "test-results" rmdir /s /q "test-results"

REM Run tests with Allure reporter
call npx playwright test --reporter=allure-playwright

REM Generate and open the report
call generate-allure-report.bat

echo Done!
