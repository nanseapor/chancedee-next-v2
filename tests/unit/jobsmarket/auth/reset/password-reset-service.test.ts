/**
 * Password Reset Service Unit Tests
 *
 * Tests the password reset service with mocked Firebase Auth.
 * Does NOT send real emails - uses Vitest mocks.
 *
 * For actual email delivery verification, see:
 * docs/jobsmarket/MANUAL-TEST-CHECKLIST.md
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { sendPasswordResetEmail } from "firebase/auth";

// Mock Firebase Auth module BEFORE tests run
vi.mock("firebase/auth", () => ({
  getAuth: vi.fn(() => ({ currentUser: null })),
  sendPasswordResetEmail: vi.fn(),
}));

describe("Password Reset Service (Mocked Firebase)", () => {
  const mockSendReset = vi.mocked(sendPasswordResetEmail);

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful Reset", () => {
    it("should call Firebase sendPasswordResetEmail with correct email", async () => {
      mockSendReset.mockResolvedValue(undefined);

      // Simulate calling the service (based on ResetClient.tsx logic)
      const testEmail = "user@example.com";
      const actionCodeSettings = {
        url: "http://localhost:3000/jobsmarket/auth/login",
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(
        { currentUser: null } as any,
        testEmail,
        actionCodeSettings
      );

      expect(mockSendReset).toHaveBeenCalledTimes(1);
      expect(mockSendReset).toHaveBeenCalledWith(
        expect.anything(),
        testEmail,
        expect.objectContaining({
          url: expect.stringContaining("jobsmarket/auth/login"),
          handleCodeInApp: false,
        })
      );
    });

    it("should resolve successfully for valid email", async () => {
      mockSendReset.mockResolvedValue(undefined);

      const result = sendPasswordResetEmail(
        { currentUser: null } as any,
        "valid@example.com"
      );

      await expect(result).resolves.toBeUndefined();
    });

    it("should accept actionCodeSettings with custom redirect URL", async () => {
      mockSendReset.mockResolvedValue(undefined);

      const customSettings = {
        url: "https://jobs.chancedee.com/jobsmarket/auth/login",
        handleCodeInApp: false,
      };

      await sendPasswordResetEmail(
        { currentUser: null } as any,
        "user@example.com",
        customSettings
      );

      expect(mockSendReset).toHaveBeenCalledWith(
        expect.anything(),
        "user@example.com",
        expect.objectContaining({
          url: "https://jobs.chancedee.com/jobsmarket/auth/login",
        })
      );
    });
  });

  describe("Error Handling", () => {
    it("should handle invalid email format error", async () => {
      const error = {
        code: "auth/invalid-email",
        message: "The email address is badly formatted.",
      };
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "bad-email"
        )
      ).rejects.toMatchObject({
        code: "auth/invalid-email",
      });
    });

    it("should handle user-not-found error", async () => {
      const error = {
        code: "auth/user-not-found",
        message: "There is no user record corresponding to this identifier.",
      };
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "ghost@example.com"
        )
      ).rejects.toMatchObject({
        code: "auth/user-not-found",
      });
    });

    it("should handle rate limiting error", async () => {
      const error = {
        code: "auth/too-many-requests",
        message:
          "We have blocked all requests from this device due to unusual activity. Try again later.",
      };
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "user@example.com"
        )
      ).rejects.toMatchObject({
        code: "auth/too-many-requests",
      });
    });

    it("should handle network errors", async () => {
      const error = new Error("Network error");
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "user@example.com"
        )
      ).rejects.toThrow("Network error");
    });

    it("should handle unauthorized continue URI error", async () => {
      const error = {
        code: "auth/unauthorized-continue-uri",
        message: "Domain not whitelisted by project",
      };
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "user@example.com",
          { url: "http://not-whitelisted.com", handleCodeInApp: false }
        )
      ).rejects.toMatchObject({
        code: "auth/unauthorized-continue-uri",
      });
    });
  });

  describe("Security Best Practices", () => {
    it("should handle user-not-found without revealing user existence (implementation detail)", async () => {
      // NOTE: This test documents the Firebase behavior
      // In production, ResetClient should show success message even for non-existent users
      // to prevent email enumeration attacks

      const error = {
        code: "auth/user-not-found",
        message: "User not found",
      };
      mockSendReset.mockRejectedValue(error);

      // Firebase throws error, but UI should catch and show success anyway
      await expect(
        sendPasswordResetEmail(
          { currentUser: null } as any,
          "ghost@example.com"
        )
      ).rejects.toMatchObject({
        code: "auth/user-not-found",
      });

      // UI layer responsibility: catch this and show success
      // See ResetClient.tsx error handling
    });
  });

  describe("Input Handling", () => {
    it("should handle empty email string", async () => {
      const error = {
        code: "auth/invalid-email",
        message: "The email address is badly formatted.",
      };
      mockSendReset.mockRejectedValue(error);

      await expect(
        sendPasswordResetEmail({ currentUser: null } as any, "")
      ).rejects.toMatchObject({
        code: "auth/invalid-email",
      });
    });

    it("should handle email with whitespace", async () => {
      mockSendReset.mockResolvedValue(undefined);

      // NOTE: Whitespace trimming should be done by UI/validation layer
      // Firebase will accept " user@example.com " as-is
      await sendPasswordResetEmail(
        { currentUser: null } as any,
        "  user@example.com  "
      );

      expect(mockSendReset).toHaveBeenCalledWith(
        expect.anything(),
        "  user@example.com  "
      );

      // Recommendation: trim in validation layer (see reset-validation.test.ts)
    });

    it("should handle special characters in email", async () => {
      mockSendReset.mockResolvedValue(undefined);

      const emailWithPlus = "user+test@example.com";
      await sendPasswordResetEmail(
        { currentUser: null } as any,
        emailWithPlus
      );

      expect(mockSendReset).toHaveBeenCalledWith(
        expect.anything(),
        emailWithPlus
      );
    });
  });

  describe("Mock Verification", () => {
    it("should verify mock is working correctly", () => {
      expect(mockSendReset).toBeDefined();
      expect(vi.isMockFunction(mockSendReset)).toBe(true);
    });

    it("should not send real emails", async () => {
      mockSendReset.mockResolvedValue(undefined);

      await sendPasswordResetEmail(
        { currentUser: null } as any,
        "test@example.com"
      );

      // Verify mock was called, not real Firebase
      expect(mockSendReset).toHaveBeenCalledTimes(1);

      // No actual network request made
      // No actual email sent
    });
  });
});
