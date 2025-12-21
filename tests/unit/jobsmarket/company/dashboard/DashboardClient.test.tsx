import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";

// Component doesn't exist yet (TDD RED phase)
import DashboardClient from "@/app/jobsmarket/companies/[id]/dashboard/_components/DashboardClient";

// Mock dependencies
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(() => ({
    replace: vi.fn(),
    push: vi.fn(),
  })),
}));

vi.mock("@/hooks/jobsmarket/company", () => ({
  useCompanyAuth: vi.fn(),
}));

vi.mock("swr", () => ({
  default: vi.fn(),
}));

// Mock child components
vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/_components/DashboardMetrics",
  () => ({
    default: () => <div data-testid="dashboard-metrics">Metrics</div>,
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/_components/QuickActions",
  () => ({
    default: () => <div data-testid="quick-actions">Actions</div>,
  })
);

vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/_components/RecentActivityFeed",
  () => ({
    default: () => <div data-testid="activity-feed">Activity</div>,
  })
);

import { useCompanyAuth } from "@/hooks/jobsmarket/company";
import useSWR from "swr";

const mockUseCompanyAuth = vi.mocked(useCompanyAuth);
const mockUseSWR = vi.mocked(useSWR);

describe("DashboardClient", () => {
  const companyId = "test-company-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Loading State", () => {
    it("should show skeleton when auth is loading", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: true,
        isReady: false,
        access: { state: "loading" },
        hasPermission: vi.fn(),
      } as any);
      mockUseSWR.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });

    it("should show skeleton when data is loading", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "admin",
        hasPermission: vi.fn(() => true),
      } as any);
      mockUseSWR.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("dashboard-skeleton")).toBeInTheDocument();
    });
  });

  describe("Authenticated & Ready", () => {
    beforeEach(() => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "admin",
        hasPermission: vi.fn(() => true),
      } as any);
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 10,
          activeJobs: 5,
          totalApplications: 50,
          newApplications: 12,
        },
        isLoading: false,
      } as any);
    });

    it("should render DashboardMetrics", () => {
      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("dashboard-metrics")).toBeInTheDocument();
    });

    it("should render QuickActions", () => {
      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    });

    it("should render RecentActivityFeed", () => {
      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("activity-feed")).toBeInTheDocument();
    });

    it("should show page title", () => {
      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByText("แดชบอร์ด")).toBeInTheDocument();
    });

    it("should show welcome message", () => {
      render(<DashboardClient companyId={companyId} />);
      expect(
        screen.getByText(/ยินดีต้อนรับ|ภาพรวม/)
      ).toBeInTheDocument();
    });
  });

  describe("Authorization", () => {
    it("should return null for unauthorized state", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: false,
        access: { state: "unauthorized" },
        hasPermission: vi.fn(),
      } as any);

      const { container } = render(<DashboardClient companyId={companyId} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should return null for not_member state", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: false,
        access: { state: "not_member" },
        hasPermission: vi.fn(),
      } as any);

      const { container } = render(<DashboardClient companyId={companyId} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should return null for pending_approval state", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: false,
        access: { state: "pending_approval", useMinimalShell: true },
        hasPermission: vi.fn(),
      } as any);

      const { container } = render(<DashboardClient companyId={companyId} />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should return null for rejected state", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: false,
        access: { state: "rejected" },
        hasPermission: vi.fn(),
      } as any);

      const { container } = render(<DashboardClient companyId={companyId} />);
      expect(container).toBeEmptyDOMElement();
    });
  });

  describe("Permission Handling", () => {
    it("should check post_jobs permission", () => {
      const mockHasPermission = vi.fn((p) => p === "post_jobs");
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "recruiter",
        hasPermission: mockHasPermission,
      } as any);
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          newApplications: 0,
        },
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(mockHasPermission).toHaveBeenCalledWith("post_jobs");
    });

    it("should handle viewer role (no post permission)", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "viewer",
        hasPermission: vi.fn((p) => p === "view_applications"),
      } as any);
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 5,
          activeJobs: 2,
          totalApplications: 20,
          newApplications: 3,
        },
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      // Should render but QuickActions will have disabled create job button
      expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    });
  });

  describe("Data Fetching", () => {
    beforeEach(() => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "admin",
        hasPermission: vi.fn(() => true),
      } as any);
    });

    it("should fetch dashboard metrics via SWR", () => {
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 10,
          activeJobs: 5,
          totalApplications: 50,
          newApplications: 12,
        },
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(mockUseSWR).toHaveBeenCalled();
    });

    it("should use correct SWR key with companyId", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        isLoading: true,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(mockUseSWR).toHaveBeenCalledWith(
        expect.stringContaining(companyId),
        expect.any(Function)
      );
    });

    it("should handle fetch errors gracefully", () => {
      mockUseSWR.mockReturnValue({
        data: undefined,
        error: new Error("Fetch failed"),
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      // Should show error message
      expect(screen.getByText(/เกิดข้อผิดพลาด/)).toBeInTheDocument();
    });

    it("should pass metrics data to DashboardMetrics", () => {
      const metricsData = {
        totalJobs: 15,
        activeJobs: 8,
        totalApplications: 100,
        newApplications: 25,
      };
      mockUseSWR.mockReturnValue({
        data: metricsData,
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("dashboard-metrics")).toBeInTheDocument();
    });

    it("should pass companyId to QuickActions", () => {
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 0,
          activeJobs: 0,
          totalApplications: 0,
          newApplications: 0,
        },
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      expect(screen.getByTestId("quick-actions")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    beforeEach(() => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "admin",
        hasPermission: vi.fn(() => true),
      } as any);
      mockUseSWR.mockReturnValue({
        data: {
          totalJobs: 10,
          activeJobs: 5,
          totalApplications: 50,
          newApplications: 12,
        },
        isLoading: false,
      } as any);
    });

    it("should have responsive padding", () => {
      const { container } = render(<DashboardClient companyId={companyId} />);
      // Check for p-4 or p-6 class
      expect(container.querySelector(".p-6")).toBeInTheDocument();
    });

    it("should render components in correct order", () => {
      render(<DashboardClient companyId={companyId} />);
      const metrics = screen.getByTestId("dashboard-metrics");
      const actions = screen.getByTestId("quick-actions");
      const activity = screen.getByTestId("activity-feed");

      // Metrics should appear before actions
      expect(
        metrics.compareDocumentPosition(actions)
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);

      // Actions should appear before activity
      expect(
        actions.compareDocumentPosition(activity)
      ).toBe(Node.DOCUMENT_POSITION_FOLLOWING);
    });

    it("should have max-width container", () => {
      const { container } = render(<DashboardClient companyId={companyId} />);
      expect(container.querySelector(".max-w-7xl")).toBeInTheDocument();
    });
  });

  describe("Edge Cases", () => {
    it("should handle missing companyId", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: false,
        access: { state: "unauthorized" },
        hasPermission: vi.fn(),
      } as any);

      const { container } = render(<DashboardClient companyId="" />);
      expect(container).toBeEmptyDOMElement();
    });

    it("should handle null metrics data", () => {
      mockUseCompanyAuth.mockReturnValue({
        isLoading: false,
        isReady: true,
        access: { state: "ready" },
        role: "admin",
        hasPermission: vi.fn(() => true),
      } as any);
      mockUseSWR.mockReturnValue({
        data: null,
        isLoading: false,
      } as any);

      render(<DashboardClient companyId={companyId} />);
      // Should show loading or empty state
      expect(
        screen.getByTestId("dashboard-skeleton") ||
          screen.getByText(/ไม่มีข้อมูล/)
      ).toBeInTheDocument();
    });
  });
});
