/**
 * COMP-R00: Company Role and Permission Types
 *
 * Simplified 3-level permission model for MVP:
 * - admin: Full company control (admin + hr_manager)
 * - member: Job and application management (recruiter + interviewer)
 * - viewer: Read-only access
 */

/**
 * Company roles as defined in COMP-R00 RIS
 *
 * Role hierarchy (highest to lowest):
 * 1. admin - Full company control
 * 2. hr_manager - HR and recruitment management
 * 3. recruiter - Job and application management
 * 4. interviewer - Interview-related tasks only
 * 5. viewer - Read-only access
 */
export type CompanyRole =
  | "admin"
  | "hr_manager"
  | "recruiter"
  | "interviewer"
  | "viewer";

/**
 * Simplified permission levels for MVP
 * Maps multiple roles to permission tiers
 */
export type PermissionLevel = "admin" | "member" | "viewer";

/**
 * Role to permission level mapping
 */
export const ROLE_TO_PERMISSION_LEVEL: Record<CompanyRole, PermissionLevel> = {
  admin: "admin",
  hr_manager: "admin",
  recruiter: "member",
  interviewer: "member",
  viewer: "viewer",
} as const;

/**
 * Individual permissions (for future granular control)
 */
export type Permission =
  | "post_jobs"
  | "edit_jobs"
  | "view_applications"
  | "accept_reject_applications"
  | "schedule_interviews"
  | "manage_team"
  | "company_settings";

/**
 * Permission matrix - which roles have which permissions
 * Used for fine-grained permission checks
 */
export const PERMISSION_MATRIX: Record<Permission, CompanyRole[]> = {
  post_jobs: ["admin", "hr_manager", "recruiter"],
  edit_jobs: ["admin", "hr_manager", "recruiter"],
  view_applications: ["admin", "hr_manager", "recruiter", "interviewer", "viewer"],
  accept_reject_applications: ["admin", "hr_manager", "recruiter"],
  schedule_interviews: ["admin", "hr_manager", "recruiter", "interviewer"],
  manage_team: ["admin"],
  company_settings: ["admin", "hr_manager"],
} as const;

/**
 * Check if a role has a specific permission
 */
export function hasPermission(role: CompanyRole, permission: Permission): boolean {
  return PERMISSION_MATRIX[permission].includes(role);
}

/**
 * Get all permissions for a role
 */
export function getPermissionsForRole(role: CompanyRole): Permission[] {
  return (Object.keys(PERMISSION_MATRIX) as Permission[]).filter(
    (permission) => hasPermission(role, permission)
  );
}

/**
 * Role display names (Thai)
 */
export const ROLE_LABELS: Record<CompanyRole, string> = {
  admin: "ผู้ดูแลระบบ",
  hr_manager: "ผู้จัดการฝ่ายบุคคล",
  recruiter: "ผู้สรรหาบุคลากร",
  interviewer: "ผู้สัมภาษณ์",
  viewer: "ผู้ดูข้อมูล",
} as const;
