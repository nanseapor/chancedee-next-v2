import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { SuspendModal } from "@/app/(platform)/platform/companies/[id]/_components/SuspendModal";

/**
 * Unit tests for SuspendModal component
 * Per ADM-R02 Company Management RIS §3.3.3 Suspend Action
 *
 * Form dialog for suspending an approved company with reason and optional duration.
 *
 * Coverage Target: 90%+
 */

describe("SuspendModal", () => {
  const mockCompany = {
    id: "company-2",
    companyName: "บริษัทอนุมัติแล้ว จำกัด",
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
      render(<SuspendModal {...defaultProps} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });

    it("should not render when closed", () => {
      render(<SuspendModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });

    it("should show company name", () => {
      render(<SuspendModal {...defaultProps} />);

      expect(screen.getByText("บริษัทอนุมัติแล้ว จำกัด")).toBeInTheDocument();
    });

    it("should show suspend message", () => {
      render(<SuspendModal {...defaultProps} />);

      expect(screen.getByText(/ระงับ|suspend/i)).toBeInTheDocument();
    });
  });

  describe("Reason Input", () => {
    it("should have reason textarea", () => {
      render(<SuspendModal {...defaultProps} />);

      expect(
        screen.getByRole("textbox", { name: /เหตุผล|reason/i })
      ).toBeInTheDocument();
    });

    it("should mark reason as required", () => {
      render(<SuspendModal {...defaultProps} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      expect(textarea).toHaveAttribute("required");
    });

    it("should disable submit when reason is empty", () => {
      render(<SuspendModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /ระงับ|confirm|ยืนยัน/i,
      });
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Duration Selector", () => {
    it("should have duration selector", () => {
      render(<SuspendModal {...defaultProps} />);

      // Duration could be a select or radio buttons
      const durationElement =
        screen.queryByRole("combobox", { name: /ระยะเวลา|duration/i }) ||
        screen.queryByRole("radiogroup", { name: /ระยะเวลา|duration/i }) ||
        screen.queryByTestId("duration-selector");

      expect(durationElement).toBeInTheDocument();
    });

    it("should allow selecting duration", async () => {
      const user = userEvent.setup();
      render(<SuspendModal {...defaultProps} />);

      // Try to select a duration option
      const durationOptions = screen.getAllByRole("option") || screen.getAllByRole("radio");
      if (durationOptions.length > 0) {
        await user.click(durationOptions[0]);
      }
    });
  });

  describe("Form Submission", () => {
    it("should call onConfirm with reason and duration", async () => {
      const user = userEvent.setup();
      const onConfirm = vi.fn();
      render(<SuspendModal {...defaultProps} onConfirm={onConfirm} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      await user.type(textarea, "ละเมิดข้อกำหนด");

      const submitButton = screen.getByRole("button", {
        name: /ระงับ|confirm|ยืนยัน/i,
      });
      await user.click(submitButton);

      expect(onConfirm).toHaveBeenCalledWith(
        expect.stringContaining("ละเมิดข้อกำหนด"),
        expect.anything()
      );
    });

    it("should call onCancel when cancelled", async () => {
      const user = userEvent.setup();
      const onCancel = vi.fn();
      render(<SuspendModal {...defaultProps} onCancel={onCancel} />);

      await user.click(screen.getByRole("button", { name: /ยกเลิก|cancel/i }));

      expect(onCancel).toHaveBeenCalled();
    });
  });

  describe("Validation", () => {
    it("should validate reason is required", async () => {
      render(<SuspendModal {...defaultProps} />);

      const submitButton = screen.getByRole("button", {
        name: /ระงับ|confirm|ยืนยัน/i,
      });

      // Button should be disabled when reason is empty
      expect(submitButton).toBeDisabled();
    });
  });

  describe("Loading State", () => {
    it("should show loading state during submission", () => {
      render(<SuspendModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", {
        name: /ระงับ|confirm|ยืนยัน|กำลัง/i,
      });
      expect(submitButton).toBeDisabled();
    });

    it("should disable all inputs during loading", () => {
      render(<SuspendModal {...defaultProps} isLoading={true} />);

      const textarea = screen.getByRole("textbox", { name: /เหตุผล|reason/i });
      expect(textarea).toBeDisabled();
    });
  });
});
