const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

// Define paths
const allureResultsPath = path.join(process.cwd(), 'allure-results');
const testResultsPath = path.join(process.cwd(), 'test-results');

/**
 * Import screenshots from test-results to allure-results
 * Now we're only importing from test-results since our direct screenshots
 * are already being saved to allure-results
 */
function importScreenshots() {
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

// Run the import
importScreenshots();

console.log('Processing complete. Run generate-allure-report.bat to view the report.');
