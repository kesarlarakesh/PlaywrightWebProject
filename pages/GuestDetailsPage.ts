import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './BasePage';

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
      await this.waitForPageLoad('networkidle', timeout);
      console.log('Guest details page loaded');
      
      // Try multiple selectors to verify we're on the correct page
      try {
        await this.waitForElement(this.guestDetailTitle, 10000);
        console.log('Found guest-detail-title');
        return true;
      } catch (e) {
        try {
          await this.waitForElement(this.checkingInText, 10000);
          console.log('Found \'Who\'s checking-in?\' text');
          return true;
        } catch (e) {
          console.error('Could not verify guest details page loaded');
          return false;
        }
      }
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
        console.log('Attempted name entry again using fill() method');
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
    givenName = 'Booker', 
    familyName = 'Test', 
    email = 'test@example.com',
    mobile = '5551234567'
  ): Promise<void> {
    console.log('Filling booker information');
    
    try {
      // Find booker section
      await this.waitForElement(this.bookerSection, 10000);
      
      // Fill Booker Given Name
      await this.fill(this.bookerGivenNameInput, givenName);
      
      // Fill Booker Family Name
      await this.fill(this.bookerFamilyNameInput, familyName);
      
      // Fill Email Address
      await this.fill(this.emailInput, email);
      
      // Fill Mobile Number
      await this.fill(this.mobileInput, mobile);
      
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
    
    // Take screenshot before clicking continue
    await this.takeScreenshot('before-continue');
    
    // Find and click the continue button
    await this.waitForElement(this.continueButton, 10000);
    await this.click(this.continueButton);
    console.log('Clicked continue to payment button');
    
    // Wait for navigation to payment page
    await this.waitForPageLoad('networkidle', 30000);
    console.log('Navigated to payment page');
  }
}
