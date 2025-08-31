const { execSync } = require('child_process');
const path = require('path');
const reportPath = path.join(__dirname, 'allure-report');

console.log('Starting Allure report server...');
console.log('Press Ctrl+C to stop the server when done viewing the report.');

try {
  // This will block and keep the server running until manually terminated
  execSync('npx allure open ' + reportPath, { stdio: 'inherit' });
} catch (e) {
  // Handle Ctrl+C gracefully
  console.log('\nAllure report server stopped.');
}