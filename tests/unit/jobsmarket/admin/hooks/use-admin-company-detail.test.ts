import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useAdminCompanyDetail } from "@/hooks/jobsmarket/admin/use-admin-company-detail";

/**
 * Unit tests for useAdminCompanyDetail hook
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Hook that wraps the getAdminCompanyDetail action with SWR-like functionality.
 * Provides loading, error, 404 states, and refresh capability.
 *
 * Coverage Target: 90%+
 */

// Mock the server action
vi.mock("@/lib/database/actions/admin-companies", () => ({
  getAdminCompanyDetail: vi.fn(),
}));

import { getAdminCompanyDetail } from "@/lib/database/actions/admin-companies";

describe("useAdminCompanyDetail", () => {
  const mockCompany = {
    id: "company-1",
    companyName: "บริษัททดสอบ จำกัด",
    companyNameEn: "Test Company Ltd.",
    email: "contact@testcompany.com",
    phone: "021234567",
    status: "pending" as const,
    profilePhoto: "/logo.png",
    industry: "เทคโนโลยี",
    companySize: "M",
    shortDescription: "บริษัทซอฟต์แวร์ชั้นนำ",
    overview: "บริษัททดสอบเป็นบริษัทพัฒนาซอฟต์แวร์",
    address: "123 ถนนสุขุมวิท",
    province: "กรุงเทพมหานคร",
    district: "วัฒนา",
    subDistrict: "คลองเตย",
    postCode: "10110",
    website: "https://testcompany.com",
    taxId: "1234567890123",
    createdAt: new Date("2025-01-01"),
    updatedAt: new Date("2025-01-01"),
  };

  const mockStats = {
    jobCount: 5,
    teamSize: 10,
    applicationCount: 25,
  };

  const mockSuccessResponse = {
    success: true,
    data: {
      company: mockCompany,
      stats: mockStats,
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockSuccessResponse
    );
  });

  describe("Initial State", () => {
    it("should start with loading state", () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      expect(result.current.isLoading).toBe(true);
    });

    it("should have null company initially", () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      expect(result.current.company).toBeNull();
    });

    it("should have no error initially", () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      expect(result.current.error).toBeNull();
    });
  });

  describe("Data Fetching", () => {
    it("should return company data after loading", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.company).toEqual(mockCompany);
    });

    it("should return company stats", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.stats).toEqual(mockStats);
    });

    it("should call action with correct company ID", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getAdminCompanyDetail).toHaveBeenCalledWith("company-1");
    });

    it("should refetch when company ID changes", async () => {
      const { result, rerender } = renderHook(
        ({ id }) => useAdminCompanyDetail(id),
        { initialProps: { id: "company-1" } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      rerender({ id: "company-2" });

      await waitFor(() => {
        expect(getAdminCompanyDetail).toHaveBeenCalledWith("company-2");
      });
    });
  });

  describe("Error Handling", () => {
    it("should set error state on failure", async () => {
      (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Failed to fetch company",
      });

      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
      expect(result.current.company).toBeNull();
    });

    it("should handle network errors", async () => {
      (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("404 Handling", () => {
    it("should set notFound state for non-existent company", async () => {
      (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Company not found",
        notFound: true,
      });

      const { result } = renderHook(() => useAdminCompanyDetail("nonexistent"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notFound).toBe(true);
      expect(result.current.company).toBeNull();
    });

    it("should not set notFound for other errors", async () => {
      (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Server error",
      });

      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.notFound).toBe(false);
    });
  });

  describe("Refresh/Mutate", () => {
    it("should provide refresh function", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe("function");
    });

    it("should refetch data when refresh is called", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCountBefore = (getAdminCompanyDetail as ReturnType<typeof vi.fn>)
        .mock.calls.length;

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(
          (getAdminCompanyDetail as ReturnType<typeof vi.fn>).mock.calls.length
        ).toBeGreaterThan(callCountBefore);
      });
    });

    it("should provide mutate function for optimistic updates", async () => {
      const { result } = renderHook(() => useAdminCompanyDetail("company-1"));

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.mutate).toBe("function");
    });
  });
});
