/**
 * @fileoverview Tests for scheduleInterview action
 * @specification BLS-05 Interview Management
 * @section BLS-05-01
 *
 * Requirements tested:
 * - BLS-05-01.auth.company: User must be company member
 * - BLS-05-01.validation.application: Application must exist
 * - BLS-05-01.validation.status: Application status must be in ['accepted', 'applied', 'read']
 * - BLS-05-01.validation.future: Date must be in future
 * - BLS-05-01.validation.location: Location required if onsite
 * - BLS-05-01.validation.time: End time must be after start time
 * - BLS-05-01.create: Create interview record in job_interviews
 * - BLS-05-01.side-effect.status: Update application status to 'scheduled'
 * - BLS-05-01.side-effect.message: Create interview chat message
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";

// Mock dependencies
vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

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

vi.mock("@/lib/database/repositories/job-interviews-repository", () => ({
  jobInterviewsRepository: {
    create: vi.fn(),
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/database/actions/job-applications", () => ({
  webJobApplicationGetById: vi.fn(),
  webJobApplicationUpdate: vi.fn(),
}));

vi.mock("@/lib/database/actions/job-interviews", () => ({
  webJobInterviewCreate: vi.fn(),
  webJobInterviewGetByFilter: vi.fn(),
}));

vi.mock("@/lib/database/actions/chat-messages", () => ({
  sendMessageFirestore: vi.fn(),
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    create: vi.fn(),
  },
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { jobInterviewsRepository } from "@/lib/database/repositories/job-interviews-repository";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";
import { webJobInterviewCreate, webJobInterviewGetByFilter } from "@/lib/database/actions/job-interviews";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";

// Import the action to test
import { scheduleInterview } from "@/lib/database/actions/interview-management";

describe("scheduleInterview", () => {
  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "test-company-id",
    email: "hr@company.com",
  };

  const mockCandidateUser = {
    uid: "candidate-user-123",
    candidateId: "test-candidate-id",
    companyId: null,
    email: "candidate@example.com",
  };

  const mockApplication = {
    uid: "app-123",
    jobId: "job-123",
    candidateId: "candidate-123",
    companyId: "test-company-id",
    status: "accepted",
    chatId: "chat-123",
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  const mockRoom = {
    id: "chat-123",
    candidateId: "candidate-123",
    companyId: "test-company-id",
    candidateName: "Test Candidate",
    companyName: "Test Company",
    hrId: "company-user-123",
    hrName: "HR Manager",
    lastMessage: null,
    lastupdate: null,
  };

  const validInput = {
    applicationId: "app-123",
    date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0], // 7 days from now
    from: "10:00",
    to: "11:00",
    channel: "online" as const,
    location: "",
    room: "https://meet.google.com/abc-defg-hij",
    note: "Please prepare your portfolio",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);
    vi.mocked(webJobApplicationGetById).mockResolvedValue(mockApplication);
    vi.mocked(chatRepository.getById).mockResolvedValue(mockRoom);
    vi.mocked(webJobInterviewGetByFilter).mockResolvedValue(null);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-05-01.auth.company
     * "User must be company member (activeRoleAtom === 'company')"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(scheduleInterview(validInput)).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-05-01.auth.company
     * "User must be company member"
     */
    it("should reject if user is not company member (is candidate)", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);

      await expect(scheduleInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-01.auth.company
     * "User must be company member"
     */
    it("should accept if user is company member", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      // This will fail until implementation exists
      const result = await scheduleInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Application", () => {
    /**
     * Requirement: BLS-05-01.validation.application
     * "Application must exist"
     */
    it("should reject if application not found", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue(null);

      await expect(scheduleInterview(validInput)).rejects.toThrow("APPLICATION_NOT_FOUND");
    });

    /**
     * Requirement: BLS-05-01.validation.status
     * "Application status must be in ['accepted', 'applied', 'read']"
     */
    it("should reject if application status is 'rejected'", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "rejected",
      });

      await expect(scheduleInterview(validInput)).rejects.toThrow("INVALID_APPLICATION_STATUS");
    });

    /**
     * Requirement: BLS-05-01.validation.status
     * "Application status must be in ['accepted', 'applied', 'read']"
     */
    it("should reject if application status is 'withdraw'", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "withdraw",
      });

      await expect(scheduleInterview(validInput)).rejects.toThrow("INVALID_APPLICATION_STATUS");
    });

    /**
     * Requirement: BLS-05-01.validation.status
     * "Application status in ['accepted', 'applied', 'read']"
     */
    it("should accept application with status 'accepted'", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "accepted",
      });
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-01.validation.status
     * "Application status in ['accepted', 'applied', 'read']"
     */
    it("should accept application with status 'applied'", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "applied",
      });
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-01.validation.status
     * "Application status in ['accepted', 'applied', 'read']"
     */
    it("should accept application with status 'read'", async () => {
      vi.mocked(webJobApplicationGetById).mockResolvedValue({
        ...mockApplication,
        status: "read",
      });
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Date/Time", () => {
    /**
     * Requirement: BLS-05-01.validation.future
     * "Date must be in future"
     */
    it("should reject if date is in the past", async () => {
      const pastDate = new Date(Date.now() - 86400000).toISOString().split("T")[0]; // Yesterday

      await expect(
        scheduleInterview({
          ...validInput,
          date: pastDate,
        })
      ).rejects.toThrow("INVALID_DATE");
    });

    /**
     * Requirement: BLS-05-01.validation.future
     * "Date must be in future"
     */
    it("should reject if date is today", async () => {
      const today = new Date().toISOString().split("T")[0];

      await expect(
        scheduleInterview({
          ...validInput,
          date: today,
        })
      ).rejects.toThrow("INVALID_DATE");
    });

    /**
     * Requirement: BLS-05-01.validation.time
     * "End time must be after start time"
     */
    it("should reject if end time is before start time", async () => {
      await expect(
        scheduleInterview({
          ...validInput,
          from: "14:00",
          to: "10:00",
        })
      ).rejects.toThrow("INVALID_TIME_RANGE");
    });

    /**
     * Requirement: BLS-05-01.validation.time
     * "End time must be after start time"
     */
    it("should reject if end time equals start time", async () => {
      await expect(
        scheduleInterview({
          ...validInput,
          from: "10:00",
          to: "10:00",
        })
      ).rejects.toThrow("INVALID_TIME_RANGE");
    });
  });

  describe("Validation - Location", () => {
    /**
     * Requirement: BLS-05-01.validation.location
     * "Location required if onsite"
     */
    it("should reject if channel is onsite and location is empty", async () => {
      await expect(
        scheduleInterview({
          ...validInput,
          channel: "onsite",
          location: "",
        })
      ).rejects.toThrow("LOCATION_REQUIRED");
    });

    /**
     * Requirement: BLS-05-01.validation.location
     * "Location required if onsite"
     */
    it("should accept if channel is onsite and location is provided", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview({
        ...validInput,
        channel: "onsite",
        location: "123 Main Street, Bangkok",
      });

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-01.validation.location
     * "Location not required if online"
     */
    it("should accept if channel is online and location is empty", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview({
        ...validInput,
        channel: "online",
        location: "",
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Note", () => {
    /**
     * Requirement: BLS-05-01.validation.note
     * "Note max 500 characters"
     */
    it("should reject if note exceeds 500 characters", async () => {
      const longNote = "a".repeat(501);

      await expect(
        scheduleInterview({
          ...validInput,
          note: longNote,
        })
      ).rejects.toThrow("NOTE_TOO_LONG");
    });

    /**
     * Requirement: BLS-05-01.validation.note
     * "Note max 500 characters"
     */
    it("should accept if note is exactly 500 characters", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview({
        ...validInput,
        note: "a".repeat(500),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Interview Creation", () => {
    /**
     * Requirement: BLS-05-01.create
     * "Create interview record in job_interviews collection"
     */
    it("should create interview record with all required fields", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await scheduleInterview(validInput);

      expect(webJobInterviewCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          applicationId: "app-123",
          candidateId: "candidate-123",
          companyId: "test-company-id",
          jobId: "job-123",
          status: "scheduled",
          channel: "online",
          from: "10:00",
          to: "11:00",
        }),
        expect.any(String)
      );
    });

    /**
     * Requirement: BLS-05-01.create
     * "Create interview record with appointment timestamp"
     */
    it("should create interview with correct appointment timestamp", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await scheduleInterview(validInput);

      expect(webJobInterviewCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          appointment: expect.any(Number), // Unix timestamp
        }),
        expect.any(String)
      );
    });

    /**
     * Requirement: BLS-05-01.create
     * "Return interview ID on success"
     */
    it("should return interview ID on success", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      const result = await scheduleInterview(validInput);

      expect(result).toEqual({
        success: true,
        interviewId: "interview-123",
      });
    });
  });

  describe("Side Effects", () => {
    /**
     * Requirement: BLS-05-01.side-effect.status
     * "Update application status to 'scheduled'"
     */
    it("should update application status to scheduled", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await scheduleInterview(validInput);

      expect(webJobApplicationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "scheduled",
        }),
        expect.any(String),
        "app-123"
      );
    });

    /**
     * Requirement: BLS-05-01.side-effect.message
     * "Create interview chat message"
     */
    it("should create interview message in chat", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await scheduleInterview(validInput);

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          type: "interview",
          roomId: "chat-123",
        }),
        expect.any(String)
      );
    });

    /**
     * Requirement: BLS-05-01.side-effect.message
     * "Interview message contains schedule details"
     */
    it("should include interview details in chat message", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockResolvedValue("message-123");

      await scheduleInterview(validInput);

      expect(messagesRepository.create).toHaveBeenCalledWith(
        expect.objectContaining({
          interviewId: "interview-123",
          interviewDate: validInput.date,
          interviewTimeFrom: "10:00",
          interviewTimeTo: "11:00",
          interviewChannel: "online",
        }),
        expect.any(String)
      );
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-01.error
     * "Handle database errors gracefully"
     */
    it("should handle interview creation failure", async () => {
      vi.mocked(webJobInterviewCreate).mockRejectedValue(new Error("Database error"));

      await expect(scheduleInterview(validInput)).rejects.toThrow("Database error");
    });

    /**
     * Requirement: BLS-05-01.error
     * "Handle message creation failure"
     */
    it("should handle message creation failure", async () => {
      vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
      vi.mocked(messagesRepository.create).mockRejectedValue(new Error("Message creation failed"));

      await expect(scheduleInterview(validInput)).rejects.toThrow("Message creation failed");
    });
  });
});
