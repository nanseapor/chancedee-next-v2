import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

import { AdminSidebar } from "@/app/(platform)/platform/_components/AdminSidebar";

/**
 * Unit tests for AdminSidebar component
 * Per ADM-R00 Cross-Cutting RIS §2.2 Sidebar Specification
 *
 * Fixed sidebar with navigation items, pending counts, and branding.
 * Width: 280px
 *
 * Coverage Target: 90%+
 */

// Mock next/navigation
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: vi.fn(),
  }),
  usePathname: () => "/platform/companies",
}));

// Mock useAdminStats hook for pending counts
vi.mock("@/hooks/jobsmarket/admin/use-admin-stats", () => ({
  useAdminStats: vi.fn(),
}));

import { useAdminStats } from "@/hooks/jobsmarket/admin/use-admin-stats";

describe("AdminSidebar", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    (useAdminStats as ReturnType<typeof vi.fn>).mockReturnValue({
      pendingCompanies: 5,
      pendingCandidates: 0,
      pendingJobs: 3,
      isLoading: false,
    });
  });

  describe("Rendering", () => {
    it("should render sidebar with correct width", () => {
      render(<AdminSidebar />);

      const sidebar = screen.getByTestId("admin-sidebar");
      expect(sidebar).toBeInTheDocument();
      expect(sidebar).toHaveClass("w-[280px]");
    });

    it("should render ChanceDee logo and branding", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("admin-logo")).toBeInTheDocument();
      // ChanceDee text appears in branding section
      expect(screen.getByText("ChanceDee")).toBeInTheDocument();
      expect(screen.getByText("Platform Admin")).toBeInTheDocument();
    });

    it("should render navigation section with label", () => {
      render(<AdminSidebar />);

      expect(screen.getByText(/MANAGEMENT/i)).toBeInTheDocument();
    });
  });

  describe("Navigation Items", () => {
    it("should render Companies nav item with icon", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-companies")).toBeInTheDocument();
      expect(screen.getByText(/Companies/i)).toBeInTheDocument();
    });

    it("should render Candidates nav item with icon", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-candidates")).toBeInTheDocument();
      expect(screen.getByText(/Candidates/i)).toBeInTheDocument();
    });

    it("should render Jobs nav item with icon", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-jobs")).toBeInTheDocument();
      expect(screen.getByText(/Jobs/i)).toBeInTheDocument();
    });

    it("should render Settings nav item (staff only)", () => {
      render(<AdminSidebar />);

      expect(screen.getByTestId("nav-settings")).toBeInTheDocument();
      expect(screen.getByText(/Settings/i)).toBeInTheDocument();
    });
  });

  describe("Active State", () => {
    it("should highlight Companies when on /platform/companies", () => {
      render(<AdminSidebar />);

      const companiesNav = screen.getByTestId("nav-companies");
      expect(companiesNav).toHaveClass("bg-purple-50", "text-purple-700");
    });

    it("should not highlight other items when on /platform/companies", () => {
      render(<AdminSidebar />);

      const candidatesNav = screen.getByTestId("nav-candidates");
      const jobsNav = screen.getByTestId("nav-jobs");

      expect(candidatesNav).not.toHaveClass("bg-purple-50");
      expect(jobsNav).not.toHaveClass("bg-purple-50");
    });
  });

  describe("Pending Counts Badge", () => {
    it("should show pending count badge on Companies when > 0", () => {
      (useAdminStats as ReturnType<typeof vi.fn>).mockReturnValue({
        pendingCompanies: 5,
        pendingCandidates: 0,
        pendingJobs: 3,
        isLoading: false,
      });

      render(<AdminSidebar />);

      const badge = screen.getByTestId("companies-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("5");
    });

    it("should not show badge when pending count is 0", () => {
      (useAdminStats as ReturnType<typeof vi.fn>).mockReturnValue({
        pendingCompanies: 0,
        pendingCandidates: 0,
        pendingJobs: 0,
        isLoading: false,
      });

      render(<AdminSidebar />);

      expect(screen.queryByTestId("companies-badge")).not.toBeInTheDocument();
    });

    it("should show pending jobs badge when > 0", () => {
      (useAdminStats as ReturnType<typeof vi.fn>).mockReturnValue({
        pendingCompanies: 5,
        pendingCandidates: 0,
        pendingJobs: 3,
        isLoading: false,
      });

      render(<AdminSidebar />);

      const badge = screen.getByTestId("jobs-badge");
      expect(badge).toBeInTheDocument();
      expect(badge).toHaveTextContent("3");
    });

    it("should show skeleton badges while loading", () => {
      (useAdminStats as ReturnType<typeof vi.fn>).mockReturnValue({
        pendingCompanies: 0,
        pendingCandidates: 0,
        pendingJobs: 0,
        isLoading: true,
      });

      render(<AdminSidebar />);

      // Multiple skeleton badges are shown while loading (one per nav item)
      const skeletons = screen.getAllByTestId("badge-skeleton");
      expect(skeletons.length).toBeGreaterThan(0);
    });
  });

  describe("Navigation Links", () => {
    it("should link to /platform/companies", () => {
      render(<AdminSidebar />);

      const link = screen.getByTestId("nav-companies").closest("a");
      expect(link).toHaveAttribute("href", "/platform/companies");
    });

    it("should link to /platform/candidates", () => {
      render(<AdminSidebar />);

      const link = screen.getByTestId("nav-candidates").closest("a");
      expect(link).toHaveAttribute("href", "/platform/candidates");
    });

    it("should link to /platform/jobs", () => {
      render(<AdminSidebar />);

      const link = screen.getByTestId("nav-jobs").closest("a");
      expect(link).toHaveAttribute("href", "/platform/jobs");
    });
  });

  describe("Styling", () => {
    it("should have purple accent color for active state", () => {
      render(<AdminSidebar />);

      const activeItem = screen.getByTestId("nav-companies");
      expect(activeItem).toHaveClass("text-purple-700");
    });

    it("should have gray text for inactive items", () => {
      render(<AdminSidebar />);

      const inactiveItem = screen.getByTestId("nav-candidates");
      expect(inactiveItem).toHaveClass("text-gray-600");
    });

    it("should have hover effect on nav items", () => {
      render(<AdminSidebar />);

      const navItem = screen.getByTestId("nav-candidates");
      expect(navItem).toHaveClass("hover:bg-gray-100");
    });
  });
});
