@echo off
REM Unified Allure utilities batch file

IF "%1"=="" (
  GOTO usage
) ELSE (
  GOTO %1 2>nul
  IF ERRORLEVEL 1 GOTO unknown
)

:import
  echo Importing screenshots from test-results to allure-results...
  node allure-utils.js import
  GOTO end

:clean
  echo Cleaning allure-results directory...
  node allure-utils.js clean
  GOTO end

:generate
  echo Generating Allure report...
  node allure-utils.js generate
  GOTO end

:open
  echo Opening Allure report...
  node allure-utils.js open
  GOTO end

:full
  echo Running full Allure process...
  node allure-utils.js full-process
  GOTO end

:cleanup-screenshots
  echo Cleaning up old screenshots directory...
  node allure-utils.js cleanup-screenshots
  GOTO end

:unknown
  echo Unknown command: %1
  GOTO usage

:usage
  echo.
  echo Allure Utilities
  echo ----------------
  echo Usage: allure-utils.bat [command]
  echo.
  echo Commands:
  echo   import              - Import screenshots from test-results to allure-results
  echo   clean               - Clean allure-results directory (preserving history)
  echo   generate            - Generate Allure report
  echo   open                - Open the Allure report in a browser
  echo   full                - Import screenshots, generate report, and open it
  echo   cleanup-screenshots - Clean up old screenshots directory
  echo.

:end
