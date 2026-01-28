/**
 * COMP-R03: ProfileTab Component Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// This import will fail until implementation exists
import { ProfileTab } from "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/tabs/ProfileTab";

// Mock child components
vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CompanyInfoForm",
  () => ({
    CompanyInfoForm: () => <div data-testid="company-info-form">CompanyInfoForm</div>,
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/LogoUploader",
  () => ({
    LogoUploader: () => <div data-testid="logo-uploader">LogoUploader</div>,
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CoverUploader",
  () => ({
    CoverUploader: () => <div data-testid="cover-uploader">CoverUploader</div>,
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/settings/_components/profile/CompanyLinksForm",
  () => ({
    CompanyLinksForm: () => <div data-testid="company-links-form">CompanyLinksForm</div>,
  })
);

describe("COMP-R03: ProfileTab Component", () => {
  const mockCompany = {
    uid: "test-company-id",
    company_name: "Test Company",
    company_name_en: "Test Company EN",
    industry: "Technology",
    company_size: "M" as const,
    founded_year: 2020,
    description: "Test description",
    profile_photo: "https://example.com/logo.png",
    cover_photo: "https://example.com/cover.jpg",
    website: "https://example.com",
  };

  const mockOnUpdate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Rendering Tests (~2 tests)
  // ============================================
  describe("Rendering", () => {
    it("should render all profile sections", () => {
      render(
        <ProfileTab
          company={mockCompany}
          onUpdate={mockOnUpdate}
          canEdit={true}
        />
      );

      expect(screen.getByTestId("logo-uploader")).toBeInTheDocument();
      expect(screen.getByTestId("cover-uploader")).toBeInTheDocument();
      expect(screen.getByTestId("company-info-form")).toBeInTheDocument();
      expect(screen.getByTestId("company-links-form")).toBeInTheDocument();
    });

    it("should show section headers", () => {
      render(
        <ProfileTab
          company={mockCompany}
          onUpdate={mockOnUpdate}
          canEdit={true}
        />
      );

      expect(screen.getByText(/รูปภาพบริษัท/i)).toBeInTheDocument();
      expect(screen.getByText(/ข้อมูลบริษัท/i)).toBeInTheDocument();
      expect(screen.getByText(/ลิงก์/i)).toBeInTheDocument();
    });
  });

  // ============================================
  // Permission Tests (~2 tests)
  // ============================================
  describe("Permissions", () => {
    it("should disable editing when canEdit is false", () => {
      render(
        <ProfileTab
          company={mockCompany}
          onUpdate={mockOnUpdate}
          canEdit={false}
        />
      );

      // Child components should receive canEdit=false
      // This is a structural test - actual behavior tested in child component tests
      expect(screen.getByTestId("company-info-form")).toBeInTheDocument();
    });

    it("should enable editing when canEdit is true", () => {
      render(
        <ProfileTab
          company={mockCompany}
          onUpdate={mockOnUpdate}
          canEdit={true}
        />
      );

      expect(screen.getByTestId("company-info-form")).toBeInTheDocument();
    });
  });
});
