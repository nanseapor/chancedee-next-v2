import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Component doesn't exist yet (TDD RED phase)
import RecentActivityFeed from "@/app/jobsmarket/companies/[id]/dashboard/_components/RecentActivityFeed";

describe("RecentActivityFeed", () => {
  const mockActivities = [
    {
      id: "1",
      type: "application_received" as const,
      message: "ได้รับใบสมัครใหม่จาก สมชาย ใจดี",
      timestamp: Date.now() - 1000 * 60 * 5, // 5 minutes ago
    },
    {
      id: "2",
      type: "job_posted" as const,
      message: 'ประกาศงาน "นักพัฒนาซอฟต์แวร์" เผยแพร่แล้ว',
      timestamp: Date.now() - 1000 * 60 * 60, // 1 hour ago
    },
  ];

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<RecentActivityFeed activities={mockActivities} />);
      expect(screen.getByText("กิจกรรมล่าสุด")).toBeInTheDocument();
    });

    it("should render section title", () => {
      render(<RecentActivityFeed activities={mockActivities} />);
      expect(screen.getByText("กิจกรรมล่าสุด")).toBeInTheDocument();
    });

    it("should render all activity items", () => {
      render(<RecentActivityFeed activities={mockActivities} />);
      expect(screen.getByText(/สมชาย ใจดี/)).toBeInTheDocument();
      expect(screen.getByText(/นักพัฒนาซอฟต์แวร์/)).toBeInTheDocument();
    });

    it("should show relative time for each activity", () => {
      render(<RecentActivityFeed activities={mockActivities} />);
      expect(screen.getByText(/5 นาทีที่แล้ว/)).toBeInTheDocument();
      expect(screen.getByText(/1 ชั่วโมงที่แล้ว/)).toBeInTheDocument();
    });

    it("should render activity icons", () => {
      const { container } = render(
        <RecentActivityFeed activities={mockActivities} />
      );
      const icons = container.querySelectorAll("svg");
      expect(icons.length).toBeGreaterThan(0);
    });
  });

  describe("Empty State", () => {
    it("should show empty message when no activities", () => {
      render(<RecentActivityFeed activities={[]} />);
      expect(screen.getByText("ยังไม่มีกิจกรรม")).toBeInTheDocument();
    });

    it("should not render activity list when empty", () => {
      const { container } = render(<RecentActivityFeed activities={[]} />);
      const activityItems = container.querySelectorAll('[data-testid^="activity-item"]');
      expect(activityItems).toHaveLength(0);
    });
  });

  describe("Loading State", () => {
    it("should show skeleton when loading", () => {
      render(<RecentActivityFeed isLoading />);
      expect(screen.getByTestId("activity-skeleton")).toBeInTheDocument();
    });

    it("should not show activities when loading", () => {
      render(<RecentActivityFeed activities={mockActivities} isLoading />);
      expect(screen.queryByText(/สมชาย/)).not.toBeInTheDocument();
    });
  });

  describe("Activity Types", () => {
    it("should show correct icon for application_received", () => {
      const activities = [mockActivities[0]];
      const { container } = render(
        <RecentActivityFeed activities={activities} />
      );
      // Check for FileText icon or similar
      expect(container.querySelector("svg")).toBeInTheDocument();
    });

    it("should show correct icon for job_posted", () => {
      const activities = [mockActivities[1]];
      const { container } = render(
        <RecentActivityFeed activities={activities} />
      );
      // Check for Briefcase icon or similar
      expect(container.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Props", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <RecentActivityFeed
          activities={mockActivities}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should limit to max 5 items", () => {
      const manyActivities = Array.from({ length: 10 }, (_, i) => ({
        id: `${i}`,
        type: "job_posted" as const,
        message: `Activity ${i}`,
        timestamp: Date.now() - i * 1000,
      }));
      const { container } = render(
        <RecentActivityFeed activities={manyActivities} />
      );
      const activityItems = container.querySelectorAll('[data-testid^="activity-item"]');
      expect(activityItems.length).toBeLessThanOrEqual(5);
    });
  });
});
