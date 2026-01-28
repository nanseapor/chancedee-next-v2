/**
 * @fileoverview Tests for RescheduleInterviewModal component
 * @specification BLS-05 Interview Management
 * @section BLS-05-02
 *
 * Requirements tested:
 * - BLS-05-02.inputs: Form shows current interview details with editable fields
 * - BLS-05-02.validation.future: New date must be in future
 * - BLS-05-02.validation.time: Time range validation
 * - BLS-05-02.ui.display: Show old vs new comparison
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import type { RoomInterview } from "@/types/chat.types";
import { RescheduleInterviewModal } from "@/app/jobsmarket/chat/[roomId]/_components/RescheduleInterviewModal";

describe("RescheduleInterviewModal", () => {
  const mockOnClose = vi.fn();
  const mockOnSubmit = vi.fn();

  const mockInterview: RoomInterview = {
    uid: "interview-123",
    appointment: Date.now() + 86400000 * 3, // 3 days from now
    channel: "online",
    status: "pending",
    isCancel: false,
    isAccepted: false,
    from: "10:00",
    to: "11:00",
    location: null,
    meetingLink: "https://meet.google.com/abc",
    candidateName: "Test Candidate",
    companyName: "Test Company",
    jobId: "job-123",
    applicationId: "app-123",
    candidateId: "candidate-123",
    companyId: "company-123",
    note: null,
  };

  const defaultProps = {
    isOpen: true,
    onClose: mockOnClose,
    onSubmit: mockOnSubmit,
    interview: mockInterview,
    isLoading: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Current Interview Display", () => {
    /**
     * Requirement: BLS-05-02.ui.display
     * "Should display current interview date"
     */
    it("should display current interview date", () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const currentDate = new Date(mockInterview.appointment).toLocaleDateString("th-TH");
      expect(screen.getByText(new RegExp(currentDate))).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-02.ui.display
     * "Should display current interview time"
     */
    it("should display current interview time range", () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      expect(screen.getByText(/10:00 - 11:00/)).toBeInTheDocument();
    });

    /**
     * Requirement: BLS-05-02.ui.display
     * "Should display current channel type"
     */
    it("should display current channel type", () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      expect(screen.getByText(/ออนไลน์/i)).toBeInTheDocument();
    });
  });

  describe("Form Pre-population", () => {
    /**
     * Requirement: BLS-05-02.inputs
     * "Form should pre-populate with current time values"
     */
    it("should pre-populate from time with current value", () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const fromInput = screen.getByLabelText(/เวลาเริ่มใหม่/i);
      expect(fromInput).toHaveValue("10:00");
    });

    /**
     * Requirement: BLS-05-02.inputs
     * "Form should pre-populate with current time values"
     */
    it("should pre-populate to time with current value", () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const toInput = screen.getByLabelText(/เวลาสิ้นสุดใหม่/i);
      expect(toInput).toHaveValue("11:00");
    });
  });

  describe("Date Validation", () => {
    /**
     * Requirement: BLS-05-02.validation.future
     * "New date must be in future"
     */
    it("should show error for past date", async () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const dateInput = screen.getByLabelText(/วันที่ใหม่/i);
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, yesterday.toISOString().split("T")[0]);

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/วันที่ต้องเป็นอนาคต/i)).toBeInTheDocument();
      });
    });

    /**
     * Requirement: BLS-05-02.validation.future
     * "Should accept future date"
     */
    it("should accept future date", async () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const dateInput = screen.getByLabelText(/วันที่ใหม่/i);
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, futureDate.toISOString().split("T")[0]);

      await waitFor(() => {
        expect(screen.queryByText(/วันที่ต้องเป็นอนาคต/i)).not.toBeInTheDocument();
      });
    });
  });

  describe("Time Validation", () => {
    /**
     * Requirement: BLS-05-02.validation.time
     * "End time must be after start time"
     */
    it("should show error if end time is before start time", async () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const fromInput = screen.getByLabelText(/เวลาเริ่มใหม่/i);
      const toInput = screen.getByLabelText(/เวลาสิ้นสุดใหม่/i);

      await userEvent.clear(fromInput);
      await userEvent.type(fromInput, "16:00");
      await userEvent.clear(toInput);
      await userEvent.type(toInput, "10:00");

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(screen.getByText(/เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม/i)).toBeInTheDocument();
      });
    });
  });

  describe("Form Submission", () => {
    /**
     * Requirement: BLS-05-02.submit
     * "Should call onSubmit with new values"
     */
    it("should call onSubmit with new date and time values", async () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      const dateInput = screen.getByLabelText(/วันที่ใหม่/i);
      await userEvent.clear(dateInput);
      await userEvent.type(dateInput, futureDate.toISOString().split("T")[0]);

      const fromInput = screen.getByLabelText(/เวลาเริ่มใหม่/i);
      await userEvent.clear(fromInput);
      await userEvent.type(fromInput, "14:00");

      const toInput = screen.getByLabelText(/เวลาสิ้นสุดใหม่/i);
      await userEvent.clear(toInput);
      await userEvent.type(toInput, "15:00");

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      await userEvent.click(submitButton);

      await waitFor(() => {
        expect(mockOnSubmit).toHaveBeenCalledWith(
          expect.objectContaining({
            date: expect.any(String),
            from: "14:00",
            to: "15:00",
          })
        );
      });
    });

    /**
     * Requirement: BLS-05-02.ui.cancel
     * "Should call onClose when cancel clicked"
     */
    it("should call onClose when cancel button clicked", async () => {
      render(<RescheduleInterviewModal {...defaultProps} />);

      const cancelButton = screen.getByRole("button", { name: /ยกเลิก/i });
      await userEvent.click(cancelButton);

      expect(mockOnClose).toHaveBeenCalledTimes(1);
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: BLS-05-02.ui.loading
     * "Should disable submit when loading"
     */
    it("should disable submit button when isLoading is true", () => {
      render(<RescheduleInterviewModal {...defaultProps} isLoading={true} />);

      const submitButton = screen.getByRole("button", { name: /ยืนยัน/i });
      expect(submitButton).toBeDisabled();
    });

    /**
     * Requirement: BLS-05-02.ui.loading
     * "Should show loading indicator"
     */
    it("should show loading indicator when isLoading is true", () => {
      render(<RescheduleInterviewModal {...defaultProps} isLoading={true} />);

      expect(screen.getByTestId("submit-loading-indicator")).toBeInTheDocument();
    });
  });

  describe("Modal Behavior", () => {
    /**
     * Requirement: BLS-05-02.ui.modal
     * "Should not render when closed"
     */
    it("should not render when isOpen is false", () => {
      render(<RescheduleInterviewModal {...defaultProps} isOpen={false} />);

      expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    });
  });
});
