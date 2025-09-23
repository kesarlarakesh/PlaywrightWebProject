import * as fs from 'fs';
import * as path from 'path';
import { ConfigManager } from '../utils/ConfigManager';

/**
 * TestDataManager class for centralized test data management
 */
export class TestDataManager {
  private static instance: TestDataManager;
  private config: ConfigManager;
  private testDataCache: Map<string, any> = new Map();
  
  /**
   * Private constructor for Singleton pattern
   */
  private constructor() {
    this.config = ConfigManager.getInstance();
  }
  
  /**
   * Get singleton instance of TestDataManager
   */
  public static getInstance(): TestDataManager {
    if (!TestDataManager.instance) {
      TestDataManager.instance = new TestDataManager();
    }
    return TestDataManager.instance;
  }
  
  /**
   * Load test data from a JSON file
   * @param fileName - Name of the JSON file in the testdata directory
   * @returns - Parsed test data
   */
  public loadTestData(fileName: string): any {
    try {
      // Check cache first
      if (this.testDataCache.has(fileName)) {
        return this.testDataCache.get(fileName);
      }
      
      // If not in cache, load from file
      const filePath = path.join(process.cwd(), 'tests', 'testdata', fileName);
      
      if (!fs.existsSync(filePath)) {
        throw new Error(`Test data file not found: ${filePath}`);
      }
      
      const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
      
      // Store in cache for future access
      this.testDataCache.set(fileName, data);
      
      return data;
    } catch (error) {
      console.error(`Error loading test data from ${fileName}:`, error);
      throw error;
    }
  }
  
  /**
   * Get all test data
   * @returns - Complete test data object
   */
  public getTestData(): any {
    return this.loadTestData('testdata.json');
  }
  
  /**
   * Get hotel destinations test data
   * @returns - Hotel destinations data
   */
  public getHotelDestinations(): any[] {
    const testData = this.getTestData();
    return testData.hotels.destinations;
  }
  
  /**
   * Get hotel test data for a specific destination by name
   * @param destinationName - Name of the destination to find
   * @returns - Hotel test data for the specified destination
   */
  public getHotelTestDataByName(destinationName: string): any {
    const destinations = this.getHotelDestinations();
    return destinations.find(dest => dest.name === destinationName);
  }
  
  /**
   * Get hotel test data for a specific destination by ID
   * @param destinationId - ID of the destination to find
   * @returns - Hotel test data for the specified destination
   */
  public getHotelTestDataById(destinationId: string): any {
    const destinations = this.getHotelDestinations();
    return destinations.find(dest => dest.id === destinationId);
  }
  
  /**
   * Get common hotel test data
   * @returns - Common hotel test data
   */
  public getCommonHotelData(): any {
    const testData = this.getTestData();
    return testData.hotels.commonData;
  }
  
  /**
   * Get default check-in days from config
   * @returns - Number of days from today for default check-in
   */
  public getDefaultCheckInDays(): number {
    return this.config.getTestData('defaultCheckInDays', 7);
  }
  
  /**
   * Get default stay duration from config
   * @returns - Number of nights for default stay
   */
  public getDefaultStayDuration(): number {
    return this.config.getTestData('defaultStayDuration', 3);
  }
  
  /**
   * Get default guest information directly from testdata.json
   * @returns - Default guest information from common data
   */
  public getDefaultGuestInfo(): any {
    const testData = this.getTestData();
    return testData.hotels.commonData.guestDetails;
  }
  
  /**
   * Get default payment information directly from testdata.json
   * @returns - Default payment information from common data
   */
  public getDefaultPaymentInfo(): any {
    const testData = this.getTestData();
    return testData.hotels.commonData.paymentDetails;
  }
  
  /**
   * Get default booker information directly from testdata.json
   * @returns - Default booker information from common data
   */
  public getDefaultBookerInfo(): any {
    const testData = this.getTestData();
    return testData.hotels.commonData.bookerDetails;
  }
  
  /**
   * Merge test-specific data with default data
   * @param testData - Test-specific data
   * @param defaultData - Default data
   * @returns - Merged data with test-specific values taking precedence
   */
  public mergeWithDefaults(testData: any, defaultData: any): any {
    return { ...defaultData, ...testData };
  }
}
