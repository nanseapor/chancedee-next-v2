import { describe, it, expect, vi, beforeEach } from "vitest";
import { webCandidateUpdateSettings } from "@/lib/database/actions/candidate-information";
import { candidateInformationRepository } from "@/lib/database/repositories/candidate-information-repository";

// Mock the repository
vi.mock("@/lib/database/repositories/candidate-information-repository", () => ({
  candidateInformationRepository: {
    getById: vi.fn(),
    update: vi.fn(),
  },
}));

/**
 * Unit tests for CAND-R03 Server Actions
 * Tests webCandidateUpdateSettings function
 */

describe("webCandidateUpdateSettings", () => {
  const mockUid = "test-candidate-123";
  const mockActorId = "test-actor-123";

  const mockExistingCandidate = {
    uid: mockUid,
    email: "test@example.com",
    isActive: true,
    isSearchable: false,
    autoAttachCoverLetter: false,
    defaultCoverLetter: "",
    emailJobRecommendations: true,
    createdAt: 1234567890,
    updatedAt: 1234567890,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Successful Updates", () => {
    it("should update isSearchable field", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          isSearchable: true,
        }),
        mockActorId
      );
    });

    it("should update autoAttachCoverLetter field", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { autoAttachCoverLetter: true },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          autoAttachCoverLetter: true,
        }),
        mockActorId
      );
    });

    it("should update defaultCoverLetter field", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      const coverLetter = "This is my cover letter";
      await webCandidateUpdateSettings(
        mockUid,
        { defaultCoverLetter: coverLetter },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          defaultCoverLetter: coverLetter,
        }),
        mockActorId
      );
    });

    it("should update emailJobRecommendations field", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { emailJobRecommendations: false },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          emailJobRecommendations: false,
        }),
        mockActorId
      );
    });

    it("should update multiple fields at once", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        {
          isSearchable: true,
          autoAttachCoverLetter: true,
          defaultCoverLetter: "My cover letter",
          emailJobRecommendations: false,
        },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          isSearchable: true,
          autoAttachCoverLetter: true,
          defaultCoverLetter: "My cover letter",
          emailJobRecommendations: false,
        }),
        mockActorId
      );
    });

    it("should preserve existing fields when updating", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          uid: mockUid,
          email: mockExistingCandidate.email,
          isActive: mockExistingCandidate.isActive,
          isSearchable: true, // Updated field
          autoAttachCoverLetter: mockExistingCandidate.autoAttachCoverLetter,
        }),
        mockActorId
      );
    });

    it("should set updatedAt to 0 (for repository to handle)", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          updatedAt: 0,
        }),
        mockActorId
      );
    });
  });

  describe("Conditional Field Updates", () => {
    it("should only update isSearchable if provided", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      const updateCall = vi.mocked(candidateInformationRepository.update).mock
        .calls[0][1];

      expect(updateCall).toHaveProperty("isSearchable", true);
      // Other fields should remain unchanged from existing
      expect(updateCall).toHaveProperty(
        "autoAttachCoverLetter",
        mockExistingCandidate.autoAttachCoverLetter
      );
    });

    it("should handle undefined fields correctly", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      // Pass empty settings object
      await webCandidateUpdateSettings(mockUid, {}, mockActorId);

      const updateCall = vi.mocked(candidateInformationRepository.update).mock
        .calls[0][1];

      // Should preserve all existing values
      expect(updateCall).toHaveProperty(
        "isSearchable",
        mockExistingCandidate.isSearchable
      );
      expect(updateCall).toHaveProperty(
        "autoAttachCoverLetter",
        mockExistingCandidate.autoAttachCoverLetter
      );
    });
  });

  describe("Error Handling", () => {
    it("should throw error when candidate not found", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(null);

      await expect(
        webCandidateUpdateSettings(mockUid, { isSearchable: true }, mockActorId)
      ).rejects.toThrow("Candidate information not found");

      expect(candidateInformationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when getById fails", async () => {
      const error = new Error("Database connection failed");
      vi.mocked(candidateInformationRepository.getById).mockRejectedValue(error);

      await expect(
        webCandidateUpdateSettings(mockUid, { isSearchable: true }, mockActorId)
      ).rejects.toThrow("Database connection failed");

      expect(candidateInformationRepository.update).not.toHaveBeenCalled();
    });

    it("should throw error when update fails", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );

      const error = new Error("Update failed");
      vi.mocked(candidateInformationRepository.update).mockRejectedValue(error);

      await expect(
        webCandidateUpdateSettings(mockUid, { isSearchable: true }, mockActorId)
      ).rejects.toThrow("Update failed");
    });
  });

  describe("Edge Cases", () => {
    it("should handle empty cover letter string", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { defaultCoverLetter: "" },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          defaultCoverLetter: "",
        }),
        mockActorId
      );
    });

    it("should handle very long cover letter", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      const longCoverLetter = "a".repeat(2000);

      await webCandidateUpdateSettings(
        mockUid,
        { defaultCoverLetter: longCoverLetter },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.objectContaining({
          defaultCoverLetter: longCoverLetter,
        }),
        mockActorId
      );
    });

    it("should handle boolean false values correctly", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        {
          isSearchable: false,
          autoAttachCoverLetter: false,
          emailJobRecommendations: false,
        },
        mockActorId
      );

      const updateCall = vi.mocked(candidateInformationRepository.update).mock
        .calls[0][1];

      expect(updateCall).toHaveProperty("isSearchable", false);
      expect(updateCall).toHaveProperty("autoAttachCoverLetter", false);
      expect(updateCall).toHaveProperty("emailJobRecommendations", false);
    });
  });

  describe("Repository Interaction", () => {
    it("should call getById before update", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      expect(candidateInformationRepository.getById).toHaveBeenCalledWith(mockUid);
      expect(candidateInformationRepository.getById).toHaveBeenCalledBefore(
        candidateInformationRepository.update as any
      );
    });

    it("should call update with correct parameters", async () => {
      vi.mocked(candidateInformationRepository.getById).mockResolvedValue(
        mockExistingCandidate
      );
      vi.mocked(candidateInformationRepository.update).mockResolvedValue(
        undefined
      );

      await webCandidateUpdateSettings(
        mockUid,
        { isSearchable: true },
        mockActorId
      );

      expect(candidateInformationRepository.update).toHaveBeenCalledWith(
        mockUid,
        expect.any(Object),
        mockActorId
      );
    });
  });
});
