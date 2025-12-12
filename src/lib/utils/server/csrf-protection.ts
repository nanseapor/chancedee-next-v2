/**
 * CSRF Protection Utilities
 *
 * Provides Cross-Site Request Forgery (CSRF) protection through:
 * 1. SameSite=Strict cookies (already implemented in cookie-utils.ts)
 * 2. Origin/Referer header validation
 * 3. Custom header validation for API requests
 *
 * Security: CWE-352 - Cross-Site Request Forgery (CSRF)
 *
 * Note: SameSite=Strict cookies provide strong CSRF protection for modern browsers.
 * This additional validation provides defense-in-depth for older browsers and
 * ensures requests come from trusted origins.
 */

import { type NextRequest, NextResponse } from "next/server";
import { CONTENT_HOST, JOBS_HOST } from "@/config/hosts";

/**
 * Allowed origins for production
 * Add your production domains here
 */
const ALLOWED_ORIGINS = [
  "https://chancedee.com",
  CONTENT_HOST,
  "https://dev.chancedee.com",
  JOBS_HOST,
];

/**
 * Check if origin is allowed
 */
function isAllowedOrigin(origin: string | null, host: string | null): boolean {
  if (!origin) {
    // No origin header - might be same-origin request or non-browser client
    // Allow if it's a same-origin request (checked via Referer)
    return true;
  }

  const isProduction = process.env.NODE_ENV === "production";

  if (!isProduction) {
    // In development, allow localhost
    if (
      origin.startsWith("http://localhost:") ||
      origin.startsWith("http://127.0.0.1:")
    ) {
      return true;
    }
  }

  // Check against allowed origins
  if (ALLOWED_ORIGINS.includes(origin)) {
    return true;
  }

  // Check if origin matches the host header (same-origin)
  if (host && origin === `https://${host}`) {
    return true;
  }

  return false;
}

/**
 * Validate CSRF protection for state-changing requests
 *
 * This function validates:
 * 1. Origin header matches allowed origins
 * 2. Referer header is from same origin
 * 3. For API routes, check for custom header (X-Requested-With)
 *
 * @param request - Next.js request object
 * @returns NextResponse if CSRF validation fails, null if valid
 */
export function validateCSRF(request: NextRequest): NextResponse | null {
  const method = request.method;

  // Only validate state-changing methods
  if (!["POST", "PUT", "PATCH", "DELETE"].includes(method)) {
    return null; // GET, HEAD, OPTIONS are safe
  }

  const origin = request.headers.get("origin");
  const referer = request.headers.get("referer");
  const host = request.headers.get("host");
  const requestedWith = request.headers.get("x-requested-with");

  // Validate Origin header
  if (!isAllowedOrigin(origin, host)) {
    console.warn(
      `⚠️  CSRF: Blocked request from unauthorized origin: ${origin}`,
    );
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "Invalid origin",
      },
      {
        status: 403,
        headers: {
          "X-CSRF-Error": "invalid-origin",
        },
      },
    );
  }

  // Validate Referer header for additional security
  if (referer) {
    const refererUrl = new URL(referer);
    const refererOrigin = `${refererUrl.protocol}//${refererUrl.host}`;

    if (!isAllowedOrigin(refererOrigin, host)) {
      console.warn(
        `⚠️  CSRF: Blocked request from unauthorized referer: ${referer}`,
      );
      return NextResponse.json(
        {
          error: "Forbidden",
          message: "Invalid referer",
        },
        {
          status: 403,
          headers: {
            "X-CSRF-Error": "invalid-referer",
          },
        },
      );
    }
  }

  // For AJAX/API requests, check for custom header
  // This provides additional protection as browsers don't send custom headers cross-origin
  const isApiRoute = request.nextUrl.pathname.startsWith("/api/");
  if (isApiRoute && !origin && !referer && !requestedWith) {
    // API route without Origin, Referer, or X-Requested-With header
    // This is suspicious - likely a CSRF attempt or misconfigured client
    console.warn(
      `⚠️  CSRF: Blocked API request without Origin/Referer/X-Requested-With: ${request.nextUrl.pathname}`,
    );
    return NextResponse.json(
      {
        error: "Forbidden",
        message: "Missing required headers",
      },
      {
        status: 403,
        headers: {
          "X-CSRF-Error": "missing-headers",
        },
      },
    );
  }

  // All checks passed
  return null;
}

/**
 * Helper to add CSRF validation to API route handlers
 *
 * @example
 * export async function POST(request: NextRequest) {
 *   const csrfError = validateCSRF(request);
 *   if (csrfError) return csrfError;
 *
 *   // Continue with request handling...
 * }
 */
export function withCSRFProtection(
  handler: (request: NextRequest, ...args: any[]) => Promise<NextResponse>,
) {
  return async (
    request: NextRequest,
    ...args: any[]
  ): Promise<NextResponse> => {
    const csrfError = validateCSRF(request);
    if (csrfError) {
      return csrfError;
    }

    return handler(request, ...args);
  };
}
