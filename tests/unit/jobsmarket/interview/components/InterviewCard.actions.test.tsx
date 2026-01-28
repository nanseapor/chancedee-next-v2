/**
 * @fileoverview Tests for InterviewCard action buttons
 * @specification BLS-05 Interview Management
 * @section BLS-05-06
 *
 * Requirements tested:
 * - BLS-05-06.actions.candidate.scheduled: Candidate can confirm or decline when scheduled
 * - BLS-05-06.actions.candidate.confirmed: No actions for candidate when confirmed
 * - BLS-05-06.actions.company.scheduled: Company can cancel or reschedule when scheduled
 * - BLS-05-06.actions.company.confirmed: Company can only cancel when confirmed
 * - BLS-05-06.actions.company.declined: Company can reschedule when declined
 * - BLS-05-06.actions.company.cancelled: Company can schedule new when cancelled
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";
import { InterviewCard } from "@/app/jobsmarket/chat/[roomId]/_components/InterviewCard";
import type { RoomInterview, InterviewStatus } from "@/types/chat.types";

// Note: This test will need to be updated once InterviewCard is extended with action buttons
// Currently testing the extended interface that will be implemented

describe("InterviewCard Actions", () => {
  const mockInterview: RoomInterview = {
    uid: "interview-123",
    appointment: Date.now() + 86400000 * 7, // 7 days from now
    channel: "online",
    status: "pending" as InterviewStatus,
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

  const mockOnConfirm = vi.fn();
  const mockOnDecline = vi.fn();
  const mockOnCancel = vi.fn();
  const mockOnReschedule = vi.fn();
  const mockOnScheduleNew = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Candidate Actions", () => {
    describe("when status is scheduled/pending", () => {
      /**
       * Requirement: BLS-05-06.actions.candidate.scheduled
       * "Candidate can confirm when status is scheduled"
       */
      it("should show confirm button when status is pending", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="candidate"
            onConfirm={mockOnConfirm}
            onDecline={mockOnDecline}
          />
        );

        expect(screen.getByRole("button", { name: /ยืนยัน/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.candidate.scheduled
       * "Candidate can decline when status is scheduled"
       */
      it("should show decline button when status is pending", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="candidate"
            onConfirm={mockOnConfirm}
            onDecline={mockOnDecline}
          />
        );

        expect(screen.getByRole("button", { name: /ปฏิเสธ/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.candidate.scheduled
       * "Confirm button calls onConfirm handler"
       */
      it("should call onConfirm when confirm button clicked", () => {
        // Extended props that will be added to InterviewCard
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="candidate"
            // @ts-expect-error - These props will be added in implementation
            onConfirm={mockOnConfirm}
            onDecline={mockOnDecline}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /ยืนยัน/i }));

        expect(mockOnConfirm).toHaveBeenCalledTimes(1);
      });

      /**
       * Requirement: BLS-05-06.actions.candidate.scheduled
       * "Decline button calls onDecline handler"
       */
      it("should call onDecline when decline button clicked", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="candidate"
            // @ts-expect-error - These props will be added in implementation
            onConfirm={mockOnConfirm}
            onDecline={mockOnDecline}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /ปฏิเสธ/i }));

        expect(mockOnDecline).toHaveBeenCalledTimes(1);
      });
    });

    describe("when status is confirmed", () => {
      /**
       * Requirement: BLS-05-06.actions.candidate.confirmed
       * "No actions for candidate when confirmed"
       */
      it("should not show confirm button when status is confirmed", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "confirmed" }}
            userRole="candidate"
          />
        );

        expect(screen.queryByRole("button", { name: /ยืนยัน/i })).not.toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.candidate.confirmed
       * "No decline button when confirmed"
       */
      it("should not show decline button when status is confirmed", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "confirmed" }}
            userRole="candidate"
          />
        );

        expect(screen.queryByRole("button", { name: /ปฏิเสธ/i })).not.toBeInTheDocument();
      });
    });

    describe("when status is cancelled", () => {
      /**
       * Requirement: BLS-05-06.actions.candidate.cancelled
       * "No actions for candidate when cancelled"
       */
      it("should not show any action buttons when status is cancelled", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "cancelled" }}
            userRole="candidate"
          />
        );

        expect(screen.queryByRole("button", { name: /ยืนยัน/i })).not.toBeInTheDocument();
        expect(screen.queryByRole("button", { name: /ปฏิเสธ/i })).not.toBeInTheDocument();
      });
    });
  });

  describe("Company Actions", () => {
    describe("when status is scheduled/pending", () => {
      /**
       * Requirement: BLS-05-06.actions.company.scheduled
       * "Company can cancel when status is scheduled"
       */
      it("should show cancel button when status is pending", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="company"
            onCancel={mockOnCancel}
            onReschedule={mockOnReschedule}
          />
        );

        expect(screen.getByRole("button", { name: /ยกเลิก/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.company.scheduled
       * "Company can reschedule when status is scheduled"
       */
      it("should show reschedule button when status is pending", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="company"
            onCancel={mockOnCancel}
            onReschedule={mockOnReschedule}
          />
        );

        expect(screen.getByRole("button", { name: /เลื่อนนัด/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.company.scheduled
       * "Cancel button calls onCancel handler"
       */
      it("should call onCancel when cancel button clicked", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="company"
            // @ts-expect-error - These props will be added in implementation
            onCancel={mockOnCancel}
            onReschedule={mockOnReschedule}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /ยกเลิก/i }));

        expect(mockOnCancel).toHaveBeenCalledTimes(1);
      });

      /**
       * Requirement: BLS-05-06.actions.company.scheduled
       * "Reschedule button calls onReschedule handler"
       */
      it("should call onReschedule when reschedule button clicked", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "pending" }}
            userRole="company"
            // @ts-expect-error - These props will be added in implementation
            onCancel={mockOnCancel}
            onReschedule={mockOnReschedule}
          />
        );

        fireEvent.click(screen.getByRole("button", { name: /เลื่อนนัด/i }));

        expect(mockOnReschedule).toHaveBeenCalledTimes(1);
      });
    });

    describe("when status is confirmed", () => {
      /**
       * Requirement: BLS-05-06.actions.company.confirmed
       * "Company can cancel when status is confirmed"
       */
      it("should show cancel button when status is confirmed", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "confirmed" }}
            userRole="company"
            onCancel={mockOnCancel}
          />
        );

        expect(screen.getByRole("button", { name: /ยกเลิก/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.company.confirmed
       * "Company cannot reschedule when confirmed (must cancel first)"
       */
      it("should not show reschedule button when status is confirmed", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "confirmed" }}
            userRole="company"
            onCancel={mockOnCancel}
          />
        );

        expect(screen.queryByRole("button", { name: /เลื่อนนัด/i })).not.toBeInTheDocument();
      });
    });

    describe("when status is declined", () => {
      /**
       * Requirement: BLS-05-06.actions.company.declined
       * "Company can reschedule when status is declined"
       */
      it("should show reschedule button when status is declined (labeled as นัดใหม่)", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "rescheduled" }}
            userRole="company"
            onReschedule={mockOnReschedule}
            onScheduleNew={mockOnScheduleNew}
          />
        );

        // When declined, button should say "นัดใหม่" (schedule new) instead of "เลื่อนนัด"
        expect(screen.getByRole("button", { name: /นัดใหม่/i })).toBeInTheDocument();
      });

      /**
       * Requirement: BLS-05-06.actions.company.declined
       * "Company cannot cancel when already declined"
       */
      it("should not show cancel button when status is declined", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "rescheduled" }}
            userRole="company"
            onReschedule={mockOnReschedule}
            onScheduleNew={mockOnScheduleNew}
          />
        );

        expect(screen.queryByRole("button", { name: /ยกเลิก/i })).not.toBeInTheDocument();
      });
    });

    describe("when status is cancelled", () => {
      /**
       * Requirement: BLS-05-06.actions.company.cancelled
       * "Company can schedule new when status is cancelled"
       */
      it("should show schedule new button when status is cancelled", () => {
        render(
          <InterviewCard
            interview={{ ...mockInterview, status: "cancelled" }}
            userRole="company"
            onScheduleNew={mockOnScheduleNew}
          />
        );

        expect(screen.getByRole("button", { name: /นัดใหม่/i })).toBeInTheDocument();
      });
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: BLS-05-06.ui.loading
     * "Show loading state during action"
     */
    it("should disable buttons when action is in progress", () => {
      render(
        <InterviewCard
          interview={{ ...mockInterview, status: "pending" }}
          userRole="candidate"
          onConfirm={mockOnConfirm}
          onDecline={mockOnDecline}
          isActionLoading={true}
        />
      );

      expect(screen.getByRole("button", { name: /ยืนยัน/i })).toBeDisabled();
      expect(screen.getByRole("button", { name: /ปฏิเสธ/i })).toBeDisabled();
    });

    /**
     * Requirement: BLS-05-06.ui.loading
     * "Show spinner on active button"
     */
    it("should show spinner on confirm button when confirming", () => {
      render(
        <InterviewCard
          interview={{ ...mockInterview, status: "pending" }}
          userRole="candidate"
          onConfirm={mockOnConfirm}
          onDecline={mockOnDecline}
          isActionLoading={true}
          loadingAction="confirm"
        />
      );

      const confirmButton = screen.getByRole("button", { name: /ยืนยัน/i });
      expect(confirmButton).toHaveAttribute("data-loading", "true");
    });
  });

  describe("Status Badge", () => {
    /**
     * Requirement: BLS-05-06.display.status
     * "Show correct status badge for pending"
     */
    it("should show waiting badge for pending status", () => {
      render(
        <InterviewCard
          interview={{ ...mockInterview, status: "pending" }}
          userRole="candidate"
        />
      );

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveTextContent(/รอยืนยัน/i);
    });

    /**
     * Requirement: BLS-05-06.display.status
     * "Show correct status badge for confirmed"
     */
    it("should show success badge for confirmed status", () => {
      render(
        <InterviewCard
          interview={{ ...mockInterview, status: "confirmed" }}
          userRole="candidate"
        />
      );

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveTextContent(/ยืนยันแล้ว/i);
    });

    /**
     * Requirement: BLS-05-06.display.status
     * "Show correct status badge for cancelled"
     */
    it("should show problem badge for cancelled status", () => {
      render(
        <InterviewCard
          interview={{ ...mockInterview, status: "cancelled" }}
          userRole="candidate"
        />
      );

      const badge = screen.getByTestId("interview-status-badge");
      expect(badge).toHaveTextContent(/ยกเลิก/i);
    });
  });
});
