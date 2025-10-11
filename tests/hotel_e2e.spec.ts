import { test, expect } from '@playwright/test';

// Import page objects
import { HomePage } from '../pages/HomePage';
import { HotelListingPage } from '../pages/HotelListingPage';
import { HotelDetailsPage } from '../pages/HotelDetailsPage';
import { GuestDetailsPage } from '../pages/GuestDetailsPage';
import { PaymentPage } from '../pages/PaymentPage';

// Import utilities
import { ConfigManager } from '../utils/ConfigManager';
import { TestDataManager } from '../testdata/testDataManager';
import { TestExecutionHelper } from '../utils/TestExecutionHelper';

// Initialize configuration and test data managers
const config = ConfigManager.getInstance();
const testDataManager = TestDataManager.getInstance();

console.log(`Running tests with environment: ${config.getEnvironment()}`);

// Load test data from JSON file
const hotelDestinations = testDataManager.getHotelDestinations();
const commonData = testDataManager.getCommonHotelData();

// Extract test configuration from common data
const skipPayment = commonData.testFlags?.skipPayment || false;

test.describe('Hotel Booking Flow', () => {
  for (const hoteldata of hotelDestinations) {
    test(`Verify hotel funnel check - ${hoteldata.name}`, async ({ page }, testInfo) => {
      const testData = {
        destination: hoteldata.name,
        skipPayment: skipPayment
      };

      try {
        // Initialize test with hooks
        await TestExecutionHelper.beforeEach(testInfo, testData);
        
        // Initialize page objects
        const homePage = new HomePage(page);
        let hotelDetailsPage: HotelDetailsPage;
        let guestDetailsPage: GuestDetailsPage;
        let paymentPage: PaymentPage;
        
        // Navigate to AirAsia website
        await test.step('Navigate to homepage', async () => {
          await TestExecutionHelper.executeStep('Navigate to homepage', async () => {
            console.log('Navigating to AirAsia homepage...');
            await homePage.ensureFocus();
            await homePage.navigateToHomepage();
          });
        });

        // Handle initial popups (non-critical)
        await test.step('Handle popups', async () => {
          await TestExecutionHelper.executeOptionalStep('Handle initial popups', async () => {
            console.log('Handling initial popups...');
            await homePage.handlePopups();
          });
        });

        // Navigate to Hotels section
        await test.step('Navigate to Hotels tab', async () => {
          await TestExecutionHelper.executeStep('Navigate to Hotels tab', async () => {
            console.log('Switching to Hotels tab...');
            await homePage.switchToHotelsTab();
          });
        });

        // Set destination
        await test.step('Set destination', async () => {
          await TestExecutionHelper.executeStep('Set destination', async () => {
            console.log(`Setting destination to ${hoteldata.name}...`);
            await homePage.setDestination(hoteldata.name);
          });
        });

        // Set dates
        await test.step('Set dates', async () => {
          await TestExecutionHelper.executeStep('Set dates', async () => {
            console.log('Setting travel dates...');
            const { checkInDaysFromNow, stayDuration } = hoteldata.dates;
            await homePage.setDates(checkInDaysFromNow, stayDuration);
          });
        });

        // Perform search with retry logic
        await test.step('Perform search', async () => {
          await TestExecutionHelper.executeStep('Perform search', async () => {
            console.log('Performing hotel search...');
            
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
                  throw error;
                }
                
                // Wait before retrying
                console.log(`Retrying search in 2 seconds...`);
                await page.waitForTimeout(2000);
              }
            }
          });
        });

        // Initialize hotel listing page and verify results
        const hotelListingPage = new HotelListingPage(page);
        
        // Verify results
        await test.step('Verify search results', async () => {
          await TestExecutionHelper.executeStep('Verify search results', async () => {
            console.log('Verifying search results...');
            
            // Ensure page is in focus
            await hotelListingPage.ensureFocus();
            
            // Wait for results with extended timeout
            await hotelListingPage.waitForSearchResults(30000);
            
            // Verify results and make assertions
            await hotelListingPage.verifyHotelCards(3);
            
            // Use a more comprehensive selector to find hotel cards
            const hotelCards = await hotelListingPage.page.locator(
              '.hotel-card, .property-card, [data-testid="hotel-card"], .property-list-item, ' +
              '.hotelCard, div[role="listitem"], .hotel-item'
            ).count();
            
            console.log(`Found ${hotelCards} hotel listings`);
          });
        });

        // Select and book a room
        await test.step('Select hotel and navigate to details', async () => {
          await TestExecutionHelper.executeStep('Select hotel and navigate to details', async () => {
            console.log('Selecting a random hotel...');
            
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
          });
        });
        
        // Select a random room
        await test.step('Select room and rate plan', async () => {
          await TestExecutionHelper.executeStep('Select room and rate plan', async () => {
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
            
            console.log('Finding Book Now button...');
            
            // Add retry logic for clicking Book Now button
            let attempts = 0;
            const maxAttempts = 3;
            
            while (attempts < maxAttempts) {
              try {
                console.log('Ensuring page is in focus before clicking...');
                await hotelDetailsPage.ensureFocus();
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
          });
        });
      
        // Initialize guest details page
        await test.step('Fill guest details', async () => {
          await TestExecutionHelper.executeStep('Fill guest details', async () => {
            console.log('Filling guest details...');
            
            // Initialize guest details page
            guestDetailsPage = new GuestDetailsPage(hotelDetailsPage.page);
            
            // Verify page loaded
            const pageLoaded = await guestDetailsPage.verifyPageLoaded();
            expect(pageLoaded).toBe(true);
            console.log('Guest details page loaded');
            
            // Fill guest information using data from common test data
            const { firstName: guestFirstName, lastName: guestLastName } = commonData.guestDetails;
            await guestDetailsPage.fillGuestInformation(guestFirstName, guestLastName);
            
            // Fill booker information using data from common test data
            const { firstName: bookerFirstName, lastName: bookerLastName, email, phone } = commonData.bookerDetails;
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
          });
        });
      
        // Initialize payment page
        await test.step('Verify payment page', async () => {
          await TestExecutionHelper.executeStep('Verify payment page', async () => {
            console.log('Verifying payment page...');
            
            // Initialize payment page
            paymentPage = new PaymentPage(hotelDetailsPage.page);
            
            // Verify payment page loaded
            const paymentPageLoaded = await paymentPage.verifyPageLoaded();
            expect(paymentPageLoaded).toBe(true);
            console.log('Payment page loaded successfully');
          });
        });
      
        // Enter payment details - skip if specified in config
        if (!skipPayment) {
          await test.step('Enter payment details', async () => {
            await TestExecutionHelper.executeStep('Enter payment details', async () => {
              console.log('Entering payment details...');
              
              // Fill payment details using data from common test data
              await paymentPage.fillPaymentDetails(commonData.paymentDetails);
            });
          });
        } else {
          console.log('Skipping payment details as specified in configuration');
        }

        // Mark test as passed in LambdaTest if all steps completed successfully
        await TestExecutionHelper.markTestPassed(page);
        console.log('✅ Test completed successfully - all steps passed');

      } catch (error: any) {
        // Mark test as failed in LambdaTest
        await TestExecutionHelper.markTestFailed(page);
        
        // Handle failure with hooks
        await TestExecutionHelper.onFailure(testInfo, page);
        throw error;
      } finally {
        // Finalize test with hooks
        await TestExecutionHelper.afterEach(testInfo, page, testData);
      }
    });
  }

  // Simple completion message after all tests
  test.afterAll(async () => {
    console.log('\n📊 Test execution completed!');
    console.log(`💡 Use 'npm run report:show' to view the test report`);
  });
});
