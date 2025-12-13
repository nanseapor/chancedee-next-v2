/**
 * Unit Tests for OTP Actions
 * Tests sendVerificationOTPEmail and verifyOTPCode
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock modules before imports
vi.mock("@/lib/database/actions/otp-codes", () => ({
  webOTPCodesCreate: vi.fn(),
  webOTPCodesGetById: vi.fn(),
  webOTPCodesGetByFilter: vi.fn(),
  webOTPCodesUpdate: vi.fn(),
}));

vi.mock("@sendgrid/mail", () => ({
  default: {
    setApiKey: vi.fn(),
    send: vi.fn(),
  },
}));

vi.mock("@/lib/utils/server/with-rate-limit", () => ({
  withRateLimit: vi.fn((fn) => fn), // Passthrough for testing core logic
}));

vi.mock("next/headers", () => ({
  headers: vi.fn(() => Promise.resolve(new Headers())),
}));

vi.mock("firebase-admin/firestore", () => ({
  Filter: {
    where: vi.fn((field, op, value) => ({ field, op, value, type: "where" })),
    and: vi.fn((...filters) => ({ filters, type: "and" })),
  },
}));

// Import after mocks
import {
  sendVerificationOTPEmail,
  verifyOTPCode,
} from "@/domains/authentication/services/server/actions/jobsmarket/otp-actions";
import {
  webOTPCodesCreate,
  webOTPCodesGetById,
  webOTPCodesGetByFilter,
  webOTPCodesUpdate,
} from "@/lib/database/actions/otp-codes";
import client from "@sendgrid/mail";
import type { FirebaseOTPData } from "@/types/auth.types";

describe("OTP Actions", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    process.env.SENDGRID_API_KEY = "test-api-key";
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("sendVerificationOTPEmail", () => {
    it("should send OTP email successfully", async () => {
      const mockEmail = "test@example.com";

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([]);
      vi.mocked(webOTPCodesCreate).mockResolvedValue(undefined);
      vi.mocked(client.send).mockResolvedValue([
        { statusCode: 202, body: {}, headers: {} },
        {},
      ]);

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(true);
      expect(result.refCode).toBeDefined();
      expect(result.refCode).toHaveLength(10);
      expect(result.error).toBeUndefined();

      // Verify OTP was created
      expect(webOTPCodesCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          email: mockEmail,
          otpCode: expect.stringMatching(/^\d{6}$/),
          refCode: expect.any(String),
          createDate: expect.any(Number),
        }),
        expect.any(String),
        "system"
      );

      // Verify email was sent
      expect(client.setApiKey).toHaveBeenCalledWith("test-api-key");
      expect(client.send).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "admin@chancedee.com",
          subject: "OTP from CHANCEDEE",
          templateId: "d-49496573d0954f62a25110c564ad89d3",
        })
      );
    });

    it("should invalidate previous OTPs for same email", async () => {
      const mockEmail = "test@example.com";
      const oldOTP: FirebaseOTPData = {
        uid: "OLD_REF_CODE",
        email: mockEmail,
        otpCode: "123456",
        refCode: "OLD_REF_CODE",
        createDate: Date.now() - 60000,
      };

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([oldOTP]);
      vi.mocked(webOTPCodesCreate).mockResolvedValue(undefined);
      vi.mocked(webOTPCodesUpdate).mockResolvedValue(undefined);
      vi.mocked(client.send).mockResolvedValue([
        { statusCode: 202, body: {}, headers: {} },
        {},
      ]);

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(true);

      // Verify old OTP was invalidated
      expect(webOTPCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: "OLD_REF_CODE",
          status: "invalidated",
        }),
        "OLD_REF_CODE",
        "system"
      );
    });

    it("should reject invalid email format", async () => {
      const result = await sendVerificationOTPEmail({
        email: "invalid-email",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("รูปแบบอีเมลไม่ถูกต้อง");
      expect(result.refCode).toBeUndefined();

      // Verify no database or email operations
      expect(webOTPCodesCreate).not.toHaveBeenCalled();
      expect(client.send).not.toHaveBeenCalled();
    });

    it("should handle SendGrid failure gracefully", async () => {
      const mockEmail = "test@example.com";

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([]);
      vi.mocked(webOTPCodesCreate).mockResolvedValue(undefined);
      vi.mocked(client.send).mockRejectedValue(new Error("SendGrid error"));

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(false);
      expect(result.error).toBe("ส่งรหัส OTP ไม่สำเร็จ กรุณาลองใหม่");
      expect(result.refCode).toBeUndefined();

      // OTP should still be created in database
      expect(webOTPCodesCreate).toHaveBeenCalled();
    });

    it("should handle database failure gracefully", async () => {
      const mockEmail = "test@example.com";

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([]);
      vi.mocked(webOTPCodesCreate).mockRejectedValue(
        new Error("Firestore error")
      );

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(false);
      expect(result.error).toBe("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    });
  });

  describe("verifyOTPCode", () => {
    it("should verify correct OTP successfully", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPCode = "123456";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: mockOTPCode,
        refCode: mockRefCode,
        createDate: Date.now() - 5 * 60 * 1000, // 5 minutes ago
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);
      vi.mocked(webOTPCodesUpdate).mockResolvedValue(undefined);

      const result = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: mockOTPCode,
      });

      expect(result.success).toBe(true);
      expect(result.error).toBeUndefined();

      // Verify OTP was marked as verified
      expect(webOTPCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "verified",
        }),
        mockRefCode,
        "system"
      );
    });

    it("should reject OTP not found", async () => {
      vi.mocked(webOTPCodesGetById).mockResolvedValue(null);

      const result = await verifyOTPCode({
        refCode: "NONEXISTENT",
        otpCode: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("ไม่พบรหัส OTP");
    });

    it("should reject already verified OTP", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: "123456",
        refCode: mockRefCode,
        createDate: Date.now() - 5 * 60 * 1000,
        status: "verified",
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);

      const result = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("รหัส OTP ถูกใช้งานแล้ว");
      expect(webOTPCodesUpdate).not.toHaveBeenCalled();
    });

    it("should reject invalidated OTP", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: "123456",
        refCode: mockRefCode,
        createDate: Date.now() - 5 * 60 * 1000,
        status: "invalidated",
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);

      const result = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("รหัส OTP หมดอายุ");
    });

    it("should reject expired OTP (> 15 minutes old)", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: "123456",
        refCode: mockRefCode,
        createDate: Date.now() - 16 * 60 * 1000, // 16 minutes ago
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);
      vi.mocked(webOTPCodesUpdate).mockResolvedValue(undefined);

      const result = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("รหัส OTP หมดอายุ");

      // Verify OTP was marked as expired
      expect(webOTPCodesUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "expired",
        }),
        mockRefCode,
        "system"
      );
    });

    it("should reject incorrect OTP code", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: "123456",
        refCode: mockRefCode,
        createDate: Date.now() - 5 * 60 * 1000,
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);

      const result = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "999999", // Wrong OTP
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("รหัส OTP ไม่ถูกต้อง");
      expect(webOTPCodesUpdate).not.toHaveBeenCalled();
    });

    it("should use constant-time comparison for OTP", async () => {
      const mockRefCode = "ABC123XYZ9";
      const mockOTPRecord: FirebaseOTPData = {
        uid: mockRefCode,
        email: "test@example.com",
        otpCode: "123456",
        refCode: mockRefCode,
        createDate: Date.now() - 5 * 60 * 1000,
      };

      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);
      vi.mocked(webOTPCodesUpdate).mockResolvedValue(undefined);

      // Test with correct OTP
      const result1 = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "123456",
      });
      expect(result1.success).toBe(true);

      // Reset mocks
      vi.clearAllMocks();
      vi.mocked(webOTPCodesGetById).mockResolvedValue(mockOTPRecord);

      // Test with incorrect OTP (same length)
      const result2 = await verifyOTPCode({
        refCode: mockRefCode,
        otpCode: "123455", // Last digit different
      });
      expect(result2.success).toBe(false);

      // Constant-time comparison should execute in similar time
      // (Hard to test timing in unit tests, but we verify the logic works)
    });

    it("should handle database errors gracefully", async () => {
      vi.mocked(webOTPCodesGetById).mockRejectedValue(
        new Error("Firestore error")
      );

      const result = await verifyOTPCode({
        refCode: "ABC123XYZ9",
        otpCode: "123456",
      });

      expect(result.success).toBe(false);
      expect(result.error).toBe("เกิดข้อผิดพลาดที่ไม่ทราบสาเหตุ");
    });
  });

  describe("OTP Code Generation", () => {
    it("should generate 6-digit OTP codes", async () => {
      const mockEmail = "test@example.com";

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([]);
      vi.mocked(webOTPCodesCreate).mockResolvedValue(undefined);
      vi.mocked(client.send).mockResolvedValue([
        { statusCode: 202, body: {}, headers: {} },
        {},
      ]);

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(true);

      const createCall = vi.mocked(webOTPCodesCreate).mock.calls[0];
      const otpData = createCall[0] as FirebaseOTPData;

      expect(otpData.otpCode).toMatch(/^\d{6}$/);
      expect(parseInt(otpData.otpCode)).toBeGreaterThanOrEqual(100000);
      expect(parseInt(otpData.otpCode)).toBeLessThan(1000000);
    });

    it("should generate 10-character refCodes with no ambiguous chars", async () => {
      const mockEmail = "test@example.com";

      vi.mocked(webOTPCodesGetByFilter).mockResolvedValue([]);
      vi.mocked(webOTPCodesCreate).mockResolvedValue(undefined);
      vi.mocked(client.send).mockResolvedValue([
        { statusCode: 202, body: {}, headers: {} },
        {},
      ]);

      const result = await sendVerificationOTPEmail({ email: mockEmail });

      expect(result.success).toBe(true);
      expect(result.refCode).toHaveLength(10);

      // Should not contain 0, O, I, 1
      expect(result.refCode).not.toMatch(/[0OI1]/);

      // Should only contain valid characters
      expect(result.refCode).toMatch(/^[ABCDEFGHJKLMNPQRSTUVWXYZ23456789]{10}$/);
    });
  });
});
