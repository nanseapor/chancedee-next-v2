import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Component doesn't exist yet (TDD RED phase)
import QuickActions from "@/app/jobsmarket/companies/[id]/dashboard/_components/QuickActions";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
  }: {
    children: React.ReactNode;
    href: string;
  }) => <a href={href}>{children}</a>,
}));

describe("QuickActions", () => {
  const companyId = "test-company-123";

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      expect(screen.getByText("สร้างประกาศงาน")).toBeInTheDocument();
    });

    it("should render section title", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      expect(screen.getByText("ดำเนินการด่วน")).toBeInTheDocument();
    });

    it("should render 3 action buttons", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      expect(screen.getByText("สร้างประกาศงาน")).toBeInTheDocument();
      expect(screen.getByText("ดูใบสมัคร")).toBeInTheDocument();
      expect(screen.getByText("ค้นหาผู้สมัคร")).toBeInTheDocument();
    });

    it("should render all buttons in correct order", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const buttons = screen.getAllByRole("button");
      expect(buttons).toHaveLength(3);
      expect(buttons[0]).toHaveTextContent("สร้างประกาศงาน");
      expect(buttons[1]).toHaveTextContent("ดูใบสมัคร");
      expect(buttons[2]).toHaveTextContent("ค้นหาผู้สมัคร");
    });
  });

  describe("Create Job Button", () => {
    it("should link to job creation page", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const createJobLink = screen
        .getByText("สร้างประกาศงาน")
        .closest("a");
      expect(createJobLink).toHaveAttribute(
        "href",
        `/jobsmarket/companies/${companyId}/dashboard/jobs/new`
      );
    });

    it("should be enabled when canPostJobs is true", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("สร้างประกาศงาน").closest("button");
      expect(button).not.toBeDisabled();
    });

    it("should be disabled when canPostJobs is false", () => {
      render(<QuickActions companyId={companyId} canPostJobs={false} />);
      const button = screen.getByText("สร้างประกาศงาน").closest("button");
      expect(button).toBeDisabled();
    });

    it("should show permission message when disabled", () => {
      render(<QuickActions companyId={companyId} canPostJobs={false} />);
      expect(screen.getByText("ไม่มีสิทธิ์")).toBeInTheDocument();
    });

    it("should be primary button style", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("สร้างประกาศงาน").closest("button");
      // Primary button should have bg-primary class
      expect(button).toHaveClass("bg-primary");
    });

    it("should have Plus icon", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("สร้างประกาศงาน").closest("button");
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("View Applications Button", () => {
    it("should link to applications page", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const viewAppsLink = screen.getByText("ดูใบสมัคร").closest("a");
      expect(viewAppsLink).toHaveAttribute(
        "href",
        `/jobsmarket/companies/${companyId}/dashboard/applications`
      );
    });

    it("should be always enabled", () => {
      render(<QuickActions companyId={companyId} canPostJobs={false} />);
      const button = screen.getByText("ดูใบสมัคร").closest("button");
      expect(button).not.toBeDisabled();
    });

    it("should be secondary/outline style", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("ดูใบสมัคร").closest("button");
      expect(button).toHaveClass("border");
    });

    it("should have FileText icon", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("ดูใบสมัคร").closest("button");
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Browse Candidates Button", () => {
    it("should be disabled (feature not ready)", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("ค้นหาผู้สมัคร").closest("button");
      expect(button).toBeDisabled();
    });

    it("should show coming soon tooltip", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      expect(screen.getByText("เร็วๆ นี้")).toBeInTheDocument();
    });

    it("should be outline style", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("ค้นหาผู้สมัคร").closest("button");
      expect(button).toHaveClass("border");
    });

    it("should have Search icon", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const button = screen.getByText("ค้นหาผู้สมัคร").closest("button");
      expect(button?.querySelector("svg")).toBeInTheDocument();
    });
  });

  describe("Icons", () => {
    it("should render icon for each button", () => {
      render(<QuickActions companyId={companyId} canPostJobs={true} />);
      const buttons = screen.getAllByRole("button");
      buttons.forEach((button) => {
        expect(button.querySelector("svg")).toBeInTheDocument();
      });
    });
  });

  describe("Props", () => {
    it("should use companyId in links", () => {
      const customId = "custom-id-456";
      render(<QuickActions companyId={customId} canPostJobs={true} />);
      const createJobLink = screen
        .getByText("สร้างประกาศงาน")
        .closest("a");
      expect(createJobLink).toHaveAttribute(
        "href",
        `/jobsmarket/companies/${customId}/dashboard/jobs/new`
      );
    });

    it("should apply custom className", () => {
      const { container } = render(
        <QuickActions
          companyId={companyId}
          canPostJobs={true}
          className="custom-class"
        />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });
  });
});
