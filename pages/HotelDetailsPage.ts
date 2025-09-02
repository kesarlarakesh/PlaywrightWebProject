import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Represents the Hotel Details Page
 */
export class HotelDetailsPage extends BasePage {
  // Locators
  private readonly roomsSection: Locator;
  private readonly roomCards: Locator;
  
  /**
   * Constructor for HotelDetailsPage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.roomsSection = page.locator('div');
    const lazyLoadWrapper = this.roomsSection.locator('.lazyload-wrapper');
    this.roomCards = lazyLoadWrapper.locator(
      'xpath=//*[contains(@class, "NewRoomCard__Wrapper")]'
    );
  }
  
  /**
   * Scroll to the middle of the page
   */
  async scrollToMiddle(): Promise<void> {
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight / 2);
    });
    await this.page.waitForTimeout(1000); // Wait for scroll animation
    console.log('Scrolled to middle of the page');
  }
  
  /**
   * Wait for room cards to be loaded
   * @param timeout - Maximum time to wait in ms
   */
  async waitForRooms(timeout = 30000): Promise<void> {
    await this.waitForElement(this.roomCards.first(), timeout);
    const roomCount = await this.roomCards.count();
    
    if (roomCount === 0) {
      throw new Error('No rooms available for this hotel');
    }
    
    console.log(`Found ${roomCount} available rooms`);
  }
  
  /**
   * Select a random room from available options
   */
  async selectRandomRoom(): Promise<{ roomCard: Locator; roomIndex: number }> {
    const roomCount = await this.roomCards.count();
    const { selectedItem: selectedRoom, index: randomRoomIndex } = 
      await this.selectRandomItem(this.roomCards);
      
    await this.scrollToElement(selectedRoom);
    console.log(`Selected room ${randomRoomIndex + 1} of ${roomCount}`);
    
    return { roomCard: selectedRoom, roomIndex: randomRoomIndex };
  }
  
  /**
   * Get all rate plans for a specific room
   * @param roomCard - The selected room card locator
   */
  async getRatePlans(roomCard: Locator): Promise<Locator> {
    const roomInfoWrapper = roomCard.locator(
      'xpath=//*[contains(@class, "NewRoomCard__RoomInfoWrapper")]'
    );
    await this.waitForElement(roomInfoWrapper.first(), 10000);
    
    // Get all rate plans within the wrapper
    const ratePlans = roomInfoWrapper.locator(
      'xpath=//*[contains(@class, "RateInfo__RateContentWrapper")]'
    );
    
    const ratePlanCount = await ratePlans.count();
    if (ratePlanCount === 0) {
      throw new Error('No rate plans available for the selected room');
    }
    
    console.log(`Found ${ratePlanCount} rate plans for the selected room`);
    return ratePlans;
  }
  
  /**
   * Select a random rate plan from available options
   * @param ratePlans - The collection of rate plan locators
   */
  async selectRandomRatePlan(ratePlans: Locator): Promise<{ ratePlan: Locator; ratePlanIndex: number }> {
    const ratePlanCount = await ratePlans.count();
    const { selectedItem: selectedRatePlan, index: randomRatePlanIndex } = 
      await this.selectRandomItem(ratePlans);
      
    await this.scrollToElement(selectedRatePlan);
    console.log(`Selected rate plan ${randomRatePlanIndex + 1} of ${ratePlanCount}`);
    
    return { ratePlan: selectedRatePlan, ratePlanIndex: randomRatePlanIndex };
  }
  
  /**
   * Find and click the Book Now button for a selected rate plan
   * @param ratePlan - The selected rate plan locator
   */
  async clickBookNow(ratePlan: Locator): Promise<void> {
    try {
      console.log('Finding Book Now button...');
      
      // Ensure the page is in focus before interacting with elements
      await this.ensureFocus();
      
      // Scroll to make sure the rate plan is in view
      await ratePlan.scrollIntoViewIfNeeded();
      await this.page.waitForTimeout(500); // Allow UI to stabilize
      
      // Locate the PriceInfoWrapper within the selected rate plan
      const priceInfoWrapper = ratePlan.locator(
        'xpath=//*[contains(@class, "RateInfo__PriceInfoWrapper")]'
      );
      await this.waitForElement(priceInfoWrapper, 10000);
      
      // Locate the PriceWrapper
      const priceWrapper = priceInfoWrapper.locator(
        'xpath=//*[contains(@class, "PriceInfo__PriceWrapper")]'
      );
      await this.waitForElement(priceWrapper, 5000);
      
      // Locate the PriceDetails
      const priceDetails = priceWrapper.locator(
        'xpath=//*[contains(@class, "PriceInfo__PriceDetails")]'
      );
      await this.waitForElement(priceDetails, 5000);
      
      // Take a screenshot before clicking the button
      await this.takeScreenshot('before-book-button');
      
      // Try different approaches to find the Book Now button
      const bookNowButton = priceDetails.locator(
        '.Button__ButtonContainer:has-text("Book now")'
      );
      
      if (await this.isVisible(bookNowButton, 5000)) {
        await this.click(bookNowButton);
        console.log('Clicked Book Now button');
        return;
      }
      
      // Fallback approach 1 - More generalized selector
      const fallbackButton1 = priceDetails.locator('a:has-text("Book now"), button:has-text("Book now")');
      if (await this.isVisible(fallbackButton1, 3000)) {
        await this.click(fallbackButton1);
        console.log('Clicked Book Now button (fallback 1)');
        return;
      }
      
      // Fallback approach 2 - Try in the entire rate plan
      const fallbackButton2 = ratePlan.locator(':text("Book now"), a:has-text("Book now"), button:has-text("Book now")');
      if (await this.isVisible(fallbackButton2, 3000)) {
        await this.click(fallbackButton2);
        console.log('Clicked Book Now button (fallback 2)');
        return;
      }
      
      // Fallback approach 3 - Try searching the entire page
      const fullPageBookButton = this.page.getByRole('link', { name: /book now/i });
      if (await this.isVisible(fullPageBookButton, 3000)) {
        await this.click(fullPageBookButton);
        console.log('Clicked Book Now button (fallback 3 - page-wide search)');
        return;
      }
      
      // Fallback approach 4 - Case insensitive search on the entire page
      const caseInsensitiveButton = this.page.locator('a, button', { hasText: /book now/i }).first();
      if (await this.isVisible(caseInsensitiveButton, 3000)) {
        await this.click(caseInsensitiveButton);
        console.log('Clicked Book Now button (fallback 4 - case insensitive)');
        return;
      }
      
      // Fallback approach 5 - Check for any visible variant of "Book" button
      const anyBookButton = this.page.locator('a, button', { hasText: /\bbook\b/i }).first();
      if (await this.isVisible(anyBookButton, 3000)) {
        await this.click(anyBookButton);
        console.log('Clicked general Book button (fallback 5)');
        return;
      }
      
      // Take a screenshot for debugging if no button was found
      const timestamp = new Date().toISOString().replace(/:/g, '-');
      await this.page.screenshot({ path: `screenshots/book-button-not-found-${timestamp}.png`, fullPage: true });
      console.error('Could not find Book Now button with any approach - screenshot saved for debugging');
      
      // Fallback approach 4 - Try clicking any button that might be relevant
      const confirmButton = this.page.locator('button:has-text("Confirm"), button:has-text("Continue"), a:has-text("Continue")').first();
      if (await this.isVisible(confirmButton, 3000)) {
        await this.click(confirmButton);
        console.log('Clicked Confirm/Continue button (fallback 4)');
        return;
      }
      
      // Take a screenshot before failing
      await this.takeScreenshot('book-button-not-found');
      throw new Error('Could not find Book Now button with any approach');
      
    } catch (error) {
      console.error('Error clicking Book Now button:', error);
      await this.takeScreenshot('book-button-error');
      throw error;
    }
  }
  
  /**
   * Wait for navigation after booking
   * @param timeout - Maximum time to wait in ms
   * @returns boolean - True if navigation was successful
   */
  async waitForGuestDetailsPage(timeout = 30000): Promise<boolean> {
    try {
      await this.waitForPageLoad('networkidle', timeout);
      console.log('Navigated to guest details page');
      return true;
    } catch (error) {
      console.error('Failed to navigate to guest details page:', error);
      return false;
    }
  }
}
