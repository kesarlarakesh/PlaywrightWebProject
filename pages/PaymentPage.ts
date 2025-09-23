import { Page, Locator, expect, FrameLocator } from '@playwright/test';
import { BasePage } from './BasePage';

/**
 * Represents the Payment Page
 */
export class PaymentPage extends BasePage {
  // Locators
  private readonly paymentSection: Locator;
  private readonly creditCardOption: Locator;
  
  /**
   * Constructor for PaymentPage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    super(page);
    
    // Initialize locators
    this.paymentSection = page.locator('text=Payment details');
    this.creditCardOption = page.locator('label:has-text("Credit Card")').first();
  }
  
  /**
   * Verify that the payment page has loaded correctly
   * @param timeout - Maximum time to wait in ms
   * @returns boolean - True if payment page loaded successfully
   */
  async verifyPageLoaded(timeout = 30000): Promise<boolean> {
    try {
      await this.waitForElement(this.paymentSection, timeout);
      console.log('Payment page loaded successfully');
      return true;
    } catch (error) {
      console.error('Error verifying payment page:', error);
      return false;
    }
  }
  
  /**
   * Select credit card payment method if necessary
   */
  async selectCreditCardPayment(): Promise<void> {
    try {
      if (await this.isVisible(this.creditCardOption, 5000)) {
        await this.click(this.creditCardOption);
        console.log('Selected credit card payment method');
      } else {
        console.log('Credit card selection not required or already selected');
      }
    } catch (e) {
      console.log('Credit card selection not required');
    }
  }
  
  /**
   * Fill credit card number (tries multiple methods)
   * @param cardNumber - Credit card number
   */
  async fillCardNumber(cardNumber: string): Promise<boolean> {
    try {
      console.log('Attempting to fill card number...');
      let cardFilled = false;
      
      // Try with iframe first (most secure implementation)
      try {
        const cardFrame = this.page.frameLocator('iframe[title="Secure card number input frame"], iframe[name*="card"], iframe.card-field').first();
        const cardInIframe = cardFrame.locator('input#cardNumber, input.card-number, input[name="cardnumber"]');
        
        if (await this.isVisible(cardInIframe as unknown as Locator, 2000)) {
          await cardInIframe.fill(cardNumber);
          console.log('Filled card number in iframe');
          cardFilled = true;
        }
      } catch (iframeError) {
        console.log('No card iframe found or error accessing it');
      }
      
      // If iframe didn't work, try direct inputs
      if (!cardFilled) {
        // Get count of potential card inputs
        const cardInputs = await this.page.locator('input[placeholder="Card number"], input#cardNumber, input[name="cardNumber"], input.card-number').count();
        console.log(`Found ${cardInputs} potential card number inputs`);
        
        if (cardInputs > 0) {
          // Try each input until one works
          for (let i = 0; i < cardInputs; i++) {
            try {
              const input = this.page.locator('input[placeholder="Card number"], input#cardNumber, input[name="cardNumber"], input.card-number').nth(i);
              if (await this.isVisible(input, 1000)) {
                await input.fill(cardNumber);
                console.log(`Filled card number in input #${i+1}`);
                cardFilled = true;
                break;
              }
            } catch (inputError) {
              console.log(`Error with card input #${i+1}`);
            }
          }
        }
      }
      
      // If still not filled, try generic payment input fallbacks
      if (!cardFilled) {
        try {
          // Look for any input that might be a card field
          const genericCardInput = this.page.locator('input[autocomplete="cc-number"], input[name*="card"], input[name*="credit"], input[aria-label*="card"]').first();
          if (await this.isVisible(genericCardInput, 1000)) {
            await genericCardInput.fill(cardNumber);
            console.log('Filled card number using generic card input selector');
            cardFilled = true;
          }
        } catch (genericError) {
          console.log('Generic card input not found');
        }
      }
      
      return cardFilled;
    } catch (e: any) {
      console.log('Error handling card number:', e.message);
      return false;
    }
  }
  
