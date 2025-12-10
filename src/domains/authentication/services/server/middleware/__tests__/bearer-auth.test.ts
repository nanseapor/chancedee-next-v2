/**
 * Bearer Authentication Middleware Tests
 *
 * Tests for bearer token authentication middleware including token validation,
 * role-based access control, and API-specific authentication patterns.
 */

import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { AUTH_ERROR_CODES, AuthenticationError } from "@/types/auth.types";

import { authenticateToken } from "../../core/auth-engine";
import {
  createMockAuthResult,
  createMockUserProfile,
} from "../../test/auth-test-utils";
import {
  authGuard,
  createAuthenticatedActions,
  withBearerAuth,
  withBearerAuthAndRoles,
} from "../bearer-auth";

// Mock core authentication functions
vi.mock("../../core/auth-engine", () => ({
  authenticateToken: vi.fn(),
  hasRoles: vi.fn(),
  belongsToCompany: vi.fn(),
}));

describe("Bearer Authentication Middleware", () => {
  let mockRequest: Partial<NextRequest>;
  let mockAuthToken: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock request
    mockRequest = {
      headers: new Headers(),
      url: "https://api.example.com/test",
      method: "GET",
    };

    // Setup mock authentication function
    mockAuthToken = authenticateToken as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("withBearerAuth", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should authenticate and call handler with valid Bearer token", async () => {
      const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({ method: "token" });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
      expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should authenticate with token without Bearer prefix", async () => {
      const token = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({ method: "token" });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuth(mockHandler);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
    });

    it("should return 401 when no Authorization header is present", async () => {
      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).not.toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result).toMatchObject({
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    });

    it("should return 401 when Authorization header is empty", async () => {
      mockRequest.headers = new Headers({ Authorization: "" });

      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
    });

    it('should return 401 when Authorization header contains only "Bearer"', async () => {
      mockRequest.headers = new Headers({ Authorization: "Bearer" });

      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
    });

    it("should handle token authentication errors", async () => {
      const token = "Bearer invalid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const authError = new AuthenticationError(
        "Token has expired",
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        401,
        { originalError: "auth/id-token-expired" },
      );
      mockAuthToken.mockRejectedValue(authError);

      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
          message: "Token has expired",
          details: { originalError: "auth/id-token-expired" },
        },
      });
    });

    it("should handle null token response", async () => {
      const token = "Bearer malformed-token";
      mockRequest.headers = new Headers({ Authorization: token });

      mockAuthToken.mockResolvedValue(null); // Invalid token format

      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.TOKEN_INVALID,
          message: "Invalid or expired token",
        },
      });
    });

    it("should pass custom authentication options", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const customOptions = {
        requireVerification: true,
        requireRoles: ["admin"],
        allowInactive: false,
      };
      const authenticatedHandler = withBearerAuth(mockHandler, customOptions);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, customOptions);
    });
  });

  describe("withBearerAuthAndRoles", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should allow users with required roles", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "admin-user",
            roles: ["admin", "company"],
            companyId: "company-123",
          },
        }),
      });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuthAndRoles(mockHandler, [
        "admin",
      ]);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should deny users without required roles", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "candidate-user",
            roles: ["candidate"],
            companyId: undefined,
          },
        }),
      });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuthAndRoles(mockHandler, [
        "admin",
      ]);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
      expect(await result.json()).toMatchObject({
        error: {
          message: expect.stringContaining("Access denied"),
          requiredRoles: ["admin"],
          userRoles: ["candidate"],
        },
      });
    });

    it("should handle missing profile when roles are required", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({ profile: undefined });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuthAndRoles(mockHandler, [
        "admin",
      ]);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(403);
      expect(await result.json()).toMatchObject({
        error: {
          message: expect.stringContaining("User profile required"),
        },
      });
    });

    it("should handle multiple required roles (ANY logic)", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "company-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuthAndRoles(mockHandler, [
        "admin",
        "company",
      ]);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockHandler).toHaveBeenCalled(); // Has 'company' role
      expect(result).toEqual({ success: true });
    });
  });

  describe("createAuthenticatedActions", () => {
    it("should create multiple bearer-authenticated actions", async () => {
      const action1 = vi.fn().mockResolvedValue({ result: "action1" });
      const action2 = vi.fn().mockResolvedValue({ result: "action2" });

      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedActions = createAuthenticatedActions({
        action1,
        action2,
      });

      const result1 = await authenticatedActions.action1(
        mockRequest as NextRequest,
      );
      const result2 = await authenticatedActions.action2(
        mockRequest as NextRequest,
      );

      expect(action1).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(action2).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result1).toEqual({ result: "action1" });
      expect(result2).toEqual({ result: "action2" });
    });

    it("should handle authentication failure for all actions", async () => {
      const action1 = vi.fn();
      const action2 = vi.fn();

      // No authorization header

      const authenticatedActions = createAuthenticatedActions({
        action1,
        action2,
      });

      const result1 = await authenticatedActions.action1(
        mockRequest as NextRequest,
      );
      const result2 = await authenticatedActions.action2(
        mockRequest as NextRequest,
      );

      expect(action1).not.toHaveBeenCalled();
      expect(action2).not.toHaveBeenCalled();
      expect(result1.status).toBe(401);
      expect(result2.status).toBe(401);
    });

    it("should apply custom options to all actions", async () => {
      const action1 = vi.fn().mockResolvedValue({ success: true });

      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const customOptions = { requireVerification: true };
      const authenticatedActions = createAuthenticatedActions(
        {
          action1,
        },
        customOptions,
      );

      await authenticatedActions.action1(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, customOptions);
    });
  });

  describe("authGuard Object", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    describe("authGuard.api", () => {
      it("should provide basic API authentication", async () => {
        const token = "Bearer api-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({ method: "token" });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.api(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
        expect(result).toEqual({ success: true });
      });
    });

    describe("authGuard.admin", () => {
      it("should allow admin users", async () => {
        const token = "Bearer admin-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "admin-user",
              roles: ["admin"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
        expect(result).toEqual({ success: true });
      });

      it("should allow chancedee users", async () => {
        const token = "Bearer chancedee-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "chancedee-user",
              roles: ["chancedee"],
              companyId: "system",
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny non-admin users", async () => {
        const token = "Bearer candidate-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(result.status).toBe(403);
      });
    });

    describe("authGuard.company", () => {
      it("should allow company users", async () => {
        const token = "Bearer company-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "company-user",
              roles: ["company"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.company(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should allow admin users (company access)", async () => {
        const token = "Bearer admin-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "admin-user",
              roles: ["admin"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.company(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny candidate users", async () => {
        const token = "Bearer candidate-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.company(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(result.status).toBe(403);
      });
    });

    describe("authGuard.candidate", () => {
      it("should allow candidate users", async () => {
        const token = "Bearer candidate-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.candidate(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny company users", async () => {
        const token = "Bearer company-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "company-user",
              roles: ["company"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.candidate(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(result.status).toBe(403);
      });
    });

    describe("authGuard.verified", () => {
      it("should allow verified users", async () => {
        const token = "Bearer verified-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult();
        mockAuth.user.email_verified = true;
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.verified(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny unverified users", async () => {
        const token = "Bearer unverified-token";
        mockRequest.headers = new Headers({ Authorization: token });

        const mockAuth = createMockAuthResult();
        mockAuth.user.email_verified = false;
        mockAuthToken.mockResolvedValue(mockAuth);

        const guardedHandler = authGuard.verified(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(result.status).toBe(401);
        expect(await result.json()).toMatchObject({
          error: {
            code: AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
          },
        });
      });
    });
  });

  describe("Header Parsing Edge Cases", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    it("should handle Authorization header with extra whitespace", async () => {
      const token = "  Bearer   token-with-spaces   ";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuth(mockHandler);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token.trim(), {
        includeProfile: true,
      });
    });

    it("should handle case-insensitive Authorization header", async () => {
      const token = "bearer lowercase-bearer-prefix";
      mockRequest.headers = new Headers({ authorization: token });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuth(mockHandler);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
    });

    it("should handle very long tokens", async () => {
      const longToken = `Bearer ${"a".repeat(2048)}`; // Very long token
      mockRequest.headers = new Headers({ Authorization: longToken });

      const mockAuth = createMockAuthResult();
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuth(mockHandler);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(longToken, {
        includeProfile: true,
      });
    });
  });

  describe("Error Response Consistency", () => {
    const mockHandler = vi.fn();

    it("should return consistent error format for authentication failures", async () => {
      const authenticatedHandler = withBearerAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      const responseData = await result.json();
      expect(responseData).toHaveProperty("error");
      expect(responseData.error).toHaveProperty("code");
      expect(responseData.error).toHaveProperty("message");
    });

    it("should return consistent error format for authorization failures", async () => {
      const token = "Bearer valid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: { uid: "user", roles: ["candidate"] },
        }),
      });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withBearerAuthAndRoles(mockHandler, [
        "admin",
      ]);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      const responseData = await result.json();
      expect(responseData).toHaveProperty("error");
      expect(responseData.error).toHaveProperty("message");
      expect(responseData.error).toHaveProperty("requiredRoles");
      expect(responseData.error).toHaveProperty("userRoles");
    });
  });
});
