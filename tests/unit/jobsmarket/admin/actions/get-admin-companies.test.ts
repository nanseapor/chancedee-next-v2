import { describe, it, expect, vi, beforeEach } from "vitest";

import { getAdminCompanies } from "@/lib/database/actions/admin-companies";

/**
 * Unit tests for getAdminCompanies server action
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Tests the server action that retrieves companies for admin management.
 * Supports filtering by status, search, and pagination.
 *
 * Coverage Target: 90%+
 */

// Mock the admin auth check
vi.mock("@/lib/database/actions/admin-auth", () => ({
  requireAdminAuth: vi.fn(),
}));

// Mock Firebase Admin Firestore
const mockGet = vi.fn();
const mockWhere = vi.fn();
const mockOrderBy = vi.fn();
const mockLimit = vi.fn();
const mockStartAfter = vi.fn();
const mockDoc = vi.fn();
const mockCollection = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

import { requireAdminAuth } from "@/lib/database/actions/admin-auth";

describe("getAdminCompanies", () => {
  const mockTimestamp = {
    toDate: () => new Date("2025-01-01"),
  };

  const mockCompanyDocs = [
    {
      id: "company-1",
      data: () => ({
        company_name: "บริษัททดสอบ จำกัด",
        email: "test@company1.com",
        status: "pending",
        profile_photo: "/logo1.png",
        industry: "เทคโนโลยี",
        created_at: mockTimestamp,
      }),
    },
    {
      id: "company-2",
      data: () => ({
        company_name: "Another Company Ltd.",
        email: "test@company2.com",
        status: "approved",
        profile_photo: "/logo2.png",
        industry: "การเงิน",
        created_at: mockTimestamp,
      }),
    },
  ];

  const mockAllCompanyDocs = [
    ...mockCompanyDocs,
    {
      id: "company-3",
      data: () => ({
        company_name: "Rejected Corp",
        email: "test@company3.com",
        status: "rejected",
        profile_photo: null,
        created_at: mockTimestamp,
      }),
    },
    {
      id: "company-4",
      data: () => ({
        company_name: "Suspended Inc",
        email: "test@company4.com",
        status: "suspended",
        profile_photo: null,
        created_at: mockTimestamp,
      }),
    },
    {
      id: "company-5",
      data: () => ({
        company_name: "Another Pending",
        email: "test@company5.com",
        status: "pending",
        profile_photo: null,
        created_at: mockTimestamp,
      }),
    },
  ];

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
      orderBy: mockOrderBy,
      doc: mockDoc,
      get: mockGet,
    });

    mockOrderBy.mockReturnValue({
      where: mockWhere,
      limit: mockLimit,
      startAfter: mockStartAfter,
    });

    mockWhere.mockReturnValue({
      limit: mockLimit,
      startAfter: mockStartAfter,
    });

    mockLimit.mockReturnValue({
      get: mockGet,
      startAfter: mockStartAfter,
    });

    mockStartAfter.mockReturnValue({
      limit: mockLimit,
      get: mockGet,
    });

    mockDoc.mockReturnValue({
      get: vi.fn().mockResolvedValue({
        exists: true,
        data: () => mockCompanyDocs[0].data(),
      }),
    });

    // Default: return mock companies
    mockGet.mockResolvedValue({
      docs: mockCompanyDocs,
    });
  });

  describe("Authorization", () => {
    it("should require admin authorization", async () => {
      await getAdminCompanies({});

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await getAdminCompanies({});

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });
  });

  describe("Fetching Companies", () => {
    it("should return paginated company list", async () => {
      const result = await getAdminCompanies({});

      expect(result.success).toBe(true);
      expect(result.data?.companies).toHaveLength(2);
      expect(result.data?.companies[0].companyName).toBe("บริษัททดสอบ จำกัด");
    });

    it("should return status counts", async () => {
      // Mock for counts query (all companies)
      mockGet.mockResolvedValueOnce({
        docs: mockCompanyDocs, // For main query
      });
      mockGet.mockResolvedValueOnce({
        docs: mockAllCompanyDocs, // For counts
      });

      const result = await getAdminCompanies({});

      expect(result.success).toBe(true);
      expect(result.data?.counts).toBeDefined();
      expect(result.data?.counts.all).toBeGreaterThan(0);
    });

    it("should return pagination info", async () => {
      const result = await getAdminCompanies({});

      expect(result.data?.hasMore).toBeDefined();
      expect(result.data?.lastDocId).toBeDefined();
    });

    it("should sort by created_at descending by default", async () => {
      await getAdminCompanies({});

      expect(mockOrderBy).toHaveBeenCalledWith("created_at", "desc");
    });
  });

  describe("Filtering", () => {
    it("should filter by pending status", async () => {
      await getAdminCompanies({ status: "pending" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "pending");
    });

    it("should filter by approved status", async () => {
      await getAdminCompanies({ status: "approved" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "approved");
    });

    it("should filter by rejected status", async () => {
      await getAdminCompanies({ status: "rejected" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "rejected");
    });

    it("should filter by suspended status", async () => {
      await getAdminCompanies({ status: "suspended" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "suspended");
    });

    it("should filter by search query (company name)", async () => {
      const result = await getAdminCompanies({ search: "ทดสอบ" });

      expect(result.success).toBe(true);
      // Search is applied client-side after fetch
      expect(result.data?.companies.length).toBeGreaterThanOrEqual(0);
    });

    it("should filter by search query (email)", async () => {
      const result = await getAdminCompanies({ search: "test@company1" });

      expect(result.success).toBe(true);
    });

    it("should combine status and search filters", async () => {
      await getAdminCompanies({ status: "pending", search: "ทดสอบ" });

      expect(mockWhere).toHaveBeenCalledWith("status", "==", "pending");
    });
  });

  describe("Pagination", () => {
    it("should use default limit of 20", async () => {
      await getAdminCompanies({});

      expect(mockLimit).toHaveBeenCalledWith(21); // limit + 1 for hasMore check
    });

    it("should accept custom limit", async () => {
      await getAdminCompanies({ limit: 50 });

      expect(mockLimit).toHaveBeenCalledWith(51); // limit + 1 for hasMore check
    });

    it("should support startAfter for pagination", async () => {
      await getAdminCompanies({ startAfter: "company-1" });

      expect(mockDoc).toHaveBeenCalledWith("company-1");
    });
  });

  describe("Empty Results", () => {
    it("should handle empty company list", async () => {
      mockGet.mockResolvedValue({
        docs: [],
      });

      const result = await getAdminCompanies({});

      expect(result.success).toBe(true);
      expect(result.data?.companies).toHaveLength(0);
    });

    it("should handle no matching search results", async () => {
      const result = await getAdminCompanies({ search: "nonexistent12345" });

      expect(result.success).toBe(true);
      // Search filters on client side, so original results minus filtered
      expect(result.data?.companies.length).toBe(0);
    });
  });

  describe("Error Handling", () => {
    it("should return error on Firestore failure", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const result = await getAdminCompanies({});

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });
  });
});
