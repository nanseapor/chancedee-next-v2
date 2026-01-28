/**
 * COMP-R02: RejectConfirmModal Component Tests
 *
 * Tests for the reject application confirmation modal:
 * - Confirmation message
 * - Confirm/cancel actions
 * - Loading state
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import "@testing-library/jest-dom";

import { RejectConfirmModal } from "@/app/jobsmarket/companies/[id]/dashboard/team/_components/RejectConfirmModal";

// Mock data
const mockPendingUser = {
  uid: "user-pending-789",
  email: "pending@test.com",
  displayName: "Pending User",
  requestTimestamp: Date.now(),
};

describe("RejectConfirmModal Component - COMP-R02", () => {
  const mockOnConfirm = vi.fn();
  const mockOnClose = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Modal Display", () => {
    it("should render modal when open", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(
        <RejectConfirmModal
          isOpen={false}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show modal title", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Title is in an h2 element with specific id
      const title = screen.queryByRole("heading", { name: /ปฏิเสธคำขอ/ });
      expect(title).toBeInTheDocument();
    });
  });

  describe("Confirmation Message", () => {
    it("should show applicant name in confirmation message", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByText(/Pending User/)).toBeInTheDocument();
    });

    it("should display rejection consequence", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      // Component shows "ผู้ใช้คนนี้จะไม่สามารถเข้าร่วมบริษัทได้"
      expect(screen.queryByText(/ไม่สามารถเข้าร่วมบริษัทได้/)).toBeInTheDocument();
    });
  });

  describe("Confirm Action", () => {
    it("should render confirm button", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("button", { name: /ยืนยัน/ })).toBeInTheDocument();
    });

    it("should call onConfirm when clicking confirm", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน/ });
      fireEvent.click(confirmButton);

      expect(mockOnConfirm).toHaveBeenCalledWith(mockPendingUser.uid);
    });

    it("should show loading state when confirming", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
          isLoading={true}
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน|กำลังปฏิเสธ/ });
      expect(confirmButton).toBeDisabled();
      expect(screen.queryByTestId("confirm-loading")).toBeInTheDocument();
    });

    it("should style confirm button as destructive", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
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
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
          onConfirm={mockOnConfirm}
          onClose={mockOnClose}
        />
      );

      expect(screen.queryByRole("button", { name: /ยกเลิก/ })).toBeInTheDocument();
    });

    it("should call onClose when clicking cancel", () => {
      render(
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
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
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
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
        <RejectConfirmModal
          isOpen={true}
          pendingUser={mockPendingUser}
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
