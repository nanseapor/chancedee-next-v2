import { describe, it, expect } from "vitest";
import { render, screen } from "@testing-library/react";

import { CompanyOverview } from "@/app/(platform)/platform/companies/[id]/_components/CompanyOverview";

/**
 * Unit tests for CompanyOverview component
 * Per ADM-R02 Company Management RIS §3.2.2 Company Overview
 *
 * Overview section of company detail page showing:
 * - Contact information (email, phone)
 * - Address information
 * - Company profile (industry, size, description)
 * - Registration date
 * - Stats (job count, team size)
 *
 * Coverage Target: 90%+
 */

describe("CompanyOverview", () => {
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
    overview: "บริษัททดสอบเป็นบริษัทพัฒนาซอฟต์แวร์ที่มีประสบการณ์มากกว่า 10 ปี",
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

  const defaultProps = {
    company: mockCompany,
    stats: mockStats,
  };

  describe("Contact Information", () => {
    it("should render company email", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("contact@testcompany.com")).toBeInTheDocument();
    });

    it("should render company phone", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("021234567")).toBeInTheDocument();
    });

    it("should render website link", () => {
      render(<CompanyOverview {...defaultProps} />);

      const link = screen.getByRole("link", { name: /testcompany\.com/i });
      expect(link).toHaveAttribute("href", "https://testcompany.com");
    });

    it("should show placeholder when phone is missing", () => {
      render(
        <CompanyOverview
          {...defaultProps}
          company={{ ...mockCompany, phone: null }}
        />
      );

      // Phone field should show placeholder
      const phoneElements = screen.getAllByText(/ไม่ระบุ|N\/A|-/i);
      expect(phoneElements.length).toBeGreaterThan(0);
    });
  });

  describe("Address Information", () => {
    it("should render company address", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("123 ถนนสุขุมวิท")).toBeInTheDocument();
    });

    it("should render province", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("กรุงเทพมหานคร")).toBeInTheDocument();
    });

    it("should render district", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText(/วัฒนา/)).toBeInTheDocument();
    });

    it("should render post code", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("10110")).toBeInTheDocument();
    });
  });

  describe("Company Profile", () => {
    it("should render industry", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("เทคโนโลยี")).toBeInTheDocument();
    });

    it("should render company size", () => {
      render(<CompanyOverview {...defaultProps} />);

      // Should display readable size label (e.g., "Medium" or "M")
      expect(screen.getByTestId("company-size")).toBeInTheDocument();
    });

    it("should render short description", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("บริษัทซอฟต์แวร์ชั้นนำ")).toBeInTheDocument();
    });

    it("should render full overview", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(
        screen.getByText(/บริษัททดสอบเป็นบริษัทพัฒนาซอฟต์แวร์/)
      ).toBeInTheDocument();
    });

    it("should render tax ID", () => {
      render(<CompanyOverview {...defaultProps} />);

      expect(screen.getByText("1234567890123")).toBeInTheDocument();
    });
  });

  describe("Registration Date", () => {
    it("should render registration date", () => {
      render(<CompanyOverview {...defaultProps} />);

      // Date should be formatted
      const dateElement = screen.getByTestId("registration-date");
      expect(dateElement).toBeInTheDocument();
      expect(dateElement.textContent).toMatch(/2025|มกราคม|Jan/i);
    });
  });

  describe("Stats Display", () => {
    it("should render job count", () => {
      render(<CompanyOverview {...defaultProps} />);

      const jobCountElement = screen.getByTestId("job-count");
      expect(jobCountElement).toHaveTextContent("5");
    });

    it("should render team size", () => {
      render(<CompanyOverview {...defaultProps} />);

      const teamSizeElement = screen.getByTestId("team-size");
      expect(teamSizeElement).toHaveTextContent("10");
    });

    it("should render application count", () => {
      render(<CompanyOverview {...defaultProps} />);

      const appCountElement = screen.getByTestId("application-count");
      expect(appCountElement).toHaveTextContent("25");
    });

    it("should handle zero stats gracefully", () => {
      render(
        <CompanyOverview
          {...defaultProps}
          stats={{ jobCount: 0, teamSize: 0, applicationCount: 0 }}
        />
      );

      expect(screen.getByTestId("job-count")).toHaveTextContent("0");
      expect(screen.getByTestId("team-size")).toHaveTextContent("0");
    });
  });

  describe("Missing Fields", () => {
    it("should show placeholder for missing industry", () => {
      render(
        <CompanyOverview
          {...defaultProps}
          company={{ ...mockCompany, industry: null }}
        />
      );

      // Should show placeholder text
      expect(screen.getByTestId("industry-value").textContent).toMatch(
        /ไม่ระบุ|N\/A|-/i
      );
    });

    it("should show placeholder for missing website", () => {
      render(
        <CompanyOverview
          {...defaultProps}
          company={{ ...mockCompany, website: null }}
        />
      );

      expect(
        screen.queryByRole("link", { name: /testcompany/i })
      ).not.toBeInTheDocument();
    });

    it("should show placeholder for missing overview", () => {
      render(
        <CompanyOverview
          {...defaultProps}
          company={{ ...mockCompany, overview: null }}
        />
      );

      expect(screen.getByTestId("company-overview").textContent).toMatch(
        /ไม่มีข้อมูล|No description|-/i
      );
    });
  });
});
