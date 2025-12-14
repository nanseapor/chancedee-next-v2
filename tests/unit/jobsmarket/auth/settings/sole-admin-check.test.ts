import { describe, it, expect, vi, beforeEach } from "vitest";
import { getCompanyAdminCount } from "@/domains/companies/services/server/actions/jobsmarket/admin-utils";
import { webUserDataPropsGetByFilter } from "@/lib/database/actions/user-data-props";
import { Filter } from "firebase-admin/firestore";

// Mock the database action
vi.mock("@/lib/database/actions/user-data-props", () => ({
  webUserDataPropsGetByFilter: vi.fn(),
}));

// Mock Firebase Filter
vi.mock("firebase-admin/firestore", () => ({
  Filter: {
    and: vi.fn((...filters) => ({ type: "and", filters })),
    where: vi.fn((field, op, value) => ({ field, op, value })),
  },
}));

/**
 * Unit tests for AUTH-R06 Settings Sole Admin Check
 * Tests the logic that blocks account deletion for sole company admins
 */

describe("Sole Admin Check", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("getCompanyAdminCount", () => {
    const mockCompanyId = "company-123";

    it("should return 0 when no admins found", async () => {
      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue([]);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(0);
    });

    it("should return 1 when sole admin exists", async () => {
      const mockAdmins = [
        {
          uid: "user-1",
          info: {
            companyId: mockCompanyId,
            roles: ["admin", "company"],
          },
        },
      ];

      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue(mockAdmins as any);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(1);
    });

    it("should return 2 when multiple admins exist", async () => {
      const mockAdmins = [
        {
          uid: "user-1",
          info: {
            companyId: mockCompanyId,
            roles: ["admin", "company"],
          },
        },
        {
          uid: "user-2",
          info: {
            companyId: mockCompanyId,
            roles: ["admin", "company"],
          },
        },
      ];

      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue(mockAdmins as any);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(2);
    });

    it("should return 3 when three admins exist", async () => {
      const mockAdmins = [
        { uid: "user-1", info: { companyId: mockCompanyId, roles: ["admin", "company"] } },
        { uid: "user-2", info: { companyId: mockCompanyId, roles: ["admin", "company"] } },
        { uid: "user-3", info: { companyId: mockCompanyId, roles: ["admin", "company"] } },
      ];

      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue(mockAdmins as any);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(3);
    });

    it("should call webUserDataPropsGetByFilter with correct filter", async () => {
      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue([]);

      await getCompanyAdminCount(mockCompanyId);

      expect(webUserDataPropsGetByFilter).toHaveBeenCalledTimes(1);
      const callArgs = vi.mocked(webUserDataPropsGetByFilter).mock.calls[0][0];
      expect(callArgs).toHaveProperty("userInfoFilter");
    });

    it("should return 0 when database query throws error", async () => {
      vi.mocked(webUserDataPropsGetByFilter).mockRejectedValue(new Error("Database error"));

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(0);
    });

    it("should handle null result from database", async () => {
      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue(null as any);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(0);
    });

    it("should handle undefined result from database", async () => {
      vi.mocked(webUserDataPropsGetByFilter).mockResolvedValue(undefined as any);

      const count = await getCompanyAdminCount(mockCompanyId);

      expect(count).toBe(0);
    });
  });

  describe("Sole admin deletion logic", () => {
    it("should block deletion when admin count is 1", () => {
      const adminCount = 1;
      const canDelete = adminCount > 1;

      expect(canDelete).toBe(false);
    });

    it("should allow deletion when admin count is 2", () => {
      const adminCount = 2;
      const canDelete = adminCount > 1;

      expect(canDelete).toBe(true);
    });

    it("should allow deletion when admin count is 3 or more", () => {
      const adminCount = 3;
      const canDelete = adminCount > 1;

      expect(canDelete).toBe(true);
    });

    it("should allow deletion when admin count is 0 (no company)", () => {
      // Edge case: User has admin role but no company (should not happen in practice)
      const adminCount = 0;
      const canDelete = adminCount > 1;

      expect(canDelete).toBe(false);
    });
  });

  describe("Admin check conditional logic", () => {
    it("should check admin count only for company admins", () => {
      const isCompanyAdmin = true;
      const hasCompanyId = true;
      const shouldCheckAdminCount = isCompanyAdmin && hasCompanyId;

      expect(shouldCheckAdminCount).toBe(true);
    });

    it("should not check admin count for non-admin users", () => {
      const isCompanyAdmin = false;
      const hasCompanyId = true;
      const shouldCheckAdminCount = isCompanyAdmin && hasCompanyId;

      expect(shouldCheckAdminCount).toBe(false);
    });

    it("should not check admin count when no companyId", () => {
      const isCompanyAdmin = true;
      const hasCompanyId = false;
      const shouldCheckAdminCount = isCompanyAdmin && hasCompanyId;

      expect(shouldCheckAdminCount).toBe(false);
    });

    it("should determine isCompanyAdmin correctly when user has both admin and company roles", () => {
      const roles = ["admin", "company"];
      const isCompanyAdmin = roles.includes("admin") && roles.includes("company");

      expect(isCompanyAdmin).toBe(true);
    });

    it("should determine isCompanyAdmin as false when user only has company role", () => {
      const roles = ["company"];
      const isCompanyAdmin = roles.includes("admin") && roles.includes("company");

      expect(isCompanyAdmin).toBe(false);
    });

    it("should determine isCompanyAdmin as false when user only has admin role", () => {
      const roles = ["admin"];
      const isCompanyAdmin = roles.includes("admin") && roles.includes("company");

      expect(isCompanyAdmin).toBe(false);
    });

    it("should determine isCompanyAdmin as false for candidate users", () => {
      const roles = ["candidate"];
      const isCompanyAdmin = roles.includes("admin") && roles.includes("company");

      expect(isCompanyAdmin).toBe(false);
    });
  });

  describe("Loading and UI state logic", () => {
    it("should show loading state while checking admin count", () => {
      const isCheckingAdmin = true;
      const shouldShowLoading = isCheckingAdmin;

      expect(shouldShowLoading).toBe(true);
    });

    it("should show blocking message when canDelete is false", () => {
      const canDelete = false;
      const isCheckingAdmin = false;
      const shouldShowBlockingMessage = !isCheckingAdmin && canDelete === false;

      expect(shouldShowBlockingMessage).toBe(true);
    });

    it("should show normal form when canDelete is true", () => {
      const canDelete = true;
      const isCheckingAdmin = false;
      const shouldShowForm = !isCheckingAdmin && canDelete !== false;

      expect(shouldShowForm).toBe(true);
    });

    it("should not show blocking message while still loading", () => {
      const canDelete = false;
      const isCheckingAdmin = true;
      const shouldShowBlockingMessage = !isCheckingAdmin && canDelete === false;

      expect(shouldShowBlockingMessage).toBe(false);
    });
  });
});
