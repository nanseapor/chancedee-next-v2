import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";

import { ApproveModal } from "@/app/(platform)/platform/companies/[id]/_components/ApproveModal";

/**
 * Unit tests for ApproveModal component
 * Per ADM-R02 Company Management RIS §3.3.1 Approve Action
 *
 * Confirmation dialog for approving a pending company.
 *
 * Coverage Target: 90%+
 */

describe("ApproveModal", () => {
  const mockCompany = {
    id: "company-1",
    companyName: "บริษัททดสอบ จำกัด",
  };

  const defaultProps = {
    isOpen: true,
    company: mockCompany,
    onConfirm: vi.fn(),
    onCancel: vi.fn(),
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Rendering", () => {
    it("should render when open", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<ApproveModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show company name", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should show confirmation message", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(screen.getByText(/อนุมัติ|confirm/i)).toBeInTheDocument();
    });
  });

  describe("Buttons", () => {
    it("should show confirm button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /อนุมัติ|confirm|ยืนยัน/i })
      ).toBeInTheDocument();
    });

    it("should show cancel button", () => {
      render(<ApproveModal {...defaultProps} />);

      expect(
        screen.getByRole("button", { name: /ยกเลิก|cancel/i })
      ).toBeInTheDocument();
    });

    it("should call onConfirm when confirmed", () => {
      const onConfirm = vi.fn();
      render(<ApproveModal {...defaultProps} onConfirm={onConfirm} />);

      fireEvent.click(
        screen.getByRole("button", { name: /อนุมัติ|confirm|ยืนยัน/i })
      );

      expect(onConfirm).toHaveBeenCalled();
    });

    it("should call onCancel when cancelled", () => {
      const onCancel = vi.fn();
      render(<ApproveModal {...defaultProps} onCancel={onCancel} />);

      fireEvent.click(screen.getByRole("button", { name: /ยกเลิก|cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading state during submission", () => {
      render(<ApproveModal {...defaultProps} isLoading={true} />);

      const confirmButton = screen.getByRole("button", {
        name: /อนุมัติ|confirm|ยืนยัน|กำลัง/i,
      });
      expect(confirmButton).toBeDisabled();
    });

    it("should disable cancel button during loading", () => {
      render(<ApproveModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole("button", {
        name: /ยกเลิก|cancel/i,
      });
      expect(cancelButton).toBeDisabled();
    });
  });
});
