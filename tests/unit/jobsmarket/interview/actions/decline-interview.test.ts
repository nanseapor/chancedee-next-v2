/**
 * @fileoverview Tests for declineInterview action
 * @specification BLS-05 Interview Management
 * @section BLS-05-05
 *
 * Requirements tested:
 * - BLS-05-05.auth: User must be candidate
 * - BLS-05-05.validation.exists: Interview must exist
 * - BLS-05-05.validation.status: Status allows decline ['scheduled', 'confirmed']
 * - BLS-05-05.update: Update interview status to 'declined'
 * - BLS-05-05.flag: Set is_accepted to false
 * - BLS-05-05.side-effect.status: Update application status to 'declined'
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
import { declineInterview } from "@/lib/database/actions/interview-management";

describe("declineInterview", () => {
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

  const validInput = {
    interviewId: "interview-123",
  };

  beforeEach(() => {
    vi.clearAllMocks();
    vi.mocked(getSessionUser).mockResolvedValue(mockCandidateUser);
    vi.mocked(webJobInterviewGetById).mockResolvedValue(mockInterview);
    vi.mocked(webJobApplicationGetById).mockResolvedValue(mockApplication);
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authorization", () => {
    /**
     * Requirement: BLS-05-05.auth
     * "User must be candidate"
     */
    it("should reject if user is not authenticated", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(null);

      await expect(declineInterview(validInput)).rejects.toThrow("UNAUTHORIZED");
    });

    /**
     * Requirement: BLS-05-05.auth
     * "User must be candidate"
     */
    it("should reject if user is company member (not candidate)", async () => {
      vi.mocked(getSessionUser).mockResolvedValue(mockCompanyUser);

      await expect(declineInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-05.auth
     * "User must be the interview's candidate"
     */
    it("should reject if user is different candidate", async () => {
      vi.mocked(getSessionUser).mockResolvedValue({
        ...mockCandidateUser,
        candidateId: "different-candidate",
      });

      await expect(declineInterview(validInput)).rejects.toThrow("FORBIDDEN");
    });

    /**
     * Requirement: BLS-05-05.auth
     * "Accept if user is correct candidate"
     */
    it("should accept if user is the interview candidate", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await declineInterview(validInput);

      expect(result.success).toBe(true);
    });
  });

  describe("Validation - Interview", () => {
    /**
     * Requirement: BLS-05-05.validation.exists
     * "Interview must exist"
     */
    it("should reject if interview not found", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue(null);

      await expect(declineInterview(validInput)).rejects.toThrow("INTERVIEW_NOT_FOUND");
    });

    /**
     * Requirement: BLS-05-05.validation.status
     * "Status allows decline - scheduled"
     */
    it("should accept if interview status is 'scheduled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "scheduled",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await declineInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-05.validation.status
     * "Status allows decline - confirmed"
     */
    it("should accept if interview status is 'confirmed'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "confirmed",
      });
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await declineInterview(validInput);

      expect(result.success).toBe(true);
    });

    /**
     * Requirement: BLS-05-05.validation.status
     * "Cannot decline already declined"
     */
    it("should reject if interview status is already 'declined'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "declined",
      });

      await expect(declineInterview(validInput)).rejects.toThrow("ALREADY_DECLINED");
    });

    /**
     * Requirement: BLS-05-05.validation.status
     * "Cannot decline cancelled interview"
     */
    it("should reject if interview status is 'cancelled'", async () => {
      vi.mocked(webJobInterviewGetById).mockResolvedValue({
        ...mockInterview,
        status: "cancelled",
      });

      await expect(declineInterview(validInput)).rejects.toThrow("INTERVIEW_CANCELLED");
    });
  });

  describe("Interview Update", () => {
    /**
     * Requirement: BLS-05-05.update
     * "Update interview status to 'declined'"
     */
    it("should update interview status to declined", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await declineInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "declined",
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-05.flag
     * "Set is_accepted to false"
     */
    it("should set isAccepted to false", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await declineInterview(validInput);

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          isAccepted: false,
        }),
        expect.any(String),
        "interview-123"
      );
    });

    /**
     * Requirement: BLS-05-05.feedback
     * "Store optional decline reason"
     */
    it("should store decline reason if provided", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await declineInterview({
        ...validInput,
        reason: "I have another commitment",
      });

      expect(webJobInterviewUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          rejectFeedback: "I have another commitment",
        }),
        expect.any(String),
        "interview-123"
      );
    });
  });

  describe("Application Status Sync", () => {
    /**
     * Requirement: BLS-05-05.side-effect.status
     * "Update application status to 'declined'"
     */
    it("should update application status to declined", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      await declineInterview(validInput);

      expect(webJobApplicationUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          status: "declined",
        }),
        expect.any(String),
        "app-123"
      );
    });
  });

  describe("Return Value", () => {
    /**
     * Requirement: BLS-05-05
     * "Return success on decline"
     */
    it("should return success true on successful decline", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");

      const result = await declineInterview(validInput);

      expect(result).toEqual({
        success: true,
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: BLS-05-05.error
     * "Handle database errors gracefully"
     */
    it("should handle interview update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockRejectedValue(new Error("Database error"));

      await expect(declineInterview(validInput)).rejects.toThrow("Database error");
    });

    /**
     * Requirement: BLS-05-05.error
     * "Handle application update failure"
     */
    it("should handle application update failure", async () => {
      vi.mocked(webJobInterviewUpdate).mockResolvedValue("interview-123");
      vi.mocked(webJobApplicationUpdate).mockRejectedValue(new Error("App update error"));

      await expect(declineInterview(validInput)).rejects.toThrow("App update error");
    });
  });
});
