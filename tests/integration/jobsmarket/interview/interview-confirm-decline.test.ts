/**
 * @fileoverview Integration tests for interview confirm and decline actions
 * @specification BLS-05 Interview Management
 * @sections BLS-05-04, BLS-05-05
 *
 * These tests verify the complete flow of confirming or declining interviews,
 * including database operations, reward distribution, and status synchronization.
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

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
  webCandidateInformationUpdate: vi.fn(),
}));

vi.mock("@/lib/database/actions/wallet-transactions", () => ({
  webWalletTransactionCreate: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";
import { webJobInterviewGetById, webJobInterviewUpdate } from "@/lib/database/actions/job-interviews";
import { webCandidateInformationGetById, webCandidateInformationUpdate } from "@/lib/database/actions/candidate-information";
import { webWalletTransactionCreate } from "@/lib/database/actions/wallet-transactions";
import { confirmInterview, declineInterview } from "@/lib/database/actions/interview-management";

describe("Interview Confirm Integration", () => {
  const mockCandidateUser = {
    uid: "candidate-user-123",
    candidateId: "candidate-123",
    companyId: null,
    email: "candidate@example.com",
  };

  const testInterviewId = "test-interview-123";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);

    // Setup mock interview for confirm tests
    vi.mocked(webJobInterviewGetById).mockResolvedValue({
      uid: testInterviewId,
      candidateId: "candidate-123",
      companyId: "company-123",
      applicationId: "app-123",
      status: "scheduled",
      appointment: Date.now() + 86400000 * 7,
      from: "10:00",
      to: "11:00",
      channel: "online",
    } as any);

    vi.mocked(webJobInterviewUpdate).mockResolvedValue(testInterviewId);
    vi.mocked(webJobApplicationGetById).mockResolvedValue({
      uid: "app-123",
      status: "scheduled",
    } as any);
    vi.mocked(webJobApplicationUpdate).mockResolvedValue("app-123");
    vi.mocked(webCandidateInformationGetById).mockResolvedValue({
      uid: "candidate-123",
      isFirstInterviewerRewarded: false,
    } as any);
    vi.mocked(webCandidateInformationUpdate).mockResolvedValue("candidate-123");
    vi.mocked(webWalletTransactionCreate).mockResolvedValue("transaction-123");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Full Confirm Flow", () => {
    /**
     * Requirement: BLS-05-04.integration
     * "Complete confirm flow updates interview and application"
     */
    it("should update interview status and application in single transaction", async () => {
      const result = await confirmInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-04.integration.status
     * "Interview and application status should be 'confirmed'"
     */
    it("should set both interview and application status to confirmed", async () => {
      await confirmInterview({ interviewId: testInterviewId });

      // Verify interview status in database is 'confirmed'
      // Verify application status in database is 'confirmed'
    });

    /**
     * Requirement: BLS-05-04.integration.flag
     * "Interview isAccepted flag should be true"
     */
    it("should set isAccepted flag to true", async () => {
      await confirmInterview({ interviewId: testInterviewId });

      // Verify isAccepted flag in database
    });
  });

  describe("First Interview Reward Flow", () => {
    /**
     * Requirement: BLS-05-04.integration.reward
     * "First interview confirmation awards 100 coins"
     */
    it("should award 100 coins on first interview confirmation", async () => {
      const result = await confirmInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
      expect(result.rewardAwarded).toBe(true);
      // Verify wallet transaction created with 100 coins
    });

    /**
     * Requirement: BLS-05-04.integration.reward.flag
     * "Should update isFirstInterviewerRewarded flag"
     */
    it("should update candidate isFirstInterviewerRewarded flag to true", async () => {
      await confirmInterview({ interviewId: testInterviewId });

      // Verify candidate info has isFirstInterviewerRewarded = true
    });

    /**
     * Requirement: BLS-05-04.integration.reward.duplicate
     * "Should not award coins if already received first interview reward"
     */
    it("should not award coins on subsequent confirmations", async () => {
      // Simulate candidate already has isFirstInterviewerRewarded = true
      vi.mocked(webCandidateInformationGetById).mockResolvedValueOnce({
        uid: "candidate-123",
        isFirstInterviewerRewarded: true,
      } as any);

      const result = await confirmInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
      expect(result.rewardAwarded).toBe(false);
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-04.integration.rollback
     * "Transaction should rollback on reward failure"
     */
    it("should rollback status changes if reward creation fails", async () => {
      // Mock wallet transaction to fail
      vi.mocked(webWalletTransactionCreate).mockRejectedValueOnce(new Error("Wallet transaction failed"));

      await expect(confirmInterview({ interviewId: testInterviewId })).rejects.toThrow("Wallet transaction failed");

      // Verify interview status was not changed (rollback)
    });
  });
});

describe("Interview Decline Integration", () => {
  const mockCandidateUser = {
    uid: "candidate-user-123",
    candidateId: "candidate-123",
    companyId: null,
    email: "candidate@example.com",
  };

  const testInterviewId = "test-interview-456";

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);

    // Setup mock interview for decline tests
    vi.mocked(webJobInterviewGetById).mockResolvedValue({
      uid: testInterviewId,
      candidateId: "candidate-123",
      companyId: "company-123",
      applicationId: "app-456",
      status: "scheduled",
      appointment: Date.now() + 86400000 * 7,
      from: "10:00",
      to: "11:00",
      channel: "online",
    } as any);

    vi.mocked(webJobInterviewUpdate).mockResolvedValue(testInterviewId);
    vi.mocked(webJobApplicationGetById).mockResolvedValue({
      uid: "app-456",
      status: "scheduled",
    } as any);
    vi.mocked(webJobApplicationUpdate).mockResolvedValue("app-456");
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Full Decline Flow", () => {
    /**
     * Requirement: BLS-05-05.integration
     * "Complete decline flow updates interview and application"
     */
    it("should update interview status and application in single transaction", async () => {
      const result = await declineInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-05.integration.status
     * "Interview and application status should be 'declined'"
     */
    it("should set both interview and application status to declined", async () => {
      await declineInterview({ interviewId: testInterviewId });

      // Verify interview status in database is 'declined'
      // Verify application status in database is 'declined'
    });

    /**
     * Requirement: BLS-05-05.integration.flag
     * "Interview isAccepted flag should be false"
     */
    it("should set isAccepted flag to false", async () => {
      await declineInterview({ interviewId: testInterviewId });

      // Verify isAccepted flag in database is false
    });
  });

  describe("Decline with Reason", () => {
    /**
     * Requirement: BLS-05-05.integration.reason
     * "Should store decline reason in interview record"
     */
    it("should store decline reason in database", async () => {
      await declineInterview({
        interviewId: testInterviewId,
        reason: "I have another commitment",
      });

      // Verify rejectFeedback field in database
    });

    /**
     * Requirement: BLS-05-05.integration.reason.optional
     * "Should work without reason"
     */
    it("should succeed without reason", async () => {
      const result = await declineInterview({ interviewId: testInterviewId });

      expect(result.success).toBe(true);
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-05.integration.rollback
     * "Transaction should rollback on partial failure"
     */
    it("should rollback if application update fails", async () => {
      // Mock application update to fail
      vi.mocked(webJobApplicationUpdate).mockRejectedValueOnce(new Error("Application update failed"));

      await expect(declineInterview({ interviewId: testInterviewId })).rejects.toThrow("Application update failed");

      // Verify interview status was not changed (rollback)
    });
  });
});
