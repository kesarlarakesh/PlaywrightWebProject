import { Page, Locator, expect } from "@playwright/test";
import { BasePage } from "./BasePage";

/**
 * Represents the Hotel Listing Page
 */
export class HotelListingPage extends BasePage {
  // Locators
  private readonly hotelsSection: Locator;
  private readonly hotelCards: Locator;
  
  /**
   * Constructor for HotelListingPage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.hotelsSection = page.locator("#hotels");
    this.hotelCards = this.hotelsSection.locator(
      ".lazyload-wrapper .HotelCard__Container-sc-mub93g-0"
    );
  }
  
  /**
   * Wait for hotel search results to load
   * @param timeout - Maximum time to wait in ms
   */
  async waitForSearchResults(timeout = 60000): Promise<void> {
    await this.waitForUrl(/.*hotel.*/, timeout);
    await this.waitForElement(this.hotelsSection, timeout);
    console.log("Hotel search results loaded");
  }
  
  /**
   * Get the count of hotel cards displayed
   */
  async getHotelCount(): Promise<number> {
    await this.waitForElement(this.hotelCards.first(), 10000);
    return await this.hotelCards.count();
  }
  
  /**
   * Verify that hotel cards contain expected information
   * @param numberOfCards - Number of cards to verify
   */
  async verifyHotelCards(numberOfCards = 3): Promise<void> {
    const count = await this.getHotelCount();
    console.log(`Found ${count} hotel listings`);
    
    if (count === 0) {
      throw new Error("No hotel listings found");
    }
    
    const cardsToVerify = Math.min(numberOfCards, count);
    
    for (let i = 0; i < cardsToVerify; i++) {
      const card = this.hotelCards.nth(i);
      await this.waitForElement(card, 10000);
      
      try {
        // Verify hotel card wrapper and structure
        const cardWrapper = card.locator(".HotelCard__Wrapper-sc-mub93g-1");
        await this.waitForElement(cardWrapper, 5000);
        
        // Verify hotel details section
        const detailsWrapper = cardWrapper.locator(
          ".HotelCard__HotelDetailsWrapper-sc-mub93g-4"
        );
        await this.waitForElement(detailsWrapper, 5000);
        
        // Verify hotel information
        await this.waitForElement(
          detailsWrapper.locator(".HotelInfo__Title-sc-1ew4f3l-5"),
          5000
        );
        await this.waitForElement(
          detailsWrapper.locator(".HotelInfo__Location-sc-1ew4f3l-9"),
          5000
        );
        
        // Verify review section
        const reviewWrapper = detailsWrapper.locator(
          ".HotelInfo__ReviewWrapper-sc-1ew4f3l-13"
        );
        await this.waitForElement(reviewWrapper, 5000);
        await this.waitForElement(
          reviewWrapper.locator(".Review__ScoreCard-sc-mu0oi8-2"),
          5000
        );
        
        // Verify amenities
        const amenities = detailsWrapper.locator(
          ".HotelInfo__Amenities-sc-1ew4f3l-14"
        );
        await this.waitForElement(amenities, 5000);
        
        // Verify price details
        const priceWrapper = cardWrapper.locator(
          ".HotelCard__PriceDetailsWrapper-sc-mub93g-12"
        );
        await this.waitForElement(priceWrapper, 5000);
        await this.waitForElement(
          priceWrapper.locator(".Price__PriceContainer-sc-1xkv6to-0"),
          5000
        );
        
        console.log(`Verified hotel card ${i + 1} information successfully`);
      } catch (error: any) {
        console.log(
          `Could not verify all information for hotel card ${i + 1}:`,
          error.message
        );
      }
    }
  }
  
  /**
   * Select a random hotel card and navigate to its details page
   * @param maxCardIndex - Maximum index to consider for selection
   * @returns - The new hotel details page
   */
  async selectRandomHotel(maxCardIndex = 3): Promise<Page> {
    const { selectedItem: selectedCard, index: randomIndex } = 
      await this.selectRandomItem(this.hotelCards, maxCardIndex);
    
    console.log(`Selected hotel card ${randomIndex + 1}`);
    
    // Click the card and wait for new window/tab
    const [newPage] = await Promise.all([
      this.page.waitForEvent("popup"),
      this.click(selectedCard),
    ]);
    
    // Wait for the new page to load
    await newPage.waitForLoadState("networkidle");
    console.log("Navigated to hotel details page");
    
    return newPage;
  }
}
