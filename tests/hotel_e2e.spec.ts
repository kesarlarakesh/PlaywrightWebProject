import { test, expect } from "@playwright/test";

// Import page objects
import { HomePage } from "../pages/HomePage";
import { HotelListingPage } from "../pages/HotelListingPage";
import { HotelDetailsPage } from "../pages/HotelDetailsPage";
import { GuestDetailsPage } from "../pages/GuestDetailsPage";
import { PaymentPage } from "../pages/PaymentPage";

// Import utilities
import { ConfigManager } from "../utils/ConfigManager";
import { TestDataManager } from "../testdata/testDataManager";

// Initialize configuration and test data managers
const config = ConfigManager.getInstance();
const testDataManager = TestDataManager.getInstance();

console.log(`Running tests with environment: ${config.getEnvironment()}`);

// Load test data from JSON file
const hotelDestinations = testDataManager.getHotelDestinations();
const commonData = testDataManager.getCommonHotelData();

// Extract test configuration from common data
const skipPayment = commonData.testFlags?.skipPayment || false;
const captureScreenshots = commonData.testFlags?.captureScreenshots !== false; // Default to true if not specified

test.describe("Hotel Booking Flow", () => {
  for (const hoteldata of hotelDestinations) {
    test(`Verify hotel funnel check - ${hoteldata.name}`, async ({ page }) => {
      // Performance tracking
      const startTime = Date.now();
      
      // Initialize page objects
      const homePage = new HomePage(page);
      let hotelDetailsPage: HotelDetailsPage;
      let guestDetailsPage: GuestDetailsPage;
      let paymentPage: PaymentPage;
      
      // Track test status for reporting
      const testStatus = {
        success: false,
        failureReason: '',
        startStep: '',
        endStep: ''
      };
      
      // Navigate to AirAsia website
      await test.step("Navigate to homepage", async () => {
        try {
          testStatus.startStep = "Navigate to homepage";
          console.log("Navigating to AirAsia homepage...");
          await homePage.navigateToHomepage();
          
          if (captureScreenshots) {
            await homePage.takeScreenshot(`homepage-${hoteldata.name}`);
          }
        } catch (error: any) {
          testStatus.failureReason = `Failed to navigate to homepage: ${error.message}`;
          console.error(testStatus.failureReason);
          throw error;
        }
      });

      // Handle initial popups
      await test.step("Handle popups", async () => {
        try {
          console.log("Handling initial popups...");
          await homePage.handlePopups();
        } catch (error: any) {
          // Non-critical step, log but continue
          console.warn(`Warning: Error handling popups: ${error.message}`);
        }
      });

      // Navigate to Hotels section
      await test.step("Navigate to Hotels tab", async () => {
        console.log("Switching to Hotels tab...");
        await homePage.switchToHotelsTab();
        await homePage.takeScreenshot(`hotels-tab-${hoteldata.name}`);
      });

      // Set destination
      await test.step("Set destination", async () => {
        try {
          testStatus.startStep = "Set destination";
          console.log(`Setting destination to ${hoteldata.name}...`);
          await homePage.setDestination(hoteldata.name);
          
          if (captureScreenshots) {
            await homePage.takeScreenshot(`search-form-${hoteldata.name}`);
          }
        } catch (error: any) {
          testStatus.failureReason = `Failed to set destination: ${error.message}`;
          console.error(testStatus.failureReason);
          throw error;
        }
      });

      // Set dates
      await test.step("Set dates", async () => {
        try {
          testStatus.startStep = "Set dates";
          console.log("Setting travel dates...");
          const { checkInDaysFromNow, stayDuration } = hoteldata.dates;
          await homePage.setDates(checkInDaysFromNow, stayDuration);
        } catch (error: any) {
          testStatus.failureReason = `Failed to set dates: ${error.message}`;
          console.error(testStatus.failureReason);
          throw error;
        }
      });

      // Perform search with retry logic
      await test.step("Perform search", async () => {
        testStatus.startStep = "Perform search";
        console.log("Performing hotel search...");
        
        // Implement retry logic for search
        let attempts = 0;
        const maxAttempts = 3;
        
        while (attempts < maxAttempts) {
          try {
            await homePage.searchHotels();
            break; // Success, exit the loop
          } catch (error: any) {
            attempts++;
            console.log(`Search attempt ${attempts}/${maxAttempts} failed: ${error.message}`);
            
            if (attempts >= maxAttempts) {
              testStatus.failureReason = `Failed to perform search after ${maxAttempts} attempts: ${error.message}`;
              console.error(testStatus.failureReason);
              throw error;
            }
            
            // Wait before retrying
            console.log(`Retrying search in 2 seconds...`);
            await page.waitForTimeout(2000);
          }
        }
      });

      // Initialize hotel listing page and verify results
      const hotelListingPage = new HotelListingPage(page);
      
      // Verify results
      await test.step("Verify search results", async () => {
        try {
          testStatus.startStep = "Verify search results";
          console.log("Verifying search results...");
          
          // Wait for results with extended timeout
          await hotelListingPage.waitForSearchResults(30000);
          
          if (captureScreenshots) {
            await page.screenshot({
              path: `screenshots/search-results-${hoteldata.name}.png`,
            });
          }
          
          // Verify results and make assertions
          await hotelListingPage.verifyHotelCards(3);
          
          // Use a more comprehensive selector to find hotel cards
          const hotelCards = await hotelListingPage.page.locator(
            '.hotel-card, .property-card, [data-testid="hotel-card"], .property-list-item, ' +
            '.hotelCard, div[role="listitem"], .hotel-item'
          ).count();
          
          // Instead of hard assertion, check if verifyHotelCards returned info
          console.log(`Found hotel cards with selector: ${hotelCards}`);
          console.log(`Found ${hotelCards} hotel listings`);
        } catch (error: any) {
          testStatus.failureReason = `Failed to verify search results: ${error.message}`;
          console.error(testStatus.failureReason);
          
          // Take screenshot on error regardless of configuration
          await page.screenshot({
            path: `screenshots/search-error-${hoteldata.name}.png`,
          });
          throw error;
        }
      });

      // Select and book a room
      await test.step("Select hotel and navigate to details", async () => {
        try {
          testStatus.startStep = "Select hotel and navigate to details";
          console.log("Selecting a random hotel...");
          
          // Select random hotel and get the new page
          const detailsPage = await hotelListingPage.selectRandomHotel();
          
          // Initialize hotel details page with the new page
          hotelDetailsPage = new HotelDetailsPage(detailsPage);
          
          // Scroll to middle and wait for rooms with timeout
          await hotelDetailsPage.scrollToMiddle();
          try {
            await hotelDetailsPage.waitForRooms(20000);
            // If we get here, rooms were loaded successfully
          } catch (error: any) {
            console.error(`Error loading rooms: ${error.message}`);
            throw new Error(`Failed to load hotel rooms: ${error.message}`);
          }
        } catch (error: any) {
          testStatus.failureReason = `Failed to select hotel or navigate to details: ${error.message}`;
          console.error(testStatus.failureReason);
          throw error;
        }
        
        // Select a random room
        await test.step("Select room and rate plan", async () => {
          try {
            testStatus.startStep = "Select room and rate plan";
            // Get available rooms first
            await hotelDetailsPage.waitForRooms(30000);
            
            // Then select a random room
            const { roomCard, roomIndex } = await hotelDetailsPage.selectRandomRoom();
            
            // Get rate plans for the selected room
            const ratePlans = await hotelDetailsPage.getRatePlans(roomCard);
            const ratePlanCount = await ratePlans.count();
            expect(ratePlanCount).toBeGreaterThan(0);
            
            // Select a random rate plan
            const { ratePlan, ratePlanIndex } = await hotelDetailsPage.selectRandomRatePlan(ratePlans);
            console.log(`Selected rate plan ${ratePlanIndex} of ${ratePlanCount}`);
            
            if (captureScreenshots) {
              // Take screenshot before clicking Book Now
              await hotelDetailsPage.takeScreenshot(`before-continue-${hoteldata.name}`);
            }
            
            console.log("Finding Book Now button...");
            
            // Add retry logic for clicking Book Now button
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
              try {
                await hotelDetailsPage.clickBookNow(ratePlan);
                break; // Success, exit the loop
              } catch (error: any) {
                attempts++;
                if (attempts >= maxAttempts) {
                  console.error(`Failed to click Book Now button after ${maxAttempts} attempts: ${error.message}`);
                  throw error;
                }
                console.log(`Attempt ${attempts}/${maxAttempts} to click Book Now button failed. Retrying...`);
                await hotelDetailsPage.page.waitForTimeout(2000);
              }
            }
            
            // Wait for navigation to guest details
            const navigationSuccessful = await hotelDetailsPage.waitForGuestDetailsPage(30000);
            expect(navigationSuccessful).toBe(true);
          } catch (error: any) {
            testStatus.failureReason = `Failed during room/rate selection: ${error.message}`;
            console.error(testStatus.failureReason);
            
            // Take error screenshot
            await hotelDetailsPage.takeScreenshot(`book-button-error-${hoteldata.name}`);
            throw error;
          }
        });
      });
      
      // Initialize guest details page
      await test.step('Fill guest details', async () => {
        try {
          testStatus.startStep = "Fill guest details";
          console.log('Filling guest details...');
          
          // Initialize guest details page
          guestDetailsPage = new GuestDetailsPage(hotelDetailsPage.page);
          
          // Verify page loaded
          const pageLoaded = await guestDetailsPage.verifyPageLoaded();
          expect(pageLoaded).toBe(true);
          console.log("Guest details page loaded");
          
          if (captureScreenshots) {
            // Take screenshot of the guest details page
            await guestDetailsPage.takeScreenshot(`guest-details-${hoteldata.name}`);
          }
          
          // Fill guest information using data from test data file
          const { firstName: guestFirstName, lastName: guestLastName } = hoteldata.guestDetails;
          await guestDetailsPage.fillGuestInformation(guestFirstName, guestLastName);
          
          // Fill booker information using data from test data file
          const { firstName: bookerFirstName, lastName: bookerLastName, email, phone } = hoteldata.bookerDetails;
          await guestDetailsPage.fillBookerInformation(
            bookerFirstName, bookerLastName, email, phone
          );
          
          // Continue to payment with retry logic if needed
          let continueAttempts = 0;
          const maxContinueAttempts = 2;
          
          while (continueAttempts < maxContinueAttempts) {
            try {
              await guestDetailsPage.continueToPayment();
              break;
            } catch (continueError: any) {
              continueAttempts++;
              if (continueAttempts >= maxContinueAttempts) {
                throw continueError;
              }
              console.log(`Retry ${continueAttempts}/${maxContinueAttempts} for continuing to payment...`);
              await guestDetailsPage.page.waitForTimeout(2000);
            }
          }
          
        } catch (error: any) {
          testStatus.failureReason = `Failed to fill guest details: ${error.message}`;
          console.error(testStatus.failureReason);
          
          // Always take error screenshot
          await guestDetailsPage.takeScreenshot(`guest-details-error-${hoteldata.name}`);
          throw error;
        }
      });
      
      // Initialize payment page
      await test.step('Verify payment page', async () => {
        try {
          testStatus.startStep = "Verify payment page";
          console.log('Verifying payment page...');
          
          // Initialize payment page
          paymentPage = new PaymentPage(hotelDetailsPage.page);
          
          // Verify payment page loaded
          const paymentPageLoaded = await paymentPage.verifyPageLoaded();
          expect(paymentPageLoaded).toBe(true);
          console.log("Payment page loaded successfully");
          
          if (captureScreenshots) {
            // Take screenshot of payment page
            await paymentPage.takeScreenshot(`payment-page-${hoteldata.name}`);
          }
        } catch (error: any) {
          testStatus.failureReason = `Failed to verify payment page: ${error.message}`;
          console.error(testStatus.failureReason);
          
          // Always take error screenshot
          await paymentPage.takeScreenshot(`payment-page-error-${hoteldata.name}`);
          throw error;
        }
      });
      
      // Enter payment details - skip if specified in config
      if (!skipPayment) {
        await test.step('Enter payment details', async () => {
          try {
            testStatus.startStep = "Enter payment details";
            console.log('Entering payment details...');
            
            // Fill payment details using data from test data file
            await paymentPage.fillPaymentDetails(hoteldata.paymentDetails);
            
            if (captureScreenshots) {
              // Take final screenshot of payment form
              await paymentPage.takeScreenshot(`payment-form-${hoteldata.name}`);
            }
          } catch (error: any) {
            testStatus.failureReason = `Failed to enter payment details: ${error.message}`;
            console.error(testStatus.failureReason);
            
            // Always take error screenshot
            await paymentPage.takeScreenshot(`payment-details-error-${hoteldata.name}`);
            throw error;
          }
        });
      } else {
        console.log('Skipping payment details as specified in configuration');
      }
      
      // Calculate test duration and log results
      const endTime = Date.now();
      const testDuration = endTime - startTime;
      const durationSeconds = (testDuration / 1000).toFixed(1);
      
      console.log(`\nTest Results for ${hoteldata.name}:`);
      console.log(`Status: ${testStatus.success ? 'PASSED ✅' : 'FAILED ❌'}`);
      if (!testStatus.success) {
        console.log(`Failure: ${testStatus.failureReason}`);
      }
      console.log(`Duration: ${durationSeconds} seconds`);
      console.log(`Start Step: ${testStatus.startStep}`);
      console.log(`End Step: ${testStatus.endStep}`);
      console.log('------------------------\n');
    });
  }
});
