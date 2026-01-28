import { describe, it, expect, vi, beforeEach } from "vitest";

import {
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
} from "@/lib/database/actions/admin-company-actions";

/**
 * Unit tests for company action server actions
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Tests the server actions for approving, rejecting,
 * suspending, and reactivating companies.
 *
 * Coverage Target: 90%+
 */

// Mock the admin auth check
vi.mock("@/lib/database/actions/admin-auth", () => ({
  requireAdminAuth: vi.fn(),
}));

// Mock Firebase Admin Firestore
const mockUpdate = vi.fn();
const mockGet = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

import { requireAdminAuth } from "@/lib/database/actions/admin-auth";

describe("Company Actions", () => {
  const mockTimestamp = {
    toDate: () => new Date("2025-01-01"),
  };

  const mockPendingCompanyDoc = {
    id: "company-1",
    exists: true,
    data: () => ({
      company_name: "บริษัททดสอบ จำกัด",
      email: "test@company.com",
      status: "pending",
      created_at: mockTimestamp,
    }),
  };

  const mockApprovedCompanyDoc = {
    id: "company-2",
    exists: true,
    data: () => ({
      company_name: "บริษัทอนุมัติแล้ว จำกัด",
      email: "approved@company.com",
      status: "approved",
      created_at: mockTimestamp,
    }),
  };

  const mockSuspendedCompanyDoc = {
    id: "company-3",
    exists: true,
    data: () => ({
      company_name: "บริษัทถูกระงับ จำกัด",
      email: "suspended@company.com",
      status: "suspended",
      created_at: mockTimestamp,
    }),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: auth succeeds
    (requireAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "admin-user-id",
      email: "admin@test.com",
      roles: ["chancedee"],
    });

    // Setup Firestore mock chain
    mockCollection.mockReturnValue({
      doc: mockDoc,
    });

    mockDoc.mockReturnValue({
      get: mockGet,
      update: mockUpdate,
    });

    mockUpdate.mockResolvedValue(undefined);
  });

  describe("approveCompany", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(mockPendingCompanyDoc);
    });

    it("should require admin authorization", async () => {
      await approveCompany("company-1");

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await approveCompany("company-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should update company status to approved", async () => {
      const result = await approveCompany("company-1");

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "approved",
        })
      );
    });

    it("should fail if company not found", async () => {
      mockGet.mockResolvedValue({ exists: false, data: () => null });

      const result = await approveCompany("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
    });

    it("should fail if company not in pending status", async () => {
      mockGet.mockResolvedValue(mockApprovedCompanyDoc);

      const result = await approveCompany("company-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("pending");
    });

    it("should log the action", async () => {
      const consoleSpy = vi.spyOn(console, "log");

      await approveCompany("company-1");

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining("approve"),
        expect.anything()
      );
    });
  });

  describe("rejectCompany", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(mockPendingCompanyDoc);
    });

    it("should require admin authorization", async () => {
      await rejectCompany("company-1", "ข้อมูลไม่ถูกต้อง");

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await rejectCompany("company-1", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should update company status to rejected", async () => {
      const result = await rejectCompany("company-1", "ข้อมูลไม่ถูกต้อง");

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "rejected",
        })
      );
    });

    it("should store rejection reason", async () => {
      await rejectCompany("company-1", "ข้อมูลไม่ครบถ้วน");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          rejection_reason: "ข้อมูลไม่ครบถ้วน",
        })
      );
    });

    it("should fail without reason", async () => {
      const result = await rejectCompany("company-1", "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("reason");
    });

    it("should fail if company not found", async () => {
      mockGet.mockResolvedValue({ exists: false, data: () => null });

      const result = await rejectCompany("nonexistent", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
    });

    it("should fail if company not pending", async () => {
      mockGet.mockResolvedValue(mockApprovedCompanyDoc);

      const result = await rejectCompany("company-2", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toContain("pending");
    });
  });

  describe("suspendCompany", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(mockApprovedCompanyDoc);
    });

    it("should require admin authorization", async () => {
      await suspendCompany("company-2", "ละเมิดข้อกำหนด");

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await suspendCompany("company-2", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should update company status to suspended", async () => {
      const result = await suspendCompany("company-2", "ละเมิดข้อกำหนด");

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "suspended",
        })
      );
    });

    it("should store suspension reason", async () => {
      await suspendCompany("company-2", "พบการทุจริต");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          suspension_reason: "พบการทุจริต",
        })
      );
    });

    it("should fail without reason", async () => {
      const result = await suspendCompany("company-2", "");

      expect(result.success).toBe(false);
      expect(result.error).toContain("reason");
    });

    it("should fail if company not found", async () => {
      mockGet.mockResolvedValue({ exists: false, data: () => null });

      const result = await suspendCompany("nonexistent", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
    });

    it("should fail if company not approved", async () => {
      mockGet.mockResolvedValue(mockPendingCompanyDoc);

      const result = await suspendCompany("company-1", "reason");

      expect(result.success).toBe(false);
      expect(result.error).toContain("approved");
    });
  });

  describe("reactivateCompany", () => {
    beforeEach(() => {
      mockGet.mockResolvedValue(mockSuspendedCompanyDoc);
    });

    it("should require admin authorization", async () => {
      await reactivateCompany("company-3");

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await reactivateCompany("company-3");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should update company status to approved", async () => {
      const result = await reactivateCompany("company-3");

      expect(result.success).toBe(true);
      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "approved",
        })
      );
    });

    it("should store reactivation note if provided", async () => {
      await reactivateCompany("company-3", "แก้ไขปัญหาแล้ว");

      expect(mockUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          reactivation_note: "แก้ไขปัญหาแล้ว",
        })
      );
    });

    it("should succeed without note", async () => {
      const result = await reactivateCompany("company-3");

      expect(result.success).toBe(true);
    });

    it("should fail if company not found", async () => {
      mockGet.mockResolvedValue({ exists: false, data: () => null });

      const result = await reactivateCompany("nonexistent");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
    });

    it("should fail if company not suspended", async () => {
      mockGet.mockResolvedValue(mockApprovedCompanyDoc);

      const result = await reactivateCompany("company-2");

      expect(result.success).toBe(false);
      expect(result.error).toContain("suspended");
    });
  });
});
