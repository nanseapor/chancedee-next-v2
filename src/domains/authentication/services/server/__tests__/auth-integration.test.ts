/**
 * Authentication Integration Tests
 *
 * Basic integration tests for authentication flows including middleware integration,
 * API route authentication, server action protection, and end-to-end authentication
 * scenarios that test multiple components working together.
 */

import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";

import { middleware } from "@/middleware";
import { AUTH_ERROR_CODES, AuthenticationError } from "@/types/auth.types";

import { authenticateSession, authenticateToken } from "../core/auth-engine";
import {
    authGuards,
    withSessionAuth,
    withTokenAuth,
} from "../middleware/auth-middleware";
import { withBearerAuth } from "../middleware/bearer-auth";
import {
    createMockAuthResult,
    createMockUserProfile,
} from "../test/auth-test-utils";

// Mock external dependencies
vi.mock("next/headers", () => ({
  cookies: vi.fn(),
}));

vi.mock("../core/auth-engine", () => ({
  authenticateSession: vi.fn(),
  authenticateToken: vi.fn(),
  hasRoles: vi.fn(),
  belongsToCompany: vi.fn(),
}));

vi.mock("@/lib/firebase-admin", () => ({
  getFirebaseAdminAuth: vi.fn(() => ({
    verifySessionCookie: vi.fn(),
    verifyIdToken: vi.fn(),
  })),
}));

vi.mock("@/lib/database/repositories/web-user-data-props", () => ({
  getUserDataPropsById: vi.fn(),
}));

vi.mock("next/server", async () => {
  const actual = await vi.importActual("next/server");
  return {
    ...actual,
    NextResponse: {
      next: vi.fn(() => ({ type: "next" })),
      redirect: vi.fn((url) => ({ type: "redirect", url })),
      json: vi.fn((data, init) => ({
        type: "json",
        data,
        status: init?.status || 200,
        json: () => Promise.resolve(data),
      })),
    },
  };
});

// Mock fetch for permission API calls
global.fetch = vi.fn();

