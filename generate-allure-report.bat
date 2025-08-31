@echo off
echo Generating Allure report...

REM Define paths
set PROJECT_ROOT=%~dp0
set ALLURE_RESULTS=%PROJECT_ROOT%allure-results
set ALLURE_REPORT=%PROJECT_ROOT%allure-report

REM Clean old reports if they exist
if exist "%ALLURE_REPORT%" rmdir /s /q "%ALLURE_REPORT%"

REM Make sure allure-results exists (create if not)
if not exist "%ALLURE_RESULTS%" mkdir "%ALLURE_RESULTS%"

REM Generate report using npx
echo Generating report from results in %ALLURE_RESULTS%...
call npx allure generate "%ALLURE_RESULTS%" --clean -o "%ALLURE_REPORT%"

REM Open the report using npx
echo Opening report at %ALLURE_REPORT%...
start "" npx allure open "%ALLURE_REPORT%"

echo Done!
