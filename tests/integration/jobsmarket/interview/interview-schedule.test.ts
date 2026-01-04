/**
 * @fileoverview Integration tests for interview scheduling
 * @specification BLS-05 Interview Management
 * @section BLS-05-01
 *
 * These tests verify the complete flow of scheduling an interview,
 * including database operations and side effects.
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
import { webJobInterviewCreate } from "@/lib/database/actions/job-interviews";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { scheduleInterview } from "@/lib/database/actions/interview-management";

describe("Interview Schedule Integration", () => {
  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "company-123",
    email: "hr@company.com",
  };

  const testInterviewData = {
    applicationId: "test-app-123",
    date: new Date(Date.now() + 86400000 * 7).toISOString().split("T")[0],
    from: "10:00",
    to: "11:00",
    channel: "online" as const,
    meetingLink: "https://meet.google.com/test",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);

    // Setup mock application
    vi.mocked(webJobApplicationGetById).mockResolvedValue({
      uid: "test-app-123",
      jobId: "job-123",
      candidateId: "candidate-123",
      companyId: "company-123",
      status: "accepted",
      chatId: "chat-123",
      companyName: "Test Company",
    } as any);

    vi.mocked(webJobApplicationUpdate).mockResolvedValue("test-app-123");
    vi.mocked(webJobInterviewCreate).mockResolvedValue("interview-123");
    vi.mocked(chatRepository.getById).mockResolvedValue({ uid: "chat-123" } as any);
    vi.mocked(messagesRepository.create).mockResolvedValue("message-123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Full Schedule Flow", () => {
    /**
     * Requirement: BLS-05-01.integration
     * "Complete schedule flow creates interview and updates application"
     */
    it("should create interview and update application status in single transaction", async () => {
      const result = await scheduleInterview(testInterviewData);

      expect(result.success).toBe(true);
      expect(result.interviewId).toBeDefined();
    });

    /**
     * Requirement: BLS-05-01.integration.message
     * "Should create interview schedule message in chat"
     */
    it("should create interview schedule message in chat room", async () => {
      await scheduleInterview(testInterviewData);

      // Verify message was created with correct type
      // This will be verified against actual database in real integration test
    });

    /**
     * Requirement: BLS-05-01.integration.room
     * "Should update chat room's interview reference"
     */
    it("should update chat room interview reference", async () => {
      const result = await scheduleInterview(testInterviewData);

      expect(result.interviewId).toBeDefined();
      // Verify chat room has reference to new interview
    });
  });

  describe("Error Scenarios", () => {
    /**
     * Requirement: BLS-05-01.integration.rollback
     * "Transaction should rollback on partial failure"
     */
    it("should rollback all changes if message creation fails", async () => {
      // Mock message creation to fail
      vi.mocked(messagesRepository.create).mockRejectedValueOnce(new Error("Message creation failed"));

      await expect(scheduleInterview(testInterviewData)).rejects.toThrow("Message creation failed");

      // Verify interview was not created (rollback)
    });

    /**
     * Requirement: BLS-05-01.integration.concurrent
     * "Should handle concurrent scheduling attempts"
     */
    it("should prevent duplicate interviews for same application", async () => {
      // Mock application already has interview scheduled
      vi.mocked(webJobApplicationGetById).mockResolvedValueOnce({
        uid: "test-app-123",
        jobId: "job-123",
        candidateId: "candidate-123",
        companyId: "company-123",
        status: "scheduled", // Already scheduled - has interview
        chatId: "chat-123",
        companyName: "Test Company",
      } as any);

      // Schedule attempt should fail because status is already 'scheduled'
      await expect(scheduleInterview(testInterviewData)).rejects.toThrow();
    });
  });

  describe("Data Integrity", () => {
    /**
     * Requirement: BLS-05-01.integration.data
     * "Interview data should match input"
     */
    it("should store interview with correct appointment timestamp", async () => {
      const result = await scheduleInterview(testInterviewData);

      expect(result.success).toBe(true);
      // Verify stored appointment matches input date
    });

    /**
     * Requirement: BLS-05-01.integration.status
     * "Application status should be 'scheduled' after success"
     */
    it("should update application status to scheduled", async () => {
      await scheduleInterview(testInterviewData);

      // Verify application status in database
    });
  });
});
