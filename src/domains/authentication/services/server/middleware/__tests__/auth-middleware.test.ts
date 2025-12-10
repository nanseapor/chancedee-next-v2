/**
 * Authentication Middleware Tests
 *
 * Tests for HOF (Higher-Order Function) based authentication middleware including
 * guard functions, route protection logic, error response handling, and
 * authorization header parsing.
 */

import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import {
  AUTH_ERROR_CODES,
  AuthenticationError,
  AuthorizationError,
} from "@/types/auth.types";

import { authenticateSession, authenticateToken } from "../../core/auth-engine";
import {
  createMockAuthResult,
  createMockUserProfile,
} from "../../test/auth-test-utils";
import {
  authGuards,
  createAuthenticatedActions,
  createRoleCheckedFunction,
  withAuth,
  withSessionAuth,
  withTokenAuth,
} from "../auth-middleware";

// Mock core authentication functions
vi.mock("../../core/auth-engine", () => ({
  authenticateSession: vi.fn(),
  authenticateToken: vi.fn(),
  hasRoles: vi.fn(),
  belongsToCompany: vi.fn(),
}));

// Mock Next.js utilities if needed
vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      json: vi.fn((data, init) => ({
        json: () => Promise.resolve(data),
        status: init?.status || 200,
        headers: new Headers(init?.headers),
      })),
    },
  };
});

