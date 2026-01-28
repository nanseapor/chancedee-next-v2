import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { RejectModal } from "@/app/(platform)/platform/companies/[id]/_components/RejectModal";

/**
 * Unit tests for RejectModal component
 * Per ADM-R02 Company Management RIS §3.3.2 Reject Action
 *
 * Form dialog for rejecting a pending company with a reason.
 *
 * Coverage Target: 90%+
 */

describe("RejectModal", () => {
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
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<RejectModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show company name", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText("บริษัททดสอบ จำกัด")).toBeInTheDocument();
    });

    it("should show reject message", () => {
      render(<RejectModal {...defaultProps} />);

      expect(screen.getByText(/ปฏิเสธ|reject/i)).toBeInTheDocument();
    });
  });

  describe("Reason Input", () => {
    it("should have reason textarea", () => {
      render(<RejectModal {...defaultProps} />);

      expect(
        screen.getByRole("textbox", { name: /เหตุผล|reason/i })
      ).toBeInTheDocument();
    });

    it("should mark reason as required", () => {
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      expect(textarea).toHaveAttribute("required");
    });

    it("should disable submit when reason is empty", () => {
      render(<RejectModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /ปฏิเสธ|confirm|ยืนยัน/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should enable submit when reason is entered", async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.type(textarea, "ข้อมูลไม่ครบถ้วน");

      const submitButton = screen.getByRole("button", {
        name: /ปฏิเสธ|confirm|ยืนยัน/i,
      });
      expect(submitButton).not.toBeDisabled();
    });
  });

  describe("Form Submission", () => {
    it("should call onConfirm with reason", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<RejectModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.type(textarea, "ข้อมูลไม่ถูกต้อง");

      const submitButton = screen.getByRole("button", {
        name: /ปฏิเสธ|confirm|ยืนยัน/i,
      });
      await user.click(submitButton);

      expect(onConfirm).toHaveBeenCalledWith("ข้อมูลไม่ถูกต้อง");
    });

    it("should call onCancel when cancelled", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<RejectModal {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /ยกเลิก|cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should show error if reason is empty on submit attempt", async () => {
      const user = userEvent.setup();
      render(<RejectModal {...defaultProps} />);

      // Try to force submit by enabling button somehow
      // This test validates the UI shows an error state
      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.click(textarea);
      await user.tab(); // blur

      // Should show some indication that reason is required
      expect(textarea).toBeInvalid?.() || expect(textarea).toHaveAttribute("aria-invalid", "true");
    });
  });

  describe("Loading State", () => {
    it("should show loading state during submission", () => {
      render(<RejectModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", {
        name: /ปฏิเสธ|confirm|ยืนยัน|กำลัง/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should disable cancel button during loading", () => {
      render(<RejectModal {...defaultProps} isLoading={true} />);

      const cancelButton = screen.getByRole("button", {
        name: /ยกเลิก|cancel/i,
      });
      expect(cancelButton).toBeDisabled();
    });

    it("should disable textarea during loading", () => {
      render(<RejectModal {...defaultProps} isLoading={true} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      expect(textarea).toBeDisabled();
    });
  });
});
