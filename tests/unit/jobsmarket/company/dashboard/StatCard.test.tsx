import { describe, it, expect, vi } from "vitest";
import { render, screen } from "@testing-library/react";

// Component doesn't exist yet - this import will fail initially (TDD RED phase)
import StatCard from "@/app/jobsmarket/companies/[id]/dashboard/_components/StatCard";

// Mock next/link
vi.mock("next/link", () => ({
  default: ({
    children,
    href,
    className,
    ...props
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => <a href={href} className={className} {...props}>{children}</a>,
}));

describe("StatCard", () => {
  const defaultProps = {
    title: "งานทั้งหมด",
    value: 42,
    icon: () => <span data-testid="icon">Icon</span>,
    href: "/jobsmarket/companies/123/dashboard/jobs",
  };

  describe("Rendering", () => {
    it("should render without crashing", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText("งานทั้งหมด")).toBeInTheDocument();
    });

    it("should display the title", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText("งานทั้งหมด")).toBeInTheDocument();
    });

    it("should display the value", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByText("42")).toBeInTheDocument();
    });

    it("should display the icon", () => {
      render(<StatCard {...defaultProps} />);
      expect(screen.getByTestId("icon")).toBeInTheDocument();
    });

    it("should wrap content in a link when href provided", () => {
      render(<StatCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toHaveAttribute(
        "href",
        "/jobsmarket/companies/123/dashboard/jobs"
      );
    });
  });

  describe("Value Formatting", () => {
    it("should display zero correctly", () => {
      render(<StatCard {...defaultProps} value={0} />);
      expect(screen.getByText("0")).toBeInTheDocument();
    });

    it("should display large numbers with comma separator", () => {
      render(<StatCard {...defaultProps} value={1234} />);
      expect(screen.getByText("1,234")).toBeInTheDocument();
    });

    it("should display very large numbers with formatting", () => {
      render(<StatCard {...defaultProps} value={1000000} />);
      expect(screen.getByText("1,000,000")).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    it("should show skeleton when loading", () => {
      render(<StatCard {...defaultProps} isLoading />);
      expect(screen.getByTestId("stat-card-skeleton")).toBeInTheDocument();
    });

    it("should hide value when loading", () => {
      render(<StatCard {...defaultProps} isLoading />);
      expect(screen.queryByText("42")).not.toBeInTheDocument();
    });
  });

  describe("Styling", () => {
    it("should apply custom className", () => {
      const { container } = render(
        <StatCard {...defaultProps} className="custom-class" />
      );
      expect(container.firstChild).toHaveClass("custom-class");
    });

    it("should apply hover styles for clickable cards", () => {
      const { container } = render(<StatCard {...defaultProps} />);
      const link = screen.getByRole("link");
      const card = link.firstChild;
      // Verify hover transition class exists
      expect(card).toHaveClass("transition");
    });
  });

  describe("Without Link", () => {
    it("should render without link when href not provided", () => {
      render(
        <StatCard title="ทดสอบ" value={10} icon={defaultProps.icon} />
      );
      expect(screen.queryByRole("link")).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have accessible name", () => {
      render(<StatCard {...defaultProps} />);
      // Card title should be accessible
      expect(screen.getByText("งานทั้งหมด")).toBeInTheDocument();
    });

    it("should be keyboard navigable when clickable", () => {
      render(<StatCard {...defaultProps} />);
      const link = screen.getByRole("link");
      expect(link).toBeInTheDocument();
    });
  });
});
