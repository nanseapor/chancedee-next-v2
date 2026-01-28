import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { CompaniesClient } from "@/app/(platform)/platform/companies/_components/CompaniesClient";

/**
 * Unit tests for CompaniesClient component
 * Per ADM-R02 Company Management RIS §3.1 Company List Page
 *
 * Main client component that integrates:
 * - CompanyFilters
 * - CompanyTable
 * - Pagination
 * - URL state management
 *
 * Coverage Target: 90%+
 */

// Mock next/navigation
const mockPush = vi.fn();
const mockReplace = vi.fn();

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: mockPush,
    replace: mockReplace,
  })),
  usePathname: vi.fn(() => "/platform/companies"),
  useSearchParams: vi.fn(() => new URLSearchParams()),
}));

// Mock the hook
vi.mock("@/hooks/jobsmarket/admin/use-admin-companies", () => ({
  useAdminCompanies: vi.fn(),
}));

import { useAdminCompanies } from "@/hooks/jobsmarket/admin/use-admin-companies";
import { useSearchParams } from "next/navigation";

describe("CompaniesClient", () => {
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
    all: 100,
    pending: 25,
    approved: 50,
    rejected: 15,
    suspended: 10,
  };

  const mockHookReturn = {
    companies: mockCompanies,
    counts: mockCounts,
    isLoading: false,
    error: null,
    hasMore: false,
    loadMore: vi.fn(),
    refresh: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue(
      mockHookReturn
    );
  });

  describe("Integration", () => {
    it("should render filters component", () => {
      render(<CompaniesClient />);

      // Should have status tabs
      expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /pending/i })).toBeInTheDocument();
    });

    it("should render table component", () => {
      render(<CompaniesClient />);

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should render company data in table", () => {
      render(<CompaniesClient />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
      expect(screen.getByText("Another Company Ltd.")).toBeInTheDocument();
    });

    it("should pass counts to filters", () => {
      render(<CompaniesClient />);

      expect(screen.getByTestId("count-all")).toHaveTextContent("100");
      expect(screen.getByTestId("count-pending")).toHaveTextContent("25");
    });
  });

  describe("Filter Handling", () => {
    it("should pass status filter to hook", async () => {
      render(<CompaniesClient />);

      fireEvent.click(screen.getByRole("tab", { name: /pending/i }));

      await waitFor(() => {
        expect(useAdminCompanies).toHaveBeenCalledWith(
          expect.objectContaining({
            status: "pending",
          })
        );
      });
    });

    it("should pass search filter to hook", async () => {
      render(<CompaniesClient />);

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "ทดสอบ" } });

      await waitFor(() => {
        expect(useAdminCompanies).toHaveBeenCalledWith(
          expect.objectContaining({
            search: "ทดสอบ",
          })
        );
      });
    });
  });

  describe("URL State", () => {
    it("should update URL when filter changes", async () => {
      mockReplace.mockClear();

      render(<CompaniesClient />);

      fireEvent.click(screen.getByRole("tab", { name: /pending/i }));

      await waitFor(() => {
        expect(mockReplace).toHaveBeenCalledWith(
          expect.stringContaining("status=pending")
        );
      });
    });

    it("should restore filters from URL on mount", () => {
      (useSearchParams as ReturnType<typeof vi.fn>).mockReturnValueOnce(
        new URLSearchParams("status=approved&search=test")
      );

      render(<CompaniesClient />);

      expect(useAdminCompanies).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "approved",
          search: "test",
        })
      );
    });
  });

  describe("Loading State", () => {
    it("should show loading state when loading", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        companies: [],
        isLoading: true,
      });

      render(<CompaniesClient />);

      expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error state when error occurs", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        companies: [],
        error: new Error("Failed to fetch"),
      });

      render(<CompaniesClient />);

      expect(screen.getByTestId("error-state")).toBeInTheDocument();
    });

    it("should show retry button on error", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        companies: [],
        error: new Error("Failed to fetch"),
      });

      render(<CompaniesClient />);

      expect(
        screen.getByRole("button", { name: /retry|ลองใหม่/i })
      ).toBeInTheDocument();
    });

    it("should call refresh when retry clicked", () => {
      const mockRefresh = vi.fn();
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        companies: [],
        error: new Error("Failed to fetch"),
        refresh: mockRefresh,
      });

      render(<CompaniesClient />);

      fireEvent.click(screen.getByRole("button", { name: /retry|ลองใหม่/i }));

      expect(mockRefresh).toHaveBeenCalled();
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no companies", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        companies: [],
      });

      render(<CompaniesClient />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    it("should show Load More button when hasMore is true", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        hasMore: true,
      });

      render(<CompaniesClient />);

      expect(
        screen.getByRole("button", { name: /load more|โหลดเพิ่ม/i })
      ).toBeInTheDocument();
    });

    it("should call loadMore when Load More clicked", () => {
      const mockLoadMore = vi.fn();
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        hasMore: true,
        loadMore: mockLoadMore,
      });

      render(<CompaniesClient />);

      fireEvent.click(
        screen.getByRole("button", { name: /load more|โหลดเพิ่ม/i })
      );

      expect(mockLoadMore).toHaveBeenCalled();
    });

    it("should not show Load More when hasMore is false", () => {
      (useAdminCompanies as ReturnType<typeof vi.fn>).mockReturnValue({
        ...mockHookReturn,
        hasMore: false,
      });

      render(<CompaniesClient />);

      expect(
        screen.queryByRole("button", { name: /load more|โหลดเพิ่ม/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Row Navigation", () => {
    it("should navigate to company detail on row click", async () => {
      mockPush.mockClear();

      render(<CompaniesClient />);

      const firstRow = screen.getByTestId("company-row-company-1");
      fireEvent.click(firstRow);

      expect(mockPush).toHaveBeenCalledWith("/platform/companies/company-1");
    });
  });

  describe("Page Header", () => {
    it("should render page title", () => {
      render(<CompaniesClient />);

      expect(
        screen.getByRole("heading", { name: /companies|บริษัท/i })
      ).toBeInTheDocument();
    });

    it("should render page description", () => {
      render(<CompaniesClient />);

      expect(
        screen.getByText(/manage company registrations/i)
      ).toBeInTheDocument();
    });
  });
});