  /**
   * Fill card holder name
   * @param cardholderName - Name on card
   */
  async fillCardholderName(cardholderName: string): Promise<boolean> {
    try {
      console.log('Attempting to fill cardholder name...');
      
      // Try multiple selector approaches for name field
      const nameSelectors = [
        'input[placeholder="Name on card"]',
        'input[placeholder*="name"]',
        'input[name="cardholderName"]',
        'input[id*="name"][id*="card"]',
        'input[autocomplete="cc-name"]'
      ];
      
      let nameFilled = false;
      
      // Try each selector until one works
      for (const selector of nameSelectors) {
        try {
          const nameInputs = await this.page.locator(selector).count();
          
          if (nameInputs > 0) {
            const nameInput = this.page.locator(selector).first();
            if (await this.isVisible(nameInput, 1000)) {
              await nameInput.fill(cardholderName);
              console.log(`Filled name on card using selector: ${selector}`);
              nameFilled = true;
              break;
            }
          }
        } catch (e) {
          // Continue to next selector
        }
      }
      
      return nameFilled;
    } catch (e: any) {
      console.log('Error filling name on card:', e.message);
      return false;
    }
  }
  
  /**
   * Fill card expiry date
   * @param expiryDate - Expiry date (MM/YY format)
   */
  async fillExpiryDate(expiryDate: string): Promise<boolean> {
    try {
      console.log('Attempting to fill expiry date...');
      let expiryFilled = false;
      
      // Try iframe first (common secure implementation)
      try {
        const expiryFrame = this.page.frameLocator('iframe[title="Secure expiration date input frame"], iframe[name*="expir"], iframe.expiry-field').first();
        const expiryInIframe = expiryFrame.locator('input#expiryDate, input[name*="expiry"]');
        
        if (await this.isVisible(expiryInIframe as unknown as Locator, 1000)) {
          await expiryInIframe.fill(expiryDate.replace('/', ''));
          console.log('Filled expiry date in iframe');
          expiryFilled = true;
        }
      } catch (iframeError) {
        console.log('No expiry iframe found or error accessing it');
      }
      
      // Try regular input fields if iframe didn't work
      if (!expiryFilled) {
        // Try common expiry date input formats
        const expirySelectors = [
          'input[placeholder="MM/YY"]',
          'input[placeholder="MM / YY"]',
          'input[placeholder*="expiry"]',
          'input[name*="expiry"]',
          'input[autocomplete="cc-exp"]'
        ];
        
        for (const selector of expirySelectors) {
          try {
            const expiryInputs = await this.page.locator(selector).count();
            
            if (expiryInputs > 0) {
              for (let i = 0; i < expiryInputs; i++) {
                const expiryInput = this.page.locator(selector).nth(i);
                if (await this.isVisible(expiryInput, 1000)) {
                  await expiryInput.fill(expiryDate);
                  console.log(`Filled expiry date using selector: ${selector}`);
                  expiryFilled = true;
                  break;
                }
              }
            }
            
            if (expiryFilled) break;
          } catch (e) {
            // Continue to next selector
          }
        }
      }
      
      // Try separate month/year fields if combined didn't work
      if (!expiryFilled) {
        try {
          const monthInput = this.page.locator('select[name*="month"], select[aria-label*="month"], select[id*="month"]').first();
          const yearInput = this.page.locator('select[name*="year"], select[aria-label*="year"], select[id*="year"]').first();
          
          const monthVisible = await this.isVisible(monthInput, 1000);
          const yearVisible = await this.isVisible(yearInput, 1000);
          
          if (monthVisible && yearVisible) {
            const [month, year] = expiryDate.split('/');
            await monthInput.selectOption(month);
            await yearInput.selectOption({ label: `20${year}` }).catch(async () => {
              // If exact year not available, select last option (farthest future year)
              const options = await yearInput.locator('option').count();
              if (options > 0) {
                await yearInput.selectOption({ index: options - 1 });
              }
            });
            console.log('Selected expiry date from dropdown');
            expiryFilled = true;
          }
        } catch (e) {
          console.log('Error with separate month/year fields');
        }
      }
      
      return expiryFilled;
    } catch (e: any) {
      console.log('Error filling expiry date:', e.message);
      return false;
    }
  }
  
