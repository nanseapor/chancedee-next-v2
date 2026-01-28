import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJobDraft } from "@/hooks/jobsmarket/jobs/use-job-draft";

// Mock server actions
vi.mock("@/lib/database/actions/jobs", () => ({
  webJobCreate: vi.fn(),
  webJobUpdate: vi.fn(),
  webJobGetById: vi.fn(),
}));

describe("useJobDraft", () => {
  const mockUserId = "test-user-123";
  const mockDraftId = "draft-456";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Create Draft", () => {
    it("should create new draft with form data", async () => {
      const { webJobCreate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobCreate).mockResolvedValue(mockDraftId);

      const { result } = renderHook(() => useJobDraft(mockUserId));

      const formData = {
        title: "Frontend Developer",
        jobType: "fulltime" as const,
        jobLevel: "mid",
        numberOfPosition: 1,
        hideSalary: false,
        skills: ["React"],
        workModel: "hybrid" as const,
      };

      let draftId: string | undefined;
      await act(async () => {
        draftId = await result.current.createDraft(formData);
      });

      expect(webJobCreate).toHaveBeenCalledWith(
        expect.objectContaining({
          title: "Frontend Developer",
          jobStatus: "draft",
        }),
        mockUserId
      );
      expect(draftId).toBe(mockDraftId);
    });

    it("should handle create draft error", async () => {
      const { webJobCreate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobCreate).mockRejectedValue(new Error("Network error"));

      const { result } = renderHook(() => useJobDraft(mockUserId));

      const formData = {
        title: "Test Job",
        jobType: "fulltime" as const,
        jobLevel: "mid",
        numberOfPosition: 1,
        hideSalary: false,
        skills: [],
        workModel: "onsite" as const,
      };

      await expect(async () => {
        await act(async () => {
          await result.current.createDraft(formData);
        });
      }).rejects.toThrow("Network error");
    });

    it("should set jobStatus to draft automatically", async () => {
      const { webJobCreate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobCreate).mockResolvedValue(mockDraftId);

      const { result } = renderHook(() => useJobDraft(mockUserId));

      const formData = {
        title: "Test Job",
        jobType: "fulltime" as const,
        jobLevel: "mid",
        numberOfPosition: 1,
        hideSalary: false,
        skills: [],
        workModel: "onsite" as const,
      };

      await act(async () => {
        await result.current.createDraft(formData);
      });

      expect(webJobCreate).toHaveBeenCalledWith(
        expect.objectContaining({ jobStatus: "draft" }),
        mockUserId
      );
    });
  });

  describe("Update Draft", () => {
    it("should update existing draft with partial data", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockResolvedValue(undefined);

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      const updates = {
        title: "Updated Title",
      };

      await act(async () => {
        await result.current.updateDraft(updates);
      });

      expect(webJobUpdate).toHaveBeenCalledWith(
        expect.objectContaining(updates),
        mockUserId,
        mockDraftId
      );
    });

    it("should throw error if updating without draftId", async () => {
      const { result } = renderHook(() => useJobDraft(mockUserId));

      await expect(async () => {
        await act(async () => {
          await result.current.updateDraft({ title: "Test" });
        });
      }).rejects.toThrow("Cannot update draft without draftId");
    });

    it("should handle update draft error", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockRejectedValue(new Error("Update failed"));

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      await expect(async () => {
        await act(async () => {
          await result.current.updateDraft({ title: "Test" });
        });
      }).rejects.toThrow("Update failed");
    });
  });

  describe("Load Draft", () => {
    it("should load existing draft by ID", async () => {
      const { webJobGetById } = await import("@/lib/database/actions/jobs");
      const mockDraftData = {
        uid: mockDraftId,
        title: "Existing Draft",
        jobType: "fulltime",
        jobStatus: "draft",
      };
      vi.mocked(webJobGetById).mockResolvedValue(mockDraftData as any);

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      await waitFor(() => {
        expect(result.current.draft).toEqual(mockDraftData);
      });

      expect(webJobGetById).toHaveBeenCalledWith(mockDraftId);
    });

    it("should set loading state while fetching draft", async () => {
      const { webJobGetById } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobGetById).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      expect(result.current.isLoading).toBe(true);
    });

    it("should handle load draft error", async () => {
      const { webJobGetById } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobGetById).mockRejectedValue(new Error("Draft not found"));

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      await waitFor(() => {
        expect(result.current.error).toBe("Draft not found");
      });
    });
  });

  describe("Draft State", () => {
    it("should track saving state during create", async () => {
      const { webJobCreate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobCreate).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve(mockDraftId), 100))
      );

      const { result } = renderHook(() => useJobDraft(mockUserId));

      const formData = {
        title: "Test",
        jobType: "fulltime" as const,
        jobLevel: "mid",
        numberOfPosition: 1,
        hideSalary: false,
        skills: [],
        workModel: "onsite" as const,
      };

      act(() => {
        result.current.createDraft(formData);
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });

    it("should track saving state during update", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockImplementation(
        () => new Promise((resolve) => setTimeout(resolve, 100))
      );

      const { result } = renderHook(() => useJobDraft(mockUserId, mockDraftId));

      act(() => {
        result.current.updateDraft({ title: "Updated" });
      });

      expect(result.current.isSaving).toBe(true);

      await waitFor(() => {
        expect(result.current.isSaving).toBe(false);
      });
    });
  });
});
