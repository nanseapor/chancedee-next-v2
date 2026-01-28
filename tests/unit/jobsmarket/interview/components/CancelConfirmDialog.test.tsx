/**
 * @fileoverview Tests for CancelConfirmDialog component
 * @specification BLS-05 Interview Management
 * @section BLS-05-03
 *
 * Requirements tested:
 * - BLS-05-03.ui.confirm: Show confirmation dialog before cancel
 * - BLS-05-03.ui.reason: Optional reason input (max 500 chars)
 * - BLS-05-03.ui.destructive: Use destructive styling for confirm button
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor, fireEvent } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { CancelConfirmDialog } from "@/app/jobsmarket/chat/[roomId]/_components/CancelConfirmDialog";

describe("CancelConfirmDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    interviewDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dialog Content", () => {
    /**
     * Requirement: BLS-05-03.ui.confirm
     * "Should display confirmation message"
     */
    it("should display confirmation message", () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/ยืนยันการยกเลิกนัดสัมภาษณ์/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-03.ui.confirm
     * "Should display interview date being cancelled"
     */
    it("should display the interview date being cancelled", () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const formattedDate = defaultProps.interviewDate.toLocaleDateString("th-TH");
      expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-03.ui.confirm
     * "Should warn that action cannot be undone"
     */
    it("should display warning about irreversible action", () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/การดำเนินการนี้ไม่สามารถย้อนกลับได้/i)).toBeInTheDocument();
    });
  });

  describe("Reason Input", () => {
    /**
     * Requirement: BLS-05-03.ui.reason
     * "Should have optional reason input"
     */
    it("should render optional reason input field", () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      expect(screen.getByLabelText(/เหตุผลในการยกเลิก/i)).toBeInTheDocument();
      expect(screen.getByText(/ไม่บังคับ/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-03.validation.reason
     * "Reason max 500 characters"
     */
    it("should show error if reason exceeds 500 characters", async () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const reasonInput = screen.getByLabelText(/เหตุผลในการยกเลิก/i);
      const longReason = "a".repeat(501);

      // Use fireEvent.change instead of userEvent.type for faster execution
      fireEvent.change(reasonInput, { target: { value: longReason } });

      const confirmButton = screen.getByRole("button", { name: /ยืนยันยกเลิก/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(screen.getByText(/เหตุผลต้องไม่เกิน 500 ตัวอักษร/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-03.validation.reason
     * "Should accept reason with exactly 500 characters"
     */
    it("should accept reason with exactly 500 characters", async () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const reasonInput = screen.getByLabelText(/เหตุผลในการยกเลิก/i);
      const validReason = "a".repeat(500);

      // Use fireEvent.change instead of userEvent.type for faster execution
      fireEvent.change(reasonInput, { target: { value: validReason } });

      await waitFor(() => {
        expect(screen.queryByText(/เหตุผลต้องไม่เกิน 500 ตัวอักษร/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Button Actions", () => {
    /**
     * Requirement: BLS-05-03.ui.destructive
     * "Confirm button should have destructive styling"
     */
    it("should have destructive styling on confirm button", () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันยกเลิก/i });
      expect(confirmButton).toHaveClass("bg-red-600");
    });

    /**
     * Requirement: BLS-05-03.submit
     * "Should call onConfirm without reason when empty"
     */
    it("should call onConfirm without reason when reason is empty", async () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันยกเลิก/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(undefined);
      });
    });

    /**
     * Requirement: BLS-05-03.submit
     * "Should call onConfirm with reason when provided"
     */
    it("should call onConfirm with reason when provided", async () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const reasonInput = screen.getByLabelText(/เหตุผลในการยกเลิก/i);
      await userEvent.type(reasonInput, "Position has been filled");

      const confirmButton = screen.getByRole("button", { name: /ยืนยันยกเลิก/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith("Position has been filled");
      });
    });

    /**
     * Requirement: BLS-05-03.ui.cancel
     * "Should call onClose when back button clicked"
     */
    it("should call onClose when back button clicked", async () => {
      render(<CancelConfirmDialog {...defaultProps} />);

      const backButton = screen.getByRole("button", { name: /ย้อนกลับ/i });
      await userEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: BLS-05-03.ui.loading
     * "Should disable confirm button when loading"
     */
    it("should disable confirm button when isLoading is true", () => {
      render(<CancelConfirmDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันยกเลิก/i });
      expect(confirmButton).toBeDisabled();
    });

    /**
     * Requirement: BLS-05-03.ui.loading
     * "Should show loading indicator when loading"
     */
    it("should show loading indicator when isLoading is true", () => {
      render(<CancelConfirmDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("confirm-loading-indicator")).toBeInTheDocument();
    });
  });

  describe("Dialog Behavior", () => {
    /**
     * Requirement: BLS-05-03.ui.modal
     * "Should not render when closed"
     */
    it("should not render when isOpen is false", () => {
      render(<CancelConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-03.ui.modal
     * "Should render when open"
     */
    it("should render when isOpen is true", () => {
      render(<CancelConfirmDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
