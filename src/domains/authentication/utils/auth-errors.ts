/**
 * Authentication Error Classes and Utilities
 * Domain-specific error handling for authentication
 */

import type { AuthErrorCode, AuthResult } from "@/types/auth.types";

/**
 * Function type definitions for Higher-Order Functions
 */
export type AuthenticatedFunction<T extends any[], R> = (
  auth: AuthResult,
  ...args: T
) => Promise<R>;

export type AsyncFunction<T extends any[], R> = (...args: T) => Promise<R>;

/**
 * Authentication error class for standardized error handling
 */
export class AuthenticationError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode = 401,
    public details?: any,
  ) {
    super(message);
    this.name = "AuthenticationError";
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      code: this.code,
      statusCode: this.statusCode,
      details: this.details,
    };
  }
}

/**
 * Authorization error class for role-based access control
 */
export class AuthorizationError extends Error {
  constructor(
    message: string,
    public requiredRoles?: string[],
    public userRoles?: string[],
    public statusCode = 403,
    public action?: string,
  ) {
    super(message);
    this.name = "AuthorizationError";
  }

  /**
   * Convert to JSON for API responses
   */
  toJSON() {
    return {
      name: this.name,
      message: this.message,
      statusCode: this.statusCode,
      requiredRoles: this.requiredRoles,
      userRoles: this.userRoles,
      action: this.action,
    };
  }
}

/**
 * Type guard to check if error is authentication-related
 */
export function isAuthenticationError(
  error: unknown,
): error is AuthenticationError {
  return error instanceof AuthenticationError;
}

/**
 * Type guard to check if error is authorization-related
 */
export function isAuthorizationError(
  error: unknown,
): error is AuthorizationError {
  return error instanceof AuthorizationError;
}

/**
 * Type guard to check if error is auth-related (either authentication or authorization)
 */
export function isAuthError(
  error: unknown,
): error is AuthenticationError | AuthorizationError {
  return isAuthenticationError(error) || isAuthorizationError(error);
}

/**
 * Common error codes for authentication
 */
export const AUTH_ERROR_CODES = {
  // Authentication errors
  SESSION_REQUIRED: "session-required",
  TOKEN_INVALID: "token-invalid",
  TOKEN_EXPIRED: "token-expired",
  TOKEN_REVOKED: "token-revoked",
  EMAIL_NOT_VERIFIED: "email-not-verified",
  ACCOUNT_INACTIVE: "account-inactive",

  // Authorization errors
  INSUFFICIENT_ROLES: "insufficient-roles",
  ACCESS_DENIED: "access-denied",
  COMPANY_MISMATCH: "company-mismatch",
  RESOURCE_FORBIDDEN: "resource-forbidden",
} as const;

/**
 * Standard auth response format for APIs
 */
export interface AuthResponse<T = any> {
  success: boolean;
  data?: T;
  error?: {
    code: AuthErrorCode;
    message: string;
    details?: any;
  };
  user?: {
    uid: string;
    email?: string;
    roles?: string[];
  };
}

/**
 * Helper type for creating authenticated API responses
 */
export type AuthenticatedResponse<T> = AuthResponse<T> & {
  success: true;
  data: T;
  user: AuthResult["user"];
};
