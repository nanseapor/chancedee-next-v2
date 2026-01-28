/**
 * COMP-R00 Phase 2: useCompanyPermission Hook Tests
 *
 * Tests permission checking utilities
 */

import { describe, it, expect } from "vitest";
import { renderHook } from "@testing-library/react";
import { useCompanyPermission } from "@/hooks/jobsmarket/company/use-company-permission";
import type { CompanyRole } from "@/types/jobsmarket/company";

describe("useCompanyPermission", () => {
  describe("Admin role", () => {
    it("has all permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "admin" as CompanyRole })
      );

      expect(result.current.canPostJobs).toBe(true);
      expect(result.current.canEditJobs).toBe(true);
      expect(result.current.canViewApplications).toBe(true);
      expect(result.current.canManageApplications).toBe(true);
      expect(result.current.canScheduleInterviews).toBe(true);
      expect(result.current.canManageTeam).toBe(true);
      expect(result.current.canManageSettings).toBe(true);
    });

    it("can() function works for all permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "admin" as CompanyRole })
      );

      expect(result.current.can("post_jobs")).toBe(true);
      expect(result.current.can("manage_team")).toBe(true);
      expect(result.current.can("company_settings")).toBe(true);
    });

    it("returns all 7 permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "admin" as CompanyRole })
      );

      expect(result.current.permissions).toHaveLength(7);
    });
  });

  describe("Viewer role", () => {
    it("only has view_applications permission", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "viewer" as CompanyRole })
      );

      expect(result.current.canViewApplications).toBe(true);
      expect(result.current.canPostJobs).toBe(false);
      expect(result.current.canEditJobs).toBe(false);
      expect(result.current.canManageApplications).toBe(false);
      expect(result.current.canScheduleInterviews).toBe(false);
      expect(result.current.canManageTeam).toBe(false);
      expect(result.current.canManageSettings).toBe(false);
    });

    it("returns only 1 permission", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "viewer" as CompanyRole })
      );

      expect(result.current.permissions).toHaveLength(1);
      expect(result.current.permissions).toContain("view_applications");
    });
  });

  describe("Recruiter role", () => {
    it("has job and application permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "recruiter" as CompanyRole })
      );

      expect(result.current.canPostJobs).toBe(true);
      expect(result.current.canEditJobs).toBe(true);
      expect(result.current.canViewApplications).toBe(true);
      expect(result.current.canManageApplications).toBe(true);
      expect(result.current.canScheduleInterviews).toBe(true);
    });

    it("cannot manage team or settings", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "recruiter" as CompanyRole })
      );

      expect(result.current.canManageTeam).toBe(false);
      expect(result.current.canManageSettings).toBe(false);
    });
  });

  describe("Interviewer role", () => {
    it("can view applications and schedule interviews", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "interviewer" as CompanyRole })
      );

      expect(result.current.canViewApplications).toBe(true);
      expect(result.current.canScheduleInterviews).toBe(true);
    });

    it("cannot post or edit jobs", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "interviewer" as CompanyRole })
      );

      expect(result.current.canPostJobs).toBe(false);
      expect(result.current.canEditJobs).toBe(false);
      expect(result.current.canManageApplications).toBe(false);
    });
  });

  describe("HR Manager role", () => {
    it("has most permissions except team management", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "hr_manager" as CompanyRole })
      );

      expect(result.current.canPostJobs).toBe(true);
      expect(result.current.canEditJobs).toBe(true);
      expect(result.current.canViewApplications).toBe(true);
      expect(result.current.canManageApplications).toBe(true);
      expect(result.current.canScheduleInterviews).toBe(true);
      expect(result.current.canManageSettings).toBe(true);
    });

    it("cannot manage team", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: "hr_manager" as CompanyRole })
      );

      expect(result.current.canManageTeam).toBe(false);
    });
  });

  describe("Null role", () => {
    it("has no permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: null })
      );

      expect(result.current.canPostJobs).toBe(false);
      expect(result.current.canEditJobs).toBe(false);
      expect(result.current.canViewApplications).toBe(false);
      expect(result.current.canManageApplications).toBe(false);
      expect(result.current.canScheduleInterviews).toBe(false);
      expect(result.current.canManageTeam).toBe(false);
      expect(result.current.canManageSettings).toBe(false);
    });

    it("returns empty permissions array", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: null })
      );

      expect(result.current.permissions).toHaveLength(0);
    });

    it("can() returns false for all permissions", () => {
      const { result } = renderHook(() =>
        useCompanyPermission({ role: null })
      );

      expect(result.current.can("post_jobs")).toBe(false);
      expect(result.current.can("manage_team")).toBe(false);
    });
  });
});
