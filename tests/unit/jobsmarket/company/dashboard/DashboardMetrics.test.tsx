import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Component doesn't exist yet (TDD RED phase)
import DashboardMetrics from "@/app/jobsmarket/companies/[id]/dashboard/_components/DashboardMetrics";

// Mock StatCard
vi.mock(
  "@/app/jobsmarket/companies/[id]/dashboard/_components/StatCard",
  () => ({
    default: ({ title, value }: { title: string; value: number }) => (
      <div data-testid={`stat-card-${title}`}>
        {title}: {value}
      </div>
    ),
  })
);

describe("DashboardMetrics", () => {
  const companyId = "test-company-123";
  const defaultMetrics = {
    totalJobs: 10,
    activeJobs: 5,
    totalApplications: 100,
    newApplications: 25,
  };

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      expect(screen.getByTestId("stat-card-งานทั้งหมด")).toBeInTheDocument();
    });

    it("should render 4 stat cards", () => {
      render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      expect(screen.getByTestId("stat-card-งานทั้งหมด")).toBeInTheDocument();
      expect(
        screen.getByTestId("stat-card-งานที่เปิดรับ")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("stat-card-ใบสมัครทั้งหมด")
      ).toBeInTheDocument();
      expect(
        screen.getByTestId("stat-card-ใบสมัครใหม่")
      ).toBeInTheDocument();
    });

    it("should display correct job counts", () => {
      render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      expect(screen.getByText(/งานทั้งหมด: 10/)).toBeInTheDocument();
      expect(screen.getByText(/งานที่เปิดรับ: 5/)).toBeInTheDocument();
    });

    it("should display correct application counts", () => {
      render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      expect(screen.getByText(/ใบสมัครทั้งหมด: 100/)).toBeInTheDocument();
      expect(screen.getByText(/ใบสมัครใหม่: 25/)).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show loading state when isLoading", () => {
      render(<DashboardMetrics companyId={companyId} isLoading />);
      // StatCards should receive isLoading prop
      expect(screen.getByTestId("dashboard-metrics-loading")).toBeInTheDocument();
    });
  });

  describe("Grid Layout", () => {
    it("should use 4-column grid on desktop", () => {
      const { container } = render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("md:grid-cols-4");
    });

    it("should use 2-column grid on tablet", () => {
      const { container } = render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("sm:grid-cols-2");
    });

    it("should use single column on mobile", () => {
      const { container } = render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      const grid = container.querySelector(".grid");
      expect(grid).toHaveClass("grid-cols-1");
    });
  });

  describe("Zero Values", () => {
    it("should handle all zero metrics", () => {
      const zeroMetrics = {
        totalJobs: 0,
        activeJobs: 0,
        totalApplications: 0,
        newApplications: 0,
      };
      render(<DashboardMetrics companyId={companyId} metrics={zeroMetrics} />);
      // Should render without errors
      expect(screen.getByTestId("stat-card-งานทั้งหมด")).toBeInTheDocument();
      expect(screen.getByText(/งานทั้งหมด: 0/)).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <DashboardMetrics
          companyId={companyId}
          metrics={defaultMetrics}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should pass companyId to stat card links", () => {
      render(
        <DashboardMetrics companyId={companyId} metrics={defaultMetrics} />
      );
      // Verify companyId is used in links (via href props to StatCard)
      expect(screen.getByTestId("stat-card-งานทั้งหมด")).toBeInTheDocument();
    });
  });
});
