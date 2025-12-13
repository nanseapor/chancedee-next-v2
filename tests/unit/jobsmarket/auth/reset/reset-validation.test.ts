/**
 * Unit Tests for Reset Password Form Validation (AUTH-R04)
 * Per AUTH-R04 Implementation Plan §4, §5
 *
 * Tests email validation logic for /auth/reset route
 */

import { describe, it, expect } from "vitest";
import { ResetSchema } from "@/lib/validations/auth";

describe("Reset Password Form Validation (AUTH-R04)", () => {
  describe("Email validation", () => {
    it("should accept valid email", () => {
      const result = ResetSchema.safeParse({
        email: "user@example.com",
      });

      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.data.email).toBe("user@example.com");
      }
    });

    it("should accept email with subdomain", () => {
      const result = ResetSchema.safeParse({
        email: "user@mail.example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should accept email with plus addressing", () => {
      const result = ResetSchema.safeParse({
        email: "user+test@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should accept email with numbers", () => {
      const result = ResetSchema.safeParse({
        email: "user123@example.com",
      });

      expect(result.success).toBe(true);
    });

    it("should reject missing email", () => {
      const result = ResetSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("กรุณา");
      }
    });

    it("should reject empty string email", () => {
      const result = ResetSchema.safeParse({
        email: "",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toContain("กรุณากรอกข้อมูล");
      }
    });

    it("should reject invalid email format (no @)", () => {
      const result = ResetSchema.safeParse({
        email: "userexample.com",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "รูปแบบอีเมลไม่ถูกต้อง"
        );
      }
    });

    it("should reject invalid email format (no domain)", () => {
      const result = ResetSchema.safeParse({
        email: "user@",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "รูปแบบอีเมลไม่ถูกต้อง"
        );
      }
    });

    it("should reject invalid email format (no local part)", () => {
      const result = ResetSchema.safeParse({
        email: "@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid email format (spaces)", () => {
      const result = ResetSchema.safeParse({
        email: "user name@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should reject invalid email format (multiple @)", () => {
      const result = ResetSchema.safeParse({
        email: "user@@example.com",
      });

      expect(result.success).toBe(false);
    });

    it("should reject non-string email", () => {
      const result = ResetSchema.safeParse({
        email: 12345,
      });

      expect(result.success).toBe(false);
    });
  });

  describe("Error messages (Thai)", () => {
    it("should return Thai error message for required field", () => {
      const result = ResetSchema.safeParse({});

      expect(result.success).toBe(false);
      if (!result.success) {
        const emailError = result.error.issues.find(
          (issue) => issue.path[0] === "email"
        );
        expect(emailError?.message).toMatch(/กรุณา/); // "Please" in Thai
      }
    });

    it("should return Thai error message for invalid format", () => {
      const result = ResetSchema.safeParse({
        email: "invalid-email",
      });

      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.issues[0].message).toBe(
          "รูปแบบอีเมลไม่ถูกต้อง"
        );
      }
    });
  });
});
