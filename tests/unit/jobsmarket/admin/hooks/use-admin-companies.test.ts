import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useAdminCompanies } from "@/hooks/jobsmarket/admin/use-admin-companies";

/**
 * Unit tests for useAdminCompanies hook
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Hook that wraps the getAdminCompanies action with SWR-like functionality.
 * Provides loading, error states, and refresh capability.
 *
 * Coverage Target: 90%+
 */

// Mock the server action
vi.mock("@/lib/database/actions/admin-companies", () => ({
  getAdminCompanies: vi.fn(),
}));

import { getAdminCompanies } from "@/lib/database/actions/admin-companies";

describe("useAdminCompanies", () => {
  const mockCompanies = [
    {
      id: "company-1",
      companyName: "บริษัททดสอบ จำกัด",
      email: "test@company1.com",
      status: "pending" as const,
      profilePhoto: "/logo1.png",
      createdAt: new Date("2025-01-01"),
    },
    {
      id: "company-2",
      companyName: "Another Company Ltd.",
      email: "test@company2.com",
      status: "approved" as const,
      profilePhoto: "/logo2.png",
      createdAt: new Date("2025-01-02"),
    },
  ];

  const mockCounts = {
    all: 10,
    pending: 5,
    approved: 3,
    rejected: 1,
    suspended: 1,
  };

  const mockSuccessResponse = {
    success: true,
    data: {
      companies: mockCompanies,
      counts: mockCounts,
      hasMore: false,
      lastDocId: "company-2",
    },
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (getAdminCompanies as ReturnType<typeof vi.fn>).mockResolvedValue(
      mockSuccessResponse
    );
  });

  describe("Initial State", () => {
    it("should start with loading state", () => {
      const { result } = renderHook(() => useAdminCompanies());

      expect(result.current.isLoading).toBe(true);
    });

    it("should have empty companies initially", () => {
      const { result } = renderHook(() => useAdminCompanies());

      expect(result.current.companies).toEqual([]);
    });
  });

  describe("Data Fetching", () => {
    it("should return companies array after loading", async () => {
      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.companies).toHaveLength(2);
      expect(result.current.companies[0].companyName).toBe("บริษัททดสอบ จำกัด");
    });

    it("should return status counts", async () => {
      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.counts).toEqual(mockCounts);
    });

    it("should return pagination info", async () => {
      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasMore).toBe(false);
    });
  });

  describe("Filtering", () => {
    it("should pass status filter to action", async () => {
      const { result } = renderHook(() =>
        useAdminCompanies({ status: "pending" })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getAdminCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "pending",
        })
      );
    });

    it("should pass search filter to action", async () => {
      const { result } = renderHook(() =>
        useAdminCompanies({ search: "ทดสอบ" })
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(getAdminCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          search: "ทดสอบ",
        })
      );
    });

    it("should refetch when filter changes", async () => {
      const { result, rerender } = renderHook(
        ({ status }) => useAdminCompanies({ status }),
        { initialProps: { status: undefined as "pending" | undefined } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = (getAdminCompanies as ReturnType<typeof vi.fn>)
        .mock.calls.length;

      rerender({ status: "pending" });

      await waitFor(() => {
        expect(
          (getAdminCompanies as ReturnType<typeof vi.fn>).mock.calls.length
        ).toBeGreaterThan(initialCallCount);
      });
    });

    it("should refetch when search changes", async () => {
      const { result, rerender } = renderHook(
        ({ search }) => useAdminCompanies({ search }),
        { initialProps: { search: "" } }
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const initialCallCount = (getAdminCompanies as ReturnType<typeof vi.fn>)
        .mock.calls.length;

      rerender({ search: "new search" });

      await waitFor(() => {
        expect(
          (getAdminCompanies as ReturnType<typeof vi.fn>).mock.calls.length
        ).toBeGreaterThan(initialCallCount);
      });
    });
  });

  describe("Pagination", () => {
    it("should support loading more items", async () => {
      (getAdminCompanies as ReturnType<typeof vi.fn>).mockResolvedValueOnce({
        success: true,
        data: {
          companies: mockCompanies,
          counts: mockCounts,
          hasMore: true,
          lastDocId: "company-2",
        },
      });

      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.hasMore).toBe(true);
      expect(typeof result.current.loadMore).toBe("function");
    });

    it("should append items when loadMore is called", async () => {
      const moreCompanies = [
        {
          id: "company-3",
          companyName: "Third Company",
          email: "test@company3.com",
          status: "pending" as const,
          profilePhoto: "/logo3.png",
          createdAt: new Date("2025-01-03"),
        },
      ];

      (getAdminCompanies as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({
          success: true,
          data: {
            companies: mockCompanies,
            counts: mockCounts,
            hasMore: true,
            lastDocId: "company-2",
          },
        })
        .mockResolvedValueOnce({
          success: true,
          data: {
            companies: moreCompanies,
            counts: mockCounts,
            hasMore: false,
            lastDocId: "company-3",
          },
        });

      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      act(() => {
        result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.companies).toHaveLength(3);
      });
    });
  });

  describe("Error Handling", () => {
    it("should set error state on failure", async () => {
      (getAdminCompanies as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Failed to fetch companies",
      });

      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });

    it("should handle network errors", async () => {
      (getAdminCompanies as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.error).toBeDefined();
    });
  });

  describe("Refresh", () => {
    it("should provide refresh function", async () => {
      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(typeof result.current.refresh).toBe("function");
    });

    it("should refetch data when refresh is called", async () => {
      const { result } = renderHook(() => useAdminCompanies());

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      const callCountBefore = (getAdminCompanies as ReturnType<typeof vi.fn>)
        .mock.calls.length;

      act(() => {
        result.current.refresh();
      });

      await waitFor(() => {
        expect(
          (getAdminCompanies as ReturnType<typeof vi.fn>).mock.calls.length
        ).toBeGreaterThan(callCountBefore);
      });
    });
  });
});