describe("Authentication Middleware", () => {
  let mockRequest: Partial<NextRequest>;
  let mockAuthSession: any;
  let mockAuthToken: any;

  beforeEach(() => {
    vi.clearAllMocks();

    // Setup mock request
    mockRequest = {
      headers: new Headers(),
      cookies: new Map(),
      url: "https://example.com/test",
      method: "GET",
    };

    // Setup mock authentication functions
    mockAuthSession = authenticateSession as any;
    mockAuthToken = authenticateToken as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("withSessionAuth HOF", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should authenticate and call handler when session is valid", async () => {
      const mockAuth = createMockAuthResult({ method: "session" });
      mockAuthSession.mockResolvedValue(mockAuth);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthSession).toHaveBeenCalledWith({ includeProfile: true });
      expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should return 401 when no session exists", async () => {
      mockAuthSession.mockResolvedValue(null);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthSession).toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
    });

    it("should handle authentication errors gracefully", async () => {
      const authError = new AuthenticationError(
        "Session expired",
        AUTH_ERROR_CODES.SESSION_REQUIRED,
        401,
      );
      mockAuthSession.mockRejectedValue(authError);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.SESSION_REQUIRED,
          message: "Session expired",
        },
      });
    });

    it("should pass custom options to authentication", async () => {
      const mockAuth = createMockAuthResult();
      mockAuthSession.mockResolvedValue(mockAuth);

      const customOptions = {
        requireVerification: true,
        requireRoles: ["admin"],
      };
      const authenticatedHandler = withSessionAuth(mockHandler, customOptions);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthSession).toHaveBeenCalledWith(customOptions);
    });
  });

  describe("withTokenAuth HOF", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should authenticate bearer token from Authorization header", async () => {
      const token = "Bearer valid-token-123";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({ method: "token" });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withTokenAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
      expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should handle token without Bearer prefix", async () => {
      const token = "valid-token-123";
      mockRequest.headers = new Headers({ Authorization: token });

      const mockAuth = createMockAuthResult({ method: "token" });
      mockAuthToken.mockResolvedValue(mockAuth);

      const authenticatedHandler = withTokenAuth(mockHandler);
      await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
    });

    it("should return 401 when no Authorization header exists", async () => {
      const authenticatedHandler = withTokenAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthToken).not.toHaveBeenCalled();
      expect(mockHandler).not.toHaveBeenCalled();
      expect(result.status).toBe(401);
    });

    it("should return 401 when token is empty", async () => {
      mockRequest.headers = new Headers({ Authorization: "" });

      const authenticatedHandler = withTokenAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
    });

    it("should handle token authentication errors", async () => {
      const token = "Bearer invalid-token";
      mockRequest.headers = new Headers({ Authorization: token });

      const authError = new AuthenticationError(
        "Token expired",
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        401,
      );
      mockAuthToken.mockRejectedValue(authError);

      const authenticatedHandler = withTokenAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
          message: "Token expired",
        },
      });
    });
  });

  describe("withAuth (Flexible Authentication)", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    it("should prefer session authentication when both session and token exist", async () => {
      const token = "Bearer token-123";
      mockRequest.headers = new Headers({ Authorization: token });

      const sessionAuth = createMockAuthResult({ method: "session" });
      const tokenAuth = createMockAuthResult({ method: "token" });

      mockAuthSession.mockResolvedValue(sessionAuth);
      mockAuthToken.mockResolvedValue(tokenAuth);

      const authenticatedHandler = withAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthSession).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(sessionAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should fallback to token when session fails", async () => {
      const token = "Bearer token-123";
      mockRequest.headers = new Headers({ Authorization: token });

      const tokenAuth = createMockAuthResult({ method: "token" });

      mockAuthSession.mockResolvedValue(null); // Session failed
      mockAuthToken.mockResolvedValue(tokenAuth);

      const authenticatedHandler = withAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(mockAuthSession).toHaveBeenCalled();
      expect(mockAuthToken).toHaveBeenCalled();
      expect(mockHandler).toHaveBeenCalledWith(tokenAuth, mockRequest);
    });

    it("should return 401 when both authentication methods fail", async () => {
      mockAuthSession.mockResolvedValue(null);
      mockAuthToken.mockResolvedValue(null);

      const authenticatedHandler = withAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(mockHandler).not.toHaveBeenCalled();
    });
  });

  describe("Authentication Guards", () => {
    const mockHandler = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockHandler.mockClear();
    });

    describe("authGuards.user", () => {
      it("should allow any authenticated user", async () => {
        const mockAuth = createMockAuthResult();
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.user(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
        expect(result).toEqual({ success: true });
      });
    });

    describe("authGuards.admin", () => {
      it("should allow users with admin role", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "admin-user",
              roles: ["admin"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      });

      it("should allow users with chancedee role", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "chancedee-user",
              roles: ["chancedee"],
              companyId: "system",
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny users without admin roles", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.admin(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).not.toHaveBeenCalled();
        expect(result.status).toBe(403);
      });
    });

    describe("authGuards.company", () => {
      it("should allow users with company role", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "company-user",
              roles: ["company"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.company(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should allow users with admin role", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "admin-user",
              roles: ["admin"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.company(mockHandler);
        await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny candidates", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.company(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(result.status).toBe(403);
      });
    });

    describe("authGuards.candidate", () => {
      it("should allow users with candidate role", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "candidate-user",
              roles: ["candidate"],
              companyId: undefined,
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.candidate(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny company users", async () => {
        const mockAuth = createMockAuthResult({
          profile: createMockUserProfile({
            info: {
              uid: "company-user",
              roles: ["company"],
              companyId: "company-123",
            },
          }),
        });
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.candidate(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(result.status).toBe(403);
      });
    });

    describe("authGuards.verified", () => {
      it("should allow verified users", async () => {
        const mockAuth = createMockAuthResult();
        mockAuth.user.email_verified = true;
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.verified(mockHandler);
        const result = await guardedHandler(mockRequest as NextRequest);

        expect(mockHandler).toHaveBeenCalled();
      });

      it("should deny unverified users", async () => {
        const mockAuth = createMockAuthResult();
        mockAuth.user.email_verified = false;
        mockAuthSession.mockResolvedValue(mockAuth);

        const guardedHandler = authGuards.verified(mockHandler);
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

  describe("createAuthenticatedActions", () => {
    it("should create multiple authenticated actions", async () => {
      const action1 = vi.fn().mockResolvedValue({ result: "action1" });
      const action2 = vi.fn().mockResolvedValue({ result: "action2" });

      const mockAuth = createMockAuthResult();
      mockAuthSession.mockResolvedValue(mockAuth);

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

      mockAuthSession.mockResolvedValue(null);

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
  });

  describe("createRoleCheckedFunction", () => {
    const mockFunction = vi.fn().mockResolvedValue({ success: true });

    beforeEach(() => {
      mockFunction.mockClear();
    });

    it("should allow users with required roles", async () => {
      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "admin-user",
            roles: ["admin", "company"],
            companyId: "company-123",
          },
        }),
      });

      const roleCheckedFunction = createRoleCheckedFunction(mockFunction, [
        "admin",
      ]);
      const result = await roleCheckedFunction(mockAuth, "additional", "args");

      expect(mockFunction).toHaveBeenCalledWith(mockAuth, "additional", "args");
      expect(result).toEqual({ success: true });
    });

    it("should throw AuthorizationError for insufficient roles", async () => {
      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "candidate-user",
            roles: ["candidate"],
            companyId: undefined,
          },
        }),
      });

      const roleCheckedFunction = createRoleCheckedFunction(mockFunction, [
        "admin",
      ]);

      await expect(roleCheckedFunction(mockAuth, "args")).rejects.toThrow(
        AuthorizationError,
      );
      expect(mockFunction).not.toHaveBeenCalled();
    });

    it("should handle multiple required roles (ANY logic)", async () => {
      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "company-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      const roleCheckedFunction = createRoleCheckedFunction(mockFunction, [
        "admin",
        "company",
      ]);
      const result = await roleCheckedFunction(mockAuth);

      expect(mockFunction).toHaveBeenCalled(); // Has 'company' role, which satisfies ANY logic
      expect(result).toEqual({ success: true });
    });
  });

  describe("Error Response Formatting", () => {
    const mockHandler = vi.fn();

    it("should format AuthenticationError responses correctly", async () => {
      const authError = new AuthenticationError(
        "Custom auth error",
        AUTH_ERROR_CODES.TOKEN_INVALID,
        401,
        { customDetail: "test" },
      );
      mockAuthSession.mockRejectedValue(authError);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.TOKEN_INVALID,
          message: "Custom auth error",
          details: { customDetail: "test" },
        },
      });
    });

    it("should format AuthorizationError responses correctly", async () => {
      const authError = new AuthorizationError(
        "Access denied",
        ["admin"],
        ["candidate"],
        403,
        "role-check",
      );
      mockAuthSession.mockRejectedValue(authError);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(403);
      expect(await result.json()).toMatchObject({
        error: {
          message: "Access denied",
          requiredRoles: ["admin"],
          userRoles: ["candidate"],
          action: "role-check",
        },
      });
    });

    it("should handle generic errors with 500 status", async () => {
      const genericError = new Error("Unexpected error");
      mockAuthSession.mockRejectedValue(genericError);

      const authenticatedHandler = withSessionAuth(mockHandler);
      const result = await authenticatedHandler(mockRequest as NextRequest);

      expect(result.status).toBe(500);
      expect(await result.json()).toMatchObject({
        error: {
          message: "Internal authentication error",
        },
      });
    });
  });
});
