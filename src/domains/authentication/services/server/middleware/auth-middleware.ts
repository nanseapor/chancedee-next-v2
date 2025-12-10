import { redirect } from "next/navigation";

import {
  authenticateSession,
  authenticateToken,
} from "@/domains/authentication/services/server/core/auth-engine";
import {
  type AuthenticatedFunction,
  AuthenticationError,
  isAuthError,
} from "@/domains/authentication/utils/auth-errors";
import type { AuthOptions, EnhancedAuthOptions } from "@/types/auth.types";

/**
 * Session-based authentication middleware
 * Replaces: verifySession() and verifySessionCookie() patterns
 */
export function withSessionAuth<T extends any[], R>(
  fn: AuthenticatedFunction<T, R>,
  options: EnhancedAuthOptions = {},
): (...args: T) => Promise<R> {
  return async (...args: T): Promise<R> => {
    try {
      const auth = await authenticateSession({
        includeProfile: true, // Default to true for session auth (replaces verifySession behavior)
        ...options,
      });

      if (!auth) {
        if (options.redirectTo) {
          redirect(options.redirectTo);
        }

        throw new AuthenticationError(
          "Authentication required - no valid session found",
          "session-required",
          401,
        );
      }

      return await fn(auth, ...args);
    } catch (error) {
      // Handle authentication/authorization errors
      if (isAuthError(error)) {
        if (options.redirectTo && error instanceof AuthenticationError) {
          redirect(options.redirectTo);
        }

        // Custom error handler if provided
        if (options.errorHandler) {
          options.errorHandler(error);
          throw error; // Still throw after custom handling
        }
      }

      throw error;
    }
  };
}

/**
 * Bearer token authentication middleware
 * Replaces: checkBearerToken() pattern
 */
export function withTokenAuth<T extends any[], R>(
  fn: AuthenticatedFunction<T, R>,
  options: AuthOptions = {},
): (token: string, ...args: T) => Promise<R> {
  return async (token: string, ...args: T): Promise<R> => {
    const auth = await authenticateToken(token, {
      includeProfile: true, // Default to true for better user context
      ...options,
    });

    if (!auth) {
      throw new AuthenticationError(
        "Invalid or expired token",
        "token-invalid",
        401,
        { tokenProvided: !!token },
      );
    }

    return await fn(auth, ...args);
  };
}
