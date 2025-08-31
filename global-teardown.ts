import { execSync, spawn } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

/**
 * This global teardown runs after all tests are complete.
 * It automatically generates the Allure report without opening it.
 */
async function globalTeardown() {
  console.log('\n--- Post-test cleanup and report generation ---');
  
  const projectRoot = path.resolve(__dirname);
  const allureResults = path.join(projectRoot, 'allure-results');
  const allureReport = path.join(projectRoot, 'allure-report');
  const historyDir = path.join(allureResults, 'history');
  const reportHistoryDir = path.join(allureReport, 'history');
  
  try {
    // Check if allure-results directory exists and has files
    if (fs.existsSync(allureResults)) {
      const files = fs.readdirSync(allureResults);
      if (files.length > 0) {
        console.log(`Generating Allure report from ${files.length} result files...`);
        
        // Preserve history if it exists
        if (fs.existsSync(reportHistoryDir) && !fs.existsSync(historyDir)) {
          // Create history directory in results if it doesn't exist
          try {
            fs.mkdirSync(historyDir, { recursive: true });
            // Copy history files
            const historyFiles = fs.readdirSync(reportHistoryDir);
            for (const file of historyFiles) {
              fs.copyFileSync(
                path.join(reportHistoryDir, file),
                path.join(historyDir, file)
              );
            }
            console.log('Preserved test history from previous report');
          } catch (e) {
            console.warn('Failed to preserve history:', e);
          }
        }
        
        // Generate the report
        execSync(`npx allure generate "${allureResults}" --clean -o "${allureReport}"`, 
          { stdio: 'inherit' }
        );
        
        console.log(`✅ Allure report generated at: ${allureReport}`);
        
        // Create a launcher script that will serve the report
        const launcherPath = path.join(projectRoot, 'view-report.js');
        fs.writeFileSync(
          launcherPath,
          `const { execSync } = require('child_process');
const path = require('path');
const reportPath = path.join(__dirname, 'allure-report');

console.log('Starting Allure report server...');
console.log('Press Ctrl+C to stop the server when done viewing the report.');

try {
  // This will block and keep the server running until manually terminated
  execSync('npx allure open ' + reportPath, { stdio: 'inherit' });
} catch (e) {
  // Handle Ctrl+C gracefully
  console.log('\\nAllure report server stopped.');
}`
        );
        
        // Create Windows batch file to launch the report
        const batchPath = path.join(projectRoot, 'view-report.bat');
        fs.writeFileSync(
          batchPath,
          `@echo off
echo Starting Allure Report Server...
echo The report will open in your default browser.
echo Press Ctrl+C in this window when done viewing the report.
node view-report.js
`
        );
        
        // Create readme with instructions
        const readmePath = path.join(projectRoot, 'HOW-TO-VIEW-REPORT.md');
        fs.writeFileSync(
          readmePath,
          `# How to View the Allure Report

Due to browser security restrictions, Allure reports cannot be viewed directly from the file system. 
They must be served by a web server.

## Option 1: Use the View Report Script (Recommended)

1. Run the batch file:
   \`\`\`
   ./view-report.bat
   \`\`\`
   
   Or run the Node.js script directly:
   \`\`\`
   node view-report.js
   \`\`\`

2. The report will open automatically in your default browser
3. When done viewing, close the browser tab and press Ctrl+C in the terminal

## Option 2: Use NPM Script

Run the following command:
\`\`\`
npm run allure:open
\`\`\`

## Note

Both methods start a temporary web server to properly display the Allure report.
`
        );
        
        console.log(`✅ Created report viewer utilities:`);
        console.log(`   - ${batchPath}`);
        console.log(`   - ${launcherPath}`);
        console.log(`   - ${readmePath}`);
        console.log(`To view the report, run: ./view-report.bat`);
      } else {
        console.log('No test results found in allure-results directory. Skipping report generation.');
      }
    } else {
      console.log('No allure-results directory found. Skipping report generation.');
    }
  } catch (error) {
    console.error('Failed to generate Allure report:', error);
  }
}

export default globalTeardown;
