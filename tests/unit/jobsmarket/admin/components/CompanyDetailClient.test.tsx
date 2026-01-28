import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";

import { CompanyDetailClient } from "@/app/(platform)/platform/companies/[id]/_components/CompanyDetailClient";

/**
 * Unit tests for CompanyDetailClient component
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Main client component for company detail page that integrates:
 * - CompanyHeader
 * - CompanyOverview
 * - Loading/Error/404 states
 * - Action handlers
 *
 * Coverage Target: 90%+
 */

// Mock the hook
vi.mock("@/hooks/jobsmarket/admin/use-admin-company-detail", () => ({
  useAdminCompanyDetail: vi.fn(),
}));

// Mock useRouter
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    push: vi.fn(),
    back: vi.fn(),
  })),
}));

import { useAdminCompanyDetail } from "@/hooks/jobsmarket/admin/use-admin-company-detail";
import { useRouter } from "next/navigation";

describe("CompanyDetailClient", () => {
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

  const mockRouter = {
    push: vi.fn(),
    back: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();

    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);

    (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
      company: mockCompany,
      stats: mockStats,
      isLoading: false,
      error: null,
      notFound: false,
      refresh: vi.fn(),
      mutate: vi.fn(),
    });
  });

  describe("Data Integration", () => {
    it("should render CompanyHeader with company data", () => {
      render(<CompanyDetailClient companyId="company-1" />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should render CompanyOverview with company data", () => {
      render(<CompanyDetailClient companyId="company-1" />);

      // Email appears in both header and overview
      const emailElements = screen.getAllByText("contact@testcompany.com");
      expect(emailElements.length).toBeGreaterThanOrEqual(1);
      expect(screen.getByText("เทคโนโลยี")).toBeInTheDocument();
    });

    it("should pass company ID to hook", () => {
      render(<CompanyDetailClient companyId="company-1" />);

      expect(useAdminCompanyDetail).toHaveBeenCalledWith("company-1");
    });
  });

  describe("Loading State", () => {
    it("should show loading skeleton when loading", () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: true,
        error: null,
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="company-1" />);

      expect(screen.getByTestId("company-detail-skeleton")).toBeInTheDocument();
    });

    it("should not show company data while loading", () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: true,
        error: null,
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="company-1" />);

      expect(screen.queryByText("บริษัททดสอบ จำกัด")).not.toBeInTheDocument();
    });
  });

  describe("Error State", () => {
    it("should show error message on error", () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: false,
        error: new Error("Failed to fetch company"),
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="company-1" />);

      expect(screen.getByTestId("company-detail-error")).toBeInTheDocument();
      expect(screen.getByText(/error|ผิดพลาด/i)).toBeInTheDocument();
    });

    it("should show retry button on error", () => {
      const refresh = vi.fn();
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: false,
        error: new Error("Failed to fetch company"),
        notFound: false,
        refresh,
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="company-1" />);

      const retryButton = screen.getByRole("button", { name: /retry|ลองใหม่/i });
      fireEvent.click(retryButton);

      expect(refresh).toHaveBeenCalled();
    });
  });

  describe("404 State", () => {
    it("should show 404 message when company not found", () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: false,
        error: null,
        notFound: true,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="nonexistent" />);

      expect(screen.getByTestId("company-not-found")).toBeInTheDocument();
      expect(screen.getByText(/not found|ไม่พบ/i)).toBeInTheDocument();
    });

    it("should show back to list link on 404", () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: null,
        stats: null,
        isLoading: false,
        error: null,
        notFound: true,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="nonexistent" />);

      expect(
        screen.getByRole("link", { name: /back to list|กลับ/i })
      ).toBeInTheDocument();
    });
  });

  describe("Action Handlers", () => {
    it("should handle approve action", async () => {
      render(<CompanyDetailClient companyId="company-1" />);

      const approveButton = screen.getByRole("button", { name: /approve|อนุมัติ/i });
      fireEvent.click(approveButton);

      // Should trigger approve flow (may open modal in 3D)
      // For now, just verify the button exists and is clickable
      expect(approveButton).toBeInTheDocument();
    });

    it("should handle reject action", async () => {
      render(<CompanyDetailClient companyId="company-1" />);

      const rejectButton = screen.getByRole("button", { name: /reject|ปฏิเสธ/i });
      fireEvent.click(rejectButton);

      expect(rejectButton).toBeInTheDocument();
    });

    it("should handle suspend action for approved company", async () => {
      (useAdminCompanyDetail as ReturnType<typeof vi.fn>).mockReturnValue({
        company: { ...mockCompany, status: "approved" },
        stats: mockStats,
        isLoading: false,
        error: null,
        notFound: false,
        refresh: vi.fn(),
        mutate: vi.fn(),
      });

      render(<CompanyDetailClient companyId="company-1" />);

      const suspendButton = screen.getByRole("button", { name: /suspend|ระงับ/i });
      expect(suspendButton).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    it("should navigate back when back button clicked", () => {
      render(<CompanyDetailClient companyId="company-1" />);

      const backButton = screen.getByRole("button", { name: /back|กลับ/i });
      fireEvent.click(backButton);

      expect(mockRouter.back).toHaveBeenCalled();
    });
  });
});
