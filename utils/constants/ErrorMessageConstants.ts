/**
 * Error Message Constants
 * 
 * Standardized error messages with consistent formatting for method references
 * Uses dynamic method names to ensure accuracy and reduce duplication
 */

export const ERROR_MESSAGES = {
  // TestExecutionHelper errors - Dynamic method name support
  STEP_FUNCTION_REQUIRED: (methodName: string) => 
    `stepFunction is required when providing testStatus. Usage: \`${methodName}(stepName, testStatus, stepFunction)\``,
  
  // Dynamic method name error generator for consistency
  STEP_FUNCTION_REQUIRED_DYNAMIC: (actualMethodName: string) =>
    `stepFunction is required when providing testStatus. Usage: \`${actualMethodName}(stepName, testStatus, stepFunction)\``,
  
  // Generic method reference formatting
  METHOD_REFERENCE: (methodName: string, params?: string) => 
    params ? `\`${methodName}(${params})\`` : `\`${methodName}()\``,
} as const;

/**
 * Error message generators that use function.name for accuracy
 */
export const DYNAMIC_ERROR_GENERATORS = {
  /**
   * Generate step function required error using actual method name
   * @param methodFunction - The actual function reference
   * @returns Formatted error message with correct method name
   */
  stepFunctionRequired: (methodFunction: Function) => 
    `stepFunction is required when providing testStatus. Usage: \`${methodFunction.name}(stepName, testStatus, stepFunction)\``,
  
  /**
   * Generate method usage error with actual method name
   * @param methodFunction - The actual function reference
   * @param signature - Method signature parameters
   * @returns Formatted error message
   */
  methodUsage: (methodFunction: Function, signature: string) =>
    `Invalid usage. Expected: \`${methodFunction.name}(${signature})\``,
  
  /**
   * Generate parameter validation error with method context
   * @param methodFunction - The actual function reference
   * @param parameterName - Name of the invalid parameter
   * @param expectedType - Expected parameter type
   * @returns Formatted error message
   */
  parameterValidation: (methodFunction: Function, parameterName: string, expectedType: string) =>
    `Invalid parameter '${parameterName}' in \`${methodFunction.name}()\`. Expected: ${expectedType}`,
} as const;

/**
 * Error handling utilities for consistent error message extraction
 */
export const ERROR_UTILS = {
  /**
   * Safely extract error message from any error type
   * Handles Error instances, strings, and other types consistently
   * 
   * @param error - The error to extract message from
   * @returns Safe error message string
   */
  extractErrorMessage: (error: unknown): string => {
    if (error instanceof Error) {
      return error.message;
    }
    if (typeof error === 'string') {
      return error;
    }
    try {
      return JSON.stringify(error);
    } catch {
      return String(error);
    }
  },

  /**
   * Create a formatted warning message with consistent error handling
   * 
   * @param context - Context description for the warning
   * @param error - The error that occurred
   * @returns Formatted warning message
   */
  formatWarningMessage: (context: string, error: unknown): string => {
    const errorMessage = ERROR_UTILS.extractErrorMessage(error);
    return `Warning: ${context}: ${errorMessage}`;
  },
} as const;

/**
 * Console message formatting utilities
 */
export const LOG_FORMATTERS = {
  // Method reference in log messages
  methodRef: (methodName: string, params?: string) => 
    params ? `\`${methodName}(${params})\`` : `\`${methodName}()\``,
  
  // Action reference in log messages  
  actionRef: (actionName: string) => `\`${actionName}\``,
  
  // File/path reference in log messages
  pathRef: (path: string) => `\`${path}\``,
  
  // Environment/config reference
  configRef: (config: string) => `\`${config}\``,
} as const;

/**
 * Standard method names for consistent referencing
 */
export const METHOD_NAMES = {
  EXECUTE_STEP: 'executeStep',
  EXECUTE_OPTIONAL_STEP: 'executeOptionalStep',
  FILL: 'fill',
  CLICK: 'click',
  TYPE: 'type',
  SELECT_OPTION: 'selectOption',
  WAIT_FOR: 'waitFor',
} as const;