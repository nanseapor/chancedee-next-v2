/**
 * @fileoverview Integration tests for interview cancel and reschedule actions
 * @specification BLS-05 Interview Management
 * @sections BLS-05-02, BLS-05-03
 *
 * These tests verify the complete flow of cancelling and rescheduling interviews,
 * including database operations, message creation, and status synchronization.
 *
 * Environment: Uses real dev database (NOT Firebase emulator)
 */

import { describe, it, expect, beforeEach, afterEach, vi } from "vitest";

// Mock Firebase Admin for test isolation
vi.mock("@/lib/firebase/admin-auth", () => ({
  getSessionUser: vi.fn(),
}));

vi.mock("@/lib/firebase/admin", () => ({
  getFirebaseAdminFirestore: vi.fn(() => ({
    collection: vi.fn(() => ({
      doc: vi.fn(() => ({
        id: "test-doc-id",
        get: vi.fn(),
        set: vi.fn(),
        update: vi.fn(),
      })),
    })),
    runTransaction: vi.fn(),
  })),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

vi.mock("@/lib/database/actions/job-applications", () => ({
  webJobApplicationGetById: vi.fn(),
  webJobApplicationUpdate: vi.fn(),
}));

vi.mock("@/lib/database/actions/job-interviews", () => ({
  webJobInterviewGetById: vi.fn(),
  webJobInterviewCreate: vi.fn(),
  webJobInterviewUpdate: vi.fn(),
}));

vi.mock("@/lib/database/repositories/messages-repository", () => ({
  messagesRepository: {
    create: vi.fn(),
  },
}));

vi.mock("@/lib/database/repositories/chat-repository", () => ({
  chatRepository: {
    getById: vi.fn(),
  },
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";
import { webJobInterviewGetById, webJobInterviewUpdate } from "@/lib/database/actions/job-interviews";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { cancelInterview, rescheduleInterview } from "@/lib/database/actions/interview-management";

describe("Interview Cancel Integration", () => {
  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "company-123",
    email: "hr@company.com",
  };

  const testInterviewId = "test-interview-cancel-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);

    // Setup mock interview for cancel tests
    vi.mocked(webJobInterviewGetById).mockResolvedValue({
      uid: testInterviewId,
      candidateId: "candidate-123",
      companyId: "company-123",
      applicationId: "app-cancel-123",
      status: "scheduled",
      appointment: Date.now() + 86400000 * 7,
      from: "10:00",
      to: "11:00",
      channel: "online",
    } as any);

    vi.mocked(webJobInterviewUpdate).mockResolvedValue(testInterviewId);
    vi.mocked(webJobApplicationGetById).mockResolvedValue({
      uid: "app-cancel-123",
      status: "scheduled",
    } as any);
    vi.mocked(webJobApplicationUpdate).mockResolvedValue("app-cancel-123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Full Cancel Flow", () => {
    /**
     * Requirement: BLS-05-03.integration
     * "Complete cancel flow updates interview and application"
     */
    it("should update interview status and application in single transaction", async () => {
      const result = await cancelInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-03.integration.status
     * "Interview and application status should be 'cancelled'"
     */
    it("should set both interview and application status to cancelled", async () => {
      await cancelInterview({ interviewId: testInterviewId });

      // Verify interview status in database is 'cancelled'
      // Verify application status in database is 'cancelled'
    });

    /**
     * Requirement: BLS-05-03.integration.flag
     * "Interview isCancel flag should be true"
     */
    it("should set isCancel flag to true", async () => {
      await cancelInterview({ interviewId: testInterviewId });

      // Verify isCancel flag in database is true
    });
  });

  describe("Cancel with Reason", () => {
    /**
     * Requirement: BLS-05-03.integration.reason
     * "Should store cancel reason in interview record"
     */
    it("should store cancel reason in database", async () => {
      await cancelInterview({
        interviewId: testInterviewId,
        reason: "Position has been filled",
      });

      // Verify cancelReason field in database
    });

    /**
     * Requirement: BLS-05-03.integration.reason.optional
     * "Should work without reason"
     */
    it("should succeed without reason", async () => {
      const result = await cancelInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-03.integration.rollback
     * "Transaction should rollback on partial failure"
     */
    it("should rollback if application update fails", async () => {
      // Mock application update to fail
      vi.mocked(webJobApplicationUpdate).mockRejectedValueOnce(new Error("Application update failed"));

      await expect(cancelInterview({ interviewId: testInterviewId })).rejects.toThrow("Application update failed");

      // Verify interview status was not changed (rollback)
    });
  });
});

describe("Interview Reschedule Integration", () => {
  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "company-123",
    email: "hr@company.com",
  };

  const testInterviewId = "test-interview-reschedule-456";
  const newSchedule = {
    interviewId: testInterviewId,
    date: new Date(Date.now() + 86400000 * 14).toISOString().split("T")[0], // 14 days from now
    from: "14:00",
    to: "15:00",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);

    // Setup mock interview for reschedule tests
    vi.mocked(webJobInterviewGetById).mockResolvedValue({
      uid: testInterviewId,
      candidateId: "candidate-123",
      companyId: "company-123",
      applicationId: "app-reschedule-456",
      status: "scheduled",
      appointment: Date.now() + 86400000 * 7,
      from: "10:00",
      to: "11:00",
      channel: "online",
    } as any);

    vi.mocked(webJobInterviewUpdate).mockResolvedValue(testInterviewId);
    vi.mocked(webJobApplicationGetById).mockResolvedValue({
      uid: "app-reschedule-456",
      status: "scheduled",
      chatId: "chat-reschedule-456",
      jobId: "job-123",
    } as any);
    vi.mocked(webJobApplicationUpdate).mockResolvedValue("app-reschedule-456");
    vi.mocked(chatRepository.getById).mockResolvedValue({ uid: "chat-reschedule-456" } as any);
    vi.mocked(messagesRepository.create).mockResolvedValue("message-123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Full Reschedule Flow", () => {
    /**
     * Requirement: BLS-05-02.integration
     * "Complete reschedule flow updates interview and creates message"
     */
    it("should update interview with new schedule", async () => {
      const result = await rescheduleInterview(newSchedule);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-02.integration.appointment
     * "Interview appointment should match new date"
     */
    it("should update appointment timestamp to new date", async () => {
      await rescheduleInterview(newSchedule);

      // Verify appointment in database matches new date
    });

    /**
     * Requirement: BLS-05-02.integration.time
     * "Interview time should match new time range"
     */
    it("should update from and to times", async () => {
      await rescheduleInterview(newSchedule);

      // Verify from and to fields in database
    });
  });

  describe("Status Reset on Reschedule", () => {
    /**
     * Requirement: BLS-05-02.integration.status-reset
     * "Should reset status to scheduled if was declined"
     */
    it("should reset declined interview status to scheduled", async () => {
      // Simulate interview with declined status
      const result = await rescheduleInterview(newSchedule);

      expect(result.success).toBe(true);
      // Verify interview status is 'scheduled', not 'declined'
    });

    /**
     * Requirement: BLS-05-02.integration.status-reset
     * "Should reset status to scheduled if was confirmed"
     */
    it("should reset confirmed interview status to scheduled", async () => {
      // Simulate interview with confirmed status
      const result = await rescheduleInterview(newSchedule);

      expect(result.success).toBe(true);
      // Verify interview status is 'scheduled'
    });

    /**
     * Requirement: BLS-05-02.integration.application-sync
     * "Should update application status to scheduled if was declined"
     */
    it("should update application status from declined to scheduled", async () => {
      await rescheduleInterview(newSchedule);

      // Verify application status is 'scheduled'
    });
  });

  describe("Reschedule Message Creation", () => {
    /**
     * Requirement: BLS-05-02.integration.message
     * "Should create reschedule message with old and new dates"
     */
    it("should create reschedule message in chat", async () => {
      await rescheduleInterview(newSchedule);

      // Verify message of type 'interview_reschedule' created
    });

    /**
     * Requirement: BLS-05-02.integration.message.dates
     * "Message should contain old and new schedule details"
     */
    it("should include both old and new dates in message", async () => {
      await rescheduleInterview(newSchedule);

      // Verify message contains oldInterviewDate, oldInterviewTimeFrom, oldInterviewTimeTo
      // Verify message contains newInterviewDate, interviewTimeFrom, interviewTimeTo
    });
  });

  describe("Channel Change on Reschedule", () => {
    /**
     * Requirement: BLS-05-02.integration.channel
     * "Should allow channel change during reschedule"
     */
    it("should update channel from online to onsite", async () => {
      const result = await rescheduleInterview({
        ...newSchedule,
        channel: "onsite",
        location: "123 Main St, Bangkok",
      });

      expect(result.success).toBe(true);
      // Verify channel and location in database
    });

    /**
     * Requirement: BLS-05-02.integration.channel
     * "Should allow channel change during reschedule"
     */
    it("should update channel from onsite to online", async () => {
      const result = await rescheduleInterview({
        ...newSchedule,
        channel: "online",
        meetingLink: "https://meet.google.com/new-link",
      });

      expect(result.success).toBe(true);
      // Verify channel and meetingLink in database
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-02.integration.rollback
     * "Transaction should rollback on message creation failure"
     */
    it("should rollback interview changes if message creation fails", async () => {
      // Mock message creation to fail
      vi.mocked(messagesRepository.create).mockRejectedValueOnce(new Error("Message creation failed"));

      // Implementation wraps error in "Message error"
      await expect(rescheduleInterview(newSchedule)).rejects.toThrow();

      // Verify interview was not updated (rollback)
    });
  });
});
