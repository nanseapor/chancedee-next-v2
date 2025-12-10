/**
 * Core authentication engine - Shared utility functions
 *
 * This module provides shared utility functions for authentication.
 * Server actions have been moved to auth-engine-actions.ts
 */

import {
  AuthenticationError,
  AuthorizationError,
} from "@/domains/authentication/utils/auth-errors";
import type { AuthResult } from "@/types/auth.types";

/**
 * Helper to create authentication errors with consistent formatting
 */
export function createAuthError(
  type: "authentication" | "authorization",
  message: string,
  code: string,
  details?: any,
): AuthenticationError | AuthorizationError {
  if (type === "authorization") {
    return new AuthorizationError(
      message,
      details?.requiredRoles,
      details?.userRoles,
    );
  }

  return new AuthenticationError(message, code, 401, details);
}

/**
 * Helper to check if user has specific roles
 */
export function hasRoles(
  authResult: AuthResult,
  requiredRoles: string[],
): boolean {
  if (!authResult.profile?.info?.roles) {
    return false;
  }

  const userRoles = authResult.profile.info.roles;
  return requiredRoles.some((role) => userRoles.includes(role));
}

/**
 * Helper to check if user belongs to specific company
 */
export function belongsToCompany(
  authResult: AuthResult,
  companyId: string,
): boolean {
  return authResult.profile?.info?.companyId === companyId;
}

/**
 * Re-exports from server actions file for backward compatibility
 *
 * These maintain the same function signatures as the original implementation
 * to ensure no breaking changes in the 50+ files that import these functions.
 */
export {
  authenticateSession,
  authenticateToken,
  authenticate,
  authenticateSession as authenticateWithSession,
  authenticateToken as authenticateWithToken,
} from "@/domains/authentication/services/server/actions/auth-engine-actions";
