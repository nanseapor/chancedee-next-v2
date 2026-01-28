import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { CompanyDetailWithActions } from "@/app/(platform)/platform/companies/[id]/_components/CompanyDetailWithActions";

/**
 * Integration tests for Company Actions
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Tests the integration between CompanyHeader action buttons and
 * their respective modal dialogs.
 *
 * Coverage Target: 90%+
 */

// Mock the hooks
vi.mock("@/hooks/jobsmarket/admin/use-admin-company-detail", () => ({
  useAdminCompanyDetail: vi.fn(),
}));

vi.mock("@/hooks/jobsmarket/admin/use-company-actions", () => ({
  useCompanyActions: vi.fn(),
}));

vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}));

import { useAdminCompanyDetail } from "@/hooks/jobsmarket/admin/use-admin-company-detail";
import { useCompanyActions } from "@/hooks/jobsmarket/admin/use-company-actions";

describe("Company Actions Integration", () => {
  const mockPendingCompany = {
    id: "company-1",
    companyName: "บริษัททดสอบ จำกัด",
    companyNameEn: "Test Company Ltd.",
    email: "test@company.com",
    phone: "021234567",
    status: "pending" as const,
    profilePhoto: null,
    industry: "เทคโนโลยี",
    companySize: "M",
    shortDescription: null,
    overview: null,
    address: null,
    province: "กรุงเทพมหานคร",
    district: null,
    subDistrict: null,
    postCode: null,
    website: null,
    taxId: null,
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  const mockApprovedCompany = {
    ...mockPendingCompany,
    id: "company-2",
    status: "approved" as const,
  };

  const mockSuspendedCompany = {
    ...mockPendingCompany,
    id: "company-3",
    status: "suspended" as const,
  };

  const mockStats = {
    jobCount: 5,
    teamSize: 10,
    applicationCount: 25,
  };

  const mockActions = {
    approve: vi.fn().mockResolvedValue(undefined),
    reject: vi.fn().mockResolvedValue(undefined),
    suspend: vi.fn().mockResolvedValue(undefined),
    reactivate: vi.fn().mockResolvedValue(undefined),
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
      company: mockPendingCompany,
      stats: mockStats,
      isLoading: false,
      error: null,
      notFound: false,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });

    (useCompanyActions as ReturnType<typeof vi.fn>).mockReturnValue(mockActions);
  });

  describe("Approve Flow", () => {
    it("should open ApproveModal when Approve button clicked", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-1" />);

      const approveButton = screen.getByRole("button", { name: /อนุมัติ/i });
      await user.click(approveButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should close modal and call approve action on confirm", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-1" />);

      // Open modal
      await user.click(screen.getByRole("button", { name: /อนุมัติ/i }));

      // Confirm
      await user.click(
        screen.getByRole("button", { name: /ยืนยัน|confirm/i })
      );

      expect(mockActions.approve).toHaveBeenCalledWith("company-1");
    });

    it("should close modal on cancel without action", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-1" />);

      // Open modal
      await user.click(screen.getByRole("button", { name: /อนุมัติ/i }));

      // Cancel
      await user.click(screen.getByRole("button", { name: /ยกเลิก|cancel/i }));

      expect(mockActions.approve).not.toHaveBeenCalled();
      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });

  describe("Reject Flow", () => {
    it("should open RejectModal when Reject button clicked", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-1" />);

      const rejectButton = screen.getByRole("button", { name: /ปฏิเสธ/i });
      await user.click(rejectButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
      expect(
        screen.getByRole("textbox", { name: /เหตุผล|reason/i })
      ).toBeInTheDocument();
    });

    it("should call reject action with reason on confirm", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-1" />);

      // Open modal
      await user.click(screen.getByRole("button", { name: /ปฏิเสธ/i }));

      // Enter reason
      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.type(textarea, "ข้อมูลไม่ครบถ้วน");

      // Confirm
      await user.click(
        screen.getByRole("button", { name: /ปฏิเสธ|confirm|ยืนยัน/i })
      );

      expect(mockActions.reject).toHaveBeenCalledWith(
        "company-1",
        "ข้อมูลไม่ครบถ้วน"
      );
    });
  });

  describe("Suspend Flow", () => {
    beforeEach(() => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: mockApprovedCompany,
        stats: mockStats,
        isLoading: false,
        error: null,
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });
    });

    it("should open SuspendModal when Suspend button clicked", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-2" />);

      const suspendButton = screen.getByRole("button", { name: /ระงับ/i });
      await user.click(suspendButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should call suspend action with reason on confirm", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-2" />);

      // Open modal
      await user.click(screen.getByRole("button", { name: /ระงับ/i }));

      // Enter reason
      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.type(textarea, "ละเมิดข้อกำหนด");

      // Confirm
      await user.click(
        screen.getByRole("button", { name: /ระงับ|confirm|ยืนยัน/i })
      );

      expect(mockActions.suspend).toHaveBeenCalledWith(
        "company-2",
        expect.stringContaining("ละเมิดข้อกำหนด"),
        expect.any(Number) // duration
      );
    });
  });

  describe("Reactivate Flow", () => {
    beforeEach(() => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: mockSuspendedCompany,
        stats: mockStats,
        isLoading: false,
        error: null,
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });
    });

    it("should open ReactivateModal when Reactivate button clicked", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-3" />);

      const reactivateButton = screen.getByRole("button", {
        name: /เปิดใช้งาน/i,
      });
      await user.click(reactivateButton);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should call reactivate action on confirm", async () => {
      const user = userEvent.setup();
      render(<CompanyDetailWithActions companyId="company-3" />);

      // Open modal
      await user.click(screen.getByRole("button", { name: /เปิดใช้งาน/i }));

      // Confirm
      await user.click(
        screen.getByRole("button", { name: /เปิดใช้งาน|confirm|ยืนยัน/i })
      );

      expect(mockActions.reactivate).toHaveBeenCalledWith(
        "company-3",
        expect.anything()
      );
    });
  });
});
