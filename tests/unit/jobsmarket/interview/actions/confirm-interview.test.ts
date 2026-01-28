/**
 * @fileoverview Tests for confirmInterview action
 * @specification BLS-05 Interview Management
 * @section BLS-05-04
 *
 * Requirements tested:
 * - BLS-05-04.auth: User must be candidate
 * - BLS-05-04.validation.exists: Interview must exist
 * - BLS-05-04.validation.status: Status must be 'scheduled'
 * - BLS-05-04.validation.expired: Interview must not be expired
 * - BLS-05-04.update: Update interview status to 'confirmed'
 * - BLS-05-04.flag: Set is_accepted to true
 * - BLS-05-04.reward: Award 100 coins for first interview
 * - BLS-05-04.reward.flag: Update isFirstInterviewerRewarded flag
 * - BLS-05-04.side-effect.status: Update application status to 'confirmed'
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

vi.mock("@/lib/database/actions/candidate-information", () => ({
  webCandidateInformationGetById: vi.fn(),
  webCandidateInformationUpdate: vi.fn(),
}));

vi.mock("@/lib/database/actions/wallet-transactions", () => ({
  webWalletTransactionCreate: vi.fn(),
}));

vi.mock("@/lib/database/actions/pockets", () => ({
  webPocketsUpdate: vi.fn(),
  webPocketsGetById: vi.fn(),
}));

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { webJobInterviewGetById, webJobInterviewUpdate } from "@/lib/database/actions/job-interviews";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";
import { webCandidateInformationGetById, webCandidateInformationUpdate } from "@/lib/database/actions/candidate-information";
import { webWalletTransactionCreate } from "@/lib/database/actions/wallet-transactions";
import { webPocketsUpdate, webPocketsGetById } from "@/lib/database/actions/pockets";

// Import the action to test
import { confirmInterview } from "@/lib/database/actions/interview-management";

describe("confirmInterview", () => {
  const mockCandidateUser = {
    uid: "candidate-user-123",
    candidateId: "candidate-123",
    companyId: null,
    email: "candidate@example.com",
  };

  const mockCompanyUser = {
    uid: "company-user-123",
    candidateId: null,
    companyId: "company-123",
    email: "hr@company.com",
  };

  const mockInterview = {
    uid: "interview-123",
    applicationId: "app-123",
    candidateId: "candidate-123",
    companyId: "company-123",
    jobId: "job-123",
    status: "scheduled",
    channel: "online",
    appointment: Date.now() + 86400000 * 7, // 7 days from now
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

  const mockCandidateInfo = {
    uid: "candidate-123",
    firstnameTH: "Test",
    lastnameTH: "Candidate",
    isFirstInterviewerRewarded: false,
    email: "candidate@example.com",
  };

  const validInput = {
    interviewId: "interview-123",
  };

  const mockPocket = {
    uid: "candidate-123",
    currency: "coin" as const,
    balance: 0,
    latest: [],
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);
    vi.mocked(webJobInterviewGetById).mockResolvedValue(mockInterview);
    vi.mocked(webJobApplicationGetById).mockResolvedValue(mockApplication);
    vi.mocked(webCandidateInformationGetById).mockResolvedValue(mockCandidateInfo);
    vi.mocked(webPocketsGetById).mockResolvedValue(mockPocket);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-05-04.auth
     * "User must be candidate"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(confirmInterview(validInput)).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-05-04.auth
     * "User must be candidate"
     */
    it("should reject if user is company member (not candidate)", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);

      await expect(confirmInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-04.auth
     * "User must be the interview's candidate"
     */
    it("should reject if user is different candidate", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        ...mockCandidateUser,
        candidateId: "different-candidate",
      });

      await expect(confirmInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-04.auth
     * "Accept if user is correct candidate"
     */
    it("should accept if user is the interview candidate", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Interview", () => {
    /**
     * Requirement: BLS-05-04.validation.exists
     * "Interview must exist"
     */
    it("should reject if interview not found", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue(null);

      await expect(confirmInterview(validInput)).rejects.toThrow("INTERVIEW_NOT_FOUND");
    });

    /**
     * Requirement: BLS-05-04.validation.status
     * "Status must be 'scheduled'"
     */
    it("should reject if interview status is 'confirmed'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "confirmed",
      });

      await expect(confirmInterview(validInput)).rejects.toThrow("ALREADY_CONFIRMED");
    });

    /**
     * Requirement: BLS-05-04.validation.status
     * "Status must be 'scheduled'"
     */
    it("should reject if interview status is 'cancelled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "cancelled",
      });

      await expect(confirmInterview(validInput)).rejects.toThrow("INTERVIEW_CANCELLED");
    });

    /**
     * Requirement: BLS-05-04.validation.status
     * "Status must be 'scheduled'"
     */
    it("should reject if interview status is 'declined'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });

      await expect(confirmInterview(validInput)).rejects.toThrow("INVALID_INTERVIEW_STATUS");
    });

    /**
     * Requirement: BLS-05-04.validation.expired
     * "Interview must not be expired (appointment > now)"
     */
    it("should reject if interview date has passed", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        appointment: Date.now() - 86400000, // Yesterday
      });

      await expect(confirmInterview(validInput)).rejects.toThrow("INTERVIEW_EXPIRED");
    });

    /**
     * Requirement: BLS-05-04.validation.expired
     * "Interview not expired - accept if appointment is in future"
     */
    it("should accept if interview date is in future", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        appointment: Date.now() + 86400000, // Tomorrow
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Interview Update", () => {
    /**
     * Requirement: BLS-05-04.update
     * "Update interview status to 'confirmed'"
     */
    it("should update interview status to confirmed", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-04.flag
     * "Set is_accepted to true"
     */
    it("should set isAccepted to true", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isAccepted: true,
        }),
        expect.any(String),
        "interview-123"
      );
    });
  });

  describe("Application Status Sync", () => {
    /**
     * Requirement: BLS-05-04.side-effect.status
     * "Update application status to 'confirmed'"
     */
    it("should update application status to confirmed", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webJobApplicationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "confirmed",
        }),
        expect.any(String),
        "app-123"
      );
    });
  });

  describe("First Interview Reward", () => {
    /**
     * Requirement: BLS-05-04.reward + BLS-10 field semantics
     * "Award 100 coins for first interview with correct field values"
     */
    it("should create transaction with transactionOrigin=first_interview_reward", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webWalletTransactionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionOrigin: "first_interview_reward",
        }),
        "candidate-123",
        "coin"
      );
    });

    /**
     * Requirement: BLS-10 field semantics
     * "transactionType should be 'deposit' (not 'first_interview_reward')"
     */
    it("should create transaction with transactionType=deposit", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webWalletTransactionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionType: "deposit",
        }),
        "candidate-123",
        "coin"
      );
    });

    /**
     * Requirement: BLS-05-04.reward + CRITICAL BUG FIX
     * "Must update pocket balance when awarding coins"
     */
    it("should update pocket balance by +100 coins", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(webPocketsGetById).mockResolvedValue({ ...mockPocket, balance: 50 });

      await confirmInterview(validInput);

      expect(webPocketsGetById).toHaveBeenCalledWith("candidate-123", "coin");
      expect(webPocketsUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          uid: "candidate-123",
          currency: "coin",
          balance: 150, // 50 + 100
        }),
        "candidate-123",
        "candidate-123",
        "coin"
      );
    });

    /**
     * Requirement: BLS-05-04.reward
     * "Award 100 coins for first interview"
     */
    it("should award 100 coins for first interview", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(webWalletTransactionCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          transactionAmount: 100,
        }),
        "candidate-123",
        "coin"
      );
      expect(result.rewardAwarded).toBe(true);
    });

    /**
     * Requirement: BLS-05-04.reward.flag
     * "Update isFirstInterviewerRewarded flag to prevent duplicate"
     */
    it("should update isFirstInterviewerRewarded flag after reward", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webCandidateInformationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isFirstInterviewerRewarded: true,
        }),
        expect.any(String),
        "candidate-123"
      );
    });

    /**
     * Requirement: BLS-05-04.reward.flag
     * "Do not award if already received first interview reward"
     */
    it("should not award coins if already received first interview reward", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: true,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(webWalletTransactionCreate).not.toHaveBeenCalled();
      expect(result.rewardAwarded).toBe(false);
    });

    /**
     * Requirement: BLS-05-04.reward.flag
     * "Do not update balance if already received first interview reward"
     */
    it("should not update balance if already received first interview reward", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: true,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      expect(webPocketsUpdate).not.toHaveBeenCalled();
    });

    /**
     * Requirement: BLS-05-04.reward
     * "First interview reward is 100 coins (per CHAT-R02 §10.3)"
     */
    it("should award exactly 100 coins (not more, not less)", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await confirmInterview(validInput);

      const walletCall = vi.mocked(webWalletTransactionCreate).mock.calls[0];
      expect(walletCall[0].transactionAmount).toBe(100);
    });
  });

  describe("Return Value", () => {
    /**
     * Requirement: BLS-05-04
     * "Return success with reward status"
     */
    it("should return success true with rewardAwarded true for first interview", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(result).toEqual({
        success: true,
        rewardAwarded: true,
      });
    });

    /**
     * Requirement: BLS-05-04
     * "Return success with reward status"
     */
    it("should return success true with rewardAwarded false for subsequent interviews", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: true,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await confirmInterview(validInput);

      expect(result).toEqual({
        success: true,
        rewardAwarded: false,
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-04.error
     * "Handle database errors gracefully"
     */
    it("should handle interview update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockRejectedValue(new Error("Database error"));

      await expect(confirmInterview(validInput)).rejects.toThrow("Database error");
    });

    /**
     * Requirement: BLS-05-04.error
     * "Handle wallet transaction failure"
     */
    it("should handle wallet transaction failure", async () => {
      vi.mocked(webCandidateInformationGetById).mockResolvedValue({
        ...mockCandidateInfo,
        isFirstInterviewerRewarded: false,
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(webWalletTransactionCreate).mockRejectedValue(new Error("Wallet error"));

      // Interview should still be confirmed even if wallet fails
      // This is a business decision - confirm first, reward is secondary
      await expect(confirmInterview(validInput)).rejects.toThrow("Wallet error");
    });
  });
});
