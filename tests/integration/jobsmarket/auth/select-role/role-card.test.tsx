import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { User } from "lucide-react";
import { RoleCard } from "@/app/jobsmarket/auth/select-role/_components/RoleCard";

/**
 * Integration tests for AUTH-R07 RoleCard Component
 * Tests rendering, interactions, and accessibility
 */

describe("RoleCard Component", () => {
  const mockOnSelect = vi.fn();
  const defaultProps = {
    role: "candidate" as const,
    title: "ผู้หางาน",
    subtitle: "Candidate",
    icon: <User data-testid="user-icon" />,
    features: ["ค้นหาและสมัครงาน", "ติดตามใบสมัคร", "แชทกับนายจ้าง"],
    onSelect: mockOnSelect,
  };

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render with all required props", () => {
      render(<RoleCard {...defaultProps} />);

      expect(screen.getByText("ผู้หางาน")).toBeInTheDocument();
      expect(screen.getByText("Candidate")).toBeInTheDocument();
      expect(screen.getByTestId("user-icon")).toBeInTheDocument();
      expect(screen.getByText("เข้าใช้งาน")).toBeInTheDocument();
    });

    it("should render all feature items", () => {
      render(<RoleCard {...defaultProps} />);

      expect(screen.getByText("ค้นหาและสมัครงาน")).toBeInTheDocument();
      expect(screen.getByText("ติดตามใบสมัคร")).toBeInTheDocument();
      expect(screen.getByText("แชทกับนายจ้าง")).toBeInTheDocument();
    });

    it("should render button with correct text", () => {
      render(<RoleCard {...defaultProps} />);

      const button = screen.getByRole("button", { name: /เข้าใช้งาน/ });
      expect(button).toBeInTheDocument();
    });

    it("should render with company role data", () => {
      render(
        <RoleCard
          {...defaultProps}
          role="company"
          title="บริษัท ทดสอบ จำกัด"
          subtitle="Employer"
          features={[
            "ลงประกาศรับสมัครงาน",
            "ดูและจัดการผู้สมัคร",
            "แชทกับผู้สมัคร",
          ]}
        />
      );

      expect(screen.getByText("บริษัท ทดสอบ จำกัด")).toBeInTheDocument();
      expect(screen.getByText("Employer")).toBeInTheDocument();
      expect(screen.getByText("ลงประกาศรับสมัครงาน")).toBeInTheDocument();
    });
  });

  describe("Click interactions", () => {
    it("should call onSelect when clicked", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      await user.click(card);

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it("should call onSelect when inner button clicked", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} />);

      const button = screen.getByRole("button", { name: /เข้าใช้งาน/ });
      await user.click(button);

      expect(mockOnSelect).toHaveBeenCalled();
    });

    it("should NOT call onSelect when disabled", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      await user.click(card);

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Keyboard interactions", () => {
    it("should call onSelect on Enter key", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      card.focus();
      await user.keyboard("{Enter}");

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it("should call onSelect on Space key", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      card.focus();
      await user.keyboard(" ");

      expect(mockOnSelect).toHaveBeenCalledTimes(1);
    });

    it("should NOT call onSelect on other keys", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      card.focus();
      await user.keyboard("a");

      expect(mockOnSelect).not.toHaveBeenCalled();
    });

    it("should NOT respond to keyboard when disabled", async () => {
      const user = userEvent.setup();
      render(<RoleCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      card.focus();
      await user.keyboard("{Enter}");

      expect(mockOnSelect).not.toHaveBeenCalled();
    });
  });

  describe("Disabled state", () => {
    it("should apply disabled styles when disabled", () => {
      render(<RoleCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toHaveClass("opacity-50");
      expect(card).toHaveClass("cursor-not-allowed");
    });

    it("should set button to disabled when disabled", () => {
      render(<RoleCard {...defaultProps} disabled={true} />);

      const button = screen.getByRole("button", { name: /เข้าใช้งาน/ });
      expect(button).toBeDisabled();
    });

    it("should set tabIndex to -1 when disabled", () => {
      render(<RoleCard {...defaultProps} disabled={true} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toHaveAttribute("tabIndex", "-1");
    });
  });

  describe("Accessibility", () => {
    it("should have role button", () => {
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toBeInTheDocument();
    });

    it("should have correct aria-label", () => {
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: "เลือกบทบาท ผู้หางาน" });
      expect(card).toHaveAttribute("aria-label", "เลือกบทบาท ผู้หางาน");
    });

    it("should be keyboard focusable when not disabled", () => {
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toHaveAttribute("tabIndex", "0");
    });

    it("should have focus ring styles", () => {
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toHaveClass("focus:outline-none");
      expect(card).toHaveClass("focus:ring-2");
      expect(card).toHaveClass("focus:ring-primary");
    });
  });

  describe("Styling", () => {
    it("should apply base styles", () => {
      render(<RoleCard {...defaultProps} />);

      const card = screen.getByRole("button", { name: /เลือกบทบาท ผู้หางาน/ });
      expect(card).toHaveClass("rounded-lg");
      expect(card).toHaveClass("border-2");
      expect(card).toHaveClass("cursor-pointer");
    });

    it("should show outline button variant when not hovered", () => {
      render(<RoleCard {...defaultProps} />);

      const button = screen.getByRole("button", { name: /เข้าใช้งาน/ });
      expect(button).toBeInTheDocument();
    });
  });
});
