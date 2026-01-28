import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { ReactivateModal } from "@/app/(platform)/platform/companies/[id]/_components/ReactivateModal";

/**
 * Unit tests for ReactivateModal component
 * Per ADM-R02 Company Management RIS §3.3.4 Reactivate Action
 *
 * Confirmation dialog for reactivating a suspended company with optional note.
 *
 * Coverage Target: 90%+
 */

describe("ReactivateModal", () => {
  const mockCompany = {
    id: "company-3",
    companyName: "บริษัทถูกระงับ จำกัด",
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
      render(<ReactivateModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<ReactivateModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show company name", () => {
      render(<ReactivateModal {...defaultProps} />);

      expect(screen.getByText("บริษัทถูกระงับ จำกัด")).toBeInTheDocument();
    });

    it("should show reactivate message", () => {
      render(<ReactivateModal {...defaultProps} />);

      expect(screen.getByText(/เปิดใช้งาน|reactivate/i)).toBeInTheDocument();
    });
  });

  describe("Note Input", () => {
    it("should have optional note textarea", () => {
      render(<ReactivateModal {...defaultProps} />);

      expect(
        screen.getByRole("textbox", { name: /หมายเหตุ|note/i })
      ).toBeInTheDocument();
    });

    it("should not require note", () => {
      render(<ReactivateModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox", { name: /หมายเหตุ|note/i });
      expect(textarea).not.toHaveAttribute("required");
    });

    it("should allow empty note submission", () => {
      render(<ReactivateModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /เปิดใช้งาน|confirm|ยืนยัน/i,
      });
      // Button should not be disabled for empty note
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("should call onConfirm with note", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ReactivateModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByRole("textbox", { name: /หมายเหตุ|note/i });
      await user.type(textarea, "แก้ไขปัญหาเรียบร้อยแล้ว");

      const submitButton = screen.getByRole("button", {
        name: /เปิดใช้งาน|confirm|ยืนยัน/i,
      });
      await user.click(submitButton);

      expect(onConfirm).toHaveBeenCalledWith("แก้ไขปัญหาเรียบร้อยแล้ว");
    });

    it("should call onConfirm without note", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<ReactivateModal {...defaultProps} onConfirm={onConfirm} />);

      const submitButton = screen.getByRole("button", {
        name: /เปิดใช้งาน|confirm|ยืนยัน/i,
      });
      await user.click(submitButton);

      expect(onConfirm).toHaveBeenCalledWith("");
    });

    it("should call onCancel when cancelled", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<ReactivateModal {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /ยกเลิก|cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Loading State", () => {
    it("should show loading state during submission", () => {
      render(<ReactivateModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", {
        name: /เปิดใช้งาน|confirm|ยืนยัน|กำลัง/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should disable cancel button during loading", () => {
      render(<ReactivateModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole("button", {
        name: /ยกเลิก|cancel/i,
      });
      expect(cancelButton).toBeDisabled();
    });

    it("should disable textarea during loading", () => {
      render(<ReactivateModal {...defaultProps} isLoading={true} />);

      const textarea = screen.getByRole("textbox", { name: /หมายเหตุ|note/i });
      expect(textarea).toBeDisabled();
    });
  });
});
