/**
 * COMP-R00: RequirePermission Guard Component
 *
 * Conditionally renders children based on permission checks
 */

"use client";

import type { ReactNode } from "react";
import type { Permission, CompanyRole } from "@/types/jobsmarket/company";
import { hasPermission } from "@/types/jobsmarket/company";

interface RequirePermissionProps {
  /** The permission required to see children */
  permission: Permission;

  /** User's current role */
  role: CompanyRole | null;

  /** Content to show if permitted */
  children: ReactNode;

  /** Optional fallback if not permitted (default: null) */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on permission check
 *
 * Usage:
 * ```tsx
 * <RequirePermission permission="manage_team" role={role}>
 *   <TeamManagementSection />
 * </RequirePermission>
 *
 * // With fallback
 * <RequirePermission
 *   permission="post_jobs"
 *   role={role}
 *   fallback={<p>You don't have permission to post jobs</p>}
 * >
 *   <JobPostingForm />
 * </RequirePermission>
 * ```
 */
export function RequirePermission({
  permission,
  role,
  children,
  fallback = null,
}: RequirePermissionProps): ReactNode {
  if (!role) {
    return fallback;
  }

  if (!hasPermission(role, permission)) {
    return fallback;
  }

  return children;
}

/**
 * Hook-style permission check for more complex conditions
 */
export function usePermissionCheck(
  role: CompanyRole | null,
  permission: Permission
): boolean {
  if (!role) return false;
  return hasPermission(role, permission);
}
