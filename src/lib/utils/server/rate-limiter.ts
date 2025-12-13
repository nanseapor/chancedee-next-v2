/**
 * Rate Limiter - In-Memory Implementation
 *
 * Implements sliding window rate limiting to prevent brute force attacks
 * and excessive authentication attempts.
 *
 * Security: CWE-307 - Improper Restriction of Excessive Authentication Attempts
 *
 * NOTE: This is an in-memory implementation suitable for single-instance deployments.
 * For production multi-instance deployments, consider using Redis-based rate limiting
 * with @upstash/ratelimit or similar.
 */

import { type NextRequest, NextResponse } from "next/server";

interface RateLimitEntry {
  count: number;
  resetTime: number;
  attempts: number[]; // Timestamps of attempts for sliding window
}

interface RateLimitConfig {
  maxAttempts: number;
  windowMs: number;
  blockDurationMs?: number;
}

class RateLimiter {
  private store: Map<string, RateLimitEntry> = new Map();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Cleanup expired entries every 5 minutes
    this.cleanupInterval = setInterval(
      () => {
        this.cleanup();
      },
      5 * 60 * 1000,
    );
  }

  /**
   * Check if a request should be rate limited
   *
   * @param key - Unique identifier (e.g., IP address, user ID, email)
   * @param config - Rate limit configuration
   * @returns Object with success status and optional retry time
   */
  async limit(
    key: string,
    config: RateLimitConfig,
  ): Promise<{ success: boolean; remaining: number; resetTime?: number }> {
    const now = Date.now();
    const { maxAttempts, windowMs, blockDurationMs = windowMs } = config;

    let entry = this.store.get(key);

    if (!entry) {
      // First attempt
      entry = {
        count: 1,
        resetTime: now + windowMs,
        attempts: [now],
      };
      this.store.set(key, entry);
      return { success: true, remaining: maxAttempts - 1 };
    }

    // Check if block period has expired
    if (now > entry.resetTime) {
      // Reset the window
      entry = {
        count: 1,
        resetTime: now + windowMs,
        attempts: [now],
      };
      this.store.set(key, entry);
      return { success: true, remaining: maxAttempts - 1 };
    }

    // Sliding window: Remove attempts outside the current window
    const windowStart = now - windowMs;
    entry.attempts = entry.attempts.filter(
      (timestamp) => timestamp > windowStart,
    );
    entry.count = entry.attempts.length;

    // Check if limit exceeded
    if (entry.count >= maxAttempts) {
      // Extend block duration if configured
      if (blockDurationMs > windowMs) {
        entry.resetTime = now + blockDurationMs;
      }
      return {
        success: false,
        remaining: 0,
        resetTime: entry.resetTime,
      };
    }

    // Add current attempt
    entry.attempts.push(now);
    entry.count = entry.attempts.length;
    this.store.set(key, entry);

    return {
      success: true,
      remaining: maxAttempts - entry.count,
    };
  }

  /**
   * Reset rate limit for a specific key (e.g., after successful login)
   */
  reset(key: string): void {
    this.store.delete(key);
  }

  /**
   * Get current rate limit status for a key
   */
  getStatus(key: string): { count: number; resetTime: number } | null {
    const entry = this.store.get(key);
    if (!entry) return null;

    const now = Date.now();
    if (now > entry.resetTime) {
      this.store.delete(key);
      return null;
    }

    return {
      count: entry.count,
      resetTime: entry.resetTime,
    };
  }

  /**
   * Clean up expired entries from memory
   */
  private cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of Array.from(this.store.entries())) {
      if (now > entry.resetTime) {
        this.store.delete(key);
      }
    }
  }

  /**
   * Clear all rate limit data (for testing)
   */
  clear(): void {
    this.store.clear();
  }

  /**
   * Cleanup interval timer
   */
  destroy(): void {
    clearInterval(this.cleanupInterval);
    this.store.clear();
  }
}

// Singleton instance
const rateLimiter = new RateLimiter();

