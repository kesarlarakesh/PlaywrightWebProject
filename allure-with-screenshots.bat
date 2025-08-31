@echo off
echo Processing test results for Allure report...

REM Run the script to import any screenshots from test-results
node import-screenshots.js

REM Generate and open the Allure report
call generate-allure-report.bat

echo Done!
