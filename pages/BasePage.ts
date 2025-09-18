import { Page, Locator, expect } from '@playwright/test';
import { ConfigManager } from '../utils/ConfigManager';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Base Page class that provides common functionality for all page objects
 */
export class BasePage {
  readonly page: Page;
  protected readonly config: ConfigManager;
  protected readonly defaultTimeout: number;

  /**
   * Constructor for BasePage
   * @param page - Playwright page instance
   */
  constructor(page: Page) {
    this.page = page;
    this.config = ConfigManager.getInstance();
    this.defaultTimeout = this.config.getEnvValue<number>('timeout', 30000);
  }
  
  /**
   * Ensure the page is in focus before interactions
   * Helps prevent "Page is not visible" warnings
   */
  async ensureFocus(): Promise<void> {
    try {
      console.log('Ensuring page is in focus...');
      await this.page.evaluate(() => {
        window.focus();
      });
      // Brief pause to allow focus to take effect
      await this.page.waitForTimeout(100);
    } catch (error) {
      // Log but continue if this fails
      console.warn('Could not ensure page focus:', error);
    }
  }

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url, { timeout: this.defaultTimeout });
    try {
      // Use a shorter timeout for networkidle to avoid hanging too long
      await this.page.waitForLoadState('domcontentloaded', { timeout: 30000 });
      // Only wait for networkidle with a reduced timeout
      await this.page.waitForLoadState('networkidle', { timeout: 60000 }).catch(e => {
        console.log('Network did not reach idle state, continuing anyway');
      });
    } catch (error: any) {
      console.log(`Page load may not be complete, but continuing: ${error.message || error}`);
    }
  }

  /**
   * Wait for page to load completely
   * @param state - Load state to wait for
   * @param timeout - Maximum time to wait in ms (defaults to config value)
   */
  async waitForPageLoad(
    state: 'load' | 'domcontentloaded' | 'networkidle' = 'networkidle', 
    timeout?: number
  ): Promise<void> {
    await this.page.waitForLoadState(state, { timeout: timeout || this.defaultTimeout });
  }

  /**
   * Click on an element
   * @param locator - Element to click
   */
  async click(locator: Locator): Promise<void> {
    // Ensure page is in focus before clicking to prevent visibility warnings
    await this.ensureFocus();
    
    await locator.waitFor({ state: 'visible' });
    try {
      await locator.click();
    } catch (error: any) {
      // If clicking fails, try again with force option
      if (error.message.includes('not visible') || error.message.includes('not in viewport')) {
        console.log('Element click failed, trying with force option');
        await locator.click({ force: true });
      } else {
        throw error;
      }
    }
  }

  /**
   * Fill a form field
   * @param locator - Form field element
   * @param value - Value to enter
   * @param delay - Delay between keystrokes
   */
  async fill(locator: Locator, value: string, delay = 100): Promise<void> {
    // Ensure page is in focus before filling to prevent visibility warnings
    await this.ensureFocus();
    
    await locator.waitFor({ state: 'visible' });
    try {
      await locator.pressSequentially(value, { delay });
    } catch (error: any) {
      // If typing fails, try again with standard fill
      if (error.message.includes('not visible') || error.message.includes('not in viewport')) {
        console.log('Press sequentially failed, trying with standard fill');
        await locator.fill(value);
      } else {
        throw error;
      }
    }
  }

  /**
   * Check if element is visible
   * @param locator - Element to check
   * @param timeout - Maximum time to wait in ms
   */
  async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      // First check if the element exists in DOM
      const count = await locator.count();
      if (count === 0) {
        return false;
      }
      
      // Then check if it's visible
      await locator.waitFor({ state: 'visible', timeout });
      
      // Additional visibility check through JS evaluation
      const isVisibleInViewport = await locator.evaluate((el) => {
        const rect = el.getBoundingClientRect();
        return (
          rect.top >= 0 &&
          rect.left >= 0 &&
          rect.bottom <= (window.innerHeight || document.documentElement.clientHeight) &&
          rect.right <= (window.innerWidth || document.documentElement.clientWidth)
        );
      }).catch(() => false);
      
      if (!isVisibleInViewport) {
        // If not in viewport, attempt to scroll to it
        await locator.scrollIntoViewIfNeeded();
        await this.page.waitForTimeout(300); // Wait for scroll
      }
      
      return true;
    } catch (e) {
      return false;
    }
  }

  /**
   * Wait for an element to be visible
   * @param locator - Element to wait for
   * @param timeout - Maximum time to wait in ms (defaults to config value)
   */
  async waitForElement(locator: Locator, timeout?: number): Promise<void> {
    await locator.waitFor({ 
      state: 'visible', 
      timeout: timeout || Math.floor(this.defaultTimeout / 3) 
    });
  }

  /**
   * Get text content of an element
   * @param locator - Element to get text from
   */
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: 'visible' });
    return await locator.textContent() || '';
  }

 

  /**
   * Scroll to element
   * @param locator - Element to scroll to
   */
  async scrollToElement(locator: Locator): Promise<void> {
    await locator.scrollIntoViewIfNeeded();
    await this.page.waitForTimeout(500); // Wait for scroll animation
  }

  /**
   * Select a random item from a collection of locators
   * @param locators - Collection of locators
   * @param maxIndex - Maximum index to consider
   */
  async selectRandomItem(locators: Locator, maxIndex?: number): Promise<{ selectedItem: Locator; index: number }> {
    const count = await locators.count();
    if (count === 0) {
      throw new Error('No items available to select');
    }
    
    const max = maxIndex ? Math.min(maxIndex, count) : count;
    const randomIndex = Math.floor(Math.random() * max);
    const selectedItem = locators.nth(randomIndex);
    
    return { selectedItem, index: randomIndex };
  }

  /**
   * Wait for URL to include specific string
   * @param urlSubstring - String that URL should contain
   * @param timeout - Maximum time to wait in ms
   */
  async waitForUrl(urlSubstring: string | RegExp, timeout = 30000): Promise<void> {
    await this.page.waitForURL(urlSubstring, { timeout });
  }
}