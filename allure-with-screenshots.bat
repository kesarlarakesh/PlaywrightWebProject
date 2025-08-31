@echo off
echo Importing screenshots for Allure report...

REM Run the screenshot import script
node import-screenshots.js

REM Generate and open the Allure report
call generate-allure-report.bat

echo Done!
