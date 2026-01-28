/**
 * COMP-R02: RemoveConfirmModal Component Tests
 *
 * Tests for the remove member confirmation modal:
 * - Confirmation message
 * - Confirm/cancel actions
 * - Loading state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RemoveConfirmModal } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/RemoveConfirmModal";

// Mock data
const mockMember = {
  uid: "user-member-456",
  email: "member@test.com",
  displayName: "Member User",
  role: "recruiter",
};

describe("RemoveConfirmModal Component - COMP-R02", () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Display", () => {
    it("should render modal when open", () => {
      render(
        <RemoveConfirmModal
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
        <RemoveConfirmModal
          isOpen={false}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show modal title", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/ลบสมาชิก/)).toBeInTheDocument();
    });
  });

  describe("Confirmation Message", () => {
    it("should show member name in confirmation message", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/Member User/)).toBeInTheDocument();
    });

    it("should display warning about consequences", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Component shows "สมาชิกคนนี้จะไม่สามารถเข้าถึงข้อมูลบริษัทได้อีกต่อไป"
      expect(screen.queryByText(/ไม่สามารถเข้าถึงข้อมูลบริษัทได้/)).toBeInTheDocument();
    });
  });

  describe("Confirm Action", () => {
    it("should render confirm button", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("button", { name: /ยืนยัน/ })).toBeInTheDocument();
    });

    it("should call onConfirm when clicking confirm", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน/ });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(mockMember.uid);
    });

    it("should show loading state when confirming", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน|กำลังลบ/ });
      expect(confirmButton).toBeDisabled();
      expect(screen.queryByTestId("confirm-loading")).toBeInTheDocument();
    });

    it("should style confirm button as destructive", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน/ });
      expect(confirmButton).toHaveClass("destructive");
    });
  });

  describe("Cancel Action", () => {
    it("should render cancel button", () => {
      render(
        <RemoveConfirmModal
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
        <RemoveConfirmModal
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

    it("should disable cancel while loading", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
          isLoading={true}
        />
      );

      const cancelButton = screen.getByRole("button", { name: /ยกเลิก/ });
      expect(cancelButton).toBeDisabled();
    });
  });

  describe("Accessibility", () => {
    it("should have proper ARIA attributes", () => {
      render(
        <RemoveConfirmModal
          isOpen={true}
          member={mockMember}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const dialog = screen.getByRole("dialog");
      expect(dialog).toHaveAttribute("aria-labelledby");
      expect(dialog).toHaveAttribute("aria-describedby");
    });
  });
});
