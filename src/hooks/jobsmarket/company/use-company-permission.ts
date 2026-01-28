/**
 * COMP-R00: Company Permission Hook
 *
 * Permission checking utilities for company roles
 * Per COMP-R00 implementation plan Phase 2
 */

"use client";

import { useMemo } from "react";
import type {
  Permission,
  CompanyRole,
} from "@/types/jobsmarket/company";
import {
  hasPermission,
  getPermissionsForRole,
} from "@/types/jobsmarket/company";

interface UseCompanyPermissionOptions {
  role: CompanyRole | null;
}

interface UseCompanyPermissionReturn {
  /** Check if role has specific permission */
  can: (permission: Permission) => boolean;

  /** All permissions the role has */
  permissions: Permission[];

  /** Quick checks for common permissions */
  canPostJobs: boolean;
  canEditJobs: boolean;
  canViewApplications: boolean;
  canManageApplications: boolean;
  canScheduleInterviews: boolean;
  canManageTeam: boolean;
  canManageSettings: boolean;
}

/**
 * Hook to check permissions for a company role
 *
 * Usage:
 * ```tsx
 * const { can, canPostJobs, canManageTeam } = useCompanyPermission({ role });
 *
 * if (can('post_jobs')) {
 *   // Show job management UI
 * }
 *
 * {canManageTeam && <TeamManagementSection />}
 * ```
 */
export function useCompanyPermission(
  options: UseCompanyPermissionOptions
): UseCompanyPermissionReturn {
  const { role } = options;

  const permissions = useMemo(() => {
    if (!role) return [];
    return getPermissionsForRole(role);
  }, [role]);

  const can = useMemo(() => {
    return (permission: Permission): boolean => {
      if (!role) return false;
      return hasPermission(role, permission);
    };
  }, [role]);

  const permissionFlags = useMemo(
    () => ({
      canPostJobs: role ? hasPermission(role, "post_jobs") : false,
      canEditJobs: role ? hasPermission(role, "edit_jobs") : false,
      canViewApplications: role
        ? hasPermission(role, "view_applications")
        : false,
      canManageApplications: role
        ? hasPermission(role, "accept_reject_applications")
        : false,
      canScheduleInterviews: role
        ? hasPermission(role, "schedule_interviews")
        : false,
      canManageTeam: role ? hasPermission(role, "manage_team") : false,
      canManageSettings: role
        ? hasPermission(role, "company_settings")
        : false,
    }),
    [role]
  );

  return {
    can,
    permissions,
    ...permissionFlags,
  };
}

export type { UseCompanyPermissionOptions, UseCompanyPermissionReturn };
