"use server";

import type { DecodedIdToken } from "firebase-admin/auth";
import { cookies } from "next/headers";

import { clearSessionCookie } from "@/domains/authentication/services/server/utils/cookie-utils";
import {
  AUTH_ERROR_CODES,
  AuthenticationError,
  AuthorizationError,
} from "@/domains/authentication/utils/auth-errors";
import { getUserDataPropsById } from "@/lib/database/repositories/web-user-data-props";
import { getFirebaseAdminAuth } from "@/lib/firebase/admin";
import type {
  AuthOptions,
  AuthResult,
  userDataProps,
} from "@/types/auth.types";

/**
 * Authenticate via session cookie - Server Action
 *
 * This function verifies the session cookie and returns the authenticated user
 * with optional profile data based on the provided options.
 */
export async function authenticateSession(
  options: AuthOptions = {},
): Promise<AuthResult | null> {
  const sessionCookie = (await cookies()).get("session")?.value;

  if (!sessionCookie) {
    console.warn("No session cookie found");
    return null;
  }

  try {
    const auth = getFirebaseAdminAuth();
    const decodedClaims = await auth.verifySessionCookie(sessionCookie, true);

    return await buildAuthResult(decodedClaims, "session", options);
  } catch (error) {
    console.error("Failed to verify session cookie:", error);

    // Clear invalid session cookie using robust utility
    await clearSessionCookie();

    return null;
  }
}

/**
 * Authenticate via bearer token - Server Action
 *
 * This function verifies the bearer token and returns the authenticated user
 * with optional profile data based on the provided options.
 */
export async function authenticateToken(
  tokenString: string,
  options: AuthOptions = {},
): Promise<AuthResult | null> {
  if (!tokenString) {
    return null;
  }

  try {
    // Handle "Bearer " prefix if present
    const token = tokenString.startsWith("Bearer ")
      ? tokenString.slice(7) // Remove "Bearer " prefix
      : tokenString;

    const auth = getFirebaseAdminAuth();
    const decodedToken = await auth.verifyIdToken(token);

    return await buildAuthResult(decodedToken, "token", options);
  } catch (error: any) {
    console.error("Failed to verify bearer token:", error);

    // Handle specific Firebase auth errors
    if (error?.code === "auth/id-token-expired") {
      throw new AuthenticationError(
        "Token has expired",
        AUTH_ERROR_CODES.TOKEN_EXPIRED,
        401,
        { originalError: error.code },
      );
    }

    if (error?.code === "auth/id-token-revoked") {
      throw new AuthenticationError(
        "Token has been revoked",
        AUTH_ERROR_CODES.TOKEN_REVOKED,
        401,
        { originalError: error.code },
      );
    }

    if (
      error?.code === "auth/argument-error" ||
      error?.code === "auth/invalid-argument"
    ) {
      return null; // Invalid token format - return null instead of throwing
    }

    // For other errors, re-throw as authentication error
    throw new AuthenticationError(
      "Token validation failed",
      AUTH_ERROR_CODES.TOKEN_INVALID,
      401,
      { originalError: error?.code || "unknown" },
    );
  }
}

/**
 * Auto-detect authentication method (session first, then token) - Server Action
 */
export async function authenticate(
  tokenOrOptions?: string | AuthOptions,
): Promise<AuthResult | null> {
  if (typeof tokenOrOptions === "string") {
    return authenticateToken(tokenOrOptions);
  }

  return authenticateSession(tokenOrOptions);
}

/**
 * Build complete AuthResult with optional profile data and validation
 */
async function buildAuthResult(
  user: DecodedIdToken,
  method: "session" | "token",
  options: AuthOptions,
): Promise<AuthResult> {
  let profile: userDataProps | undefined;

  // Fetch profile if requested
  if (options.includeProfile) {
    try {
      profile = (await getUserProfile(user.uid)) || undefined;
    } catch (error) {
      console.warn("Failed to fetch user profile:", error);
      // Continue without profile - don't fail authentication for profile fetch issues
    }
  }

  const authResult: AuthResult = {
    user,
    profile,
    method,
  };

  // Validate authentication result against requirements
  await validateAuthResult(authResult, options);

  return authResult;
}

/**
 * Get user profile from database
 *
 * Note: This function doesn't cache results. Caching should be handled
 * at the database layer (e.g., Redis) or client-side (e.g., SWR).
 */
async function getUserProfile(uid: string): Promise<userDataProps | null> {
  return await getUserDataPropsById(uid);
}

/**
 * Validate authentication result against requirements
 */
async function validateAuthResult(
  authResult: AuthResult,
  options: AuthOptions,
): Promise<void> {
  const { user, profile } = authResult;

  // Check email verification requirement
  if (options.requireVerification && !user.email_verified) {
    throw new AuthenticationError(
      "Email verification required to access this resource",
      AUTH_ERROR_CODES.EMAIL_NOT_VERIFIED,
      401,
      { email: user.email },
    );
  }

  // Check if profile is required for role checking
  if (options.requireRoles && options.requireRoles.length > 0) {
    if (!profile) {
      throw new AuthorizationError(
        "User profile required for role-based access control",
        options.requireRoles,
        [],
        403,
      );
    }

    // Check account active status
    if (!options.allowInactive && !profile.isActive) {
      throw new AuthenticationError(
        "Account is inactive",
        AUTH_ERROR_CODES.ACCOUNT_INACTIVE,
        401,
        { uid: user.uid },
      );
    }

    // Validate user roles
    const userRoles = profile.info?.roles || [];
    const hasRequiredRole = options.requireRoles.some((role) =>
      userRoles.includes(role),
    );

    if (!hasRequiredRole) {
      throw new AuthorizationError(
        `Access denied. Required roles: ${options.requireRoles.join(", ")}`,
        options.requireRoles,
        userRoles,
        403,
        "role-check",
      );
    }
  }
}