/**
 * Rate Limit Configurations
 */
export const RATE_LIMIT_CONFIGS = {
  // Login attempts: 5 attempts per 15 minutes
  LOGIN: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes after limit exceeded
  },

  // Password reset: 3 attempts per hour
  PASSWORD_RESET: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 2 * 60 * 60 * 1000, // Block for 2 hours
  },

  // OTP requests: 5 attempts per 15 minutes
  OTP_REQUEST: {
    maxAttempts: 5,
    windowMs: 15 * 60 * 1000, // 15 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },

  // OTP verification: 5 attempts per 10 minutes
  OTP_VERIFY: {
    maxAttempts: 5,
    windowMs: 10 * 60 * 1000, // 10 minutes
    blockDurationMs: 30 * 60 * 1000, // Block for 30 minutes
  },

  // Email verification: 10 attempts per hour
  EMAIL_VERIFICATION: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
  },

  // Email existence check: 10 attempts per 5 minutes
  EMAIL_CHECK: {
    maxAttempts: 10,
    windowMs: 5 * 60 * 1000, // 5 minutes
  },

  // Account creation: 3 attempts per hour per IP
  ACCOUNT_CREATION: {
    maxAttempts: 3,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // Block for 24 hours
  },

  // Account lockout: 10 failed login attempts per hour per email+IP
  // More strict than regular rate limiting - targets account security
  ACCOUNT_LOCKOUT: {
    maxAttempts: 10,
    windowMs: 60 * 60 * 1000, // 1 hour
    blockDurationMs: 24 * 60 * 60 * 1000, // Block for 24 hours - requires manual unlock or wait
  },
} as const;

/**
 * Helper function to get client IP address
 */
export function getClientIP(headers: Headers): string {
  // Try various headers for client IP
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) {
    // x-forwarded-for can contain multiple IPs, take the first one
    return forwardedFor.split(",")[0]?.trim() || "unknown";
  }

  const realIP = headers.get("x-real-ip");
  if (realIP) {
    return realIP;
  }

  const cfConnectingIP = headers.get("cf-connecting-ip"); // Cloudflare
  if (cfConnectingIP) {
    return cfConnectingIP;
  }

  // Fallback
  return "unknown";
}

/**
 * Format time remaining for user-friendly error messages
 */
export function formatTimeRemaining(resetTime: number): string {
  const now = Date.now();
  const diff = resetTime - now;

  if (diff <= 0) return "0 seconds";

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);

  if (hours > 0) {
    return `${hours} hour${hours > 1 ? "s" : ""}`;
  }
  if (minutes > 0) {
    return `${minutes} minute${minutes > 1 ? "s" : ""}`;
  }
  return `${seconds} second${seconds > 1 ? "s" : ""}`;
}

// Legacy global rate limiter (keep for backward compatibility)
const rateLimit = 10; // 10 requests per minute globally
const rateLimitPeriod = 1000; // 1 second in milliseconds

// Global request count and reset time
let globalRequestCount = 0;
let globalResetTime = Date.now() + rateLimitPeriod;

export function globalRateLimiter(req: NextRequest) {
  const now = Date.now();

  if (now > globalResetTime) {
    // Reset the count and timer if the period has passed
    globalRequestCount = 1;
    globalResetTime = now + rateLimitPeriod;
  } else if (globalRequestCount < rateLimit) {
    // Increment the count if under the limit
    globalRequestCount++;
  } else {
    // Return error response if rate limit is exceeded
    return NextResponse.json(
      { error: "Global rate limit exceeded" },
      {
        status: 429,
        headers: {
          "X-RateLimit-Limit": rateLimit.toString(),
          "X-RateLimit-Remaining": "0",
          "X-RateLimit-Reset": Math.ceil(globalResetTime / 1000).toString(),
        },
      },
    );
  }

  // If not rate limited, return null (allowing the request to proceed)
  return null;
}

export default rateLimiter;
