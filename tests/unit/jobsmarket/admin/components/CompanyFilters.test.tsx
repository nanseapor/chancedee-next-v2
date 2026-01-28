import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CompanyFilters } from "@/app/(platform)/platform/companies/_components/CompanyFilters";

/**
 * Unit tests for CompanyFilters component
 * Per ADM-R02 Company Management RIS §3.1.1 Filter Bar
 *
 * Filter bar with:
 * - Status tabs (All, Pending, Approved, Rejected, Suspended)
 * - Search input
 * - Status counts in badges
 *
 * Coverage Target: 90%+
 */

describe("CompanyFilters", () => {
  const mockCounts = {
    all: 100,
    pending: 25,
    approved: 50,
    rejected: 15,
    suspended: 10,
  };

  const defaultProps = {
    activeStatus: undefined as "pending" | "approved" | "rejected" | "suspended" | undefined,
    searchQuery: "",
    counts: mockCounts,
    onStatusChange: vi.fn(),
    onSearchChange: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Status Tabs Rendering", () => {
    it("should render All tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /all/i })).toBeInTheDocument();
    });

    it("should render Pending tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /pending/i })).toBeInTheDocument();
    });

    it("should render Approved tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /approved/i })).toBeInTheDocument();
    });

    it("should render Rejected tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /rejected/i })).toBeInTheDocument();
    });

    it("should render Suspended tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByRole("tab", { name: /suspended/i })).toBeInTheDocument();
    });
  });

  describe("Status Counts", () => {
    it("should show count badge for All tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("count-all")).toHaveTextContent("100");
    });

    it("should show count badge for Pending tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("count-pending")).toHaveTextContent("25");
    });

    it("should show count badge for Approved tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("count-approved")).toHaveTextContent("50");
    });

    it("should show count badge for Rejected tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("count-rejected")).toHaveTextContent("15");
    });

    it("should show count badge for Suspended tab", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("count-suspended")).toHaveTextContent("10");
    });
  });

  describe("Active State", () => {
    it("should highlight All tab when no status selected", () => {
      render(<CompanyFilters {...defaultProps} activeStatus={undefined} />);

      const allTab = screen.getByRole("tab", { name: /all/i });
      expect(allTab).toHaveAttribute("aria-selected", "true");
    });

    it("should highlight Pending tab when pending status selected", () => {
      render(<CompanyFilters {...defaultProps} activeStatus="pending" />);

      const pendingTab = screen.getByRole("tab", { name: /pending/i });
      expect(pendingTab).toHaveAttribute("aria-selected", "true");
    });

    it("should highlight Approved tab when approved status selected", () => {
      render(<CompanyFilters {...defaultProps} activeStatus="approved" />);

      const approvedTab = screen.getByRole("tab", { name: /approved/i });
      expect(approvedTab).toHaveAttribute("aria-selected", "true");
    });
  });

  describe("Status Tab Interaction", () => {
    it("should call onStatusChange with undefined when All clicked", () => {
      const onStatusChange = vi.fn();
      render(
        <CompanyFilters
          {...defaultProps}
          activeStatus="pending"
          onStatusChange={onStatusChange}
        />
      );

      fireEvent.click(screen.getByRole("tab", { name: /all/i }));

      expect(onStatusChange).toHaveBeenCalledWith(undefined);
    });

    it("should call onStatusChange with pending when Pending clicked", () => {
      const onStatusChange = vi.fn();
      render(
        <CompanyFilters {...defaultProps} onStatusChange={onStatusChange} />
      );

      fireEvent.click(screen.getByRole("tab", { name: /pending/i }));

      expect(onStatusChange).toHaveBeenCalledWith("pending");
    });

    it("should call onStatusChange with approved when Approved clicked", () => {
      const onStatusChange = vi.fn();
      render(
        <CompanyFilters {...defaultProps} onStatusChange={onStatusChange} />
      );

      fireEvent.click(screen.getByRole("tab", { name: /approved/i }));

      expect(onStatusChange).toHaveBeenCalledWith("approved");
    });

    it("should call onStatusChange with rejected when Rejected clicked", () => {
      const onStatusChange = vi.fn();
      render(
        <CompanyFilters {...defaultProps} onStatusChange={onStatusChange} />
      );

      fireEvent.click(screen.getByRole("tab", { name: /rejected/i }));

      expect(onStatusChange).toHaveBeenCalledWith("rejected");
    });

    it("should call onStatusChange with suspended when Suspended clicked", () => {
      const onStatusChange = vi.fn();
      render(
        <CompanyFilters {...defaultProps} onStatusChange={onStatusChange} />
      );

      fireEvent.click(screen.getByRole("tab", { name: /suspended/i }));

      expect(onStatusChange).toHaveBeenCalledWith("suspended");
    });
  });

  describe("Search Input", () => {
    it("should render search input", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByPlaceholderText(/search/i)).toBeInTheDocument();
    });

    it("should show search icon", () => {
      render(<CompanyFilters {...defaultProps} />);

      expect(screen.getByTestId("search-icon")).toBeInTheDocument();
    });

    it("should display current search query", () => {
      render(<CompanyFilters {...defaultProps} searchQuery="ทดสอบ" />);

      expect(screen.getByPlaceholderText(/search/i)).toHaveValue("ทดสอบ");
    });

    it("should call onSearchChange when typing", () => {
      const onSearchChange = vi.fn();
      render(
        <CompanyFilters {...defaultProps} onSearchChange={onSearchChange} />
      );

      const searchInput = screen.getByPlaceholderText(/search/i);
      fireEvent.change(searchInput, { target: { value: "new search" } });

      expect(onSearchChange).toHaveBeenCalledWith("new search");
    });
  });

  describe("Loading State", () => {
    it("should show skeleton badges when loading", () => {
      render(<CompanyFilters {...defaultProps} counts={undefined} isLoading />);

      expect(screen.getAllByTestId("count-skeleton")).toHaveLength(5);
    });
  });
});
