/**
 * Unit Tests for withRateLimit HOF
 * Tests rate limiting wrapper for server actions
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock modules before imports
vi.mock("@/lib/utils/server/rate-limiter", async (importOriginal) => {
  const actual = await importOriginal<typeof import("@/lib/utils/server/rate-limiter")>();
  return {
    ...actual,
    default: {
      limit: vi.fn(),
    },
    getClientIP: vi.fn(() => "192.168.1.1"),
  };
});

vi.mock("next/headers", () => ({
  headers: vi.fn(() =>
    Promise.resolve(
      new Headers({
        "x-forwarded-for": "192.168.1.1",
      })
    )
  ),
}));

// Import after mocks
import {
  withRateLimit,
  RateLimitError,
  isRateLimitError,
} from "@/lib/utils/server/with-rate-limit";
import rateLimiter from "@/lib/utils/server/rate-limiter";

describe("withRateLimit HOF", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Basic Rate Limiting", () => {
    it("should allow requests within rate limit", async () => {
      const mockAction = vi.fn(async (input: { email: string }) => ({
        success: true,
        data: `Processed ${input.email}`,
      }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      const result = await wrappedAction({ email: "test@example.com" });

      expect(result.success).toBe(true);
      expect(result.data).toBe("Processed test@example.com");
      expect(mockAction).toHaveBeenCalledWith({ email: "test@example.com" });
    });

    it("should throw RateLimitError when limit exceeded", async () => {
      const mockAction = vi.fn();
      const resetTime = Date.now() + 300000;

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: false,
        remaining: 0,
        resetTime,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await expect(
        wrappedAction({ email: "test@example.com" })
      ).rejects.toThrow(RateLimitError);

      expect(mockAction).not.toHaveBeenCalled();
    });

    it("should include resetTime in RateLimitError", async () => {
      const mockAction = vi.fn();
      const resetTime = Date.now() + 300000;

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: false,
        remaining: 0,
        resetTime,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      try {
        await wrappedAction({ email: "test@example.com" });
        expect.fail("Should have thrown RateLimitError");
      } catch (error) {
        expect(error).toBeInstanceOf(RateLimitError);
        if (error instanceof RateLimitError) {
          expect(error.resetTime).toBe(resetTime);
          expect(error.retryAfter).toBeGreaterThan(0);
          expect(error.message).toBe("RATE_LIMITED");
        }
      }
    });
  });

  describe("Key Extraction and Composition", () => {
    it("should compose rate limit key from configKey, extracted key, and IP", async () => {
      const mockAction = vi.fn(async (_input: { email: string }) => ({
        success: true,
      }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await wrappedAction({ email: "test@example.com" });

      expect(rateLimiter.limit).toHaveBeenCalledWith(
        "OTP_REQUEST_test@example.com_192.168.1.1",
        expect.objectContaining({
          maxAttempts: 5,
          windowMs: 15 * 60 * 1000,
        })
      );
    });

    it("should use different keys for different inputs", async () => {
      const mockAction = vi.fn(async (_input: { email: string }) => ({
        success: true,
      }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await wrappedAction({ email: "user1@example.com" });
      await wrappedAction({ email: "user2@example.com" });

      expect(rateLimiter.limit).toHaveBeenNthCalledWith(
        1,
        "OTP_REQUEST_user1@example.com_192.168.1.1",
        expect.any(Object)
      );

      expect(rateLimiter.limit).toHaveBeenNthCalledWith(
        2,
        "OTP_REQUEST_user2@example.com_192.168.1.1",
        expect.any(Object)
      );
    });

    it("should handle different config keys", async () => {
      const mockAction = vi.fn(async (_input: { refCode: string }) => ({
        success: true,
      }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 4,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_VERIFY",
        (input) => input.refCode
      );

      await wrappedAction({ refCode: "ABC123XYZ9" });

      expect(rateLimiter.limit).toHaveBeenCalledWith(
        "OTP_VERIFY_ABC123XYZ9_192.168.1.1",
        expect.objectContaining({
          maxAttempts: 5,
          windowMs: 10 * 60 * 1000,
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should propagate errors from the wrapped action", async () => {
      const mockError = new Error("Action failed");
      const mockAction = vi.fn(async () => {
        throw mockError;
      });

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await expect(
        wrappedAction({ email: "test@example.com" })
      ).rejects.toThrow("Action failed");
    });

    it("should not call action if rate limit check fails", async () => {
      const mockAction = vi.fn();

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: false,
        remaining: 0,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      try {
        await wrappedAction({ email: "test@example.com" });
      } catch {
        // Expected to throw
      }

      expect(mockAction).not.toHaveBeenCalled();
    });
  });

  describe("RateLimitError", () => {
    it("should have correct name and message", () => {
      const resetTime = Date.now() + 300000;
      const error = new RateLimitError("RATE_LIMITED", resetTime);

      expect(error.name).toBe("RateLimitError");
      expect(error.message).toBe("RATE_LIMITED");
      expect(error.resetTime).toBe(resetTime);
    });

    it("should calculate retryAfter in seconds", () => {
      const now = Date.now();
      const resetTime = now + 300000; // 5 minutes
      const error = new RateLimitError("RATE_LIMITED", resetTime);

      const retryAfter = error.retryAfter;

      // Should be approximately 300 seconds (5 minutes)
      expect(retryAfter).toBeGreaterThanOrEqual(299);
      expect(retryAfter).toBeLessThanOrEqual(301);
    });

    it("should handle past resetTime gracefully", () => {
      const resetTime = Date.now() - 1000; // 1 second ago
      const error = new RateLimitError("RATE_LIMITED", resetTime);

      const retryAfter = error.retryAfter;

      // Should return negative or zero
      expect(retryAfter).toBeLessThanOrEqual(0);
    });
  });

  describe("isRateLimitError", () => {
    it("should identify RateLimitError instances", () => {
      const error = new RateLimitError("RATE_LIMITED", Date.now() + 300000);
      expect(isRateLimitError(error)).toBe(true);
    });

    it("should reject regular Error instances", () => {
      const error = new Error("Regular error");
      expect(isRateLimitError(error)).toBe(false);
    });

    it("should reject non-Error values", () => {
      expect(isRateLimitError(null)).toBe(false);
      expect(isRateLimitError(undefined)).toBe(false);
      expect(isRateLimitError("error")).toBe(false);
      expect(isRateLimitError({})).toBe(false);
      expect(isRateLimitError({ name: "RateLimitError" })).toBe(false);
    });

    it("should reject Error-like objects that are not RateLimitError instances", () => {
      const errorLike = {
        name: "RateLimitError",
        message: "Rate limited",
        resetTime: Date.now(),
      };

      // Should return false - not an actual RateLimitError instance
      expect(isRateLimitError(errorLike)).toBe(false);
    });
  });

  describe("IP Address Extraction", () => {
    it("should extract IP from x-forwarded-for header", async () => {
      const mockAction = vi.fn(async () => ({ success: true }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await wrappedAction({ email: "test@example.com" });

      // Should include IP in the key
      expect(rateLimiter.limit).toHaveBeenCalledWith(
        expect.stringContaining("192.168.1.1"),
        expect.any(Object)
      );
    });

    it("should handle missing IP gracefully", async () => {
      const mockAction = vi.fn(async () => ({ success: true }));

      // Mock headers without x-forwarded-for
      const { headers } = await import("next/headers");
      vi.mocked(headers).mockResolvedValueOnce(new Headers());

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        mockAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      await wrappedAction({ email: "test@example.com" });

      // Should use "unknown" or similar fallback
      expect(rateLimiter.limit).toHaveBeenCalledWith(
        expect.stringMatching(/OTP_REQUEST_test@example\.com_.+/),
        expect.any(Object)
      );
    });
  });

  describe("Integration with Multiple Actions", () => {
    it("should handle different actions independently", async () => {
      const sendAction = vi.fn(async (_input: { email: string }) => ({
        success: true,
        refCode: "ABC123",
      }));

      const verifyAction = vi.fn(async (_input: { refCode: string }) => ({
        success: true,
      }));

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedSend = withRateLimit(
        sendAction,
        "OTP_REQUEST",
        (input) => input.email
      );

      const wrappedVerify = withRateLimit(
        verifyAction,
        "OTP_VERIFY",
        (input) => input.refCode
      );

      await wrappedSend({ email: "test@example.com" });
      await wrappedVerify({ refCode: "ABC123" });

      expect(rateLimiter.limit).toHaveBeenNthCalledWith(
        1,
        expect.stringContaining("OTP_REQUEST"),
        expect.any(Object)
      );

      expect(rateLimiter.limit).toHaveBeenNthCalledWith(
        2,
        expect.stringContaining("OTP_VERIFY"),
        expect.any(Object)
      );
    });
  });

  describe("Type Safety", () => {
    it("should preserve input and output types", async () => {
      interface TestInput {
        userId: string;
        action: "create" | "update";
      }

      interface TestOutput {
        success: boolean;
        userId: string;
        timestamp: number;
      }

      const typedAction = async (input: TestInput): Promise<TestOutput> => ({
        success: true,
        userId: input.userId,
        timestamp: Date.now(),
      });

      vi.mocked(rateLimiter.limit).mockResolvedValue({
        success: true,
        remaining: 2,
        resetTime: Date.now() + 300000,
      });

      const wrappedAction = withRateLimit(
        typedAction,
        "AUTH_LOGIN",
        (input) => input.userId
      );

      const result = await wrappedAction({
        userId: "user123",
        action: "create",
      });

      expect(result.success).toBe(true);
      expect(result.userId).toBe("user123");
      expect(result.timestamp).toBeGreaterThan(0);
    });
  });
});
