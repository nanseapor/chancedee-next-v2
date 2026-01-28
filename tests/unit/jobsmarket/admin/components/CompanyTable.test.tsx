import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CompanyTable } from "@/app/(platform)/platform/companies/_components/CompanyTable";

/**
 * Unit tests for CompanyTable component
 * Per ADM-R02 Company Management RIS §3.1.2 Company Table
 *
 * Data table displaying companies with:
 * - Company info (logo, name, email - combined in one column)
 * - Status badge
 * - Registration date
 * - Action buttons
 *
 * Coverage Target: 90%+
 */

describe("CompanyTable", () => {
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
    {
      id: "company-3",
      companyName: "Suspended Corp",
      email: "test@company3.com",
      status: "suspended" as const,
      profilePhoto: null,
      createdAt: new Date("2025-01-03"),
    },
  ];

  const defaultProps = {
    companies: mockCompanies,
    isLoading: false,
    onRowClick: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Table Structure", () => {
    it("should render table element", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
    });

    it("should render Company column header", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(
        screen.getByRole("columnheader", { name: /company/i })
      ).toBeInTheDocument();
    });

    it("should render Status column header", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(
        screen.getByRole("columnheader", { name: /status/i })
      ).toBeInTheDocument();
    });

    it("should render Date column header", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(
        screen.getByRole("columnheader", { name: /date|registered/i })
      ).toBeInTheDocument();
    });

    it("should render Actions column header", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(
        screen.getByRole("columnheader", { name: /actions/i })
      ).toBeInTheDocument();
    });
  });

  describe("Company Rows", () => {
    it("should render correct number of rows", () => {
      render(<CompanyTable {...defaultProps} />);

      const rows = screen.getAllByRole("row");
      // +1 for header row
      expect(rows).toHaveLength(mockCompanies.length + 1);
    });

    it("should render company names", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
      expect(screen.getByText("Another Company Ltd.")).toBeInTheDocument();
    });

    it("should render company emails", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(screen.getByText("test@company1.com")).toBeInTheDocument();
      expect(screen.getByText("test@company2.com")).toBeInTheDocument();
    });
  });

  describe("Row Interaction", () => {
    it("should call onRowClick when row is clicked", () => {
      const onRowClick = vi.fn();
      render(<CompanyTable {...defaultProps} onRowClick={onRowClick} />);

      const firstRow = screen.getByTestId("company-row-company-1");
      fireEvent.click(firstRow);

      expect(onRowClick).toHaveBeenCalledWith("company-1");
    });

    it("should have hover effect on rows", () => {
      render(<CompanyTable {...defaultProps} />);

      const firstRow = screen.getByTestId("company-row-company-1");
      expect(firstRow).toHaveClass("hover:bg-gray-50");
    });

    it("should have cursor pointer on rows", () => {
      render(<CompanyTable {...defaultProps} />);

      const firstRow = screen.getByTestId("company-row-company-1");
      expect(firstRow).toHaveClass("cursor-pointer");
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      render(<CompanyTable {...defaultProps} companies={[]} isLoading />);

      expect(screen.getByTestId("table-skeleton")).toBeInTheDocument();
    });

    it("should show multiple skeleton rows", () => {
      render(<CompanyTable {...defaultProps} companies={[]} isLoading />);

      const skeletonRows = screen.getAllByTestId("skeleton-row");
      expect(skeletonRows.length).toBeGreaterThanOrEqual(5);
    });
  });

  describe("Empty State", () => {
    it("should show empty state when no companies", () => {
      render(<CompanyTable {...defaultProps} companies={[]} />);

      expect(screen.getByTestId("empty-state")).toBeInTheDocument();
    });

    it("should show empty message", () => {
      render(<CompanyTable {...defaultProps} companies={[]} />);

      expect(screen.getByText(/no companies found/i)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper table semantics", () => {
      render(<CompanyTable {...defaultProps} />);

      expect(screen.getByRole("table")).toBeInTheDocument();
      // 4 columns: Company, Status, Registered, Actions
      expect(screen.getAllByRole("columnheader")).toHaveLength(4);
      expect(screen.getAllByRole("row").length).toBeGreaterThan(1);
    });
  });
});
