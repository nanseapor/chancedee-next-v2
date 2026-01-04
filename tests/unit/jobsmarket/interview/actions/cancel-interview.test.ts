/**
 * @fileoverview Tests for cancelInterview action
 * @specification BLS-05 Interview Management
 * @section BLS-05-03
 *
 * Requirements tested:
 * - BLS-05-03.auth: User must be company member
 * - BLS-05-03.validation.exists: Interview must exist
 * - BLS-05-03.validation.status: Status is cancellable ['scheduled', 'confirmed']
 * - BLS-05-03.update: Update interview status to 'cancelled'
 * - BLS-05-03.flag: Set is_cancel to true
 * - BLS-05-03.reason: Accept optional cancel reason (max 500 chars)
 * - BLS-05-03.side-effect.status: Update application status to 'cancelled'
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

vi.mock("next/cache", () => ({
  revalidatePath: vi.fn(),
  revalidateTag: vi.fn(),
}));

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { webJobInterviewGetById, webJobInterviewUpdate } from "@/lib/database/actions/job-interviews";
import { webJobApplicationGetById, webJobApplicationUpdate } from "@/lib/database/actions/job-applications";

// Import the action to test
import { cancelInterview } from "@/lib/database/actions/interview-management";

describe("cancelInterview", () => {
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

  const validInput = {
    interviewId: "interview-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);
    vi.mocked(webJobInterviewGetById).mockResolvedValue(mockInterview);
    vi.mocked(webJobApplicationGetById).mockResolvedValue(mockApplication);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-05-03.auth
     * "User must be company member"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(cancelInterview(validInput)).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-05-03.auth
     * "User must be company member"
     */
    it("should reject if user is candidate (not company)", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);

      await expect(cancelInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-03.auth
     * "User must be from the interview's company"
     */
    it("should reject if user is from different company", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        ...mockCompanyUser,
        companyId: "different-company",
      });

      await expect(cancelInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-03.auth
     * "Accept if user is from correct company"
     */
    it("should accept if user is from the interview company", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await cancelInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Interview", () => {
    /**
     * Requirement: BLS-05-03.validation.exists
     * "Interview must exist"
     */
    it("should reject if interview not found", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue(null);

      await expect(cancelInterview(validInput)).rejects.toThrow("INTERVIEW_NOT_FOUND");
    });

    /**
     * Requirement: BLS-05-03.validation.status
     * "Status is cancellable - scheduled"
     */
    it("should accept if interview status is 'scheduled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "scheduled",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await cancelInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-03.validation.status
     * "Status is cancellable - confirmed"
     */
    it("should accept if interview status is 'confirmed'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "confirmed",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await cancelInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-03.validation.status
     * "Cannot cancel already cancelled"
     */
    it("should reject if interview status is already 'cancelled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "cancelled",
      });

      await expect(cancelInterview(validInput)).rejects.toThrow("ALREADY_CANCELLED");
    });

    /**
     * Requirement: BLS-05-03.validation.status
     * "Cannot cancel declined interview"
     */
    it("should reject if interview status is 'declined'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });

      await expect(cancelInterview(validInput)).rejects.toThrow("INVALID_INTERVIEW_STATUS");
    });
  });

  describe("Interview Update", () => {
    /**
     * Requirement: BLS-05-03.update
     * "Update interview status to 'cancelled'"
     */
    it("should update interview status to cancelled", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await cancelInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-03.flag
     * "Set is_cancel to true"
     */
    it("should set isCancel to true", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await cancelInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isCancel: true,
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-03.reason
     * "Accept optional cancel reason"
     */
    it("should store cancel reason if provided", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await cancelInterview({
        ...validInput,
        reason: "Position has been filled",
      });

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          cancelReason: "Position has been filled",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-03.reason
     * "Cancel reason max 500 characters"
     */
    it("should reject if cancel reason exceeds 500 characters", async () => {
      const longReason = "a".repeat(501);

      await expect(
        cancelInterview({
          ...validInput,
          reason: longReason,
        })
      ).rejects.toThrow("REASON_TOO_LONG");
    });

    /**
     * Requirement: BLS-05-03.reason
     * "Cancel reason max 500 characters"
     */
    it("should accept if cancel reason is exactly 500 characters", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await cancelInterview({
        ...validInput,
        reason: "a".repeat(500),
      });

      expect(result.success).toBe(true);
    });
  });

  describe("Application Status Sync", () => {
    /**
     * Requirement: BLS-05-03.side-effect.status
     * "Update application status to 'cancelled'"
     */
    it("should update application status to cancelled", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await cancelInterview(validInput);

      expect(webJobApplicationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "cancelled",
        }),
        expect.any(String),
        "app-123"
      );
    });
  });

  describe("Return Value", () => {
    /**
     * Requirement: BLS-05-03
     * "Return success on cancel"
     */
    it("should return success true on successful cancel", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await cancelInterview(validInput);

      expect(result).toEqual({
        success: true,
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-03.error
     * "Handle database errors gracefully"
     */
    it("should handle interview update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockRejectedValue(new Error("Database error"));

      await expect(cancelInterview(validInput)).rejects.toThrow("Database error");
    });

    /**
     * Requirement: BLS-05-03.error
     * "Handle application update failure"
     */
    it("should handle application update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(webJobApplicationUpdate).mockRejectedValue(new Error("App update error"));

      await expect(cancelInterview(validInput)).rejects.toThrow("App update error");
    });
  });
});
