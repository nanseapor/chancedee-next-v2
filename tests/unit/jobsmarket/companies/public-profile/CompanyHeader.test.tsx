/**
 * @fileoverview Tests for CompanyHeader component
 * @specification BLS-02 Discovery Stage - viewCompanyProfile
 * @section §3.6 Action: viewCompanyProfile
 *
 * Requirements tested:
 * - BLS-02.company.header: Display company logo, name, industry
 * - BLS-02.company.verified: Show verified badge for approved companies
 * - BLS-02.company.size: Display company size
 * - BLS-02.company.fallback: Show initials when no logo
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("CompanyHeader", () => {
  const mockCompany = {
    uid: "company-123",
    companyName: "บริษัท ทดสอบ จำกัด",
    profilePhoto: "https://example.com/logo.png",
    coverPhoto: "https://example.com/cover.png",
    industry: "เทคโนโลยี",
    companySize: "M" as const,
    status: "approved" as const,
    isActive: true,
    website: "https://example.com",
    overview: "<p>Company overview</p>",
  };

  describe("Logo Display", () => {
    /**
     * Requirement: BLS-02.company.header
     * "Display company logo"
     */
    it("should display company logo when profilePhoto exists", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      const logo = screen.getByAltText(mockCompany.companyName);
      expect(logo).toBeInTheDocument();
      expect(logo).toHaveAttribute("src", mockCompany.profilePhoto);
    });

    /**
     * Requirement: BLS-02.company.fallback
     * "Show initials when no logo"
     */
    it("should display initials when no profilePhoto", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      const companyWithoutLogo = { ...mockCompany, profilePhoto: undefined };
      render(<CompanyHeader company={companyWithoutLogo} jobsCount={5} />);

      // Should show first 2 characters as initials
      expect(screen.getByText("บร")).toBeInTheDocument();
    });
  });

  describe("Company Name", () => {
    /**
     * Requirement: BLS-02.company.header
     * "Display company name"
     */
    it("should display company name as heading", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      const heading = screen.getByRole("heading", { level: 1 });
      expect(heading).toHaveTextContent(mockCompany.companyName);
    });
  });

  describe("Industry Badge", () => {
    /**
     * Requirement: BLS-02.company.header
     * "Display industry badge"
     */
    it("should display industry badge", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByText(mockCompany.industry)).toBeInTheDocument();
    });

    it("should not show industry if not provided", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      const companyWithoutIndustry = { ...mockCompany, industry: undefined };
      render(<CompanyHeader company={companyWithoutIndustry} jobsCount={5} />);

      expect(screen.queryByText("เทคโนโลยี")).not.toBeInTheDocument();
    });
  });

  describe("Company Size", () => {
    /**
     * Requirement: BLS-02.company.size
     * "Display company size"
     */
    it("should display Small for size S", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      const smallCompany = { ...mockCompany, companySize: "S" as const };
      render(<CompanyHeader company={smallCompany} jobsCount={5} />);

      expect(screen.getByText(/1-50/)).toBeInTheDocument();
    });

    it("should display Medium for size M", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByText(/51-200/)).toBeInTheDocument();
    });

    it("should display Large for size L", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      const largeCompany = { ...mockCompany, companySize: "L" as const };
      render(<CompanyHeader company={largeCompany} jobsCount={5} />);

      expect(screen.getByText(/200\+/)).toBeInTheDocument();
    });
  });

  describe("Verified Badge", () => {
    /**
     * Requirement: BLS-02.company.verified
     * "Show verified badge for approved companies"
     */
    it("should display verified badge when status is approved", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByTestId("verified-badge")).toBeInTheDocument();
    });
  });

  describe("Jobs Count", () => {
    /**
     * Requirement: BLS-02.company.jobs
     * "Display open positions count"
     */
    it("should display jobs count", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByText(/5.*ตำแหน่ง/)).toBeInTheDocument();
    });

    it("should handle zero jobs", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={0} />);

      expect(screen.getByText(/0.*ตำแหน่ง/)).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading hierarchy", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByRole("heading", { level: 1 })).toBeInTheDocument();
    });

    it("should have proper test id for component", async () => {
      const { CompanyHeader } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyHeader"
      );

      render(<CompanyHeader company={mockCompany} jobsCount={5} />);

      expect(screen.getByTestId("company-header")).toBeInTheDocument();
    });
  });
});
