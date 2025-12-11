import { type NextRequest, NextResponse } from "next/server";

/**
 * Subdomain Configuration
 * These can be configured via environment variables
 */
const CONTENT_HOST = process.env.CONTENT_HOST || "www.chancedee.com";
const JOBS_HOST = process.env.JOBS_HOST || "jobs.chancedee.com";

/**
 * Get the subdomain app based on the hostname
 */
function getSubdomainApp(hostname: string): "content" | "jobsmarket" | null {
  // Remove port for local development
  const host = hostname.split(":")[0];

  // Check for jobs subdomain
  if (host === JOBS_HOST || host.startsWith("jobs.")) {
    return "jobsmarket";
  }

  // Check for content (www) subdomain - default
  if (
    host === CONTENT_HOST ||
    host.startsWith("www.") ||
    host === "localhost" ||
    host === "127.0.0.1"
  ) {
    return "content";
  }

  // Default to content for any other hostname
  return "content";
}

/**
 * Next.js Middleware
 *
 * Handles:
 * 1. Subdomain-based routing (www -> /content, jobs -> /jobsmarket)
 * 2. Session cookie clearing on auth pages (content site only)
 */
export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hostname = request.headers.get("host") || "";

  // Debug logging
  console.log(`[Middleware] pathname: ${pathname}, hostname: ${hostname}`);

  // Skip middleware for static files, API routes, and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/api") || // API routes are shared across subdomains
    pathname.startsWith("/content") || // Already rewritten
    pathname.startsWith("/jobsmarket") || // Already rewritten
    pathname.includes(".") // Static files like favicon.ico, robots.txt
  ) {
    console.log(`[Middleware] Skipping: ${pathname}`);
    return NextResponse.next();
  }

  // Determine which subdomain app to use
  const subdomainApp = getSubdomainApp(hostname);
  console.log(`[Middleware] subdomainApp: ${subdomainApp}`);

  if (subdomainApp) {
    // Rewrite to the appropriate subdomain app folder
    // e.g., / -> /content or /jobsmarket
    // e.g., /auth/sign-in -> /content/auth/sign-in
    const normalizedPath = pathname === "/" ? "" : pathname;
    const rewritePath = `/${subdomainApp}${normalizedPath}`;

    console.log(`[Middleware] Rewriting to: ${rewritePath}`);

    // Handle auth session clearing for content site auth pages
    if (subdomainApp === "content" && (pathname === "/auth/sign-in" || pathname === "/auth/sign-up")) {
      return handleAuthSessionClear(request, new URL(rewritePath, request.url));
    }

    return NextResponse.rewrite(new URL(rewritePath, request.url));
  }

  return NextResponse.next();
}

/**
 * Handle session cookie clearing for auth pages and rewrite to content
 */
function handleAuthSessionClear(request: NextRequest, rewriteUrl: URL): NextResponse {
  // Only process GET requests - skip POST/PUT/DELETE/PATCH (server actions)
  if (request.method !== "GET") {
    return NextResponse.rewrite(rewriteUrl);
  }

  const response = NextResponse.rewrite(rewriteUrl);
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".chancedee.com" : undefined;

  // Clear session cookie by setting max-age to 0
  response.cookies.set("session", "", {
    maxAge: 0,
    expires: new Date(0),
    httpOnly: true,
    secure: isProduction,
    path: "/",
    domain,
    sameSite: "strict",
  });

  // Also clear without domain for development environments
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

/**
 * Middleware configuration
 * Run on all routes except static files
 */
export const config = {
  matcher: [
    /*
     * Match all request paths except:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico, sitemap.xml, robots.txt (metadata files)
     */
    "/((?!_next/static|_next/image|favicon.ico|sitemap.xml|robots.txt).*)",
  ],
};
