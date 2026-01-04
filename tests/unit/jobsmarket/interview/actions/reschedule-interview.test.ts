/**
 * @fileoverview Tests for rescheduleInterview action
 * @specification BLS-05 Interview Management
 * @section BLS-05-02
 *
 * Requirements tested:
 * - BLS-05-02.auth: User must be company member
 * - BLS-05-02.validation.exists: Interview must exist
 * - BLS-05-02.validation.status: Status allows reschedule ['scheduled', 'confirmed', 'declined']
 * - BLS-05-02.validation.future: New date must be in future
 * - BLS-05-02.update: Update interview with new date/time
 * - BLS-05-02.status-reset: Reset status to 'scheduled' if was declined
 * - BLS-05-02.side-effect.message: Create reschedule chat message (old→new)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        id: "mock-doc-id",
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
    })),
  })),
}));

vi.mock("@/lib/database/actions/job-interviews", () => ({
  webJobInterviewGetById: vi.fn(),
  webJobInterviewUpdate: vi.fn(),
}));

vi.mock("@/lib/database/actions/job-applications", () => ({
  webJobApplicationGetById: vi.fn(),
  webJobApplicationUpdate: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { webJobInterviewGetById, webJobInterviewUpdate } from "@/lib/database/actions/job-interviews";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";

// Import the action to test
import { rescheduleInterview } from "@/lib/database/actions/interview-management";

describe("rescheduleInterview", () => {
  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "company-123",
    email: "hr@company.com",
  };

  const mockCandidateUser = {
    uid: "candidate-user-123",
    candidateId: "candidate-123",
    companyId: null,
    email: "candidate@example.com",
  };

  const mockInterview = {
    uid: "interview-123",
    applicationId: "app-123",
    candidateId: "candidate-123",
    companyId: "company-123",
    jobId: "job-123",
    status: "scheduled",
    channel: "online",
    appointment: Date.now() + 86400000 * 3, // 3 days from now
    from: "10:00",
    to: "11:00",
    location: "",
    room: "https://meet.google.com/abc",
    note: "",
    isCancel: false,
    isAccepted: false,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockApplication = {
    uid: "app-123",
    jobId: "job-123",
    candidateId: "candidate-123",
    companyId: "company-123",
    status: "scheduled",
    chatId: "chat-123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockRoom = {
    id: "chat-123",
    candidateId: "candidate-123",
    companyId: "company-123",
    candidateName: "Test Candidate",
    companyName: "Test Company",
    hrId: "company-user-123",
    hrName: "HR Manager",
    lastMessage: null,
    lastupdate: null,
  };

  const validInput = {
    interviewId: "interview-123",
    date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0], // 7 days from now
    from: "14:00",
    to: "15:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);
    vi.mocked(webJobInterviewGetById).mockResolvedValue(mockInterview);
    vi.mocked(webJobApplicationGetById).mockResolvedValue(mockApplication);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-05-02.auth
     * "User must be company member"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(rescheduleInterview(validInput)).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-05-02.auth
     * "User must be company member"
     */
    it("should reject if user is candidate (not company)", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);

      await expect(rescheduleInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-02.auth
     * "User must be from the interview's company"
     */
    it("should reject if user is from different company", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        ...mockCompanyUser,
        companyId: "different-company",
      });

      await expect(rescheduleInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-02.auth
     * "Accept if user is from correct company"
     */
    it("should accept if user is from the interview company", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await rescheduleInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Interview", () => {
    /**
     * Requirement: BLS-05-02.validation.exists
     * "Interview must exist"
     */
    it("should reject if interview not found", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue(null);

      await expect(rescheduleInterview(validInput)).rejects.toThrow("INTERVIEW_NOT_FOUND");
    });

    /**
     * Requirement: BLS-05-02.validation.status
     * "Status allows reschedule - scheduled"
     */
    it("should accept if interview status is 'scheduled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "scheduled",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await rescheduleInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-02.validation.status
     * "Status allows reschedule - confirmed"
     */
    it("should accept if interview status is 'confirmed'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "confirmed",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await rescheduleInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-02.validation.status
     * "Status allows reschedule - declined"
     */
    it("should accept if interview status is 'declined'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await rescheduleInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-02.validation.status
     * "Cannot reschedule cancelled interview"
     */
    it("should reject if interview status is 'cancelled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "cancelled",
      });

      await expect(rescheduleInterview(validInput)).rejects.toThrow("INTERVIEW_CANCELLED");
    });
  });

  describe("Validation - Date/Time", () => {
    /**
     * Requirement: BLS-05-02.validation.future
     * "New date must be in future"
     */
    it("should reject if new date is in the past", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString().split("T")[0];

      await expect(
        rescheduleInterview({
          ...validInput,
          date: pastDate,
        })
      ).rejects.toThrow("INVALID_DATE");
    });

    /**
     * Requirement: BLS-05-02.validation.future
     * "New date must be in future"
     */
    it("should reject if new date is today", async () => {
      const today = new Date().toISOString().split("T")[0];

      await expect(
        rescheduleInterview({
          ...validInput,
          date: today,
        })
      ).rejects.toThrow("INVALID_DATE");
    });

    /**
     * Requirement: BLS-05-02.validation.time
     * "End time must be after start time"
     */
    it("should reject if end time is before start time", async () => {
      await expect(
        rescheduleInterview({
          ...validInput,
          from: "16:00",
          to: "14:00",
        })
      ).rejects.toThrow("INVALID_TIME_RANGE");
    });
  });

  describe("Interview Update", () => {
    /**
     * Requirement: BLS-05-02.update
     * "Update interview with new date/time"
     */
    it("should update interview with new date and time", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          from: "14:00",
          to: "15:00",
          appointment: expect.any(Number),
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-02.update
     * "Update channel if provided"
     */
    it("should update channel if provided", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview({
        ...validInput,
        channel: "onsite",
        location: "123 Main St",
      });

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          channel: "onsite",
          location: "123 Main St",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-02.status-reset
     * "Reset status to 'scheduled' if was declined"
     */
    it("should reset status to scheduled if was declined", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "scheduled",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-02.status-reset
     * "Reset status to 'scheduled' if was confirmed"
     */
    it("should reset status to scheduled if was confirmed", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "confirmed",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "scheduled",
        }),
        expect.any(String),
        "interview-123"
      );
    });
  });

  describe("Application Status Sync", () => {
    /**
     * Requirement: BLS-05-02.side-effect.status
     * "Update application status to 'scheduled' if was declined"
     */
    it("should update application status to scheduled if was declined", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "declined",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(webJobApplicationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "scheduled",
        }),
        expect.any(String),
        "app-123"
      );
    });
  });

  describe("Reschedule Message", () => {
    /**
     * Requirement: BLS-05-02.side-effect.message
     * "Create reschedule chat message"
     */
    it("should create reschedule message in chat", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "interview-reschedule",
          roomId: "chat-123",
        }),
        expect.any(String)
      );
    });

    /**
     * Requirement: BLS-05-02.side-effect.message
     * "Reschedule message shows old and new dates"
     */
    it("should include old and new dates in reschedule message", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await rescheduleInterview(validInput);

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          oldInterviewDate: expect.any(String),
          oldInterviewTimeFrom: "10:00",
          oldInterviewTimeTo: "11:00",
          newInterviewDate: validInput.date,
          interviewTimeFrom: "14:00",
          interviewTimeTo: "15:00",
        }),
        expect.any(String)
      );
    });
  });

  describe("Return Value", () => {
    /**
     * Requirement: BLS-05-02
     * "Return success on reschedule"
     */
    it("should return success true on successful reschedule", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await rescheduleInterview(validInput);

      expect(result).toEqual({
        success: true,
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-02.error
     * "Handle database errors gracefully"
     */
    it("should handle interview update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockRejectedValue(new Error("Database error"));

      await expect(rescheduleInterview(validInput)).rejects.toThrow("Database error");
    });

    /**
     * Requirement: BLS-05-02.error
     * "Handle message creation failure"
     */
    it("should handle message creation failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockRejectedValue(new Error("Message error"));

      await expect(rescheduleInterview(validInput)).rejects.toThrow("Message error");
    });
  });
});
