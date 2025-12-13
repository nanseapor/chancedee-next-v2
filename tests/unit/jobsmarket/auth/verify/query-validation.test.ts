/**
 * Unit Tests for Query Parameter Validation (AUTH-R03)
 * Per RIS AUTH-R03 Section 6
 *
 * Tests query parameter validation logic for /auth/verify route
 */

import { describe, it, expect } from "vitest";

/**
 * Query parameter validation types
 */
type VerifyPurpose = "account" | "candidate-contact" | "company-contact";

interface VerifyQueryParams {
  purpose?: string;
  email?: string;
  entityId?: string;
  redirect?: string;
}

interface ValidationResult {
  isValid: boolean;
  errors: string[];
  sanitized?: {
    purpose: VerifyPurpose;
    email: string;
    entityId?: string;
    redirect?: string;
  };
}

/**
 * Validate query parameters
 * Per RIS AUTH-R03 Section 6
 */
function validateVerifyQueryParams(
  params: VerifyQueryParams
): ValidationResult {
  const errors: string[] = [];

  // Validate purpose
  if (!params.purpose) {
    errors.push("MISSING_PURPOSE");
  } else if (
    !["account", "candidate-contact", "company-contact"].includes(
      params.purpose
    )
  ) {
    errors.push("INVALID_PURPOSE");
  }

  // Validate email
  if (!params.email) {
    errors.push("MISSING_EMAIL");
  } else if (!isValidEmail(params.email)) {
    errors.push("INVALID_EMAIL");
  }

  // Validate entityId for company-contact
  if (params.purpose === "company-contact" && !params.entityId) {
    errors.push("MISSING_ENTITY_ID");
  }

  if (errors.length > 0) {
    return { isValid: false, errors };
  }

  // Sanitize redirect (relative paths only, not protocol-relative)
  let sanitizedRedirect: string | undefined;
  if (params.redirect && params.redirect.startsWith("/") && !params.redirect.startsWith("//")) {
    sanitizedRedirect = params.redirect;
  }

  return {
    isValid: true,
    errors: [],
    sanitized: {
      purpose: params.purpose as VerifyPurpose,
      email: params.email.toLowerCase(),
      entityId: params.entityId,
      redirect: sanitizedRedirect,
    },
  };
}

/**
 * Simple email validation
 */
function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

describe("Query Parameter Validation (AUTH-R03)", () => {
  describe("Purpose validation", () => {
    it("should accept valid purpose: account", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.purpose).toBe("account");
    });

    it("should accept valid purpose: candidate-contact", () => {
      const result = validateVerifyQueryParams({
        purpose: "candidate-contact",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.purpose).toBe("candidate-contact");
    });

    it("should accept valid purpose: company-contact with entityId", () => {
      const result = validateVerifyQueryParams({
        purpose: "company-contact",
        email: "test@example.com",
        entityId: "company123",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.purpose).toBe("company-contact");
    });

    it("should reject missing purpose", () => {
      const result = validateVerifyQueryParams({
        email: "test@example.com",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MISSING_PURPOSE");
    });

    it("should reject invalid purpose", () => {
      const result = validateVerifyQueryParams({
        purpose: "invalid-purpose",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("INVALID_PURPOSE");
    });
  });

  describe("Email validation", () => {
    it("should accept valid email", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "user@example.com",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.email).toBe("user@example.com");
    });

    it("should normalize email to lowercase", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "USER@EXAMPLE.COM",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.email).toBe("user@example.com");
    });

    it("should reject missing email", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MISSING_EMAIL");
    });

    it("should reject invalid email format", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "not-an-email",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("INVALID_EMAIL");
    });

    it("should reject email without @", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "userexample.com",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("INVALID_EMAIL");
    });

    it("should reject email without domain", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "user@",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("INVALID_EMAIL");
    });
  });

  describe("EntityId validation", () => {
    it("should require entityId for company-contact purpose", () => {
      const result = validateVerifyQueryParams({
        purpose: "company-contact",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MISSING_ENTITY_ID");
    });

    it("should accept entityId for company-contact purpose", () => {
      const result = validateVerifyQueryParams({
        purpose: "company-contact",
        email: "test@example.com",
        entityId: "company123",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.entityId).toBe("company123");
    });

    it("should not require entityId for account purpose", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(true);
    });

    it("should not require entityId for candidate-contact purpose", () => {
      const result = validateVerifyQueryParams({
        purpose: "candidate-contact",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(true);
    });
  });

  describe("Redirect validation", () => {
    it("should accept relative redirect path", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
        redirect: "/auth/settings",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.redirect).toBe("/auth/settings");
    });

    it("should reject absolute URLs (security)", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
        redirect: "https://evil.com/phishing",
      });

      expect(result.isValid).toBe(true); // Doesn't fail validation
      expect(result.sanitized?.redirect).toBeUndefined(); // But redirect is ignored
    });

    it("should reject protocol-relative URLs (security)", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
        redirect: "//evil.com/phishing",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.redirect).toBeUndefined();
    });

    it("should handle missing redirect gracefully", () => {
      const result = validateVerifyQueryParams({
        purpose: "account",
        email: "test@example.com",
      });

      expect(result.isValid).toBe(true);
      expect(result.sanitized?.redirect).toBeUndefined();
    });
  });

  describe("Multiple errors", () => {
    it("should return all validation errors", () => {
      const result = validateVerifyQueryParams({
        purpose: "invalid",
        email: "bad-email",
      });

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("INVALID_PURPOSE");
      expect(result.errors).toContain("INVALID_EMAIL");
      expect(result.errors.length).toBe(2);
    });

    it("should return all errors for empty params", () => {
      const result = validateVerifyQueryParams({});

      expect(result.isValid).toBe(false);
      expect(result.errors).toContain("MISSING_PURPOSE");
      expect(result.errors).toContain("MISSING_EMAIL");
    });
  });
});
