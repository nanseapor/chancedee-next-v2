/**
 * Rate Limiting Higher-Order Function
 * Per AUTH-R00 §5 Cross-Cutting Infrastructure
 *
 * Wraps server actions with rate limiting to prevent abuse
 * Uses existing RateLimiter class from rate-limiter.ts
 */

import rateLimiter, {
  RATE_LIMIT_CONFIGS,
  getClientIP,
} from "./rate-limiter";
import { headers } from "next/headers";

/**
 * Rate limit error class
 * Thrown when rate limit is exceeded
 */
export class RateLimitError extends Error {
  constructor(
    message: string,
    public resetTime: number
  ) {
    super(message);
    this.name = "RateLimitError";
  }

  /**
   * Get seconds until rate limit resets
   */
  get retryAfter(): number {
    return Math.ceil((this.resetTime - Date.now()) / 1000);
  }
}

/**
 * Higher-Order Function for rate-limited server actions
 * Per AUTH-R00 §5
 *
 * @param action - Server action to wrap
 * @param configKey - Key from RATE_LIMIT_CONFIGS
 * @param keyExtractor - Function to extract rate limit key from input
 * @returns Wrapped action with rate limiting
 *
 * @example
 * ```typescript
 * const sendOTP = withRateLimit(
 *   async (input: { email: string }) => {
 *     // Send OTP logic
 *     return { success: true };
 *   },
 *   "OTP_REQUEST",
 *   (input) => input.email
 * );
 * ```
 */
export function withRateLimit<TInput, TOutput>(
  action: (input: TInput) => Promise<TOutput>,
  configKey: keyof typeof RATE_LIMIT_CONFIGS,
  keyExtractor: (input: TInput) => string
): (input: TInput) => Promise<TOutput> {
  return async (input: TInput): Promise<TOutput> => {
    // Get rate limit config
    const config = RATE_LIMIT_CONFIGS[configKey];

    // Extract key (e.g., email, refCode)
    const key = keyExtractor(input);

    // Get client IP for compound key
    const headersList = await headers();
    const clientIP = getClientIP(headersList);

    // Create compound key: configKey_extractedKey_clientIP
    // Example: "OTP_REQUEST_user@example.com_192.168.1.1"
    const rateLimitKey = `${configKey}_${key}_${clientIP}`;

    // Check rate limit
    const { success, resetTime } = await rateLimiter.limit(
      rateLimitKey,
      config
    );

    if (!success) {
      throw new RateLimitError("RATE_LIMITED", resetTime || Date.now());
    }

    // Proceed with action
    try {
      const result = await action(input);

      // On success, optionally reset rate limit
      // Uncomment if you want to reset on successful operations
      // rateLimiter.reset(rateLimitKey);

      return result;
    } catch (error) {
      // On failure, keep rate limit active
      throw error;
    }
  };
}

/**
 * Type guard to check if error is a rate limit error
 */
export function isRateLimitError(error: unknown): error is RateLimitError {
  return error instanceof RateLimitError;
}
