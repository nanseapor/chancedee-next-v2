/**
 * @fileoverview Tests for CompanyOpenPositions component
 * @specification BLS-02 Discovery Stage - viewCompanyProfile, viewCompanyJobs
 * @section §3.6 & §3.7
 *
 * Requirements tested:
 * - BLS-02.company.jobs.count: Display count of open positions
 * - BLS-02.company.jobs.cards: Display job cards for active jobs
 * - BLS-02.company.jobs.empty: Show empty state when no open positions
 * - BLS-02.company.jobs.link: Link to job detail page on card click
 * - BLS-02.company.jobs.viewall: Show "View All" when more than 6 jobs
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";
import { JobCardData } from "@/types/public-jobs";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({ href, children, ...props }: { href: string; children: React.ReactNode }) => (
    <a href={href} {...props}>
      {children}
    </a>
  ),
}));

// Mock next/image
vi.mock("next/image", () => ({
  default: ({ src, alt, ...props }: { src: string; alt: string }) => (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={src} alt={alt} {...props} />
  ),
}));

describe("CompanyOpenPositions", () => {
  const mockJobs: JobCardData[] = [
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
    {
      uid: "job-2",
      title: "Product Manager",
      companyId: "company-123",
      companyName: "Test Company",
      companyLogo: "https://example.com/logo.png",
      minSalary: 70000,
      maxSalary: 100000,
      isNegotiable: true,
      workLocationText: "กรุงเทพมหานคร",
      employmentText: "Full-time",
      experienceText: "3-5 ปี",
      createdAt: Date.now() - 86400000,
    },
  ];

  const manyJobs = Array.from({ length: 8 }, (_, i) => ({
    ...mockJobs[0],
    uid: `job-${i + 1}`,
    title: `Position ${i + 1}`,
  }));

  describe("Rendering", () => {
    /**
     * Requirement: BLS-02.company.jobs.cards
     * "Display job cards for active jobs"
     */
    it("should render open positions section", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getByTestId("company-open-positions")).toBeInTheDocument();
    });

    it("should display section header", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(
        screen.getByRole("heading", { name: /ตำแหน่งที่เปิดรับ|Open Positions/i })
      ).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-02.company.jobs.count
     * "Display count of open positions"
     */
    it("should display jobs count in header", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getByText(/2.*ตำแหน่ง/)).toBeInTheDocument();
    });
  });

  describe("Job Cards", () => {
    /**
     * Requirement: BLS-02.company.jobs.cards
     * "Display job cards for active jobs"
     */
    it("should display all job cards", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getByText("Software Engineer")).toBeInTheDocument();
      expect(screen.getByText("Product Manager")).toBeInTheDocument();
    });

    it("should display job salary", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getByText(/50,000/)).toBeInTheDocument();
    });

    it("should display job location", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getAllByText("กรุงเทพมหานคร").length).toBeGreaterThan(0);
    });

    /**
     * Requirement: BLS-02.company.jobs.link
     * "Link to job detail page on card click"
     */
    it("should link to job detail page", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      const links = screen.getAllByRole("link");
      const jobLink = links.find((link) =>
        link.getAttribute("href")?.includes("/jobsmarket/jobs/job-1")
      );
      expect(jobLink).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    /**
     * Requirement: BLS-02.company.jobs.empty
     * "Show empty state when no open positions"
     */
    it("should show empty state when no jobs", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={[]} companyId="company-123" />);

      expect(
        screen.getByText(/ยังไม่มีตำแหน่งเปิดรับ|No open positions/i)
      ).toBeInTheDocument();
    });

    it("should show illustration in empty state", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={[]} companyId="company-123" />);

      expect(screen.getByTestId("empty-jobs-illustration")).toBeInTheDocument();
    });
  });

  describe("View All Link", () => {
    /**
     * Requirement: BLS-02.company.jobs.viewall
     * "Show 'View All' link when more than 6 jobs"
     */
    it("should show View All when more than 6 jobs", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={manyJobs} companyId="company-123" />);

      expect(screen.getByRole("link", { name: /ดูทั้งหมด|View All/i })).toBeInTheDocument();
    });

    it("should not show View All when 6 or fewer jobs", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(
        screen.queryByRole("link", { name: /ดูทั้งหมด|View All/i })
      ).not.toBeInTheDocument();
    });

    it("should only show first 6 jobs by default", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={manyJobs} companyId="company-123" />);

      // Should only render 6 job cards
      const jobCards = screen.getAllByTestId("job-card");
      expect(jobCards.length).toBe(6);
    });

    it("should link to jobs page with company filter", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={manyJobs} companyId="company-123" />);

      const viewAllLink = screen.getByRole("link", { name: /ดูทั้งหมด|View All/i });
      expect(viewAllLink).toHaveAttribute(
        "href",
        expect.stringContaining("/jobsmarket/jobs?company=company-123")
      );
    });
  });

  describe("Loading State", () => {
    it("should show skeleton when loading", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(
        <CompanyOpenPositions jobs={[]} companyId="company-123" isLoading={true} />
      );

      expect(screen.getByTestId("jobs-skeleton")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper heading", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      // Check for a heading that contains "ตำแหน่งที่เปิดรับ"
      expect(screen.getByText(/ตำแหน่งที่เปิดรับ/)).toBeInTheDocument();
    });

    it("should have list role for job cards", async () => {
      const { CompanyOpenPositions } = await import(
        "@/app/jobsmarket/companies/[id]/_components/CompanyOpenPositions"
      );

      render(<CompanyOpenPositions jobs={mockJobs} companyId="company-123" />);

      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });
});
