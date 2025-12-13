/**
 * Unit Tests for Authorization Checks (AUTH-R03)
 * Per RIS AUTH-R03 Section 8
 *
 * Tests authorization logic for different verify purposes
 */

import { describe, it, expect } from "vitest";

/**
 * Mock session type
 */
interface MockSession {
  uid: string;
  email: string;
  roles?: string[];
  companyId?: string;
  providerData?: Array<{ providerId: string }>;
}

/**
 * Verify purpose type
 */
type VerifyPurpose = "account" | "candidate-contact" | "company-contact";

/**
 * Authorization result
 */
interface AuthResult {
  authorized: boolean;
  errorCode?: string;
  errorMessage?: string;
}

/**
 * Check if user is OAuth-only (no password provider)
 */
function isOAuthOnly(session: MockSession): boolean {
  if (!session.providerData || session.providerData.length === 0) {
    return false;
  }

  const hasPasswordProvider = session.providerData.some(
    (p) => p.providerId === "password"
  );

  return !hasPasswordProvider;
}

/**
 * Check authorization for verify page
 * Per RIS AUTH-R03 Section 8
 */
function checkVerifyAuthorization(
  purpose: VerifyPurpose,
  session: MockSession | null,
  entityId?: string
): AuthResult {
  // Check if session exists
  if (!session) {
    return {
      authorized: false,
      errorCode: "SESSION_EXPIRED",
      errorMessage: "กรุณาเข้าสู่ระบบอีกครั้ง",
    };
  }

  // Purpose-specific checks
  switch (purpose) {
    case "account":
      // Check if OAuth-only user
      if (isOAuthOnly(session)) {
        return {
          authorized: false,
          errorCode: "OAUTH_ACCOUNT",
          errorMessage: "บัญชีนี้ใช้ Google เข้าสู่ระบบ ไม่สามารถเปลี่ยนอีเมลได้",
        };
      }
      return { authorized: true };

    case "candidate-contact":
      // Check if user has candidate role
      if (!session.roles || !session.roles.includes("candidate")) {
        return {
          authorized: false,
          errorCode: "ROLE_UNAUTHORIZED",
          errorMessage: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        };
      }
      return { authorized: true };

    case "company-contact":
      // Check if user has admin role
      if (!session.roles || !session.roles.includes("admin")) {
        return {
          authorized: false,
          errorCode: "ROLE_UNAUTHORIZED",
          errorMessage: "คุณไม่มีสิทธิ์เข้าถึงหน้านี้",
        };
      }

      // Check if entityId matches session companyId
      if (entityId && session.companyId !== entityId) {
        return {
          authorized: false,
          errorCode: "UNAUTHORIZED_ENTITY",
          errorMessage: "คุณไม่มีสิทธิ์แก้ไขข้อมูลบริษัทนี้",
        };
      }

      return { authorized: true };

    default:
      return {
        authorized: false,
        errorCode: "INVALID_PURPOSE",
        errorMessage: "วัตถุประสงค์ไม่ถูกต้อง",
      };
  }
}

describe("Authorization Checks (AUTH-R03)", () => {
  describe("Session validation", () => {
    it("should reject null session", () => {
      const result = checkVerifyAuthorization("account", null);

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("SESSION_EXPIRED");
    });

    it("should accept valid session", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        roles: ["candidate"],
        providerData: [{ providerId: "password" }],
      };

      const result = checkVerifyAuthorization("candidate-contact", session);

      expect(result.authorized).toBe(true);
    });
  });

  describe("Account email change authorization", () => {
    it("should allow password users to change account email", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        providerData: [{ providerId: "password" }],
      };

      const result = checkVerifyAuthorization("account", session);

      expect(result.authorized).toBe(true);
    });

    it("should block OAuth-only users from changing account email", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@gmail.com",
        providerData: [{ providerId: "google.com" }],
      };

      const result = checkVerifyAuthorization("account", session);

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("OAUTH_ACCOUNT");
    });

    it("should allow users with both password and OAuth to change account email", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        providerData: [
          { providerId: "password" },
          { providerId: "google.com" },
        ],
      };

      const result = checkVerifyAuthorization("account", session);

      expect(result.authorized).toBe(true);
    });
  });

  describe("Candidate contact email authorization", () => {
    it("should allow users with candidate role", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        roles: ["candidate"],
      };

      const result = checkVerifyAuthorization("candidate-contact", session);

      expect(result.authorized).toBe(true);
    });

    it("should reject users without candidate role", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        roles: ["company"],
      };

      const result = checkVerifyAuthorization("candidate-contact", session);

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("ROLE_UNAUTHORIZED");
    });

    it("should allow multi-role users with candidate role", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        roles: ["candidate", "company"],
      };

      const result = checkVerifyAuthorization("candidate-contact", session);

      expect(result.authorized).toBe(true);
    });

    it("should reject users with no roles", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        roles: [],
      };

      const result = checkVerifyAuthorization("candidate-contact", session);

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("ROLE_UNAUTHORIZED");
    });
  });

  describe("Company contact email authorization", () => {
    it("should allow admin of same company", () => {
      const session: MockSession = {
        uid: "user123",
        email: "admin@company.com",
        roles: ["admin", "company"],
        companyId: "company123",
      };

      const result = checkVerifyAuthorization(
        "company-contact",
        session,
        "company123"
      );

      expect(result.authorized).toBe(true);
    });

    it("should reject users without admin role", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@company.com",
        roles: ["company"],
        companyId: "company123",
      };

      const result = checkVerifyAuthorization(
        "company-contact",
        session,
        "company123"
      );

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("ROLE_UNAUTHORIZED");
    });

    it("should reject admin of different company (IDOR prevention)", () => {
      const session: MockSession = {
        uid: "user123",
        email: "admin@company.com",
        roles: ["admin", "company"],
        companyId: "company123",
      };

      const result = checkVerifyAuthorization(
        "company-contact",
        session,
        "company456" // Different company!
      );

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("UNAUTHORIZED_ENTITY");
    });

    it("should reject candidate trying to change company email", () => {
      const session: MockSession = {
        uid: "user123",
        email: "candidate@example.com",
        roles: ["candidate"],
      };

      const result = checkVerifyAuthorization(
        "company-contact",
        session,
        "company123"
      );

      expect(result.authorized).toBe(false);
      expect(result.errorCode).toBe("ROLE_UNAUTHORIZED");
    });
  });

  describe("OAuth provider detection", () => {
    it("should detect Google OAuth users", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@gmail.com",
        providerData: [{ providerId: "google.com" }],
      };

      expect(isOAuthOnly(session)).toBe(true);
    });

    it("should detect password users as not OAuth-only", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        providerData: [{ providerId: "password" }],
      };

      expect(isOAuthOnly(session)).toBe(false);
    });

    it("should detect users with both providers as not OAuth-only", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        providerData: [
          { providerId: "password" },
          { providerId: "google.com" },
        ],
      };

      expect(isOAuthOnly(session)).toBe(false);
    });

    it("should handle empty providerData", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
        providerData: [],
      };

      expect(isOAuthOnly(session)).toBe(false);
    });

    it("should handle missing providerData", () => {
      const session: MockSession = {
        uid: "user123",
        email: "user@example.com",
      };

      expect(isOAuthOnly(session)).toBe(false);
    });
  });
});
