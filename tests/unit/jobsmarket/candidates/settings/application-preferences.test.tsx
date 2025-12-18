import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ApplicationPreferencesSection } from "@/app/jobsmarket/candidates/[id]/settings/_components/ApplicationPreferencesSection";

/**
 * Unit tests for CAND-R03 Application Preferences Section
 * Tests cover letter toggle + textarea + debounced save
 */

describe("ApplicationPreferencesSection", () => {
  const mockOnToggle = vi.fn();
  const mockOnChange = vi.fn();

  const defaultProps = {
    autoAttachCoverLetter: false,
    coverLetterDraft: "",
    onToggleCoverLetter: mockOnToggle,
    onCoverLetterChange: mockOnChange,
    isSavingToggle: false,
    isSavingCoverLetter: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render section title", () => {
      render(<ApplicationPreferencesSection {...defaultProps} />);
      expect(screen.getByText("การตั้งค่าการสมัคร")).toBeInTheDocument();
      expect(screen.getByText("Application Settings")).toBeInTheDocument();
    });

    it("should render cover letter toggle", () => {
      render(<ApplicationPreferencesSection {...defaultProps} />);
      expect(screen.getByText("แนบจดหมายสมัครงานอัตโนมัติ")).toBeInTheDocument();
      expect(screen.getByText("Auto-attach cover letter")).toBeInTheDocument();
    });

    it("should NOT show textarea when toggle is OFF", () => {
      render(<ApplicationPreferencesSection {...defaultProps} />);
      expect(screen.queryByLabelText("จดหมายสมัครงานเริ่มต้น:")).not.toBeInTheDocument();
    });

    it("should show textarea when toggle is ON", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );
      expect(screen.getByLabelText("จดหมายสมัครงานเริ่มต้น:")).toBeInTheDocument();
    });
  });

  describe("Toggle Behavior", () => {
    it("should call onToggleCoverLetter when toggle is clicked", async () => {
      const user = userEvent.setup();
      render(<ApplicationPreferencesSection {...defaultProps} />);

      const toggle = screen.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      await user.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(true);
    });

    it("should call onToggleCoverLetter with false when toggle is ON and clicked", async () => {
      const user = userEvent.setup();
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );

      const toggle = screen.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      await user.click(toggle);

      expect(mockOnToggle).toHaveBeenCalledWith(false);
    });

    it("should disable toggle when isSavingToggle is true", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          isSavingToggle={true}
        />
      );

      const toggle = screen.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      expect(toggle).toBeDisabled();
    });

    it("should show loading indicator when isSavingToggle is true", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          isSavingToggle={true}
        />
      );

      // Loader2 component renders an SVG with animate-spin class
      const loader = document.querySelector(".animate-spin");
      expect(loader).toBeInTheDocument();
    });
  });

  describe("Textarea Behavior", () => {
    it("should display current cover letter draft", () => {
      const draftText = "This is my cover letter";
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          coverLetterDraft={draftText}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      expect(textarea).toHaveValue(draftText);
    });

    it("should call onCoverLetterChange when user types", async () => {
      const user = userEvent.setup();
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      await user.type(textarea, "Test");

      // Should be called for each character typed
      expect(mockOnChange).toHaveBeenCalled();
    });

    it("should show character count", () => {
      const draftText = "Hello World";
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          coverLetterDraft={draftText}
        />
      );

      expect(screen.getByText(`${draftText.length}/2000 ตัวอักษร`)).toBeInTheDocument();
    });

    it("should have maxLength of 2000 characters", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      expect(textarea).toHaveAttribute("maxLength", "2000");
    });

    it("should show saving indicator when isSavingCoverLetter is true", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          isSavingCoverLetter={true}
        />
      );

      expect(screen.getByText("กำลังบันทึก...")).toBeInTheDocument();
    });
  });

  describe("Conditional Rendering", () => {
    it("should show textarea only when toggle is enabled", () => {
      const { rerender } = render(
        <ApplicationPreferencesSection {...defaultProps} />
      );

      // Initially hidden
      expect(
        screen.queryByPlaceholderText("เขียนจดหมายสมัครงานเริ่มต้นของคุณ...")
      ).not.toBeInTheDocument();

      // Show when enabled
      rerender(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );
      expect(
        screen.getByPlaceholderText("เขียนจดหมายสมัครงานเริ่มต้นของคุณ...")
      ).toBeInTheDocument();

      // Hide when disabled again
      rerender(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={false}
        />
      );
      expect(
        screen.queryByPlaceholderText("เขียนจดหมายสมัครงานเริ่มต้นของคุณ...")
      ).not.toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    it("should have proper labels for toggle", () => {
      render(<ApplicationPreferencesSection {...defaultProps} />);

      const toggle = screen.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      expect(toggle).toHaveAttribute("id", "auto-attach-cover-letter-toggle");
    });

    it("should have proper labels for textarea", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );

      const label = screen.getByText("จดหมายสมัครงานเริ่มต้น:");
      expect(label).toHaveAttribute("for", "default-cover-letter");

      const textarea = screen.getByPlaceholderText(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      expect(textarea).toHaveAttribute("id", "default-cover-letter");
    });

    it("should have resize-y class on textarea", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
        />
      );

      const textarea = screen.getByPlaceholderText(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      expect(textarea).toHaveClass("resize-y");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty cover letter draft", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          coverLetterDraft=""
        />
      );

      expect(screen.getByText("0/2000 ตัวอักษร")).toBeInTheDocument();
    });

    it("should handle cover letter at max length", () => {
      const maxLengthText = "a".repeat(2000);
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          coverLetterDraft={maxLengthText}
        />
      );

      expect(screen.getByText("2000/2000 ตัวอักษร")).toBeInTheDocument();
    });

    it("should handle both loading states simultaneously", () => {
      render(
        <ApplicationPreferencesSection
          {...defaultProps}
          autoAttachCoverLetter={true}
          isSavingToggle={true}
          isSavingCoverLetter={true}
        />
      );

      // Should show both loading indicators
      expect(screen.getByText("กำลังบันทึก...")).toBeInTheDocument();
      const loaders = document.querySelectorAll(".animate-spin");
      expect(loaders.length).toBeGreaterThanOrEqual(2);
    });
  });
});
