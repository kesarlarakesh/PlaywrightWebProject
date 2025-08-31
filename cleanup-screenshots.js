/**
 * This script cleans up the screenshots directory
 * It is no longer needed since screenshots are now saved to allure-results
 */
const fs = require('fs');
const path = require('path');

// Define path to old screenshots directory
const screenshotsPath = path.join(process.cwd(), 'screenshots');

// Check if screenshots directory exists
if (fs.existsSync(screenshotsPath)) {
  console.log(`Removing old screenshots directory: ${screenshotsPath}`);
  
  // Remove directory and its contents recursively
  fs.rmSync(screenshotsPath, { recursive: true, force: true });
  console.log('Screenshots directory removed.');
} else {
  console.log('No screenshots directory found to clean up.');
}

console.log('Your project has been updated to use allure-results for screenshots.');
