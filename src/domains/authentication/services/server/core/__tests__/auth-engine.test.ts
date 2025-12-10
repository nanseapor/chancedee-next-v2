/**
 * Auth Engine Unit Tests
 *
 * Tests for core authentication functions including session and token validation,
 * profile fetching, error handling, and security validation.
 */

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { getUserDataPropsById } from "@/lib/database/repositories/web-user-data-props";
import { getFirebaseAdminAuth } from "@/lib/firebase-admin";
import { AUTH_ERROR_CODES, AuthenticationError } from "@/types/auth.types";

import {
    MockAuthCache,
    createMockAuthResult,
    createMockUserProfile,
} from "../../test/auth-test-utils";
import {
    authenticate,
    authenticateSession,
    authenticateToken,
    belongsToCompany,
    hasRoles,
} from "../auth-engine";

// Mock dependencies
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminAuth: vi.fn(),
}));

vi.mock("@/lib/database/repositories/web-user-data-props", () => ({
  getUserDataPropsById: vi.fn(),
}));

describe("Auth Engine", () => {
  let mockAuth: any;
  let mockCookies: any;
  let mockCache: MockAuthCache;

  beforeEach(() => {
    // Reset mocks
    vi.clearAllMocks();

    // Setup mock Firebase Admin Auth
    mockAuth = {
      verifySessionCookie: vi.fn(),
      verifyIdToken: vi.fn(),
    };
    (getFirebaseAdminAuth as any).mockReturnValue(mockAuth);

    // Setup mock cookies
    mockCookies = {
      get: vi.fn(),
      set: vi.fn(),
    };
    (cookies as any).mockReturnValue(mockCookies);

    // Setup test cache
    mockCache = new MockAuthCache();

    // Console spies to verify error logging
    vi.spyOn(console, "error").mockImplementation(() => {});
    vi.spyOn(console, "warn").mockImplementation(() => {});
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("authenticateSession", () => {
    const mockDecodedClaims: DecodedIdToken = {
      uid: "test-user-123",
      sub: "test-user-123",
      email: "test@example.com",
      email_verified: true,
      phone_number: "+1234567890",
      display_name: "Test User",
      photo_url: "https://example.com/photo.jpg",
      disabled: false,
      metadata: {
        creation_time: new Date().toISOString(),
        last_sign_in_time: new Date().toISOString(),
      },
      providers: [{ provider_id: "password", uid: "test-user-123" }],
      password_hash: undefined,
      password_salt: undefined,
      custom_claims: {},
      tenant_id: undefined,
      tokens_valid_after_time: undefined,
      multifactor: undefined,
      iss: "https://securetoken.google.com/test-project",
      aud: "test-project",
      auth_time: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: {
        identities: {},
        sign_in_provider: "password",
      },
    };

    it("should return null when no session cookie exists", async () => {
      mockCookies.get.mockReturnValue(undefined);

      const result = await authenticateSession();

      expect(result).toBeNull();
      expect(console.error).toHaveBeenCalledWith("No session cookie found");
    });

    it("should authenticate valid session cookie successfully", async () => {
      const sessionCookie = "valid-session-cookie";
      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockResolvedValue(mockDecodedClaims);

      const result = await authenticateSession();

      expect(result).toEqual({
        user: mockDecodedClaims,
        profile: undefined,
        method: "session",
      });
      expect(mockAuth.verifySessionCookie).toHaveBeenCalledWith(
        sessionCookie,
        true,
      );
    });

    it("should fetch profile when includeProfile option is true", async () => {
      const sessionCookie = "valid-session-cookie";
      const mockProfile = createMockUserProfile();

      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockResolvedValue(mockDecodedClaims);
      (getUserDataPropsById as any).mockResolvedValue(mockProfile);

      const result = await authenticateSession({ includeProfile: true });

      expect(result).toEqual({
        user: mockDecodedClaims,
        profile: mockProfile,
        method: "session",
      });
      expect(getUserDataPropsById).toHaveBeenCalledWith("test-user-123");
    });

    it("should clear invalid session cookie and return null", async () => {
      const sessionCookie = "invalid-session-cookie";
      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockRejectedValue(
        new Error("Invalid session"),
      );

      const result = await authenticateSession();

      expect(result).toBeNull();
      expect(mockCookies.set).toHaveBeenCalledWith("session", "", {
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: false, // NODE_ENV is not 'production' in test
        path: "/",
        domain: undefined, // NODE_ENV is not 'production' in test
        sameSite: "strict",
      });
      expect(console.error).toHaveBeenCalledWith(
        "Failed to verify session cookie:",
        expect.any(Error),
      );
    });

    it("should continue authentication even if profile fetch fails", async () => {
      const sessionCookie = "valid-session-cookie";

      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockResolvedValue(mockDecodedClaims);
      (getUserDataPropsById as any).mockRejectedValue(
        new Error("Profile fetch failed"),
      );

      const result = await authenticateSession({ includeProfile: true });

      expect(result).toEqual({
        user: mockDecodedClaims,
        profile: undefined,
        method: "session",
      });
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to fetch user profile:",
        expect.any(Error),
      );
    });

    it("should handle cookie clearing errors gracefully", async () => {
      const sessionCookie = "invalid-session-cookie";
      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockRejectedValue(
        new Error("Invalid session"),
      );
      mockCookies.set.mockImplementation(() => {
        throw new Error("Cookie clear failed");
      });

      const result = await authenticateSession();

      expect(result).toBeNull();
      expect(console.warn).toHaveBeenCalledWith(
        "Failed to clear session cookie:",
        expect.any(Error),
      );
    });
  });

  describe("authenticateToken", () => {
    const mockDecodedToken: DecodedIdToken = {
      uid: "token-user-456",
      sub: "token-user-456",
      email: "token@example.com",
      email_verified: true,
      phone_number: "+1987654321",
      display_name: "Token User",
      photo_url: "https://example.com/token-photo.jpg",
      disabled: false,
      metadata: {
        creation_time: new Date().toISOString(),
        last_sign_in_time: new Date().toISOString(),
      },
      providers: [{ provider_id: "password", uid: "token-user-456" }],
      password_hash: undefined,
      password_salt: undefined,
      custom_claims: {},
      tenant_id: undefined,
      tokens_valid_after_time: undefined,
      multifactor: undefined,
      iss: "https://securetoken.google.com/test-project",
      aud: "test-project",
      auth_time: Math.floor(Date.now() / 1000),
      iat: Math.floor(Date.now() / 1000),
      exp: Math.floor(Date.now() / 1000) + 3600,
      firebase: {
        identities: {},
        sign_in_provider: "password",
      },
    };

    it("should return null for empty token", async () => {
      const result = await authenticateToken("");
      expect(result).toBeNull();

      const result2 = await authenticateToken(null as any);
      expect(result2).toBeNull();
    });

    it("should authenticate valid token successfully", async () => {
      const token = "valid-id-token";
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await authenticateToken(token);

      expect(result).toEqual({
        user: mockDecodedToken,
        profile: undefined,
        method: "token",
      });
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it("should handle Bearer prefix correctly", async () => {
      const token = "valid-id-token";
      const bearerToken = `Bearer ${token}`;
      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);

      const result = await authenticateToken(bearerToken);

      expect(result).toEqual({
        user: mockDecodedToken,
        profile: undefined,
        method: "token",
      });
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it("should throw AuthenticationError for expired token", async () => {
      const token = "expired-token";
      const firebaseError = { code: "auth/id-token-expired" };
      mockAuth.verifyIdToken.mockRejectedValue(firebaseError);

      await expect(authenticateToken(token)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authenticateToken(token)).rejects.toMatchObject({
        message: "Token has expired",
        code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
        statusCode: 401,
        details: { originalError: "auth/id-token-expired" },
      });
    });

    it("should throw AuthenticationError for revoked token", async () => {
      const token = "revoked-token";
      const firebaseError = { code: "auth/id-token-revoked" };
      mockAuth.verifyIdToken.mockRejectedValue(firebaseError);

      await expect(authenticateToken(token)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authenticateToken(token)).rejects.toMatchObject({
        message: "Token has been revoked",
        code: AUTH_ERROR_CODES.TOKEN_REVOKED,
        statusCode: 401,
        details: { originalError: "auth/id-token-revoked" },
      });
    });

    it("should return null for invalid token format", async () => {
      const token = "invalid-format-token";
      const firebaseError = { code: "auth/argument-error" };
      mockAuth.verifyIdToken.mockRejectedValue(firebaseError);

      const result = await authenticateToken(token);
      expect(result).toBeNull();
    });

    it("should throw AuthenticationError for other token errors", async () => {
      const token = "unknown-error-token";
      const firebaseError = { code: "auth/unknown-error" };
      mockAuth.verifyIdToken.mockRejectedValue(firebaseError);

      await expect(authenticateToken(token)).rejects.toThrow(
        AuthenticationError,
      );
      await expect(authenticateToken(token)).rejects.toMatchObject({
        message: "Token validation failed",
        code: AUTH_ERROR_CODES.TOKEN_INVALID,
        statusCode: 401,
        details: { originalError: "auth/unknown-error" },
      });
    });

    it("should include profile when requested", async () => {
      const token = "valid-token";
      const mockProfile = createMockUserProfile({ uid: "token-user-456" });

      mockAuth.verifyIdToken.mockResolvedValue(mockDecodedToken);
      (getUserDataPropsById as any).mockResolvedValue(mockProfile);

      const result = await authenticateToken(token, { includeProfile: true });

      expect(result).toEqual({
        user: mockDecodedToken,
        profile: mockProfile,
        method: "token",
      });
      expect(getUserDataPropsById).toHaveBeenCalledWith("token-user-456");
    });
  });

  describe("authenticate (auto-detect)", () => {
    it("should use token authentication when string is provided", async () => {
      const token = "test-token";
      const mockResult = createMockAuthResult({ method: "token" });

      // Mock the authenticateToken function behavior
      mockAuth.verifyIdToken.mockResolvedValue(mockResult.user);

      const result = await authenticate(token);

      expect(result?.method).toBe("token");
      expect(mockAuth.verifyIdToken).toHaveBeenCalledWith(token);
    });

    it("should use session authentication when options are provided", async () => {
      const options = { includeProfile: true };
      const sessionCookie = "test-session";
      const mockResult = createMockAuthResult({ method: "session" });

      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockResolvedValue(mockResult.user);

      const result = await authenticate(options);

      expect(result?.method).toBe("session");
      expect(mockAuth.verifySessionCookie).toHaveBeenCalledWith(
        sessionCookie,
        true,
      );
    });

    it("should use session authentication when no parameters provided", async () => {
      const sessionCookie = "test-session";
      const mockResult = createMockAuthResult({ method: "session" });

      mockCookies.get.mockReturnValue({ value: sessionCookie });
      mockAuth.verifySessionCookie.mockResolvedValue(mockResult.user);

      const result = await authenticate();

      expect(result?.method).toBe("session");
    });
  });

  describe("hasRoles", () => {
    it("should return true when user has any required roles", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: ["candidate", "admin"] },
        }),
      });

      expect(hasRoles(authResult, ["candidate"])).toBe(true);
      expect(hasRoles(authResult, ["admin"])).toBe(true);
      expect(hasRoles(authResult, ["candidate", "admin"])).toBe(true);
      expect(hasRoles(authResult, ["admin", "company"])).toBe(true); // Has admin
    });

    it("should return false when user lacks all required roles", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: ["candidate"] },
        }),
      });

      expect(hasRoles(authResult, ["admin"])).toBe(false);
      expect(hasRoles(authResult, ["company"])).toBe(false);
      expect(hasRoles(authResult, ["admin", "company"])).toBe(false); // Has neither
    });

    it("should return false when profile is missing", () => {
      const authResult = createMockAuthResult({ profile: undefined });

      expect(hasRoles(authResult, ["candidate"])).toBe(false);
    });

    it("should return false when roles array is missing", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: undefined as any },
        }),
      });

      expect(hasRoles(authResult, ["candidate"])).toBe(false);
    });
  });

  describe("belongsToCompany", () => {
    it("should return true when user belongs to the specified company", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: ["company"], companyId: "company-123" },
        }),
      });

      expect(belongsToCompany(authResult, "company-123")).toBe(true);
    });

    it("should return false when user belongs to different company", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: ["company"], companyId: "company-456" },
        }),
      });

      expect(belongsToCompany(authResult, "company-123")).toBe(false);
    });

    it("should return false when profile is missing", () => {
      const authResult = createMockAuthResult({ profile: undefined });

      expect(belongsToCompany(authResult, "company-123")).toBe(false);
    });

    it("should return false when companyId is missing", () => {
      const authResult = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "test", roles: ["company"], companyId: undefined },
        }),
      });

      expect(belongsToCompany(authResult, "company-123")).toBe(false);
    });
  });
});