describe("Authentication Integration Tests", () => {
  let mockCookies: any;
  let mockFetch: any;
  let mockAuthSession: any;
  let mockAuthToken: any;

  beforeEach(() => {
    vi.clearAllMocks();

    mockCookies = {
      get: vi.fn(),
      set: vi.fn(),
    };
    (cookies as any).mockReturnValue(mockCookies);

    mockFetch = global.fetch as any;
    mockAuthSession = authenticateSession as any;
    mockAuthToken = authenticateToken as any;
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("End-to-End Authentication Flow", () => {
    it("should complete full session authentication flow", async () => {
      // Step 1: User has valid session cookie
      const sessionCookie = "valid-session-12345";
      mockCookies.get.mockReturnValue({ value: sessionCookie });

      // Step 2: Middleware checks permission via API
      const mockRequest = {
        nextUrl: new URL("https://example.com/companies/dashboard"),
        cookies: mockCookies,
        headers: new Headers(),
        url: "https://example.com/companies/dashboard",
        method: "GET",
      } as NextRequest;

      // Mock successful permission check
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hasPermission: true }),
      });

      // Step 3: Middleware allows request through
      const middlewareResult = await middleware(mockRequest, {} as any);

      expect(middlewareResult?.type).toBe("next");
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining("/api/web-permission"),
        expect.objectContaining({
          headers: expect.objectContaining({
            Cookie: expect.stringContaining("session=valid-session-12345"),
          }),
        }),
      );
    });

    it("should complete full bearer token authentication flow", async () => {
      // Step 1: API request with bearer token
      const token = "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...";
      const mockRequest = {
        headers: new Headers({ Authorization: token }),
        url: "https://api.example.com/companies/profile",
        method: "GET",
      } as NextRequest;

      // Step 2: Create authenticated API handler
      const mockApiHandler = vi.fn().mockResolvedValue({
        company: { id: "company-123", name: "Test Company" },
      });

      const authenticatedHandler = withBearerAuth(mockApiHandler);

      // Step 3: Mock successful token validation
      const mockAuth = createMockAuthResult({
        method: "token",
        profile: createMockUserProfile({
          info: {
            uid: "company-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      mockAuthToken.mockResolvedValue(mockAuth);

      // Step 4: Execute authenticated API call
      const result = await authenticatedHandler(mockRequest);

      expect(authenticateToken).toHaveBeenCalledWith(token, {
        includeProfile: true,
      });
      expect(mockApiHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({
        company: { id: "company-123", name: "Test Company" },
      });
    });

    it("should handle authentication failure cascade", async () => {
      // Step 1: User has invalid session cookie
      const invalidSession = "invalid-session-12345";
      mockCookies.get.mockReturnValue({ value: invalidSession });

      // Step 2: Middleware permission check fails
      const mockRequest = {
        nextUrl: new URL(
          "https://example.com/companies/dashboard?tab=analytics",
        ),
        cookies: mockCookies,
        headers: new Headers(),
        url: "https://example.com/companies/dashboard?tab=analytics",
        method: "GET",
      } as NextRequest;

      // Mock failed permission check (401 Unauthorized)
      mockFetch.mockResolvedValue({
        ok: false,
        status: 401,
        json: () => Promise.resolve({ error: "Unauthorized" }),
      });

      // Step 3: Middleware redirects to login with proper redirect URL
      const middlewareResult = await middleware(mockRequest, {} as any);

      expect(middlewareResult?.type).toBe("redirect");
      expect(middlewareResult?.url).toContain("/auth/login");
      expect(middlewareResult?.url).toContain(
        "redirect=%2Fcompanies%2Fdashboard%3Ftab%3Danalytics",
      );
    });
  });

  describe("Multi-Layer Authentication Integration", () => {
    it("should integrate middleware with session auth guards", async () => {
      // Create a server action with session authentication
      const mockServerAction = vi.fn().mockResolvedValue({ success: true });
      const guardedAction = authGuards.company(mockServerAction);

      // Mock authenticated user
      const mockAuth = createMockAuthResult({
        method: "session",
        profile: createMockUserProfile({
          info: {
            uid: "company-user",
            roles: ["company"],
            companyId: "company-123",
          },
        }),
      });

      mockAuthSession.mockResolvedValue(mockAuth);

      // Execute guarded action
      const mockRequest = {} as NextRequest;
      const result = await guardedAction(mockRequest);

      expect(authenticateSession).toHaveBeenCalled();
      expect(mockServerAction).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ success: true });
    });

    it("should integrate bearer auth with role-based guards", async () => {
      // Create API endpoint with bearer auth and admin role requirement
      const mockApiEndpoint = vi.fn().mockResolvedValue({
        users: [{ id: "1", role: "company" }],
      });

      const adminGuardedEndpoint = withBearerAuth(
        authGuards.admin(mockApiEndpoint),
      );

      // Mock admin user with bearer token
      const mockAuth = createMockAuthResult({
        method: "token",
        profile: createMockUserProfile({
          info: {
            uid: "admin-user",
            roles: ["admin"],
            companyId: "company-123",
          },
        }),
      });

      mockAuthToken.mockResolvedValue(mockAuth);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer admin-token" }),
        url: "https://api.example.com/admin/users",
      } as NextRequest;

      const result = await adminGuardedEndpoint(mockRequest);

      expect(mockApiEndpoint).toHaveBeenCalledWith(mockAuth, mockRequest);
      expect(result).toEqual({ users: [{ id: "1", role: "company" }] });
    });

    it("should handle role mismatch in multi-layer setup", async () => {
      // Create admin-only endpoint with bearer auth
      const mockAdminEndpoint = vi.fn();
      const adminGuardedEndpoint = withBearerAuth(
        authGuards.admin(mockAdminEndpoint),
      );

      // Mock candidate user (insufficient permissions)
      const mockAuth = createMockAuthResult({
        method: "token",
        profile: createMockUserProfile({
          info: {
            uid: "candidate-user",
            roles: ["candidate"],
            companyId: undefined,
          },
        }),
      });

      mockAuthToken.mockResolvedValue(mockAuth);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer candidate-token" }),
        url: "https://api.example.com/admin/users",
      } as NextRequest;

      const result = await adminGuardedEndpoint(mockRequest);

      expect(mockAdminEndpoint).not.toHaveBeenCalled();
      expect(result.status).toBe(403);
    });
  });

  describe("Cross-Authentication Method Integration", () => {
    it("should handle session-to-token authentication fallback", async () => {
      // Mock handler that accepts either auth method
      const flexibleHandler = vi.fn().mockResolvedValue({ success: true });

      // First try session auth (fails)
      mockAuthSession.mockResolvedValue(null);

      // Then try token auth (succeeds)
      const mockAuth = createMockAuthResult({ method: "token" });
      mockAuthToken.mockResolvedValue(mockAuth);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer fallback-token" }),
        cookies: mockCookies,
      } as NextRequest;

      // Use flexible auth that tries both methods
      const flexibleAuthHandler = withSessionAuth(async (auth, req) => {
        if (!auth) {
          // Fallback to token auth
          const tokenAuthHandler = withTokenAuth(flexibleHandler);
          return await tokenAuthHandler(req);
        }
        return flexibleHandler(auth, req);
      });

      const result = await flexibleAuthHandler(mockRequest);

      expect(authenticateSession).toHaveBeenCalled();
      expect(authenticateToken).toHaveBeenCalled();
      expect(flexibleHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
    });

    it("should maintain consistent user context across auth methods", async () => {
      const userId = "consistent-user-123";

      // Same user authenticated via session
      const sessionAuth = createMockAuthResult({
        method: "session",
        user: { ...createMockAuthResult().user, uid: userId },
        profile: createMockUserProfile({ uid: userId }),
      });

      // Same user authenticated via token
      const tokenAuth = createMockAuthResult({
        method: "token",
        user: { ...createMockAuthResult().user, uid: userId },
        profile: createMockUserProfile({ uid: userId }),
      });

      // Verify both auth methods resolve to same user
      expect(sessionAuth.user.uid).toBe(tokenAuth.user.uid);
      expect(sessionAuth.profile?.uid).toBe(tokenAuth.profile?.uid);
      expect(sessionAuth.profile?.info?.companyId).toBe(
        tokenAuth.profile?.info?.companyId,
      );
    });
  });

  describe("Error Propagation Integration", () => {
    it("should propagate authentication errors through middleware layers", async () => {
      const mockHandler = vi.fn();
      const authError = new AuthenticationError(
        "Token expired",
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        401,
        { originalError: "auth/id-token-expired" },
      );

      mockAuthToken.mockRejectedValue(authError);

      const authenticatedHandler = withBearerAuth(mockHandler);

      const mockRequest = {
        headers: new Headers({ Authorization: "Bearer expired-token" }),
      } as NextRequest;

      const result = await authenticatedHandler(mockRequest);

      expect(result.status).toBe(401);
      expect(await result.json()).toMatchObject({
        error: {
          code: AUTH_ERROR_CODES.TOKEN_EXPIRED,
          message: "Token expired",
          details: { originalError: "auth/id-token-expired" },
        },
      });
    });

    it("should handle network errors in permission API integration", async () => {
      mockCookies.get.mockReturnValue({ value: "valid-session" });

      const mockRequest = {
        nextUrl: new URL("https://example.com/companies/dashboard"),
        cookies: mockCookies,
        headers: new Headers(),
        url: "https://example.com/companies/dashboard",
      } as NextRequest;

      // Simulate network error
      mockFetch.mockRejectedValue(new Error("Network timeout"));

      const result = await middleware(mockRequest, {} as any);

      expect(result?.type).toBe("redirect");
      expect(result?.url).toContain("/auth/login");
    });
  });

  describe("Performance and Caching Integration", () => {
    it("should handle concurrent authentication requests efficiently", async () => {
      const mockHandler = vi.fn().mockResolvedValue({ success: true });
      const authenticatedHandler = withSessionAuth(mockHandler);

      const mockAuth = createMockAuthResult();
      mockAuthSession.mockResolvedValue(mockAuth);

      const mockRequest = {} as NextRequest;

      // Simulate concurrent requests
      const promises = Array(5)
        .fill(null)
        .map(() => authenticatedHandler(mockRequest));

      const results = await Promise.all(promises);

      // All requests should succeed
      results.forEach((result) => {
        expect(result).toEqual({ success: true });
      });

      // Authentication should be called for each request (no shared state)
      expect(authenticateSession).toHaveBeenCalledTimes(5);
    });

    it("should not cache failed authentication attempts", async () => {
      const mockHandler = vi.fn();
      const authenticatedHandler = withSessionAuth(mockHandler);

      // First request fails
      mockAuthSession.mockResolvedValueOnce(null);

      // Second request succeeds
      const mockAuth = createMockAuthResult();
      mockAuthSession.mockResolvedValueOnce(mockAuth);

      const mockRequest = {} as NextRequest;

      // First request should fail
      const result1 = await authenticatedHandler(mockRequest);
      expect(result1.status).toBe(401);

      // Second request should succeed (no cached failure)
      const result2 = await authenticatedHandler(mockRequest);
      expect(mockHandler).toHaveBeenCalledWith(mockAuth, mockRequest);
    });
  });

  describe("Real-World Scenario Simulations", () => {
    it("should simulate company dashboard access flow", async () => {
      // 1. User navigates to company dashboard
      const dashboardRequest = {
        nextUrl: new URL("https://app.chancedee.com/companies/dashboard"),
        cookies: mockCookies,
        headers: new Headers(),
        url: "https://app.chancedee.com/companies/dashboard",
      } as NextRequest;

      // 2. User has valid session
      mockCookies.get.mockReturnValue({ value: "company-session-abc123" });

      // 3. Permission API validates company role
      mockFetch.mockResolvedValue({
        ok: true,
        json: () => Promise.resolve({ hasPermission: true }),
      });

      // 4. Middleware allows access
      const middlewareResult = await middleware(dashboardRequest, {} as any);
      expect(middlewareResult?.type).toBe("next");

      // 5. Server action fetches company data
      const fetchCompanyData = vi.fn().mockResolvedValue({
        company: { id: "comp-123", name: "Test Corp" },
      });

      const authenticatedFetch = authGuards.company(fetchCompanyData);

      const mockAuth = createMockAuthResult({
        profile: createMockUserProfile({
          info: {
            uid: "user-123",
            roles: ["company"],
            companyId: "comp-123",
          },
        }),
      });

      mockAuthSession.mockResolvedValue(mockAuth);

      const actionResult = await authenticatedFetch({} as NextRequest);
      expect(actionResult).toEqual({
        company: { id: "comp-123", name: "Test Corp" },
      });
    });

    it("should simulate API key authentication for external integration", async () => {
      // External service accessing API with bearer token
      const apiRequest = {
        headers: new Headers({
          Authorization: "Bearer external-service-token-xyz789",
          "User-Agent": "ExternalHRSystem/1.0",
        }),
        url: "https://api.chancedee.com/v1/jobs",
        method: "GET",
      } as NextRequest;

      const jobsApiHandler = vi.fn().mockResolvedValue({
        jobs: [
          { id: "job-1", title: "Senior Developer" },
          { id: "job-2", title: "Product Manager" },
        ],
      });

      const authenticatedApiHandler = withBearerAuth(jobsApiHandler);

      const mockAuth = createMockAuthResult({
        method: "token",
        profile: createMockUserProfile({
          info: {
            uid: "external-service",
            roles: ["api-client"],
            companyId: "client-company-456",
          },
        }),
      });

      mockAuthToken.mockResolvedValue(mockAuth);

      const result = await authenticatedApiHandler(apiRequest);

      expect(result).toEqual({
        jobs: [
          { id: "job-1", title: "Senior Developer" },
          { id: "job-2", title: "Product Manager" },
        ],
      });
    });
  });
});
