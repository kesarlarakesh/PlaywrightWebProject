const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const projectRoot = process.cwd();
const allureResultsPath = path.join(projectRoot, 'allure-results');
const testResultsPath = path.join(projectRoot, 'test-results');
const allureReportPath = path.join(projectRoot, 'allure-report');
const oldScreenshotsPath = path.join(projectRoot, 'screenshots');

/**
 * Main entry point - handles different commands
 */
function main() {
  // Get command line arguments
  const args = process.argv.slice(2);
  const command = args[0]?.toLowerCase();
  
  switch (command) {
    case 'import':
      importScreenshotsFromTestResults();
      break;
      
    case 'clean':
      cleanAllureResults();
      break;
      
    case 'generate':
      generateReport();
      break;
      
    case 'cleanup-screenshots':
      cleanupScreenshotsDirectory();
      break;
      
    case 'full-process':
      // Complete workflow
      importScreenshotsFromTestResults();
      generateReport();
      openReport();
      break;
      
    case 'open':
      openReport();
      break;
      
    default:
      printUsage();
      break;
  }
}

/**
 * Print usage instructions
 */
function printUsage() {
  console.log(`
  Allure Utilities
  ----------------
  Usage: node allure-utils.js <command>
  
  Commands:
    import              Import screenshots from test-results to allure-results
    clean               Clean allure-results directory (preserving history)
    generate            Generate Allure report
    cleanup-screenshots Clean up old screenshots directory
    full-process        Import screenshots, generate report, and open it
    open                Open the Allure report in a browser
  `);
}

/**
 * Import screenshots from test-results to allure-results
 */
function importScreenshotsFromTestResults() {
  console.log('Importing screenshots from test-results to Allure results...');
  
  // Ensure allure-results directory exists
  if (!fs.existsSync(allureResultsPath)) {
    fs.mkdirSync(allureResultsPath, { recursive: true });
  }
  
  // Process test-results directory if it exists
  if (fs.existsSync(testResultsPath)) {
    processDirectory(testResultsPath);
  }
  
  console.log('Import complete!');
}

/**
 * Process a directory recursively looking for screenshots
 * @param {string} dirPath - Directory path to process
 */
function processDirectory(dirPath) {
  const entries = fs.readdirSync(dirPath, { withFileTypes: true });
  
  for (const entry of entries) {
    const fullPath = path.join(dirPath, entry.name);
    
    if (entry.isDirectory()) {
      // Recursively process subdirectories
      processDirectory(fullPath);
    } else if (isScreenshot(entry.name)) {
      // Copy screenshots to allure-results
      const timestamp = Date.now();
      const newFileName = `${timestamp}-${entry.name}`;
      const targetPath = path.join(allureResultsPath, newFileName);
      
      try {
        // Copy the file
        fs.copyFileSync(fullPath, targetPath);
        
        // Create attachment metadata for Allure
        const attachmentJson = {
          name: entry.name,
          source: newFileName,
          type: 'image/png'
        };
        
        fs.writeFileSync(
          path.join(allureResultsPath, `${timestamp}-attachment.json`),
          JSON.stringify(attachmentJson)
        );
        
        console.log(`Imported screenshot: ${entry.name}`);
      } catch (error) {
        console.error(`Error importing ${entry.name}: ${error.message}`);
      }
    }
  }
}

/**
 * Check if a file is a screenshot
 * @param {string} fileName - File name to check
 * @returns {boolean} - True if the file is a screenshot
 */
function isScreenshot(fileName) {
  return fileName.toLowerCase().endsWith('.png') || 
         fileName.toLowerCase().endsWith('.jpg') ||
         fileName.toLowerCase().endsWith('.jpeg');
}

/**
 * Clean allure-results directory (preserving history)
 */
function cleanAllureResults() {
  console.log('Cleaning Allure results directory...');
  
  if (fs.existsSync(allureResultsPath)) {
    const entries = fs.readdirSync(allureResultsPath, { withFileTypes: true });
    
    // Preserve history directory if it exists
    const historyDir = path.join(allureResultsPath, 'history');
    let hasHistory = false;
    
    if (fs.existsSync(historyDir)) {
      hasHistory = true;
      const tempHistoryDir = path.join(projectRoot, 'temp-allure-history');
      
      // Move history to temp location
      fs.renameSync(historyDir, tempHistoryDir);
      console.log('Preserved history directory');
      
      // Delete all files in allure-results
      fs.rmSync(allureResultsPath, { recursive: true, force: true });
      fs.mkdirSync(allureResultsPath, { recursive: true });
      
      // Restore history
      fs.renameSync(tempHistoryDir, historyDir);
    } else {
      // No history to preserve, just clean everything
      for (const entry of entries) {
        if (entry.name !== 'history') {
          const fullPath = path.join(allureResultsPath, entry.name);
          fs.rmSync(fullPath, { recursive: true, force: true });
        }
      }
    }
    
    console.log('Allure results directory cleaned' + (hasHistory ? ' (history preserved)' : ''));
  } else {
    console.log('No allure-results directory found. Creating it...');
    fs.mkdirSync(allureResultsPath, { recursive: true });
  }
}

/**
 * Generate Allure report
 */
function generateReport() {
  console.log('Generating Allure report...');
  
  // Clean old report directory
  if (fs.existsSync(allureReportPath)) {
    fs.rmSync(allureReportPath, { recursive: true, force: true });
  }
  
  // Make sure allure-results exists
  if (!fs.existsSync(allureResultsPath)) {
    fs.mkdirSync(allureResultsPath, { recursive: true });
  }
  
  try {
    // Generate report
    execSync(`npx allure generate "${allureResultsPath}" --clean -o "${allureReportPath}"`, {
      stdio: 'inherit'
    });
    console.log(`Report successfully generated to ${allureReportPath}`);
  } catch (error) {
    console.error('Error generating Allure report:', error.message);
    process.exit(1);
  }
}

/**
 * Open the Allure report in the browser
 */
function openReport() {
  console.log('Opening Allure report...');
  
  if (!fs.existsSync(allureReportPath)) {
    console.error(`Allure report not found at ${allureReportPath}`);
    console.error('Please generate the report first with "node allure-utils.js generate"');
    process.exit(1);
  }
  
  try {
    // This will block until the user terminates it
    execSync(`npx allure open "${allureReportPath}"`, { stdio: 'inherit' });
  } catch (error) {
    // This will execute when the user presses Ctrl+C to stop the server
    console.log('\nAllure report server stopped.');
  }
}

/**
 * Clean up the old screenshots directory
 */
function cleanupScreenshotsDirectory() {
  // Check if screenshots directory exists
  if (fs.existsSync(oldScreenshotsPath)) {
    console.log(`Removing old screenshots directory: ${oldScreenshotsPath}`);
    
    // Remove directory and its contents recursively
    fs.rmSync(oldScreenshotsPath, { recursive: true, force: true });
    console.log('Screenshots directory removed.');
  } else {
    console.log('No screenshots directory found to clean up.');
  }
}

// Run the main function
main();
