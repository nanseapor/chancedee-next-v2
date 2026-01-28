/**
 * @fileoverview Tests for ScheduleInterviewModal component
 * @specification BLS-05 Interview Management
 * @section BLS-05-01
 *
 * Requirements tested:
 * - BLS-05-01.inputs: Required form fields (date, from, to, channel)
 * - BLS-05-01.validation.future: Date must be in future
 * - BLS-05-01.validation.time: Time range validation (to > from)
 * - BLS-05-01.validation.location: Location required when onsite
 * - BLS-05-01.validation.note: Note max 500 characters
 * - BLS-05-01.ui.loading: Show loading state during submission
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { ScheduleInterviewModal } from "@/app/jobsmarket/chat/[roomId]/_components/ScheduleInterviewModal";

describe("ScheduleInterviewModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    applicationId: "app-123",
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Form Fields", () => {
    /**
     * Requirement: BLS-05-01.inputs
     * "Modal should render all required form fields"
     */
    it("should render date picker field", () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      expect(screen.getByLabelText(/วันที่/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.inputs
     * "Modal should render time fields"
     */
    it("should render from and to time fields", () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      expect(screen.getByLabelText(/เวลาเริ่ม/i)).toBeInTheDocument();
      expect(screen.getByLabelText(/เวลาสิ้นสุด/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.inputs
     * "Modal should render channel selector"
     */
    it("should render channel selector with online and onsite options", () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      expect(screen.getByRole("radio", { name: /ออนไลน์/i })).toBeInTheDocument();
      expect(screen.getByRole("radio", { name: /ออนไซต์/i })).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.inputs.optional
     * "Modal should render optional note field"
     */
    it("should render optional note field", () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      expect(screen.getByLabelText(/หมายเหตุ/i)).toBeInTheDocument();
    });
  });

  describe("Date Validation", () => {
    /**
     * Requirement: BLS-05-01.validation.future
     * "Should show error if date is in the past"
     */
    it("should show error for past date", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const dateInput = screen.getByLabelText(/วันที่/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      // Use fireEvent.change for native date inputs
      fireEvent.change(dateInput, { target: { value: yesterday.toISOString().split("T")[0] } });

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/วันที่ต้องเป็นอนาคต/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-01.validation.future
     * "Should show error if date is today"
     */
    it("should show error for today's date", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const dateInput = screen.getByLabelText(/วันที่/i);
      // Format today as YYYY-MM-DD in local timezone to match component logic
      const today = new Date();
      const todayStr = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;

      // Use fireEvent.change for native date inputs
      fireEvent.change(dateInput, { target: { value: todayStr } });

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/วันที่ต้องเป็นอนาคต/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-01.validation.future
     * "Should accept future date"
     */
    it("should accept future date", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const dateInput = screen.getByLabelText(/วันที่/i);
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      // Use fireEvent.change for native date inputs
      fireEvent.change(dateInput, { target: { value: tomorrow.toISOString().split("T")[0] } });

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      fireEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.queryByText(/วันที่ต้องเป็นอนาคต/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Time Validation", () => {
    /**
     * Requirement: BLS-05-01.validation.time
     * "Should show error if end time is before start time"
     */
    it("should show error if end time is before start time", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const fromInput = screen.getByLabelText(/เวลาเริ่ม/i);
      const toInput = screen.getByLabelText(/เวลาสิ้นสุด/i);

      await userEvent.type(fromInput, "14:00");
      await userEvent.type(toInput, "10:00");

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-01.validation.time
     * "Should show error if end time equals start time"
     */
    it("should show error if end time equals start time", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const fromInput = screen.getByLabelText(/เวลาเริ่ม/i);
      const toInput = screen.getByLabelText(/เวลาสิ้นสุด/i);

      await userEvent.type(fromInput, "10:00");
      await userEvent.type(toInput, "10:00");

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม/i)).toBeInTheDocument();
      });
    });
  });

  describe("Location Validation", () => {
    /**
     * Requirement: BLS-05-01.validation.location
     * "Should require location when channel is onsite"
     */
    it("should show location field when onsite is selected", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const onsiteRadio = screen.getByRole("radio", { name: /ออนไซต์/i });
      await userEvent.click(onsiteRadio);

      expect(screen.getByLabelText(/สถานที่/i)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.validation.location
     * "Should show error if onsite but no location"
     */
    it("should show error if onsite selected but location empty", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const onsiteRadio = screen.getByRole("radio", { name: /ออนไซต์/i });
      await userEvent.click(onsiteRadio);

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/กรุณากรอกสถานที่/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-01.validation.meetingLink
     * "Should show meeting link field when online is selected"
     */
    it("should show meeting link field when online is selected", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const onlineRadio = screen.getByRole("radio", { name: /ออนไลน์/i });
      await userEvent.click(onlineRadio);

      expect(screen.getByLabelText(/ลิงก์ประชุม/i)).toBeInTheDocument();
    });
  });

  describe("Note Validation", () => {
    /**
     * Requirement: BLS-05-01.validation.note
     * "Note should have max 500 characters"
     */
    it("should show error if note exceeds 500 characters", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const noteInput = screen.getByLabelText(/หมายเหตุ/i);
      const longNote = "a".repeat(501);

      // Use fireEvent.change instead of userEvent.type for faster execution
      fireEvent.change(noteInput, { target: { value: longNote } });

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/หมายเหตุต้องไม่เกิน 500 ตัวอักษร/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-01.validation.note
     * "Should accept note with exactly 500 characters"
     */
    it("should accept note with exactly 500 characters", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const noteInput = screen.getByLabelText(/หมายเหตุ/i);
      const validNote = "a".repeat(500);

      // Use fireEvent.change instead of userEvent.type for faster execution
      fireEvent.change(noteInput, { target: { value: validNote } });

      await waitFor(() => {
        expect(screen.queryByText(/หมายเหตุต้องไม่เกิน 500 ตัวอักษร/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    /**
     * Requirement: BLS-05-01.submit
     * "Should call onSubmit with form data"
     */
    it("should call onSubmit with correct data when form is valid", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      // Fill in valid form data
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      const dateInput = screen.getByLabelText(/วันที่/i);
      await userEvent.type(dateInput, tomorrow.toISOString().split("T")[0]);

      const fromInput = screen.getByLabelText(/เวลาเริ่ม/i);
      await userEvent.type(fromInput, "10:00");

      const toInput = screen.getByLabelText(/เวลาสิ้นสุด/i);
      await userEvent.type(toInput, "11:00");

      const onlineRadio = screen.getByRole("radio", { name: /ออนไลน์/i });
      await userEvent.click(onlineRadio);

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            date: expect.any(String),
            from: "10:00",
            to: "11:00",
            channel: "online",
          })
        );
      });
    });

    /**
     * Requirement: BLS-05-01.ui.cancel
     * "Should call onClose when cancel button clicked"
     */
    it("should call onClose when cancel button clicked", async () => {
      render(<ScheduleInterviewModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /ยกเลิก/i });
      await userEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: BLS-05-01.ui.loading
     * "Should disable submit button when loading"
     */
    it("should disable submit button when isLoading is true", () => {
      render(<ScheduleInterviewModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      expect(submitButton).toBeDisabled();
    });

    /**
     * Requirement: BLS-05-01.ui.loading
     * "Should show loading indicator when loading"
     */
    it("should show loading indicator when isLoading is true", () => {
      render(<ScheduleInterviewModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("submit-loading-indicator")).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.ui.loading
     * "Should disable form fields when loading"
     */
    it("should disable all form fields when isLoading is true", () => {
      render(<ScheduleInterviewModal {...defaultProps} isLoading={true} />);

      expect(screen.getByLabelText(/วันที่/i)).toBeDisabled();
      expect(screen.getByLabelText(/เวลาเริ่ม/i)).toBeDisabled();
      expect(screen.getByLabelText(/เวลาสิ้นสุด/i)).toBeDisabled();
    });
  });

  describe("Modal Behavior", () => {
    /**
     * Requirement: BLS-05-01.ui.modal
     * "Should not render when isOpen is false"
     */
    it("should not render when isOpen is false", () => {
      render(<ScheduleInterviewModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByLabelText(/วันที่/i)).not.toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-01.ui.modal
     * "Should render when isOpen is true"
     */
    it("should render when isOpen is true", () => {
      render(<ScheduleInterviewModal {...defaultProps} isOpen={true} />);

      expect(screen.getByRole("dialog")).toBeInTheDocument();
    });
  });
});
