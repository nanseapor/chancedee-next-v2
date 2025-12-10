/**
 * Secure Error Logging Utilities
 *
 * Prevents information disclosure through verbose error messages in production.
 *
 * Security: CWE-209 - Generation of Error Message Containing Sensitive Information
 *
 * In development, logs full error details for debugging.
 * In production, logs only safe error messages to prevent information leakage.
 */

const isProduction = process.env.NODE_ENV === "production";

/**
 * Safely log error in server-side code
 *
 * @param context - Context string (e.g., "API: User Data", "Auth: Login")
 * @param error - Error object or message
 *
 * @example
 * try {
 *   await someOperation();
 * } catch (error) {
 *   logError("API: User Data", error);
 *   return NextResponse.json({ error: "Internal server error" }, { status: 500 });
 * }
 */
export function logError(context: string, error: unknown): void {
  if (isProduction) {
    // In production: Only log safe error message, not full stack traces
    if (error instanceof Error) {
      console.error(`[${context}] Error:`, error.message);
    } else {
      console.error(`[${context}] Error:`, String(error));
    }
  } else {
    // In development: Log full error details for debugging
    console.error(`[${context}] Error:`, error);
  }
}

/**
 * Safely log warning in server-side code
 *
 * @param context - Context string
 * @param message - Warning message
 * @param data - Optional data (will be stringified in dev, omitted in prod if sensitive)
 */
export function logWarning(
  context: string,
  message: string,
  data?: unknown,
): void {
  if (isProduction) {
    console.warn(`[${context}] ${message}`);
  } else {
    if (data !== undefined) {
      console.warn(`[${context}] ${message}`, data);
    } else {
      console.warn(`[${context}] ${message}`);
    }
  }
}

/**
 * Safely log info in server-side code
 *
 * @param context - Context string
 * @param message - Info message
 * @param data - Optional data (will be logged in dev only if sensitive)
 */
export function logInfo(
  context: string,
  message: string,
  data?: unknown,
): void {
  if (!isProduction && data !== undefined) {
    console.log(`[${context}] ${message}`, data);
  } else {
    console.log(`[${context}] ${message}`);
  }
}

/**
 * Get a safe error message to return to the client
 *
 * Returns generic message in production, detailed message in development
 *
 * @param error - Error object
 * @param fallback - Fallback generic message (default: "Internal server error")
 * @returns Safe error message string
 */
export function getSafeErrorMessage(
  error: unknown,
  fallback = "Internal server error",
): string {
  if (isProduction) {
    // In production: Always return generic message
    return fallback;
  }

  // In development: Return actual error message for debugging
  if (error instanceof Error) {
    return error.message;
  }

  return String(error);
}

/**
 * Create a standardized error response with safe logging
 *
 * @param context - Context for logging (e.g., "API: User Data")
 * @param error - Error object
 * @param clientMessage - Safe message to send to client (default: "Internal server error")
 * @param statusCode - HTTP status code (default: 500)
 */
export function createErrorResponse(
  context: string,
  error: unknown,
  clientMessage = "Internal server error",
  statusCode = 500,
): { error: string; status: number } {
  // Log the error securely
  logError(context, error);

  // Return safe message to client
  return {
    error: getSafeErrorMessage(error, clientMessage),
    status: statusCode,
  };
}
