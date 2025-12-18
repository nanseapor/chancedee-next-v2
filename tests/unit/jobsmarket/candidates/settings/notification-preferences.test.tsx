import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationPreferencesSection } from "@/app/jobsmarket/candidates/[id]/settings/_components/NotificationPreferencesSection";

/**
 * Unit tests for CAND-R03 Notification Preferences Section
 * Tests email notifications toggle (push notifications deferred to Phase 2)
 */

describe("NotificationPreferencesSection", () => {
  const mockOnToggleEmail = vi.fn();

  const defaultProps = {
    emailJobRecommendations: true,
    onToggleEmail: mockOnToggleEmail,
    isSavingEmail: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render section title", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);
      expect(screen.getByText("การแจ้งเตือนงาน")).toBeInTheDocument();
      expect(screen.getByText("Job Notifications")).toBeInTheDocument();
    });

    it("should render email notifications toggle", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);
      expect(screen.getByText("รับงานแนะนำทางอีเมล")).toBeInTheDocument();
      expect(
        screen.getByText("Receive job recommendations via email")
      ).toBeInTheDocument();
    });

    it("should render email notifications description", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);
      expect(
        screen.getByText("รับอีเมลแนะนำงานที่ตรงกับโปรไฟล์ของคุณ")
      ).toBeInTheDocument();
    });

    it("should render push notifications section as coming soon", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);
      expect(screen.getByText("รับการแจ้งเตือนแบบ Push")).toBeInTheDocument();
      expect(screen.getByText("เร็วๆ นี้ (Coming soon)")).toBeInTheDocument();
    });

    it("should render email toggle in ON state when emailJobRecommendations is true", () => {
      render(<NotificationPreferencesSection {...defaultProps} emailJobRecommendations={true} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      expect(toggle).toBeChecked();
    });

    it("should render email toggle in OFF state when emailJobRecommendations is false", () => {
      render(<NotificationPreferencesSection {...defaultProps} emailJobRecommendations={false} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      expect(toggle).not.toBeChecked();
    });
  });

  describe("Email Toggle Interaction", () => {
    it("should call onToggleEmail with false when toggle is clicked (ON to OFF)", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesSection {...defaultProps} emailJobRecommendations={true} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      await user.click(toggle);

      expect(mockOnToggleEmail).toHaveBeenCalledWith(false);
      expect(mockOnToggleEmail).toHaveBeenCalledTimes(1);
    });

    it("should call onToggleEmail with true when toggle is clicked (OFF to ON)", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesSection {...defaultProps} emailJobRecommendations={false} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      await user.click(toggle);

      expect(mockOnToggleEmail).toHaveBeenCalledWith(true);
      expect(mockOnToggleEmail).toHaveBeenCalledTimes(1);
    });

    it("should disable email toggle when isSavingEmail is true", () => {
      render(<NotificationPreferencesSection {...defaultProps} isSavingEmail={true} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      expect(toggle).toBeDisabled();
    });

    it("should NOT call onToggleEmail when toggle is disabled", async () => {
      const user = userEvent.setup();
      render(<NotificationPreferencesSection {...defaultProps} isSavingEmail={true} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });

      await user.click(toggle);

      expect(mockOnToggleEmail).not.toHaveBeenCalled();
    });
  });

  describe("Email Loading State", () => {
    it("should show loading indicator when isSavingEmail is true", () => {
      render(<NotificationPreferencesSection {...defaultProps} isSavingEmail={true} />);

      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });

    it("should NOT show loading indicator when isSavingEmail is false", () => {
      render(<NotificationPreferencesSection {...defaultProps} isSavingEmail={false} />);

      const loader = document.querySelector(".animate-spin");
      expect(loader).not.toBeInTheDocument();
    });
  });

  describe("Push Notifications (Coming Soon)", () => {
    it("should render push toggle as disabled", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);

      const pushToggles = screen.getAllByRole("switch");
      const pushToggle = pushToggles.find((toggle) => toggle.getAttribute("id") !== "email-job-recommendations-toggle");

      expect(pushToggle).toBeDisabled();
    });

    it("should show coming soon badge", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);

      expect(screen.getByText("เร็วๆ นี้ (Coming soon)")).toBeInTheDocument();
    });

    it("should render push section with reduced opacity", () => {
      const { container } = render(<NotificationPreferencesSection {...defaultProps} />);

      // Push section has opacity-50
      const pushSection = container.querySelector(".opacity-50");
      expect(pushSection).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper label association for email toggle", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      expect(toggle).toHaveAttribute("id", "email-job-recommendations-toggle");

      const label = screen.getByText("รับงานแนะนำทางอีเมล");
      expect(label).toHaveAttribute("for", "email-job-recommendations-toggle");
    });

    it("should have cursor-pointer on email label", () => {
      render(<NotificationPreferencesSection {...defaultProps} />);

      const label = screen.getByText("รับงานแนะนำทางอีเมล");
      expect(label).toHaveClass("cursor-pointer");
    });
  });

  describe("Section Layout", () => {
    it("should have separator between sections", () => {
      const { container } = render(<NotificationPreferencesSection {...defaultProps} />);

      // Separator component renders a div
      const separators = container.querySelectorAll("[role='none']");
      expect(separators.length).toBeGreaterThan(0);
    });

    it("should render in a Card component", () => {
      const { container } = render(<NotificationPreferencesSection {...defaultProps} />);

      const card = container.querySelector(".p-6");
      expect(card).toBeInTheDocument();
    });
  });

  describe("State Transitions", () => {
    it("should handle multiple email toggle clicks", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <NotificationPreferencesSection {...defaultProps} emailJobRecommendations={true} />
      );

      const toggle = screen.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });

      // First click: ON to OFF
      await user.click(toggle);
      expect(mockOnToggleEmail).toHaveBeenNthCalledWith(1, false);

      // Simulate state update from parent
      rerender(<NotificationPreferencesSection {...defaultProps} emailJobRecommendations={false} />);

      // Second click: OFF to ON
      await user.click(toggle);
      expect(mockOnToggleEmail).toHaveBeenNthCalledWith(2, true);

      expect(mockOnToggleEmail).toHaveBeenCalledTimes(2);
    });
  });
});
