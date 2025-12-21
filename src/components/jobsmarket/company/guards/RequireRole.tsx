/**
 * COMP-R00: RequireRole Guard Component
 *
 * Conditionally renders children based on role checks
 */

"use client";

import type { ReactNode } from "react";
import type { CompanyRole } from "@/types/jobsmarket/company";

interface RequireRoleProps {
  /** Roles that are allowed to see children */
  allowedRoles: CompanyRole[];

  /** User's current role */
  role: CompanyRole | null;

  /** Content to show if role is allowed */
  children: ReactNode;

  /** Optional fallback if role not allowed (default: null) */
  fallback?: ReactNode;
}

/**
 * Conditionally renders children based on role check
 *
 * Usage:
 * ```tsx
 * <RequireRole allowedRoles={['admin', 'hr_manager']} role={role}>
 *   <AdminOnlySection />
 * </RequireRole>
 * ```
 */
export function RequireRole({
  allowedRoles,
  role,
  children,
  fallback = null,
}: RequireRoleProps): ReactNode {
  if (!role) {
    return fallback;
  }

  if (!allowedRoles.includes(role)) {
    return fallback;
  }

  return children;
}

/**
 * Check if role is admin level (admin or hr_manager)
 */
export function isAdminRole(role: CompanyRole | null): boolean {
  if (!role) return false;
  return ["admin", "hr_manager"].includes(role);
}

/**
 * Check if role can manage content (not viewer)
 */
export function canManageContent(role: CompanyRole | null): boolean {
  if (!role) return false;
  return role !== "viewer";
}
