import { type NextRequest, NextResponse } from "next/server";

/**
 * Next.js Middleware - Clear session cookies on auth pages (GET requests only)
 *
 * This middleware intercepts GET requests to sign-in and sign-up pages
 * and clears the session cookie by setting its max-age to 0.
 *
 * This ensures users start fresh on these pages without stale sessions,
 * while preserving session cookies for POST requests (server actions).
 *
 * Why GET only?
 * - GET requests = page loads (should clear stale sessions)
 * - POST requests = server actions/form submissions (may need session for verification)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // Only process GET requests - skip POST/PUT/DELETE/PATCH (server actions)
  if (request.method !== "GET") {
    return NextResponse.next();
  }

  // Check if the path is sign-in or sign-up
  const isAuthPath =
    pathname === "/auth/sign-in" || pathname === "/auth/sign-up";

  if (isAuthPath) {
    const response = NextResponse.next();
    const isProduction = process.env.NODE_ENV === "production";
    const domain = isProduction ? ".chancedee.com" : undefined;

    // Clear session cookie by setting max-age to 0
    // This matches the cookie attributes used in cookie-utils.ts
    response.cookies.set("session", "", {
      maxAge: 0,
      expires: new Date(0), // Unix epoch
      httpOnly: true,
      secure: isProduction,
      path: "/",
      domain,
      sameSite: "strict",
    });

    // Also clear without domain for development environments
    // This ensures cookies set in development are also cleared
    if (!isProduction) {
      response.cookies.set("session", "", {
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
    }

    return response;
  }

  return NextResponse.next();
}

/**
 * Middleware configuration
 * Only run on auth sign-in and sign-up pages for optimal performance
 */
export const config = {
  matcher: ["/auth/sign-in", "/auth/sign-up"],
};
