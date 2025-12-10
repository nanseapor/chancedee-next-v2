/**
 * Cookie Management Utilities
 *
 * Provides robust cookie handling for session management,
 * including aggressive deletion for stubborn cookies.
 */

import { cookies } from "next/headers";

/**
 * Aggressively clear session cookie - handles stubborn cookies
 *
 * Uses multiple techniques to ensure complete deletion across all browsers:
 * 1. Native delete() method
 * 2. Set with expired date and all original attributes (domain, path, etc.)
 * 3. Additional clear without domain for localhost/development
 *
 * This approach handles edge cases where cookies were set with different
 * attributes or where browsers are stubborn about deletion.
 *
 * @example
 * // In logout handler
 * clearSessionCookie();
 *
 * @example
 * // In error handler for expired tokens
 * if (error.code === 'auth/id-token-expired') {
 *   clearSessionCookie();
 * }
 */
export const clearSessionCookie = () => {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".chancedee.com" : undefined;

  try {
    const cookieStore = cookies();

    // Technique 1: Native delete method
    // This works for cookies set without special attributes
    cookieStore.delete("session");

    // Technique 2: Set with expired date and all original attributes
    // This is crucial for stubborn cookies that were set with domain/path
    // Must match ALL the attributes that were used when setting the cookie
    cookieStore.set("session", "", {
      maxAge: 0,
      expires: new Date(0), // Unix epoch (Jan 1, 1970)
      httpOnly: true,
      secure: isProduction,
      path: "/",
      domain,
      sameSite: "strict",
    });

    // Technique 3: Also clear without domain (for localhost/development)
    // Some browsers store cookies differently for localhost
    // This ensures cookies set in development are also cleared
    if (!isProduction) {
      cookieStore.set("session", "", {
        maxAge: 0,
        expires: new Date(0),
        httpOnly: true,
        secure: false,
        path: "/",
        sameSite: "strict",
      });
    }

    console.log("Session cookie cleared successfully with all techniques");
  } catch (error) {
    console.error("Failed to clear session cookie:", error);
    // Don't throw - cookie deletion should not break the application flow
    // The cookie will expire naturally or be overwritten on next login
  }
};

/**
 * Set session cookie with secure attributes
 *
 * @param sessionCookie - The session cookie value from Firebase Admin
 * @param expiresIn - Expiration time in milliseconds
 */
export const setSessionCookie = (sessionCookie: string, expiresIn: number) => {
  const isProduction = process.env.NODE_ENV === "production";
  const domain = isProduction ? ".chancedee.com" : undefined;

  try {
    cookies().set("session", sessionCookie, {
      maxAge: expiresIn,
      httpOnly: true,
      secure: isProduction,
      path: "/",
      domain,
      sameSite: "strict",
    });

    console.log("Session cookie set successfully");
  } catch (error) {
    console.error("Failed to set session cookie:", error);
    throw error; // Setting cookie failure should be thrown
  }
};
