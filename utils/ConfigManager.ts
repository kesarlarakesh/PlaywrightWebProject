import * as fs from 'fs';
import * as path from 'path';

/**
 * Configuration Manager for handling environment-specific settings
 */
export class ConfigManager {
  private static instance: ConfigManager;
  private config: any;
  private currentEnv: string;

  /**
   * Private constructor for singleton pattern
   */
  private constructor() {
    try {
      // Load the config file
      const configPath = path.join(process.cwd(), 'config', 'config.json');
      this.config = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      
      // Determine the environment from process.env.TEST_ENV (set by playwright.config.ts)
      // or use default environment from config
      this.currentEnv = process.env.TEST_ENV || this.config.defaultEnvironment || 'prod';
      
      // Validate that the environment exists in the config
      if (!this.config.environments[this.currentEnv]) {
        console.warn(`Environment '${this.currentEnv}' not found in config. Using default environment.`);
        this.currentEnv = this.config.defaultEnvironment;
      }
      
      console.log(`ConfigManager initialized with environment: ${this.currentEnv}`);
    } catch (error) {
      console.error('Error loading configuration:', error);
      throw new Error(`Failed to load configuration: ${error}`);
    }
  }

  /**
   * Get singleton instance of ConfigManager
   */
  public static getInstance(): ConfigManager {
    if (!ConfigManager.instance) {
      ConfigManager.instance = new ConfigManager();
    }
    return ConfigManager.instance;
  }

  /**
   * Get the current environment name
   */
  public getEnvironment(): string {
    return this.currentEnv;
  }

  /**
   * Set the current environment
   * @param env - Environment name
   */
  public setEnvironment(env: string): void {
    if (!this.config.environments[env]) {
      throw new Error(`Environment '${env}' not found in config`);
    }
    this.currentEnv = env;
    console.log(`Environment switched to: ${this.currentEnv}`);
  }

  /**
   * Get the base URL for the current environment
   */
  public getBaseUrl(): string {
    return this.config.environments[this.currentEnv].baseUrl;
  }

  /**
   * Get environment-specific value
   * @param key - The configuration key
   * @param defaultValue - Default value if key not found
   */
  public getEnvValue<T>(key: string, defaultValue: T): T {
    return this.config.environments[this.currentEnv][key] !== undefined 
      ? this.config.environments[this.currentEnv][key] as T
      : defaultValue;
  }

  /**
   * Get global configuration value (not environment specific)
   * @param key - The configuration key
   * @param defaultValue - Default value if key not found
   */
  public getValue<T>(key: string, defaultValue: T): T {
    return this.config[key] !== undefined 
      ? this.config[key] as T
      : defaultValue;
  }

  /**
   * Get test data from configuration
   * @param key - The test data key
   * @param defaultValue - Default value if key not found
   */
  public getTestData<T>(key: string, defaultValue: T): T {
    return this.config.testData && this.config.testData[key] 
      ? this.config.testData[key] as T
      : defaultValue;
  }

  /**
   * Get the entire configuration object
   */
  public getFullConfig(): any {
    return this.config;
  }

  /**
   * Get the current environment's configuration
   */
  public getCurrentEnvConfig(): any {
    return this.config.environments[this.currentEnv];
  }
}
