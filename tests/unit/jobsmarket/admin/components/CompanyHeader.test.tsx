import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { CompanyHeader } from "@/app/(platform)/platform/companies/[id]/_components/CompanyHeader";

/**
 * Unit tests for CompanyHeader component
 * Per ADM-R02 Company Management RIS §3.2.1 Company Header
 *
 * Header section of company detail page showing:
 * - Company logo and name
 * - Status badge
 * - Context-sensitive action buttons
 * - Back navigation
 *
 * Coverage Target: 90%+
 */

describe("CompanyHeader", () => {
  const mockPendingCompany = {
    id: "company-1",
    companyName: "บริษัททดสอบ จำกัด",
    companyNameEn: "Test Company Ltd.",
    email: "contact@testcompany.com",
    status: "pending" as const,
    profilePhoto: "/logo.png",
    createdAt: new Date("2025-01-01"),
  };

  const mockApprovedCompany = {
    ...mockPendingCompany,
    id: "company-2",
    status: "approved" as const,
  };

  const mockRejectedCompany = {
    ...mockPendingCompany,
    id: "company-3",
    status: "rejected" as const,
    profilePhoto: null,
  };

  const mockSuspendedCompany = {
    ...mockPendingCompany,
    id: "company-4",
    status: "suspended" as const,
    profilePhoto: null,
  };

  const defaultProps = {
    company: mockPendingCompany,
    onApprove: vi.fn(),
    onReject: vi.fn(),
    onSuspend: vi.fn(),
    onReactivate: vi.fn(),
    onBack: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Company Info Rendering", () => {
    it("should render company name", () => {
      render(<CompanyHeader {...defaultProps} />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should render English company name", () => {
      render(<CompanyHeader {...defaultProps} />);

      expect(screen.getByText("Test Company Ltd.")).toBeInTheDocument();
    });

    it("should render company logo when available", () => {
      render(<CompanyHeader {...defaultProps} />);

      const logo = screen.getByTestId("company-header-logo");
      expect(logo).toHaveAttribute("src", expect.stringContaining("logo.png"));
    });

    it("should render fallback avatar when no logo", () => {
      render(
        <CompanyHeader {...defaultProps} company={mockRejectedCompany} />
      );

      expect(screen.getByTestId("company-header-avatar-fallback")).toBeInTheDocument();
    });

    it("should render company email", () => {
      render(<CompanyHeader {...defaultProps} />);

      expect(screen.getByText("contact@testcompany.com")).toBeInTheDocument();
    });
  });

  describe("Status Badge", () => {
    it("should render pending status with amber color", () => {
      render(<CompanyHeader {...defaultProps} company={mockPendingCompany} />);

      const badge = screen.getByTestId("company-status-badge");
      expect(badge).toHaveTextContent(/pending|รอการอนุมัติ/i);
      expect(badge).toHaveClass("bg-amber-100", "text-amber-700");
    });

    it("should render approved status with green color", () => {
      render(<CompanyHeader {...defaultProps} company={mockApprovedCompany} />);

      const badge = screen.getByTestId("company-status-badge");
      expect(badge).toHaveTextContent(/approved|อนุมัติ/i);
      expect(badge).toHaveClass("bg-green-100", "text-green-700");
    });

    it("should render rejected status with red color", () => {
      render(<CompanyHeader {...defaultProps} company={mockRejectedCompany} />);

      const badge = screen.getByTestId("company-status-badge");
      expect(badge).toHaveTextContent(/rejected|ไม่อนุมัติ/i);
      expect(badge).toHaveClass("bg-rose-100", "text-rose-700");
    });

    it("should render suspended status with red color", () => {
      render(<CompanyHeader {...defaultProps} company={mockSuspendedCompany} />);

      const badge = screen.getByTestId("company-status-badge");
      expect(badge).toHaveTextContent(/suspended|ถูกระงับ/i);
      expect(badge).toHaveClass("bg-rose-100", "text-rose-700");
    });
  });

  describe("Action Buttons - Pending Company", () => {
    it("should show Approve button for pending company", () => {
      render(<CompanyHeader {...defaultProps} company={mockPendingCompany} />);

      expect(
        screen.getByRole("button", { name: /approve|อนุมัติ/i })
      ).toBeInTheDocument();
    });

    it("should show Reject button for pending company", () => {
      render(<CompanyHeader {...defaultProps} company={mockPendingCompany} />);

      expect(
        screen.getByRole("button", { name: /reject|ปฏิเสธ/i })
      ).toBeInTheDocument();
    });

    it("should call onApprove when Approve clicked", () => {
      const onApprove = vi.fn();
      render(
        <CompanyHeader {...defaultProps} company={mockPendingCompany} onApprove={onApprove} />
      );

      fireEvent.click(screen.getByRole("button", { name: /approve|อนุมัติ/i }));

      expect(onApprove).toHaveBeenCalledWith("company-1");
    });

    it("should call onReject when Reject clicked", () => {
      const onReject = vi.fn();
      render(
        <CompanyHeader {...defaultProps} company={mockPendingCompany} onReject={onReject} />
      );

      fireEvent.click(screen.getByRole("button", { name: /reject|ปฏิเสธ/i }));

      expect(onReject).toHaveBeenCalledWith("company-1");
    });
  });

  describe("Action Buttons - Approved Company", () => {
    it("should show Suspend button for approved company", () => {
      render(<CompanyHeader {...defaultProps} company={mockApprovedCompany} />);

      expect(
        screen.getByRole("button", { name: /suspend|ระงับ/i })
      ).toBeInTheDocument();
    });

    it("should not show Approve button for approved company", () => {
      render(<CompanyHeader {...defaultProps} company={mockApprovedCompany} />);

      expect(
        screen.queryByRole("button", { name: /approve|อนุมัติ/i })
      ).not.toBeInTheDocument();
    });

    it("should call onSuspend when Suspend clicked", () => {
      const onSuspend = vi.fn();
      render(
        <CompanyHeader {...defaultProps} company={mockApprovedCompany} onSuspend={onSuspend} />
      );

      fireEvent.click(screen.getByRole("button", { name: /suspend|ระงับ/i }));

      expect(onSuspend).toHaveBeenCalledWith("company-2");
    });
  });

  describe("Action Buttons - Suspended Company", () => {
    it("should show Reactivate button for suspended company", () => {
      render(<CompanyHeader {...defaultProps} company={mockSuspendedCompany} />);

      expect(
        screen.getByRole("button", { name: /reactivate|เปิดใช้งาน/i })
      ).toBeInTheDocument();
    });

    it("should call onReactivate when Reactivate clicked", () => {
      const onReactivate = vi.fn();
      render(
        <CompanyHeader
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
    it("should not show action buttons for rejected company", () => {
      render(<CompanyHeader {...defaultProps} company={mockRejectedCompany} />);

      expect(
        screen.queryByRole("button", { name: /approve|อนุมัติ/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /reject|ปฏิเสธ/i })
      ).not.toBeInTheDocument();
      expect(
        screen.queryByRole("button", { name: /suspend|ระงับ/i })
      ).not.toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should render back button", () => {
      render(<CompanyHeader {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /back|กลับ/i })
      ).toBeInTheDocument();
    });

    it("should call onBack when back button clicked", () => {
      const onBack = vi.fn();
      render(<CompanyHeader {...defaultProps} onBack={onBack} />);

      fireEvent.click(screen.getByRole("button", { name: /back|กลับ/i }));

      expect(onBack).toHaveBeenCalled();
    });
  });
});
