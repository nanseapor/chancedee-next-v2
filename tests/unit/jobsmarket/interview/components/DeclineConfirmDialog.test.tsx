/**
 * @fileoverview Tests for DeclineConfirmDialog component
 * @specification BLS-05 Interview Management
 * @section BLS-05-05
 *
 * Requirements tested:
 * - BLS-05-05.ui.confirm: Show confirmation dialog before decline
 * - BLS-05-05.ui.reason: Optional decline reason input
 * - BLS-05-05.ui.warning: Warn candidate about consequences
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { DeclineConfirmDialog } from "@/app/jobsmarket/chat/[roomId]/_components/DeclineConfirmDialog";

describe("DeclineConfirmDialog", () => {
  const mockOnClose = vi.fn();
  const mockOnConfirm = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onConfirm: mockOnConfirm,
    interviewDate: new Date(Date.now() + 86400000 * 7), // 7 days from now
    companyName: "Test Company Co., Ltd.",
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Dialog Content", () => {
    /**
     * Requirement: BLS-05-05.ui.confirm
     * "Should display confirmation message"
     */
    it("should display confirmation message", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/ยืนยันการปฏิเสธนัดสัมภาษณ์/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-05.ui.confirm
     * "Should display company name"
     */
    it("should display the company name", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/Test Company Co., Ltd./)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-05.ui.confirm
     * "Should display interview date being declined"
     */
    it("should display the interview date being declined", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      const formattedDate = defaultProps.interviewDate.toLocaleDateString("th-TH");
      expect(screen.getByText(new RegExp(formattedDate))).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-05.ui.warning
     * "Should warn about consequences"
     */
    it("should display warning about declining", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/บริษัทอาจเลือกไม่นัดหมายใหม่/i)).toBeInTheDocument();
    });
  });

  describe("Reason Input", () => {
    /**
     * Requirement: BLS-05-05.ui.reason
     * "Should have optional reason input"
     */
    it("should render optional reason input field", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      expect(screen.getByLabelText(/เหตุผลในการปฏิเสธ/i)).toBeInTheDocument();
      expect(screen.getByText(/ไม่บังคับ/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-05.ui.reason
     * "Reason helps company understand situation"
     */
    it("should display helper text for reason field", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      expect(screen.getByText(/การให้เหตุผลช่วยให้บริษัทเข้าใจสถานการณ์/i)).toBeInTheDocument();
    });
  });

  describe("Button Actions", () => {
    /**
     * Requirement: BLS-05-05.ui.destructive
     * "Confirm decline button should have warning styling"
     */
    it("should have warning/problem styling on confirm button", () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันปฏิเสธ/i });
      // Using rose/problem color for decline (different from cancel's red/destructive)
      expect(confirmButton).toHaveClass("bg-rose-600");
    });

    /**
     * Requirement: BLS-05-05.submit
     * "Should call onConfirm without reason when empty"
     */
    it("should call onConfirm without reason when reason is empty", async () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันปฏิเสธ/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith(undefined);
      });
    });

    /**
     * Requirement: BLS-05-05.submit
     * "Should call onConfirm with reason when provided"
     */
    it("should call onConfirm with reason when provided", async () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      const reasonInput = screen.getByLabelText(/เหตุผลในการปฏิเสธ/i);
      await userEvent.type(reasonInput, "I have another commitment on that day");

      const confirmButton = screen.getByRole("button", { name: /ยืนยันปฏิเสธ/i });
      await userEvent.click(confirmButton);

      await waitFor(() => {
        expect(mockOnConfirm).toHaveBeenCalledWith("I have another commitment on that day");
      });
    });

    /**
     * Requirement: BLS-05-05.ui.cancel
     * "Should call onClose when back button clicked"
     */
    it("should call onClose when back button clicked", async () => {
      render(<DeclineConfirmDialog {...defaultProps} />);

      const backButton = screen.getByRole("button", { name: /ย้อนกลับ/i });
      await userEvent.click(backButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: BLS-05-05.ui.loading
     * "Should disable confirm button when loading"
     */
    it("should disable confirm button when isLoading is true", () => {
      render(<DeclineConfirmDialog {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole("button", { name: /ยืนยันปฏิเสธ/i });
      expect(confirmButton).toBeDisabled();
    });

    /**
     * Requirement: BLS-05-05.ui.loading
     * "Should show loading indicator when loading"
     */
    it("should show loading indicator when isLoading is true", () => {
      render(<DeclineConfirmDialog {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("confirm-loading-indicator")).toBeInTheDocument();
    });
  });

  describe("Dialog Behavior", () => {
    /**
     * Requirement: BLS-05-05.ui.modal
     * "Should not render when closed"
     */
    it("should not render when isOpen is false", () => {
      render(<DeclineConfirmDialog {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-05.ui.modal
     * "Should render when open"
     */
    it("should render when isOpen is true", () => {
      render(<DeclineConfirmDialog {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("alertdialog")).toBeInTheDocument();
    });
  });
});
