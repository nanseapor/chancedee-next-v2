/**
 * COMP-R02: RolePickerModal Component Tests
 *
 * Tests for the role selection modal:
 * - Role options display
 * - Current role highlight
 * - Confirm action
 * - Loading state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RolePickerModal } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/RolePickerModal";

// Mock data
const mockMember = {
  uid: "user-member-456",
  email: "member@test.com",
  displayName: "Member User",
  role: "recruiter" as const,
};

describe("RolePickerModal Component - COMP-R02", () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Display", () => {
    it("should render modal when open", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(
        <RolePickerModal
          isOpen={false}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show modal title with member name", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Component shows "เลือกบทบาทใหม่ - {member.displayName}"
      expect(screen.queryByText(/เลือกบทบาทใหม่.*Member User/)).toBeInTheDocument();
    });
  });

  describe("Role Options", () => {
    it("should render all available roles", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Use data-testid to check for role options specifically
      expect(screen.queryByTestId("role-option-admin")).toBeInTheDocument();
      expect(screen.queryByTestId("role-option-hr_manager")).toBeInTheDocument();
      expect(screen.queryByTestId("role-option-recruiter")).toBeInTheDocument();
      expect(screen.queryByTestId("role-option-interviewer")).toBeInTheDocument();
      expect(screen.queryByTestId("role-option-viewer")).toBeInTheDocument();
    });

    it("should highlight current role with selected class", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const currentRoleOption = screen.getByTestId("role-option-recruiter");
      expect(currentRoleOption).toHaveClass("selected");
    });

    it("should show current role in description", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Component shows "บทบาทปัจจุบัน: {ROLE_LABELS[member.role]}"
      expect(screen.queryByText(/บทบาทปัจจุบัน.*ผู้สรรหาบุคลากร/)).toBeInTheDocument();
    });
  });

  describe("Role Selection", () => {
    it("should allow selecting a different role", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const adminOption = screen.getByTestId("role-option-admin");
      fireEvent.click(adminOption);

      expect(adminOption).toHaveClass("selected");
    });

    it("should enable confirm button when different role selected", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const adminOption = screen.getByTestId("role-option-admin");
      fireEvent.click(adminOption);

      const confirmButton = screen.getByRole("button", { name: /บันทึก/ });
      expect(confirmButton).not.toBeDisabled();
    });

    it("should disable confirm button when same role selected", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Current role is already selected
      const confirmButton = screen.getByRole("button", { name: /บันทึก/ });
      expect(confirmButton).toBeDisabled();
    });
  });

  describe("Confirm Action", () => {
    it("should call onConfirm with selected role when clicking confirm", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const adminOption = screen.getByTestId("role-option-admin");
      fireEvent.click(adminOption);

      const confirmButton = screen.getByRole("button", { name: /บันทึก/ });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(mockMember.uid, "admin");
    });

    it("should show loading state when confirming", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /บันทึก|กำลังบันทึก/ });
      expect(confirmButton).toBeDisabled();
      expect(screen.queryByTestId("confirm-loading")).toBeInTheDocument();
    });
  });

  describe("Cancel Action", () => {
    it("should render cancel button", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("button", { name: /ยกเลิก/ })).toBeInTheDocument();
    });

    it("should call onClose when clicking cancel", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /ยกเลิก/ });
      fireEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <RolePickerModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
    });
  });
});
