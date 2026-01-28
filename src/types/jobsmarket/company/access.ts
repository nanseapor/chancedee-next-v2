/**
 * COMP-R00: Access Control Types
 *
 * 5-level access control state machine for company routes
 */

import type { CompanyRole, PermissionLevel, Permission } from "./roles";
import type { CompanyStatus } from "./status";

/**
 * Access control check states (5-level state machine)
 *
 * Flow: loading → auth_check → membership_check → status_check →
 *       role_check → permission_check → ready
 */
export type AccessCheckState =
  | "loading" // Initial loading
  | "auth_check" // Checking Firebase auth
  | "membership_check" // Checking company membership
  | "status_check" // Checking company status
  | "role_check" // Resolving user role
  | "permission_check" // Checking specific permission
  | "ready" // Access granted
  | "unauthorized" // Not logged in
  | "not_member" // Not a company member
  | "pending_approval" // Company pending approval
  | "rejected" // Company rejected
  | "suspended" // Company suspended
  | "insufficient_permission"; // Role lacks required permission

/**
 * States that indicate access is denied
 */
export const ACCESS_DENIED_STATES: AccessCheckState[] = [
  "unauthorized",
  "not_member",
  "rejected",
  "suspended",
  "insufficient_permission",
] as const;

/**
 * States that require minimal shell (limited UI)
 */
export const MINIMAL_SHELL_STATES: AccessCheckState[] = [
  "pending_approval",
  "rejected",
] as const;

/**
 * Result of access control check
 */
export interface AccessCheckResult {
  /** Current state in the access check flow */
  state: AccessCheckState;

  /** Whether access is granted */
  isGranted: boolean;

  /** Whether the state is still loading */
  isLoading: boolean;

  /** Whether to show minimal shell */
  useMinimalShell: boolean;

  /** Redirect path if access denied */
  redirectTo?: string;

  /** User's role in the company (if member) */
  role?: CompanyRole;

  /** User's permission level */
  permissionLevel?: PermissionLevel;

  /** Company status */
  companyStatus?: CompanyStatus;

  /** Error message if any */
  error?: string;
}

/**
 * Company auth hook options
 */
export interface UseCompanyAuthOptions {
  /** Company ID to check access for */
  companyId: string;

  /** Required permission (optional - for permission-gated routes) */
  requiredPermission?: Permission;

  /** Skip redirect on access denied */
  skipRedirect?: boolean;
}

/**
 * Company auth hook return type
 */
export interface UseCompanyAuthReturn {
  /** Access check result */
  access: AccessCheckResult;

  /** Current user's role */
  role: CompanyRole | null;

  /** Permission level */
  permissionLevel: PermissionLevel | null;

  /** Company status */
  companyStatus: CompanyStatus | null;

  /** Check if user has specific permission */
  hasPermission: (permission: Permission) => boolean;

  /** Whether still loading */
  isLoading: boolean;

  /** Whether access is ready (granted) */
  isReady: boolean;
}
