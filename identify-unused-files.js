/**
 * This script identifies potentially unused files in the project
 * It analyzes batch files and JavaScript/TypeScript files that might be candidates for removal
 */

const fs = require('fs');
const path = require('path');

// Files that have been refactored and could potentially be removed
const potentiallyUnusedFiles = [
  {
    path: 'cleanup-custom-reporter.bat',
    replacedBy: 'No longer needed - CustomReporter was removed',
    canRemove: true
  }
];

// Check if files exist and print status
console.log('Potentially Unused Files Report:');
console.log('-------------------------------');

let hasRemovableFiles = false;

potentiallyUnusedFiles.forEach(file => {
  const filePath = path.join(process.cwd(), file.path);
  const exists = fs.existsSync(filePath);
  
  console.log(`File: ${file.path}`);
  console.log(`Status: ${exists ? 'Exists' : 'Not found'}`);
  console.log(`Replaced by: ${file.replacedBy}`);
  console.log(`Can be removed: ${file.canRemove ? 'Yes' : 'No (keeping for backward compatibility)'}`);
  console.log('-------------------------------');
  
  if (exists && file.canRemove) {
    hasRemovableFiles = true;
  }
});

if (hasRemovableFiles) {
  console.log('\nThe following files can be safely removed:');
  potentiallyUnusedFiles.forEach(file => {
    if (file.canRemove && fs.existsSync(path.join(process.cwd(), file.path))) {
      console.log(`- ${file.path}`);
    }
  });
} else {
  console.log('\nNo files are marked for immediate removal.');
}

console.log('\nNote: Files marked as "keeping for backward compatibility" can be removed in a future update after ensuring all team members have migrated to the new utilities.');
