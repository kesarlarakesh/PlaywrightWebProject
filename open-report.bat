@echo off
echo Starting Allure Report Server...
echo.
echo The report will open automatically in your browser.
echo Press Ctrl+C in this window when finished viewing the report.
echo.

set ALLURE_REPORT=%~dp0allure-report

if exist "%ALLURE_REPORT%" (
    npx allure open "%ALLURE_REPORT%"
) else (
    echo No Allure report found at %ALLURE_REPORT%.
    echo Please run tests first to generate a report.
    pause
)
