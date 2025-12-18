import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ProfileVisibilitySection } from "@/app/jobsmarket/candidates/[id]/settings/_components/ProfileVisibilitySection";

/**
 * Unit tests for CAND-R03 Profile Visibility Section
 * Tests is_searchable toggle (reuses CAND-R02 pattern)
 */

describe("ProfileVisibilitySection", () => {
  const mockOnToggle = vi.fn();

  const defaultProps = {
    isSearchable: false,
    onToggle: mockOnToggle,
    isSaving: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render section title", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);
      expect(screen.getByText("การมองเห็นโปรไฟล์")).toBeInTheDocument();
      expect(screen.getByText("Profile Visibility")).toBeInTheDocument();
    });

    it("should render toggle label", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);
      expect(
        screen.getByText("อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน")
      ).toBeInTheDocument();
      expect(
        screen.getByText("Allow companies to find my profile")
      ).toBeInTheDocument();
    });

    it("should render description", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);
      expect(
        screen.getByText("เมื่อเปิด บริษัทจะสามารถค้นหาและดูโปรไฟล์ของคุณได้")
      ).toBeInTheDocument();
    });

    it("should render toggle in OFF state when isSearchable is false", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      expect(toggle).not.toBeChecked();
    });

    it("should render toggle in ON state when isSearchable is true", () => {
      render(<ProfileVisibilitySection {...defaultProps} isSearchable={true} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      expect(toggle).toBeChecked();
    });
  });

  describe("Toggle Interaction", () => {
    it("should call onToggle with true when toggle is clicked (OFF to ON)", async () => {
      const user = userEvent.setup();
      render(<ProfileVisibilitySection {...defaultProps} isSearchable={false} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await user.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("should call onToggle with false when toggle is clicked (ON to OFF)", async () => {
      const user = userEvent.setup();
      render(<ProfileVisibilitySection {...defaultProps} isSearchable={true} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await user.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(false);
      expect(mockOnToggle).toHaveBeenCalledTimes(1);
    });

    it("should disable toggle when isSaving is true", () => {
      render(<ProfileVisibilitySection {...defaultProps} isSaving={true} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      expect(toggle).toBeDisabled();
    });

    it("should NOT call onToggle when toggle is disabled", async () => {
      const user = userEvent.setup();
      render(<ProfileVisibilitySection {...defaultProps} isSaving={true} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });

      // Attempt to click disabled toggle
      await user.click(toggle);

      expect(mockOnToggle).not.toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading indicator when isSaving is true", () => {
      render(<ProfileVisibilitySection {...defaultProps} isSaving={true} />);

      // Loader2 component renders an SVG with animate-spin class
      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });

    it("should NOT show loading indicator when isSaving is false", () => {
      render(<ProfileVisibilitySection {...defaultProps} isSaving={false} />);

      const loader = document.querySelector(".animate-spin");
      expect(loader).not.toBeInTheDocument();
    });

    it("should show loading indicator next to toggle", () => {
      render(<ProfileVisibilitySection {...defaultProps} isSaving={true} />);

      const toggle = screen.getByRole("switch");
      const loader = document.querySelector(".animate-spin");

      // Both should be in the same container
      const container = toggle.parentElement;
      expect(container).toContainElement(loader);
    });
  });

  describe("Accessibility", () => {
    it("should have proper label association", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);

      const toggle = screen.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      expect(toggle).toHaveAttribute("id", "profile-visibility-toggle");

      const label = screen.getByText("อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน");
      expect(label).toHaveAttribute("for", "profile-visibility-toggle");
    });

    it("should have cursor-pointer on label", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);

      const label = screen.getByText("อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน");
      expect(label).toHaveClass("cursor-pointer");
    });
  });

  describe("State Transitions", () => {
    it("should handle multiple toggles", async () => {
      const user = userEvent.setup();
      const { rerender } = render(
        <ProfileVisibilitySection {...defaultProps} isSearchable={false} />
      );

      const toggle = screen.getByRole("switch");

      // First toggle: OFF to ON
      await user.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(1, true);

      // Simulate state update from parent
      rerender(<ProfileVisibilitySection {...defaultProps} isSearchable={true} />);

      // Second toggle: ON to OFF
      await user.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(2, false);

      // Simulate state update from parent
      rerender(<ProfileVisibilitySection {...defaultProps} isSearchable={false} />);

      // Third toggle: OFF to ON again
      await user.click(toggle);
      expect(mockOnToggle).toHaveBeenNthCalledWith(3, true);

      expect(mockOnToggle).toHaveBeenCalledTimes(3);
    });
  });

  describe("Visual Styling", () => {
    it("should render in a Card component", () => {
      const { container } = render(<ProfileVisibilitySection {...defaultProps} />);

      // Card component adds specific classes
      const card = container.querySelector(".p-6");
      expect(card).toBeInTheDocument();
    });

    it("should use proper typography classes for title", () => {
      render(<ProfileVisibilitySection {...defaultProps} />);

      const title = screen.getByText("การมองเห็นโปรไฟล์");
      expect(title).toHaveClass("text-xl", "font-medium", "tracking-wide");
    });
  });
});
