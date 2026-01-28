import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CompanyRow } from "@/app/(platform)/platform/companies/_components/CompanyRow";

/**
 * Unit tests for CompanyRow component
 * Per ADM-R02 Company Management RIS §3.1.3 Company Row
 *
 * Single row in company table with:
 * - Company logo and name
 * - Email
 * - Status badge
 * - Registration date
 * - Context-sensitive action buttons
 *
 * Coverage Target: 90%+
 */

describe("CompanyRow", () => {
  const mockPendingCompany = {
    id: "company-1",
    companyName: "บริษัททดสอบ จำกัด",
    email: "test@company1.com",
    status: "pending" as const,
    profilePhoto: "/logo1.png",
    createdAt: new Date("2025-01-01"),
  };

  const mockApprovedCompany = {
    id: "company-2",
    companyName: "Approved Company Ltd.",
    email: "test@company2.com",
    status: "approved" as const,
    profilePhoto: "/logo2.png",
    createdAt: new Date("2025-01-02"),
  };

  const mockRejectedCompany = {
    id: "company-3",
    companyName: "Rejected Corp",
    email: "test@company3.com",
    status: "rejected" as const,
    profilePhoto: null,
    createdAt: new Date("2025-01-03"),
  };

  const mockSuspendedCompany = {
    id: "company-4",
    companyName: "Suspended Corp",
    email: "test@company4.com",
    status: "suspended" as const,
    profilePhoto: null,
    createdAt: new Date("2025-01-04"),
  };

  const defaultProps = {
    company: mockPendingCompany,
    onClick: vi.fn(),
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onSuspend: vi.fn(),
    onReactivate: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Company Info Rendering", () => {
    it("should render company name", () => {
      render(<CompanyRow {...defaultProps} />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should render company logo when available", () => {
      render(<CompanyRow {...defaultProps} />);

      const logo = screen.getByTestId("company-logo");
      expect(logo).toHaveAttribute("src", expect.stringContaining("logo1.png"));
    });

    it("should render fallback avatar when no logo", () => {
      render(
        <CompanyRow {...defaultProps} company={mockRejectedCompany} />
      );

      expect(screen.getByTestId("company-avatar-fallback")).toBeInTheDocument();
    });

    it("should render company email", () => {
      render(<CompanyRow {...defaultProps} />);

      expect(screen.getByText("test@company1.com")).toBeInTheDocument();
    });

    it("should render registration date", () => {
      render(<CompanyRow {...defaultProps} />);

      // Date should be formatted (e.g., "1 Jan 2025" or similar)
      expect(screen.getByTestId("company-date")).toBeInTheDocument();
    });
  });

  describe("Status Badge", () => {
    it("should render pending status with amber color", () => {
      render(<CompanyRow {...defaultProps} company={mockPendingCompany} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent(/pending|รอการอนุมัติ/i);
      expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
    });

    it("should render approved status with green color", () => {
      render(<CompanyRow {...defaultProps} company={mockApprovedCompany} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent(/approved|อนุมัติ/i);
      expect(badge).toHaveClass("bg-green-100", "text-green-700");
    });

    it("should render rejected status with red color", () => {
      render(<CompanyRow {...defaultProps} company={mockRejectedCompany} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent(/rejected|ไม่อนุมัติ/i);
      expect(badge).toHaveClass("bg-rose-100", "text-rose-700");
    });

    it("should render suspended status with red color", () => {
      render(<CompanyRow {...defaultProps} company={mockSuspendedCompany} />);

      const badge = screen.getByTestId("status-badge");
      expect(badge).toHaveTextContent(/suspended|ถูกระงับ/i);
      expect(badge).toHaveClass("bg-rose-100", "text-rose-700");
    });
  });

  describe("Action Buttons - Pending Company", () => {
    it("should show Approve button for pending company", () => {
      render(<CompanyRow {...defaultProps} company={mockPendingCompany} />);

      expect(
        screen.getByRole("button", { name: /approve|อนุมัติ/i })
      ).toBeInTheDocument();
    });

    it("should show Reject button for pending company", () => {
      render(<CompanyRow {...defaultProps} company={mockPendingCompany} />);

      expect(
        screen.getByRole("button", { name: /reject|ปฏิเสธ/i })
      ).toBeInTheDocument();
    });

    it("should call onApprove when Approve clicked", () => {
      const onApprove = vi.fn();
      render(
        <CompanyRow {...defaultProps} company={mockPendingCompany} onApprove={onApprove} />
      );

      fireEvent.click(screen.getByRole("button", { name: /approve|อนุมัติ/i }));

      expect(onApprove).toHaveBeenCalledWith("company-1");
    });

    it("should call onReject when Reject clicked", () => {
      const onReject = vi.fn();
      render(
        <CompanyRow {...defaultProps} company={mockPendingCompany} onReject={onReject} />
      );

      fireEvent.click(screen.getByRole("button", { name: /reject|ปฏิเสธ/i }));

      expect(onReject).toHaveBeenCalledWith("company-1");
    });

    it("should not show Suspend button for pending company", () => {
      render(<CompanyRow {...defaultProps} company={mockPendingCompany} />);

      expect(
        screen.queryByRole("button", { name: /suspend|ระงับ/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons - Approved Company", () => {
    it("should show Suspend button for approved company", () => {
      render(<CompanyRow {...defaultProps} company={mockApprovedCompany} />);

      expect(
        screen.getByRole("button", { name: /suspend|ระงับ/i })
      ).toBeInTheDocument();
    });

    it("should call onSuspend when Suspend clicked", () => {
      const onSuspend = vi.fn();
      render(
        <CompanyRow {...defaultProps} company={mockApprovedCompany} onSuspend={onSuspend} />
      );

      fireEvent.click(screen.getByRole("button", { name: /suspend|ระงับ/i }));

      expect(onSuspend).toHaveBeenCalledWith("company-2");
    });

    it("should not show Approve button for approved company", () => {
      render(<CompanyRow {...defaultProps} company={mockApprovedCompany} />);

      expect(
        screen.queryByRole("button", { name: /approve|อนุมัติ/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Action Buttons - Suspended Company", () => {
    it("should show Reactivate button for suspended company", () => {
      render(<CompanyRow {...defaultProps} company={mockSuspendedCompany} />);

      expect(
        screen.getByRole("button", { name: /reactivate|เปิดใช้งาน/i })
      ).toBeInTheDocument();
    });

    it("should call onReactivate when Reactivate clicked", () => {
      const onReactivate = vi.fn();
      render(
        <CompanyRow
          {...defaultProps}
          company={mockSuspendedCompany}
          onReactivate={onReactivate}
        />
      );

      fireEvent.click(
        screen.getByRole("button", { name: /reactivate|เปิดใช้งาน/i })
      );

      expect(onReactivate).toHaveBeenCalledWith("company-4");
    });
  });

  describe("Action Buttons - Rejected Company", () => {
    it("should show View button for rejected company", () => {
      render(<CompanyRow {...defaultProps} company={mockRejectedCompany} />);

      expect(
        screen.getByRole("button", { name: /view|ดู/i })
      ).toBeInTheDocument();
    });
  });

  describe("Row Interaction", () => {
    it("should call onClick when row clicked", () => {
      const onClick = vi.fn();
      render(<CompanyRow {...defaultProps} onClick={onClick} />);

      const row = screen.getByTestId("company-row-company-1");
      fireEvent.click(row);

      expect(onClick).toHaveBeenCalled();
    });

    it("should not trigger onClick when action button clicked", () => {
      const onClick = vi.fn();
      render(<CompanyRow {...defaultProps} onClick={onClick} />);

      const approveButton = screen.getByRole("button", { name: /approve|อนุมัติ/i });
      fireEvent.click(approveButton);

      // onClick should not be called when clicking action buttons
      expect(onClick).not.toHaveBeenCalled();
    });
  });
});
