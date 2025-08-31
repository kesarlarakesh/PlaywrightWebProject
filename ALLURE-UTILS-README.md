# Allure Utilities Refactoring

The project's Allure utilities have been refactored to improve organization and remove redundant code.

## Changes Made

1. **Consolidated Utility Scripts**
   - Created a unified `allure-utils.js` script that handles all Allure-related operations
   - Created a unified `allure-utils.bat` batch file for Windows users

2. **Removed Redundant Files**
   - Deprecated multiple batch files with overlapping functionality
   - Consolidated screenshot management into the allure-results directory

3. **Updated NPM Scripts**
   - Replaced multiple scripts with a cleaner, more consistent set
   - Added specific commands for common operations

## New Commands

### Using the batch file:
```
allure-utils.bat import              # Import screenshots from test-results
allure-utils.bat clean               # Clean allure-results (preserving history)
allure-utils.bat generate            # Generate Allure report
allure-utils.bat open                # Open the Allure report
allure-utils.bat full                # Complete workflow: import + generate + open
allure-utils.bat cleanup-screenshots # Clean up old screenshots directory
```

### Using NPM scripts:
```
npm run allure:import     # Import screenshots from test-results
npm run allure:clean      # Clean allure-results (preserving history)
npm run allure:generate   # Generate Allure report
npm run allure:open       # Open the Allure report
npm run allure:full       # Complete workflow: import + generate + open
```

## Deprecated Files

The following files are no longer needed but have been kept for backward compatibility:
- `allure-with-screenshots.bat` (use `allure-utils.bat full` instead)
- `generate-allure-report.bat` (use `allure-utils.bat generate` instead)
- `open-report.bat` (use `allure-utils.bat open` instead)
- `view-report.bat` (use `allure-utils.bat open` instead)
- `cleanup-screenshots.bat` (use `allure-utils.bat cleanup-screenshots` instead)
- `cleanup-custom-reporter.bat` (no longer needed)
- `import-screenshots.js` (functionality moved to allure-utils.js)
- `view-report.js` (functionality moved to allure-utils.js)

## Future Improvements

In a future update, the deprecated files could be completely removed once everyone has migrated to the new utilities.
