import { Page, Locator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Represents the AirAsia Homepage with hotel-related actions
 */
export class HomePage extends BasePage {
  // Locators - grouped by functionality
  // Tab navigation
  protected readonly hotelsTab: Locator;
  
  // Destination selection
  protected readonly destinationInput: Locator;
  protected readonly destinationDropdown: Locator;
  
  // Date selection
  protected readonly checkInDateInput: Locator;
  protected readonly checkOutDateInput: Locator;
  protected readonly dateConfirmButton: Locator;
  
  // Actions
  private readonly searchButton: Locator;
  
  // Popups
  private readonly appNotificationCloseButton: Locator;
  
  /**
   * Constructor for HomePage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators with more reliable selectors where possible
    this.hotelsTab = page.getByRole('tab', { name: /hotels/i });
    this.destinationInput = page.locator('.Dropdown__StyledInput-sc-16g04av-10');
    this.destinationDropdown = page.locator('.Dropdown__OptionsContainer-sc-16g04av-11');
    this.checkInDateInput = page.locator('#departclick-handle input[placeholder="dd/mm/yyyy"]');
    this.checkOutDateInput = page.locator('#returnclick-handle input[placeholder="dd/mm/yyyy"]');
    this.dateConfirmButton = page.locator('#closebutton');
    this.searchButton = page.locator('#hsw-search-button-container a');
    this.appNotificationCloseButton = page.locator('[aria-label="Close"]').first();
  }

  /**
   * Navigate to AirAsia homepage
   */
  async navigateToHomepage(): Promise<void> {
    const baseUrl = this.config.getBaseUrl();
    await this.navigateTo(baseUrl);
    console.log(`Navigated to AirAsia homepage (${this.config.getEnvironment()} environment): ${baseUrl}`);
  }
  
  /**
   * Handle initial popups that may appear on the site
   * @returns Promise that resolves when popups are handled
   */
  async handlePopups(): Promise<void> {
    try {
      // Handle app notification if present (with timeout)
      if (await this.isVisible(this.appNotificationCloseButton, 5000)) {
        await this.click(this.appNotificationCloseButton);
        console.log('Closed app notification popup');
      }
      
      // Handle login popup by clicking outside (a common workaround)
      await this.page.mouse.click(10, 10);
      
      // Small wait to allow popups to close
      await this.page.waitForTimeout(1000);
      console.log('Clicked outside to close potential login dialog');
    } catch (e: any) {
      console.log(`No popups to handle or already closed: ${e.message}`);
    }
  }
  
  /**
   * Switch to the Hotels tab
   */
  async switchToHotelsTab(): Promise<void> {
    await this.waitForElement(this.hotelsTab);
    await this.click(this.hotelsTab);
    console.log('Switched to Hotels tab');
  }
  
  /**
   * Set the destination for hotel search
   * @param destination - Name of the destination
   * @returns Promise that resolves when destination is set
   */
  async setDestination(destination: string): Promise<void> {
    // Wait for and interact with the input field
    await this.waitForElement(this.destinationInput);
    await this.click(this.destinationInput);
    
    // Brief pause for UI to respond before typing
    await this.page.waitForTimeout(1000);
    
    // Clear and fill the input
    await this.fill(this.destinationInput, destination);
    
    // Wait for dropdown to appear
    await this.waitForElement(this.destinationDropdown);
    
    // Create a more specific locator for the destination option
    const optionLocator = this.page
      .locator('.Dropdown__OptionMainContent-sc-16g04av-22')
      .filter({
        has: this.page.getByText(destination, { exact: false }),
      });
    
    // Wait for and select the option  
    await this.waitForElement(optionLocator.first());
    await this.click(optionLocator.first());
    
    console.log(`Set destination to: ${destination}`);
  }
  
  /**
   * Format a date object to dd/mm/yyyy string
   * @param date - Date to format
   * @returns Formatted date string
   */
  private formatDate(date: Date): string {
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  }

  /**
   * Set the check-in and check-out dates
   * @param checkInDaysFromNow - Days from today for check-in
   * @param stayDuration - Number of nights to stay
   * @returns Object containing formatted check-in and check-out dates
   */
  async setDates(checkInDaysFromNow = 7, stayDuration = 3): Promise<{ checkIn: string; checkOut: string }> {
    // Calculate check-in and check-out dates
    const checkInDate = new Date();
    checkInDate.setDate(checkInDate.getDate() + checkInDaysFromNow);
    
    const checkOutDate = new Date(checkInDate);
    checkOutDate.setDate(checkOutDate.getDate() + stayDuration);
    
    // Format dates using the extracted method
    const checkInFormatted = this.formatDate(checkInDate);
    const checkOutFormatted = this.formatDate(checkOutDate);
    
    // Fill in the dates
    await this.fill(this.checkInDateInput, checkInFormatted);
    await this.fill(this.checkOutDateInput, checkOutFormatted);
    
    // Click the confirm button
    await this.waitForElement(this.dateConfirmButton);
    await this.click(this.dateConfirmButton);
    
    console.log(`Set dates: ${checkInFormatted} to ${checkOutFormatted}`);
    return { checkIn: checkInFormatted, checkOut: checkOutFormatted };
  }
  
  /**
   * Perform hotel search after setting destination and dates
   * @returns Promise that resolves when search is completed
   * @throws Error if search fails
   */
  async searchHotels(): Promise<void> {
    // Wait for search button with extended timeout
    await this.waitForElement(this.searchButton, 10000);
    
    try {
      // Click search button and wait for page load simultaneously
      await Promise.all([
        this.page.waitForLoadState('domcontentloaded'),
        this.searchButton.click(),
      ]);
      
      // Wait for full page load with extended timeout
      await this.waitForPageLoad('load', 30000);
      console.log('Performed hotel search');
    } catch (error: any) {
      console.error(`Error during hotel search: ${error.message}`);
      
      // Re-throw error to let calling code handle it
      throw new Error(`Hotel search failed: ${error.message}`);
    }
  }
}
