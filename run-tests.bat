@echo off
REM Run tests with different environments

IF "%1"=="" (
    ECHO Usage: run-tests.bat [dev^|staging^|prod] [--headed]
    ECHO Example: run-tests.bat staging --headed
    EXIT /B 1
)

SET TEST_ENV=%1
SET HEADED=

IF "%2"=="--headed" (
    SET HEADED=--headed
)

ECHO Running tests in %TEST_ENV% environment...
npx playwright test tests/hotel_e2e_pom.spec.ts %HEADED%