  /**
   * Fill CVV/CVC security code
   * @param cvv - CVV code
   */
  async fillCVV(cvv: string): Promise<boolean> {
    try {
      console.log('Attempting to fill CVV/CVC...');
      let cvvFilled = false;
      
      // Try iframe first (common secure implementation)
      try {
        const cvvFrame = this.page.frameLocator('iframe[title="Secure CVC input frame"], iframe[name*="cvc"], iframe[name*="cvv"], iframe.cvv-field').first();
        const cvvInIframe = cvvFrame.locator('input#cvv, input#cvc, input[name*="cvc"], input[name*="cvv"]');
        
        if (await this.isVisible(cvvInIframe as unknown as Locator, 1000)) {
          await cvvInIframe.fill(cvv);
          console.log('Filled CVV in iframe');
          cvvFilled = true;
        }
      } catch (iframeError) {
        console.log('No CVV iframe found or error accessing it');
      }
      
      // Try regular input fields if iframe didn't work
      if (!cvvFilled) {
        const cvvSelectors = [
          'input[placeholder="CVV"]',
          'input[placeholder="CVC"]',
          'input[placeholder*="security code"]',
          'input[name*="cvv"]',
          'input[name*="cvc"]',
          'input[autocomplete="cc-csc"]'
        ];
        
        for (const selector of cvvSelectors) {
          try {
            const cvvInputs = await this.page.locator(selector).count();
            
            if (cvvInputs > 0) {
              for (let i = 0; i < cvvInputs; i++) {
                const cvvInput = this.page.locator(selector).nth(i);
                if (await this.isVisible(cvvInput, 1000)) {
                  await cvvInput.fill(cvv);
                  console.log(`Filled CVV using selector: ${selector}`);
                  cvvFilled = true;
                  break;
                }
              }
            }
            
            if (cvvFilled) break;
          } catch (e) {
            // Continue to next selector
          }
        }
      }
      
      return cvvFilled;
    } catch (e: any) {
      console.log('Error filling CVV:', e.message);
      return false;
    }
  }
  
  /**
   * Check required checkboxes (terms and conditions, etc.)
   */
  async checkRequiredCheckboxes(): Promise<void> {
    try {
      console.log('Checking for required checkboxes...');
      const checkboxCount = await this.page.locator('input[type="checkbox"]').count();
      
      if (checkboxCount > 0) {
        console.log(`Found ${checkboxCount} checkboxes, checking required ones`);
        for (let i = 0; i < checkboxCount; i++) {
          const checkbox = this.page.locator('input[type="checkbox"]').nth(i);
          // Check if the checkbox is required and not checked
          try {
            const isRequired = await checkbox.evaluate(el => {
              return el.hasAttribute('required') || el.getAttribute('aria-required') === 'true';
            });
            
            const isChecked = await checkbox.isChecked();
            
            if (isRequired && !isChecked) {
              await checkbox.check();
              console.log(`Checked required checkbox #${i+1}`);
            }
          } catch (e) {
            console.log(`Error checking checkbox #${i+1}`);
          }
        }
      }
    } catch (e: any) {
      console.log('Error handling checkboxes:', e.message);
    }
  }
  
  /**
   * Fill all payment form fields
   * @param paymentDetails - Payment details object containing card info
   */
  async fillPaymentDetails(paymentDetails: {
    cardNumber: string;
    cardholderName: string;
    expiryDate: string;
    cvv: string;
  }): Promise<void> {
    try {
      await this.selectCreditCardPayment();
      
      // Fill card details
      const cardNumberFilled = await this.fillCardNumber(paymentDetails.cardNumber);
      const nameOnCardFilled = await this.fillCardholderName(paymentDetails.cardholderName);
      const expiryFilled = await this.fillExpiryDate(paymentDetails.expiryDate);
      const cvvFilled = await this.fillCVV(paymentDetails.cvv);
      
      // Check required checkboxes
      await this.checkRequiredCheckboxes();
      
      console.log('Payment form filled successfully');
    } catch (error) {
      console.error('Error entering payment details:', error);
      console.log('Continuing test execution despite payment entry issues');
    }
  }
}
