import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';
import { TestDataManager } from '../testdata/testDataManager';

/**
 * Represents the Guest Details Page
 */
export class GuestDetailsPage extends BasePage {
  // Locators
  private readonly guestDetailTitle: Locator;
  private readonly checkingInText: Locator;
  private readonly givenNameInput: Locator;
  private readonly familyNameInput: Locator;
  private readonly bookerSection: Locator;
  private readonly bookerGivenNameInput: Locator;
  private readonly bookerFamilyNameInput: Locator;
  private readonly emailInput: Locator;
  private readonly mobileInput: Locator;
  private readonly continueButton: Locator;
  
  /**
   * Constructor for GuestDetailsPage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.guestDetailTitle = page.locator('#guest-detail-title');
    this.checkingInText = page.locator('text="Who\'s checking-in?"');
    this.givenNameInput = page.locator('.given-name input[placeholder="Given name"]').first();
    this.familyNameInput = page.locator('.family-name input[placeholder="Family name/Surname"]').first();
    this.bookerSection = page.locator('.booker');
    this.bookerGivenNameInput = this.bookerSection.locator('.given-name input[placeholder="Given name"]');
    this.bookerFamilyNameInput = this.bookerSection.locator('.family-name input[placeholder="Family name/Surname"]');
    this.emailInput = this.bookerSection.locator('.email input[placeholder="Email address"]');
    this.mobileInput = page.locator('.phone-number input[placeholder="Mobile number"]');
    this.continueButton = page.locator('button:has-text("Continue")');
  }
  
  /**
   * Verify that the guest details page has loaded correctly
   * @param timeout - Maximum time to wait in ms
   * @returns boolean - True if page loaded successfully
   */
  async verifyPageLoaded(timeout = 30000): Promise<boolean> {
    try {
      // Wait for network to become relatively idle - allows page to load
      await this.waitForPageLoad('networkidle', timeout);
      console.log('Waiting for guest details page to load...');
      
      // Define an array of locator strategies to try
      const locatorStrategies = [
        // Strategy 1: Check for title element
        async () => {
          await this.waitForElement(this.guestDetailTitle, 3000);
          console.log('Found guest-detail-title');
          return true;
        },
        
        // Strategy 2: Check for "Who's checking in" text
        async () => {
          await this.waitForElement(this.checkingInText, 3000);
          console.log('Found \'Who\'s checking-in?\' text');
          return true;
        },
        
        // Strategy 3: Check for any form input with name/placeholder related to guests
        async () => {
          const nameInputs = this.page.locator('input[placeholder*="name"], input[placeholder*="Given"], input[name="firstName"]');
          await this.waitForElement(nameInputs, 3000);
          console.log('Found name input fields');
          return true;
        },
        
        // Strategy 4: Look for headings or text related to guests
        async () => {
          const guestHeadings = this.page.locator('h1, h2, h3, div.title').filter({ hasText: /guest|booker|traveler|who|checking/i });
          await this.waitForElement(guestHeadings, 3000);
          console.log('Found guest-related headings');
          return true;
        },
        
        // Strategy 5: Check URL for indicators of guest details page
        async () => {
          const url = this.page.url();
          if (url.includes('guest') || url.includes('traveler') || url.includes('booking')) {
            console.log('URL indicates guest details page');
            return true;
          }
          return false;
        },

        // Strategy 6: Check for any form with multiple inputs (last resort)
        async () => {
          const anyForm = this.page.locator('form, div:has(> input[type="text"]:nth-child(1):nth-child(-n+5))');
          await this.waitForElement(anyForm, 3000);
          console.log('Found a form with multiple inputs');
          return true;
        }
      ];
      
      // Try each strategy in order
      for (const strategy of locatorStrategies) {
        try {
          const result = await strategy();
          if (result) {
            return true;
          }
        } catch (e) {
          // Continue to next strategy
        }
      }
      
      // If we got here, none of the strategies worked
      console.error('Could not verify guest details page loaded using any strategy');
      return false;
    } catch (error) {
      console.error('Error verifying guest details page loaded:', error);
      return false;
    }
  }
  
  /**
   * Fill guest information (who's checking in)
   * @param givenName - Guest's first name
   * @param familyName - Guest's last name
   */
  async fillGuestInformation(givenName = 'Test', familyName = 'User'): Promise<void> {
    console.log('Filling guest (who\'s checking-in) information');
    
    try {
      // Fill Given Name with verification
      await this.waitForElement(this.givenNameInput, 5000);
      await this.page.waitForTimeout(1000);
      await this.fill(this.givenNameInput, givenName);
      
      // Verify that name was entered correctly
      await this.page.waitForTimeout(500);
      const nameValue = await this.givenNameInput.inputValue();
      
      if (nameValue !== givenName) {
        console.warn(`Name verification failed. Expected '${givenName}' but got '${nameValue}'`);
        await this.givenNameInput.fill(givenName);
        console.log('Attempted name entry again using `fill()` method');
      }
      
      // Fill Family Name/Surname
      await this.waitForElement(this.familyNameInput, 5000);
      await this.fill(this.familyNameInput, familyName);
      
      console.log('Filled guest information successfully');
    } catch (error: any) {
      console.error('Error filling guest information:', error);
      throw new Error(`Failed to fill guest information: ${error.message}`);
    }
  }
  
  /**
   * Fill booker information
   * @param givenName - Booker's first name
   * @param familyName - Booker's last name
   * @param email - Booker's email address
   * @param mobile - Booker's mobile number
   */
  async fillBookerInformation(
    givenName?: string, 
    familyName?: string, 
    email?: string,
    mobile?: string
  ): Promise<void> {
    console.log('Filling booker information');
    
    try {
      // Get default booker information from test data if parameters are not provided
      const testDataManager = TestDataManager.getInstance();
      const defaultBookerInfo = testDataManager.getDefaultBookerInfo();
      
      // Use provided values or fall back to defaults from test data
      const firstName: string = givenName || defaultBookerInfo.firstName;
      const lastName: string = familyName || defaultBookerInfo.lastName;
      const emailAddress: string = email || defaultBookerInfo.email;
      const phoneNumber: string = mobile || defaultBookerInfo.phone;
      
      // Find booker section
      await this.waitForElement(this.bookerSection, 10000);
      
      // Fill Booker Given Name
      await this.fill(this.bookerGivenNameInput, firstName);
      
      // Fill Booker Family Name
      await this.fill(this.bookerFamilyNameInput, lastName);
      
      // Fill Email Address
      await this.fill(this.emailInput, emailAddress);
      
      // Fill Mobile Number
      await this.fill(this.mobileInput, phoneNumber);
      
      console.log('Filled booker information successfully');
    } catch (error: any) {
      console.error('Error filling booker information:', error);
      throw new Error(`Failed to fill booker information: ${error.message}`);
    }
  }
  
  /**
   * Continue to payment page
   */
  async continueToPayment(): Promise<void> {
    // Scroll down to find the continue button
    await this.page.evaluate(() => {
      window.scrollTo(0, document.body.scrollHeight);
    });
    await this.page.waitForTimeout(1000);
    
    // Find and click the continue button
    await this.waitForElement(this.continueButton, 10000);
    await this.click(this.continueButton);
    console.log('Clicked continue to payment button');
    
    // Wait for navigation to payment page
    await this.waitForPageLoad('networkidle', 30000);
    console.log('Navigated to payment page');
  }
}