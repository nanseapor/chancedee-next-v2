/**
 * @fileoverview Tests for CompanyContact component
 * @specification BLS-02 Discovery Stage - viewCompanyProfile
 * @section §3.6 Action: viewCompanyProfile
 *
 * Requirements tested:
 * - BLS-02.company.contact.website: Display website link with external icon
 * - BLS-02.company.contact.location: Display company location
 * - BLS-02.company.contact.map: Open maps on location click
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

describe("CompanyContact", () => {
  const mockCompany = {
    website: "https://example.com",
    mapLocation: "https://maps.google.com/?q=Bangkok",
    travelMode: "BTS",
    travelStation: "สถานีอโศก",
    address: {
      address: "123 Sukhumvit Road",
      province: "กรุงเทพมหานคร",
      district: "วัฒนา",
      subDistrict: "คลองเตยเหนือ",
      postalCode: "10110",
    },
  };

  describe("Website Link", () => {
    /**
     * Requirement: BLS-02.company.contact.website
     * "Display website link with external icon"
     */
    it("should display website link", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      const websiteLink = screen.getByRole("link", { name: /example\.com/i });
      expect(websiteLink).toBeInTheDocument();
      expect(websiteLink).toHaveAttribute("href", "https://example.com");
    });

    it("should open website in new tab", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      const websiteLink = screen.getByRole("link", { name: /example\.com/i });
      expect(websiteLink).toHaveAttribute("target", "_blank");
      expect(websiteLink).toHaveAttribute("rel", expect.stringContaining("noopener"));
    });

    it("should show external link icon", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      expect(screen.getByTestId("external-link-icon")).toBeInTheDocument();
    });

    it("should not show website section when not provided", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      const companyWithoutWebsite = { ...mockCompany, website: undefined };
      render(<CompanyContact company={companyWithoutWebsite} />);

      expect(screen.queryByTestId("company-website")).not.toBeInTheDocument();
    });
  });

  describe("Location Display", () => {
    /**
     * Requirement: BLS-02.company.contact.location
     * "Display company location"
     */
    it("should display company address", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      // Address parts are joined with comma, so check with regex
      expect(screen.getByText(/123 Sukhumvit Road/)).toBeInTheDocument();
      expect(screen.getByText(/กรุงเทพมหานคร/)).toBeInTheDocument();
    });

    it("should display province and district", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      expect(screen.getByText(/วัฒนา/)).toBeInTheDocument();
    });

    it("should display travel station info when available", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      expect(screen.getByText(/BTS/)).toBeInTheDocument();
      expect(screen.getByText(/สถานีอโศก/)).toBeInTheDocument();
    });
  });

  describe("Map Integration", () => {
    /**
     * Requirement: BLS-02.company.contact.map
     * "Open maps on location click"
     */
    it("should link to Google Maps", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      const mapLink = screen.getByTestId("map-link");
      expect(mapLink).toHaveAttribute("href", mockCompany.mapLocation);
    });

    it("should open map in new tab", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      const mapLink = screen.getByTestId("map-link");
      expect(mapLink).toHaveAttribute("target", "_blank");
    });

    it("should show map icon", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      expect(screen.getByTestId("map-icon")).toBeInTheDocument();
    });

    it("should not show map link when mapLocation not provided", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      const companyWithoutMap = { ...mockCompany, mapLocation: undefined };
      render(<CompanyContact company={companyWithoutMap} />);

      expect(screen.queryByTestId("map-link")).not.toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    it("should handle company with no contact info", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      const emptyCompany = {};
      render(<CompanyContact company={emptyCompany} />);

      expect(screen.getByTestId("company-contact")).toBeInTheDocument();
      expect(
        screen.getByText(/ยังไม่มีข้อมูลติดต่อ|No contact information/i)
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper test id", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      expect(screen.getByTestId("company-contact")).toBeInTheDocument();
    });

    it("should have accessible link names", async () => {
      const { CompanyContact } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyContact"
      );

      render(<CompanyContact company={mockCompany} />);

      const links = screen.getAllByRole("link");
      links.forEach((link) => {
        expect(link).toHaveAccessibleName();
      });
    });
  });
});
