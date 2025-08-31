@echo off
echo Cleaning up custom reporter files...

REM Remove CustomReporter.ts
if exist "utils\reporter\CustomReporter.ts" (
    del /f /q "utils\reporter\CustomReporter.ts"
    echo Removed CustomReporter.ts
)

REM Remove custom-report directory if it exists
if exist "custom-report" (
    rmdir /s /q "custom-report"
    echo Removed custom-report directory
)

echo Cleanup completed!
