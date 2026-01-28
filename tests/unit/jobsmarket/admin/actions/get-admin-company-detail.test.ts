import { describe, it, expect, vi, beforeEach } from "vitest";

import { getAdminCompanyDetail } from "@/lib/database/actions/admin-companies";

/**
 * Unit tests for getAdminCompanyDetail server action
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Tests the server action that retrieves a single company's full details
 * for admin review and management.
 *
 * Coverage Target: 90%+
 */

// Mock the admin auth check
vi.mock("@/lib/database/actions/admin-auth", () => ({
  requireAdminAuth: vi.fn(),
}));

// Mock Firebase Admin Firestore
const mockGet = vi.fn();
const mockDoc = vi.fn();
const mockWhere = vi.fn();
const mockCollection = vi.fn();

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: mockCollection,
  })),
}));

import { requireAdminAuth } from "@/lib/database/actions/admin-auth";

describe("getAdminCompanyDetail", () => {
  const mockTimestamp = {
    toDate: () => new Date("2025-01-01"),
  };

  const mockCompanyDoc = {
    id: "company-1",
    exists: true,
    data: () => ({
      company_name: "บริษัททดสอบ จำกัด",
      company_name_en: "Test Company Ltd.",
      email: "contact@testcompany.com",
      phone: "021234567",
      status: "pending",
      profile_photo: "/logo.png",
      industry: "เทคโนโลยี",
      company_size: "M",
      short_description: "บริษัทซอฟต์แวร์ชั้นนำ",
      overview: "บริษัททดสอบเป็นบริษัทพัฒนาซอฟต์แวร์ที่มีประสบการณ์มากกว่า 10 ปี",
      address: "123 ถนนสุขุมวิท",
      province: "กรุงเทพมหานคร",
      district: "วัฒนา",
      sub_district: "คลองเตย",
      post_code: "10110",
      website: "https://testcompany.com",
      tax_id: "1234567890123",
      created_at: mockTimestamp,
      updated_at: mockTimestamp,
    }),
  };

  // Mock stats query results
  const mockJobsSnapshot = {
    size: 5,
    docs: [{ id: "job-1" }, { id: "job-2" }, { id: "job-3" }, { id: "job-4" }, { id: "job-5" }],
  };

  const mockTeamSnapshot = {
    size: 10,
    docs: [],
  };

  const mockApplicationsSnapshot = {
    size: 25,
    docs: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: auth succeeds
    (requireAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
      userId: "admin-user-id",
      email: "admin@test.com",
      roles: ["chancedee"],
    });

    // Setup Firestore mock chain based on collection name
    mockCollection.mockImplementation((collectionName: string) => {
      if (collectionName === "company_information") {
        return {
          doc: mockDoc,
        };
      }
      // For jobs, company_users, applications - return where chain
      return {
        where: mockWhere,
      };
    });

    mockDoc.mockReturnValue({
      get: mockGet,
    });

    // Default: return mock company
    mockGet.mockResolvedValue(mockCompanyDoc);

    // Mock where queries for stats
    mockWhere.mockImplementation((field: string, op: string, value: string | string[]) => {
      // For job_id "in" query (applications)
      if (field === "job_id" && op === "in") {
        return {
          get: vi.fn().mockResolvedValue(mockApplicationsSnapshot),
        };
      }
      // For company_id queries (jobs, company_users)
      return {
        get: vi.fn().mockImplementation(() => {
          // Based on which collection was called
          const lastCollection = mockCollection.mock.calls[mockCollection.mock.calls.length - 1]?.[0];
          if (lastCollection === "jobs") {
            return Promise.resolve(mockJobsSnapshot);
          }
          if (lastCollection === "company_users") {
            return Promise.resolve(mockTeamSnapshot);
          }
          return Promise.resolve({ size: 0, docs: [] });
        }),
      };
    });
  });

  describe("Authorization", () => {
    it("should require admin authorization", async () => {
      await getAdminCompanyDetail("company-1");

      expect(requireAdminAuth).toHaveBeenCalled();
    });

    it("should return error if not admin", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Unauthorized")
      );

      const result = await getAdminCompanyDetail("company-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Unauthorized");
    });

    it("should return error if forbidden", async () => {
      (requireAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Forbidden")
      );

      const result = await getAdminCompanyDetail("company-1");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Forbidden");
    });
  });

  describe("Fetching Company Detail", () => {
    it("should return company with all fields", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.success).toBe(true);
      expect(result.data).toBeDefined();
      expect(result.data?.company.id).toBe("company-1");
      expect(result.data?.company.companyName).toBe("บริษัททดสอบ จำกัด");
      expect(result.data?.company.companyNameEn).toBe("Test Company Ltd.");
      expect(result.data?.company.email).toBe("contact@testcompany.com");
      expect(result.data?.company.phone).toBe("021234567");
      expect(result.data?.company.status).toBe("pending");
    });

    it("should return company profile information", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.company.profilePhoto).toBe("/logo.png");
      expect(result.data?.company.industry).toBe("เทคโนโลยี");
      expect(result.data?.company.companySize).toBe("M");
      expect(result.data?.company.shortDescription).toBe("บริษัทซอฟต์แวร์ชั้นนำ");
      expect(result.data?.company.overview).toBeDefined();
    });

    it("should return company address information", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.company.address).toBe("123 ถนนสุขุมวิท");
      expect(result.data?.company.province).toBe("กรุงเทพมหานคร");
      expect(result.data?.company.district).toBe("วัฒนา");
      expect(result.data?.company.subDistrict).toBe("คลองเตย");
      expect(result.data?.company.postCode).toBe("10110");
    });

    it("should return company metadata", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.company.website).toBe("https://testcompany.com");
      expect(result.data?.company.taxId).toBe("1234567890123");
      expect(result.data?.company.createdAt).toBeInstanceOf(Date);
      expect(result.data?.company.updatedAt).toBeInstanceOf(Date);
    });

    it("should fetch from correct collection and document", async () => {
      await getAdminCompanyDetail("company-1");

      expect(mockCollection).toHaveBeenCalledWith("company_information");
      expect(mockDoc).toHaveBeenCalledWith("company-1");
    });
  });

  describe("404 Not Found", () => {
    it("should return 404 for non-existent company", async () => {
      mockGet.mockResolvedValue({
        exists: false,
        data: () => null,
      });

      const result = await getAdminCompanyDetail("nonexistent-company");

      expect(result.success).toBe(false);
      expect(result.error).toBe("Company not found");
      expect(result.notFound).toBe(true);
    });
  });

  describe("Company Stats", () => {
    it("should return associated job count", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.stats).toBeDefined();
      expect(typeof result.data?.stats?.jobCount).toBe("number");
    });

    it("should return team size", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.stats).toBeDefined();
      expect(typeof result.data?.stats?.teamSize).toBe("number");
    });

    it("should return application count", async () => {
      const result = await getAdminCompanyDetail("company-1");

      expect(result.data?.stats).toBeDefined();
      expect(typeof result.data?.stats?.applicationCount).toBe("number");
    });
  });

  describe("Error Handling", () => {
    it("should return error on Firestore failure", async () => {
      mockGet.mockRejectedValue(new Error("Database error"));

      const result = await getAdminCompanyDetail("company-1");

      expect(result.success).toBe(false);
      expect(result.error).toBeDefined();
    });

    it("should handle null fields gracefully", async () => {
      mockGet.mockResolvedValue({
        id: "company-1",
        exists: true,
        data: () => ({
          company_name: "Test Company",
          email: "test@test.com",
          status: "pending",
          // Many fields null/undefined
          phone: null,
          profile_photo: null,
          industry: null,
          created_at: mockTimestamp,
        }),
      });

      const result = await getAdminCompanyDetail("company-1");

      expect(result.success).toBe(true);
      expect(result.data?.company.phone).toBeNull();
      expect(result.data?.company.profilePhoto).toBeNull();
    });
  });
});
