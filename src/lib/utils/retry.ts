/**
 * Retry utility for handling failed operations with exponential backoff
 */

export interface RetryOptions {
  maxAttempts: number;
  baseDelay: number; // Base delay in milliseconds
  maxDelay: number; // Maximum delay in milliseconds
  timeout?: number; // Optional timeout for each attempt
}

export interface RetryResult<T> {
  success: boolean;
  data?: T;
  error?: Error;
  attempts: number;
}

/**
 * Exponential backoff with jitter
 */
function calculateDelay(
  attempt: number,
  baseDelay: number,
  maxDelay: number,
): number {
  const exponentialDelay = baseDelay * Math.pow(2, attempt - 1);
  const jitter = Math.random() * 0.1 * exponentialDelay; // 10% jitter
  return Math.min(exponentialDelay + jitter, maxDelay);
}

/**
 * Sleep utility
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Retry an async operation with exponential backoff
 */
export async function retryWithBackoff<T>(
  operation: () => Promise<T>,
  options: RetryOptions,
): Promise<RetryResult<T>> {
  const { maxAttempts, baseDelay, maxDelay, timeout } = options;

  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`🔄 Retry attempt ${attempt}/${maxAttempts}`);

      let result: T;

      if (timeout) {
        // Create a timeout promise
        const timeoutPromise = new Promise<never>((_, reject) => {
          setTimeout(
            () => reject(new Error(`Operation timed out after ${timeout}ms`)),
            timeout,
          );
        });

        // Race the operation against the timeout
        result = await Promise.race([operation(), timeoutPromise]);
      } else {
        result = await operation();
      }

      console.log(`✅ Operation succeeded on attempt ${attempt}`);
      return {
        success: true,
        data: result,
        attempts: attempt,
      };
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error";
      console.log(
        `❌ Attempt ${attempt}/${maxAttempts} failed: ${errorMessage}`,
      );

      // If this is the last attempt, return the error
      if (attempt === maxAttempts) {
        console.error(
          `🚨 All ${maxAttempts} attempts failed. Last error:`,
          error,
        );
        return {
          success: false,
          error: error instanceof Error ? error : new Error(String(error)),
          attempts: attempt,
        };
      }

      // Calculate delay before next attempt
      const delay = calculateDelay(attempt, baseDelay, maxDelay);
      console.log(
        `⏳ Waiting ${Math.round(delay)}ms before attempt ${attempt + 1}`,
      );
      await sleep(delay);
    }
  }

  // This should never be reached, but TypeScript requires it
  return {
    success: false,
    error: new Error("Unexpected retry loop exit"),
    attempts: maxAttempts,
  };
}

/**
 * Default retry configuration for Directus operations
 * Optimized for serverless cold starts which can take 30-60 seconds
 */
export const DIRECTUS_RETRY_CONFIG: RetryOptions = {
  maxAttempts: 4, // Increased from 3 to 4 attempts
  baseDelay: 3000, // Start with 3 seconds (increased from 2s)
  maxDelay: 30000, // Max 30 seconds (doubled from 15s for cold starts)
  timeout: 60000, // 60 second timeout per request (doubled from 30s for serverless cold starts)
};

/**
 * Retry specifically for Directus operations with logging
 */
export async function retryDirectusOperation<T>(
  operationName: string,
  operation: () => Promise<T>,
): Promise<RetryResult<T>> {
  console.log(`🎯 Starting Directus operation: ${operationName}`);

  const result = await retryWithBackoff(operation, DIRECTUS_RETRY_CONFIG);

  if (result.success) {
    console.log(
      `🎉 Directus operation "${operationName}" succeeded after ${result.attempts} attempts`,
    );
  } else {
    console.error(
      `💥 Directus operation "${operationName}" failed after ${result.attempts} attempts:`,
      result.error,
    );
  }

  return result;
}
