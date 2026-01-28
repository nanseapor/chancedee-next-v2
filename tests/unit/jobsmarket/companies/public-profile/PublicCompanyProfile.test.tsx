/**
 * @fileoverview Tests for PublicCompanyProfile page component
 * @specification BLS-02 Discovery Stage - viewCompanyProfile
 * @section §3.6 Action: viewCompanyProfile
 *
 * Requirements tested:
 * - BLS-02.company.loading: Show skeleton while loading
 * - BLS-02.company.notfound: Show 404 when company not found
 * - BLS-02.company.pending: Show 404 when company is pending
 * - BLS-02.company.suspended: Show 404 when company is suspended
 * - BLS-02.company.sections: Display all company sections
 * - BLS-02.company.navigation: Navigation to job detail works
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

// Mock next/navigation
const mockPush = vi.fn();
const mockBack = vi.fn();
vi.mock("next/navigation", () => ({
  notFound: vi.fn(),
  useRouter: () => ({
    push: mockPush,
    back: mockBack,
  }),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    href,
    children,
    ...props
  }: {
    href: string;
    children: React.ReactNode;
  }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Create a mutable mock state that tests can modify
const mockHookState = {
  company: null as ReturnType<
    typeof import("@/hooks/jobsmarket/company/use-public-company-profile").usePublicCompanyProfile
  >["company"],
  jobs: [] as ReturnType<
    typeof import("@/hooks/jobsmarket/company/use-public-company-profile").usePublicCompanyProfile
  >["jobs"],
  isLoading: false,
  error: null as Error | null,
  mutate: vi.fn(),
};

// Mock the hook to use mutable state
vi.mock("@/hooks/jobsmarket/company/use-public-company-profile", () => ({
  usePublicCompanyProfile: () => mockHookState,
}));

// Import the component AFTER mocking
import { PublicCompanyProfileClient } from "@/app/jobsmarket/companies/[id]/_components/PublicCompanyProfileClient";

describe("PublicCompanyProfile Page", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    // Reset mock state
    mockHookState.company = null;
    mockHookState.jobs = [];
    mockHookState.isLoading = false;
    mockHookState.error = null;
  });

  afterEach(() => {
    cleanup();
  });

  const mockCompany = {
    uid: "company-123",
    companyName: "บริษัท ทดสอบ จำกัด",
    taxId: "1234567890123",
    profilePhoto: "https://example.com/logo.png",
    coverPhoto: "https://example.com/cover.png",
    industry: "เทคโนโลยี",
    companySize: "M" as const,
    status: "approved" as const,
    isActive: true,
    website: "https://example.com",
    overview: "<p>Company overview</p>",
    benefitsDetails: "<ul><li>Health insurance</li></ul>",
    mapLocation: "https://maps.google.com/?q=Bangkok",
  };

  const mockJobs = [
    {
      uid: "job-1",
      title: "Software Engineer",
      companyId: "company-123",
      companyName: "Test Company",
      companyLogo: "https://example.com/logo.png",
      minSalary: 50000,
      maxSalary: 80000,
      isNegotiable: false,
      workLocationText: "กรุงเทพมหานคร",
      employmentText: "Full-time",
      experienceText: "2-5 ปี",
      createdAt: Date.now(),
    },
  ];

  describe("Loading State", () => {
    /**
     * Requirement: BLS-02.company.loading
     * "Show skeleton while loading"
     */
    it("should show skeleton while loading company data", () => {
      mockHookState.isLoading = true;

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-profile-skeleton")).toBeInTheDocument();
    });
  });

  describe("Not Found States", () => {
    /**
     * Requirement: BLS-02.company.notfound
     * "Show 404 when company not found"
     */
    it("should show 404 when company does not exist", () => {
      mockHookState.company = null;
      mockHookState.isLoading = false;

      render(<PublicCompanyProfileClient companyId="nonexistent" />);

      expect(screen.getByTestId("company-not-found")).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-02.company.pending
     * "Show 404 when company is pending"
     */
    it("should show 404 when company status is pending", () => {
      mockHookState.company = { ...mockCompany, status: "pending" as const };
      mockHookState.isLoading = false;

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-not-found")).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-02.company.suspended
     * "Show 404 when company is suspended"
     */
    it("should show 404 when company status is suspended", () => {
      mockHookState.company = { ...mockCompany, status: "suspended" as const };
      mockHookState.isLoading = false;

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-not-found")).toBeInTheDocument();
    });

    it("should show 404 when company isActive is false", () => {
      mockHookState.company = { ...mockCompany, isActive: false };
      mockHookState.isLoading = false;

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-not-found")).toBeInTheDocument();
    });
  });

  describe("Success State - All Sections", () => {
    beforeEach(() => {
      mockHookState.company = mockCompany;
      mockHookState.jobs = mockJobs;
      mockHookState.isLoading = false;
      mockHookState.error = null;
    });

    /**
     * Requirement: BLS-02.company.sections
     * "Display all company sections"
     */
    it("should render company header section", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-header")).toBeInTheDocument();
    });

    it("should render company about section", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-about")).toBeInTheDocument();
    });

    it("should render open positions section", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-open-positions")).toBeInTheDocument();
    });

    it("should render contact section", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByTestId("company-contact")).toBeInTheDocument();
    });
  });

  describe("Navigation", () => {
    beforeEach(() => {
      mockHookState.company = mockCompany;
      mockHookState.jobs = mockJobs;
      mockHookState.isLoading = false;
    });

    /**
     * Requirement: BLS-02.company.navigation
     * "Navigation to job detail works"
     */
    it("should have job link to job detail page", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      // Look for links that go to job detail pages
      const jobLinks = screen.getAllByRole("link");
      const hasJobDetailLink = jobLinks.some(
        (link) =>
          link.getAttribute("href")?.includes("/jobsmarket/jobs/") ||
          link.getAttribute("href")?.includes("/jobs/")
      );
      expect(hasJobDetailLink).toBe(true);
    });

    it("should have back button", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      const backButton = screen.getByRole("button", { name: /กลับ|Back/i });
      expect(backButton).toBeInTheDocument();
    });
  });

  describe("Error Handling", () => {
    it("should show error state when fetch fails", () => {
      mockHookState.company = null;
      mockHookState.isLoading = false;
      mockHookState.error = new Error("Network error");

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(
        screen.getByText(/เกิดข้อผิดพลาด|Something went wrong/i)
      ).toBeInTheDocument();
    });

    it("should show retry button on error", () => {
      mockHookState.company = null;
      mockHookState.isLoading = false;
      mockHookState.error = new Error("Network error");

      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(
        screen.getByRole("button", { name: /ลองใหม่|Retry/i })
      ).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    beforeEach(() => {
      mockHookState.company = mockCompany;
      mockHookState.jobs = mockJobs;
      mockHookState.isLoading = false;
    });

    it("should have main landmark", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByRole("main")).toBeInTheDocument();
    });

    it("should have proper page title", () => {
      render(<PublicCompanyProfileClient companyId="company-123" />);

      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        mockCompany.companyName
      );
    });
  });
});
