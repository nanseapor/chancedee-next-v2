/**
 * @fileoverview Tests for CompanyAbout component
 * @specification BLS-02 Discovery Stage - viewCompanyProfile
 * @section §3.6 Action: viewCompanyProfile
 *
 * Requirements tested:
 * - BLS-02.company.about: Display company description
 * - BLS-02.company.about.html: Render rich text safely
 * - BLS-02.company.about.empty: Show placeholder when empty
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Mock dompurify for browser environment
vi.mock("dompurify", () => ({
  default: {
    sanitize: (html: string, _config?: Record<string, unknown>) => {
      // Simple sanitization mock - removes script tags
      return html.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, "");
    },
  },
}));

describe("CompanyAbout", () => {
  describe("Description Display", () => {
    /**
     * Requirement: BLS-02.company.about
     * "Display company description"
     */
    it("should render company overview section", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="<p>We are a technology company</p>" />);

      expect(screen.getByTestId("company-about")).toBeInTheDocument();
    });

    it("should display section header", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="<p>Test overview</p>" />);

      expect(screen.getByRole("heading")).toHaveTextContent(/เกี่ยวกับบริษัท|About/i);
    });

    /**
     * Requirement: BLS-02.company.about.html
     * "Render rich text content safely"
     */
    it("should render HTML content safely", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      const htmlContent = "<p>We are a <strong>technology</strong> company.</p>";
      render(<CompanyAbout overview={htmlContent} />);

      // Should render the text content
      expect(screen.getByText(/technology/)).toBeInTheDocument();
    });

    it("should sanitize dangerous HTML", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      const dangerousHtml = '<p>Safe content</p><script>alert("xss")</script>';
      const { container } = render(<CompanyAbout overview={dangerousHtml} />);

      // Script tag should not be in the DOM
      expect(container.querySelector("script")).not.toBeInTheDocument();
      expect(screen.getByText("Safe content")).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    /**
     * Requirement: BLS-02.company.about.empty
     * "Show placeholder when no description"
     */
    it("should show placeholder when overview is empty", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="" />);

      expect(screen.getByText(/ยังไม่มีข้อมูล|No information/i)).toBeInTheDocument();
    });

    it("should show placeholder when overview is undefined", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview={undefined} />);

      expect(screen.getByText(/ยังไม่มีข้อมูล|No information/i)).toBeInTheDocument();
    });
  });

  describe("Benefits Section", () => {
    /**
     * Requirement: BLS-02.company.benefits
     * "Display company benefits if available"
     */
    it("should display benefits when provided", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(
        <CompanyAbout
          overview="<p>Overview</p>"
          benefits="<ul><li>Health insurance</li></ul>"
        />
      );

      expect(screen.getByText(/สวัสดิการ|Benefits/i)).toBeInTheDocument();
      expect(screen.getByText(/Health insurance/i)).toBeInTheDocument();
    });

    it("should not show benefits section when not provided", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="<p>Overview</p>" />);

      expect(screen.queryByText(/สวัสดิการ|Benefits/i)).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading for section", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="<p>Test</p>" />);

      expect(screen.getByRole("heading")).toBeInTheDocument();
    });

    it("should have proper test id", async () => {
      const { CompanyAbout } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyAbout"
      );

      render(<CompanyAbout overview="<p>Test</p>" />);

      expect(screen.getByTestId("company-about")).toBeInTheDocument();
    });
  });
});
