# How to View the Allure Report

Due to browser security restrictions, Allure reports cannot be viewed directly from the file system. 
They must be served by a web server.

## Option 1: Use the View Report Script (Recommended)

1. Run the batch file:
   ```
   ./view-report.bat
   ```
   
   Or run the Node.js script directly:
   ```
   node view-report.js
   ```

2. The report will open automatically in your default browser
3. When done viewing, close the browser tab and press Ctrl+C in the terminal

## Option 2: Use NPM Script

Run the following command:
```
npm run allure:open
```

## Note

Both methods start a temporary web server to properly display the Allure report.
