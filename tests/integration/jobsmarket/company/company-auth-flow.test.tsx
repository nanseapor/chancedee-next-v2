/**
 * COMP-R00 Integration Test: Company Auth Flow
 *
 * Tests the complete integration of:
 * - Permission matrix consistency
 * - Guard components (RequirePermission, RequireRole)
 * - Navigation filtering
 * - Role helper functions
 */

import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";
import React from "react";

// Import types and utilities
import {
  hasPermission,
  getPermissionsForRole,
  PERMISSION_MATRIX,
  ROLE_TO_PERMISSION_LEVEL,
  type CompanyRole,
  type Permission,
} from "@/types/jobsmarket/company";

import {
  RequirePermission,
  RequireRole,
  isAdminRole,
  canManageContent,
} from "@/components/jobsmarket/company/guards";

import {
  COMPANY_NAV_ITEMS,
  getVisibleNavItems,
} from "@/lib/jobsmarket/company/navigation";

describe("COMP-R00 Integration: Company Auth Flow", () => {
  describe("Permission Matrix Consistency", () => {
    const ALL_ROLES: CompanyRole[] = [
      "admin",
      "hr_manager",
      "recruiter",
      "interviewer",
      "viewer",
    ];

    it("all roles have a permission level mapping", () => {
      ALL_ROLES.forEach((role) => {
        expect(ROLE_TO_PERMISSION_LEVEL[role]).toBeDefined();
      });
    });

    it("admin has all permissions", () => {
      const adminPermissions = getPermissionsForRole("admin");
      expect(adminPermissions).toHaveLength(
        Object.keys(PERMISSION_MATRIX).length
      );
    });

    it("viewer has minimal permissions", () => {
      const viewerPermissions = getPermissionsForRole("viewer");
      expect(viewerPermissions).toHaveLength(1);
      expect(viewerPermissions).toContain("view_applications");
    });

    it("hr_manager has most permissions except manage_team", () => {
      const hrPermissions = getPermissionsForRole("hr_manager");
      expect(hrPermissions).toContain("post_jobs");
      expect(hrPermissions).toContain("edit_jobs");
      expect(hrPermissions).toContain("view_applications");
      expect(hrPermissions).toContain("accept_reject_applications");
      expect(hrPermissions).toContain("schedule_interviews");
      expect(hrPermissions).toContain("company_settings");
      expect(hrPermissions).not.toContain("manage_team");
    });

    it("recruiter can post jobs and manage applications", () => {
      const recruiterPermissions = getPermissionsForRole("recruiter");
      expect(recruiterPermissions).toContain("post_jobs");
      expect(recruiterPermissions).toContain("edit_jobs");
      expect(recruiterPermissions).toContain("view_applications");
      expect(recruiterPermissions).toContain("accept_reject_applications");
      expect(recruiterPermissions).toContain("schedule_interviews");
      expect(recruiterPermissions).not.toContain("manage_team");
      expect(recruiterPermissions).not.toContain("company_settings");
    });

    it("interviewer can only view and schedule", () => {
      const interviewerPermissions = getPermissionsForRole("interviewer");
      expect(interviewerPermissions).toContain("view_applications");
      expect(interviewerPermissions).toContain("schedule_interviews");
      expect(interviewerPermissions).not.toContain("post_jobs");
      expect(interviewerPermissions).not.toContain("edit_jobs");
      expect(interviewerPermissions).not.toContain(
        "accept_reject_applications"
      );
      expect(interviewerPermissions).not.toContain("manage_team");
      expect(interviewerPermissions).not.toContain("company_settings");
    });
  });

  describe("RequirePermission Guard", () => {
    it("renders children when role has permission", () => {
      render(
        <RequirePermission permission="post_jobs" role="admin">
          <div data-testid="protected">Protected Content</div>
        </RequirePermission>
      );

      expect(screen.getByTestId("protected")).toBeInTheDocument();
    });

    it("renders fallback when role lacks permission", () => {
      render(
        <RequirePermission
          permission="manage_team"
          role="viewer"
          fallback={<div data-testid="fallback">No Access</div>}
        >
          <div data-testid="protected">Protected Content</div>
        </RequirePermission>
      );

      expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });

    it("renders nothing when role is null", () => {
      const { container } = render(
        <RequirePermission permission="post_jobs" role={null}>
          <div data-testid="protected">Protected Content</div>
        </RequirePermission>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("renders fallback when role is null and fallback is provided", () => {
      render(
        <RequirePermission
          permission="post_jobs"
          role={null}
          fallback={<div data-testid="fallback">Please log in</div>}
        >
          <div data-testid="protected">Protected Content</div>
        </RequirePermission>
      );

      expect(screen.queryByTestId("protected")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });

    it("hr_manager can post jobs but cannot manage team", () => {
      const { rerender, container } = render(
        <RequirePermission permission="post_jobs" role="hr_manager">
          <div data-testid="can-post">Can Post Jobs</div>
        </RequirePermission>
      );
      expect(screen.getByTestId("can-post")).toBeInTheDocument();

      rerender(
        <RequirePermission permission="manage_team" role="hr_manager">
          <div data-testid="can-manage">Can Manage Team</div>
        </RequirePermission>
      );
      expect(screen.queryByTestId("can-manage")).not.toBeInTheDocument();
    });
  });

  describe("RequireRole Guard", () => {
    it("renders children when role is in allowed list", () => {
      render(
        <RequireRole allowedRoles={["admin", "hr_manager"]} role="admin">
          <div data-testid="admin-only">Admin Content</div>
        </RequireRole>
      );

      expect(screen.getByTestId("admin-only")).toBeInTheDocument();
    });

    it("renders fallback when role is not in allowed list", () => {
      render(
        <RequireRole
          allowedRoles={["admin"]}
          role="viewer"
          fallback={<div data-testid="fallback">Not Allowed</div>}
        >
          <div data-testid="admin-only">Admin Content</div>
        </RequireRole>
      );

      expect(screen.queryByTestId("admin-only")).not.toBeInTheDocument();
      expect(screen.getByTestId("fallback")).toBeInTheDocument();
    });

    it("renders nothing when role is null", () => {
      const { container } = render(
        <RequireRole allowedRoles={["admin"]} role={null}>
          <div data-testid="admin-only">Admin Content</div>
        </RequireRole>
      );

      expect(container).toBeEmptyDOMElement();
    });

    it("allows multiple roles", () => {
      const { rerender } = render(
        <RequireRole
          allowedRoles={["admin", "hr_manager", "recruiter"]}
          role="admin"
        >
          <div data-testid="multi-role">Multi Role Content</div>
        </RequireRole>
      );
      expect(screen.getByTestId("multi-role")).toBeInTheDocument();

      rerender(
        <RequireRole
          allowedRoles={["admin", "hr_manager", "recruiter"]}
          role="hr_manager"
        >
          <div data-testid="multi-role">Multi Role Content</div>
        </RequireRole>
      );
      expect(screen.getByTestId("multi-role")).toBeInTheDocument();

      rerender(
        <RequireRole
          allowedRoles={["admin", "hr_manager", "recruiter"]}
          role="viewer"
        >
          <div data-testid="multi-role">Multi Role Content</div>
        </RequireRole>
      );
      expect(screen.queryByTestId("multi-role")).not.toBeInTheDocument();
    });
  });

  describe("Role Helper Functions", () => {
    it("isAdminRole returns true for admin and hr_manager", () => {
      expect(isAdminRole("admin")).toBe(true);
      expect(isAdminRole("hr_manager")).toBe(true);
      expect(isAdminRole("recruiter")).toBe(false);
      expect(isAdminRole("viewer")).toBe(false);
      expect(isAdminRole(null)).toBe(false);
    });

    it("canManageContent returns false only for viewer", () => {
      expect(canManageContent("admin")).toBe(true);
      expect(canManageContent("hr_manager")).toBe(true);
      expect(canManageContent("recruiter")).toBe(true);
      expect(canManageContent("interviewer")).toBe(true);
      expect(canManageContent("viewer")).toBe(false);
      expect(canManageContent(null)).toBe(false);
    });
  });

  describe("Navigation Filtering", () => {
    it("admin sees all nav items", () => {
      const hasAllPermissions = () => true;
      const items = getVisibleNavItems(hasAllPermissions);
      expect(items).toHaveLength(COMPANY_NAV_ITEMS.length);
    });

    it("viewer sees limited nav items", () => {
      const viewerPermissions = (p: Permission) => hasPermission("viewer", p);
      const items = getVisibleNavItems(viewerPermissions);

      // Viewer should not see team or settings
      expect(items.find((i) => i.key === "team")).toBeUndefined();
      expect(items.find((i) => i.key === "settings")).toBeUndefined();

      // Viewer should see dashboard and jobs (no permission required)
      expect(items.find((i) => i.key === "dashboard")).toBeDefined();
      expect(items.find((i) => i.key === "jobs")).toBeDefined();

      // Viewer should see applications (has view_applications permission)
      expect(items.find((i) => i.key === "applications")).toBeDefined();
    });

    it("hr_manager sees all items except team", () => {
      const hrPermissions = (p: Permission) => hasPermission("hr_manager", p);
      const items = getVisibleNavItems(hrPermissions);

      // HR Manager should not see team
      expect(items.find((i) => i.key === "team")).toBeUndefined();

      // HR Manager should see everything else
      expect(items.find((i) => i.key === "dashboard")).toBeDefined();
      expect(items.find((i) => i.key === "jobs")).toBeDefined();
      expect(items.find((i) => i.key === "applications")).toBeDefined();
      expect(items.find((i) => i.key === "settings")).toBeDefined();
    });

    it("mobile nav only shows mobile items", () => {
      const hasAllPermissions = () => true;
      const items = getVisibleNavItems(hasAllPermissions, true);

      items.forEach((item) => {
        expect(item.showOnMobile).toBe(true);
      });

      // Team and settings should not be in mobile nav
      expect(items.find((i) => i.key === "team")).toBeUndefined();
      expect(items.find((i) => i.key === "settings")).toBeUndefined();
    });

    it("navigation items are sorted by order", () => {
      const hasAllPermissions = () => true;
      const items = getVisibleNavItems(hasAllPermissions);

      for (let i = 1; i < items.length; i++) {
        expect(items[i].order).toBeGreaterThanOrEqual(items[i - 1].order);
      }
    });

    it("recruiter sees correct items", () => {
      const recruiterPermissions = (p: Permission) =>
        hasPermission("recruiter", p);
      const items = getVisibleNavItems(recruiterPermissions);

      // Recruiter should see dashboard, jobs, applications
      expect(items.find((i) => i.key === "dashboard")).toBeDefined();
      expect(items.find((i) => i.key === "jobs")).toBeDefined();
      expect(items.find((i) => i.key === "applications")).toBeDefined();

      // Recruiter should not see team or settings
      expect(items.find((i) => i.key === "team")).toBeUndefined();
      expect(items.find((i) => i.key === "settings")).toBeUndefined();
    });

    it("interviewer sees correct items", () => {
      const interviewerPermissions = (p: Permission) =>
        hasPermission("interviewer", p);
      const items = getVisibleNavItems(interviewerPermissions);

      // Interviewer should see dashboard, jobs, applications
      expect(items.find((i) => i.key === "dashboard")).toBeDefined();
      expect(items.find((i) => i.key === "jobs")).toBeDefined();
      expect(items.find((i) => i.key === "applications")).toBeDefined();

      // Interviewer should not see team or settings
      expect(items.find((i) => i.key === "team")).toBeUndefined();
      expect(items.find((i) => i.key === "settings")).toBeUndefined();
    });
  });

  describe("Complete Integration Scenarios", () => {
    it("admin workflow: can access everything", () => {
      // Admin has all permissions
      const adminPermissions = getPermissionsForRole("admin");
      expect(adminPermissions).toHaveLength(7);

      // Admin sees all nav items
      const navItems = getVisibleNavItems((p) => hasPermission("admin", p));
      expect(navItems).toHaveLength(5);

      // Admin can render all guards
      const { rerender } = render(
        <RequirePermission permission="manage_team" role="admin">
          <div data-testid="team">Team</div>
        </RequirePermission>
      );
      expect(screen.getByTestId("team")).toBeInTheDocument();

      rerender(
        <RequireRole allowedRoles={["admin"]} role="admin">
          <div data-testid="admin">Admin</div>
        </RequireRole>
      );
      expect(screen.getByTestId("admin")).toBeInTheDocument();
    });

    it("viewer workflow: limited access", () => {
      // Viewer has only view_applications permission
      const viewerPermissions = getPermissionsForRole("viewer");
      expect(viewerPermissions).toHaveLength(1);

      // Viewer sees limited nav items
      const navItems = getVisibleNavItems((p) => hasPermission("viewer", p));
      expect(navItems.length).toBeLessThan(5);

      // Viewer cannot access team management
      render(
        <RequirePermission
          permission="manage_team"
          role="viewer"
          fallback={<div data-testid="denied">Access Denied</div>}
        >
          <div data-testid="team">Team</div>
        </RequirePermission>
      );
      expect(screen.queryByTestId("team")).not.toBeInTheDocument();
      expect(screen.getByTestId("denied")).toBeInTheDocument();
    });

    it("hr_manager workflow: almost full access except team", () => {
      // HR Manager has 6 permissions (all except manage_team)
      const hrPermissions = getPermissionsForRole("hr_manager");
      expect(hrPermissions).toHaveLength(6);
      expect(hrPermissions).not.toContain("manage_team");

      // HR Manager can post jobs
      render(
        <RequirePermission permission="post_jobs" role="hr_manager">
          <div data-testid="post">Post Jobs</div>
        </RequirePermission>
      );
      expect(screen.getByTestId("post")).toBeInTheDocument();
    });
  });
});
