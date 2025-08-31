# Screenshot Management with Allure

This project has been updated to save screenshots directly to the `allure-results` folder, which improves workflow and makes reports more reliable.

## Changes Made

1. All screenshots are now saved directly to the `allure-results` directory
2. This eliminates the need for a separate `screenshots` folder
3. Screenshot filenames now include timestamps to prevent conflicts
4. Allure metadata is created automatically for each screenshot
5. Configuration has been updated to use `allure-results` as the default path

## Benefits

- Cleaner project structure
- Reduced Git repository size
- More reliable Allure reports
- Screenshots are automatically included in reports
- No need for multiple screenshot copying operations

## How It Works

When a test takes a screenshot:

1. The image is saved directly to `allure-results/{timestamp}-{name}.png`
2. An attachment JSON file is created for Allure to recognize the image
3. The screenshot is automatically included in the Allure report

## Note

The old `screenshots` directory is no longer used or needed. If you need to clean up the directory, run:

```
.\cleanup-screenshots.bat
```

This will remove the old screenshots directory if it exists.
