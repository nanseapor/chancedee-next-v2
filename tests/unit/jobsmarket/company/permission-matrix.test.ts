/**
 * COMP-R00 Phase 2: Permission Matrix Tests
 *
 * Tests the permission matrix and role-based access control
 */

import { describe, it, expect } from "vitest";
import {
  hasPermission,
  getPermissionsForRole,
  PERMISSION_MATRIX,
  type CompanyRole,
  type Permission,
} from "@/types/jobsmarket/company";

describe("Permission Matrix", () => {
  const ALL_ROLES: CompanyRole[] = [
    "admin",
    "hr_manager",
    "recruiter",
    "interviewer",
    "viewer",
  ];
  const ALL_PERMISSIONS: Permission[] = [
    "post_jobs",
    "edit_jobs",
    "view_applications",
    "accept_reject_applications",
    "schedule_interviews",
    "manage_team",
    "company_settings",
  ];

  describe("hasPermission", () => {
    // Admin has all permissions
    it.each(ALL_PERMISSIONS)("admin has permission: %s", (permission) => {
      expect(hasPermission("admin", permission)).toBe(true);
    });

    // Viewer only has view_applications
    it("viewer can view applications", () => {
      expect(hasPermission("viewer", "view_applications")).toBe(true);
    });

    it("viewer cannot post jobs", () => {
      expect(hasPermission("viewer", "post_jobs")).toBe(false);
    });

    it("viewer cannot manage team", () => {
      expect(hasPermission("viewer", "manage_team")).toBe(false);
    });

    // Recruiter permissions
    it("recruiter can post jobs", () => {
      expect(hasPermission("recruiter", "post_jobs")).toBe(true);
    });

    it("recruiter cannot manage team", () => {
      expect(hasPermission("recruiter", "manage_team")).toBe(false);
    });

    // Interviewer permissions
    it("interviewer can schedule interviews", () => {
      expect(hasPermission("interviewer", "schedule_interviews")).toBe(true);
    });

    it("interviewer cannot post jobs", () => {
      expect(hasPermission("interviewer", "post_jobs")).toBe(false);
    });

    // HR Manager permissions
    it("hr_manager can manage settings", () => {
      expect(hasPermission("hr_manager", "company_settings")).toBe(true);
    });

    it("hr_manager cannot manage team", () => {
      expect(hasPermission("hr_manager", "manage_team")).toBe(false);
    });
  });

  describe("getPermissionsForRole", () => {
    it("returns all permissions for admin", () => {
      const permissions = getPermissionsForRole("admin");
      expect(permissions).toHaveLength(7);
    });

    it("returns 1 permission for viewer", () => {
      const permissions = getPermissionsForRole("viewer");
      expect(permissions).toContain("view_applications");
      expect(permissions).toHaveLength(1);
    });

    it("returns correct permissions for recruiter", () => {
      const permissions = getPermissionsForRole("recruiter");
      expect(permissions).toContain("post_jobs");
      expect(permissions).toContain("edit_jobs");
      expect(permissions).toContain("view_applications");
      expect(permissions).toContain("accept_reject_applications");
      expect(permissions).toContain("schedule_interviews");
      expect(permissions).not.toContain("manage_team");
    });
  });

  describe("PERMISSION_MATRIX consistency", () => {
    it("every permission is assigned to at least one role", () => {
      ALL_PERMISSIONS.forEach((permission) => {
        expect(PERMISSION_MATRIX[permission].length).toBeGreaterThan(0);
      });
    });

    it("admin is in every permission", () => {
      ALL_PERMISSIONS.forEach((permission) => {
        expect(PERMISSION_MATRIX[permission]).toContain("admin");
      });
    });
  });
});
