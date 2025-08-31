import { Page, Locator, expect } from "@playwright/test";
import { ConfigManager } from "../utils/ConfigManager";

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
    this.defaultTimeout = this.config.getEnvValue<number>("timeout", 30000);
  }

  /**
   * Navigate to a specific URL
   * @param url - URL to navigate to
   */
  async navigateTo(url: string): Promise<void> {
    await this.page.goto(url);
    await this.page.waitForLoadState("networkidle");
  }

  /**
   * Wait for page to load completely
   * @param state - Load state to wait for
   * @param timeout - Maximum time to wait in ms (defaults to config value)
   */
  async waitForPageLoad(
    state: "load" | "domcontentloaded" | "networkidle" = "networkidle", 
    timeout?: number
  ): Promise<void> {
    await this.page.waitForLoadState(state, { timeout: timeout || this.defaultTimeout });
  }

  /**
   * Click on an element
   * @param locator - Element to click
   */
  async click(locator: Locator): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.click();
  }

  /**
   * Fill a form field
   * @param locator - Form field element
   * @param value - Value to enter
   * @param delay - Delay between keystrokes
   */
  async fill(locator: Locator, value: string, delay = 100): Promise<void> {
    await locator.waitFor({ state: "visible" });
    await locator.pressSequentially(value, { delay });
  }

  /**
   * Check if element is visible
   * @param locator - Element to check
   * @param timeout - Maximum time to wait in ms
   */
  async isVisible(locator: Locator, timeout = 5000): Promise<boolean> {
    try {
      await locator.waitFor({ state: "visible", timeout });
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
      state: "visible", 
      timeout: timeout || Math.floor(this.defaultTimeout / 3) 
    });
  }

  /**
   * Get text content of an element
   * @param locator - Element to get text from
   */
  async getText(locator: Locator): Promise<string> {
    await locator.waitFor({ state: "visible" });
    return await locator.textContent() || "";
  }

  /**
   * Take a screenshot with a specified name
   * @param name - Name of the screenshot file
   */
  async takeScreenshot(name: string): Promise<void> {
    await this.page.screenshot({ path: `screenshots/${name}.png` });
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
      throw new Error("No items available to select");
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
