/**
 * Post-test script to rename HTML report file
 * Run this script after tests complete to rename index.html to PlaywrightAutomationTestResult.html
 */

const fs = require('fs');
const path = require('path');

// Function to find the most recent report folder
function findLatestReportFolder() {
  const currentDir = process.cwd();
  const folders = fs.readdirSync(currentDir)
    .filter(name => name.startsWith('playwright-web-report-'))
    .map(name => ({
      name,
      mtime: fs.statSync(path.join(currentDir, name)).mtime
    }))
    .sort((a, b) => b.mtime - a.mtime);
  
  return folders.length > 0 ? folders[0].name : null;
}

// Function to rename the HTML report
function renameHtmlReport(reportFolder) {
  const originalPath = path.join(reportFolder, 'index.html');
  const newPath = path.join(reportFolder, 'PlaywrightAutomationTestResult.html');
  
  console.log(`📁 Looking for report in: ${reportFolder}`);
  
  if (fs.existsSync(originalPath)) {
    try {
      fs.renameSync(originalPath, newPath);
      console.log(`✅ Successfully renamed: index.html → PlaywrightAutomationTestResult.html`);
      console.log(`📄 Report available at: ${newPath}`);
    } catch (error) {
      console.error(`❌ Error renaming file: ${error.message}`);
    }
  } else {
    console.log(`❌ Original file not found: ${originalPath}`);
  }
}

// Main execution
function main() {
  console.log('🔄 Finding latest Playwright report...');
  
  const latestFolder = findLatestReportFolder();
  
  if (latestFolder) {
    console.log(`📂 Found latest report folder: ${latestFolder}`);
    renameHtmlReport(latestFolder);
  } else {
    console.log('❌ No Playwright report folders found');
  }
}

// Run the script
main();