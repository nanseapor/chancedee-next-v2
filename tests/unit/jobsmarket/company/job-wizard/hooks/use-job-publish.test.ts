import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act, waitFor } from "@testing-library/react";
import { useJobPublish } from "@/hooks/jobsmarket/jobs/use-job-publish";

// Mock server actions
vi.mock("@/lib/database/actions/jobs", () => ({
  webJobPublish: vi.fn(),
  webJobUpdate: vi.fn(),
}));

describe("useJobPublish", () => {
  const mockJobId = "job-123";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Publish Now", () => {
    it("should publish job immediately", async () => {
      const { webJobPublish } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobPublish(mockJobId));

      await act(async () => {
        await result.current.publishNow();
      });

      expect(webJobPublish).toHaveBeenCalledWith(mockJobId);
    });

    it("should set publishing state during publish", async () => {
      const { webJobPublish } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobPublish).mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() => useJobPublish(mockJobId));

      act(() => {
        result.current.publishNow();
      });

      expect(result.current.isPublishing).toBe(true);

      await waitFor(() => {
        expect(result.current.isPublishing).toBe(false);
      });
    });

    it("should handle publish error", async () => {
      const { webJobPublish } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobPublish).mockResolvedValue({
        success: false,
        error: "Validation failed",
      });

      const { result } = renderHook(() => useJobPublish(mockJobId));

      await act(async () => {
        await result.current.publishNow();
      });

      expect(result.current.error).toBe("Validation failed");
    });

    it("should call onSuccess callback after successful publish", async () => {
      const { webJobPublish } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useJobPublish(mockJobId, { onSuccess }));

      await act(async () => {
        await result.current.publishNow();
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("Schedule Publish", () => {
    it("should schedule job for future publication", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockResolvedValue(undefined);

      const { result } = renderHook(() => useJobPublish(mockJobId));

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await act(async () => {
        await result.current.schedulePublish(futureDate);
      });

      expect(webJobUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          jobStatus: "ontimer",
          postStartDate: expect.any(Number),
          postExpiryDate: expect.any(Number),
        }),
        expect.any(String),
        mockJobId
      );
    });

    it("should reject past dates for scheduling", async () => {
      const { result } = renderHook(() => useJobPublish(mockJobId));

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await expect(async () => {
        await act(async () => {
          await result.current.schedulePublish(pastDate);
        });
      }).rejects.toThrow("วันที่ต้องเป็นอนาคต");
    });

    it("should calculate expiry date as 30 days from start", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockResolvedValue(undefined);

      const { result } = renderHook(() => useJobPublish(mockJobId));

      const startDate = new Date();
      startDate.setDate(startDate.getDate() + 7);

      await act(async () => {
        await result.current.schedulePublish(startDate);
      });

      const callArgs = vi.mocked(webJobUpdate).mock.calls[0][0] as any;
      const expectedExpiry = startDate.getTime() + 30 * 24 * 60 * 60 * 1000;

      expect(callArgs.postExpiryDate).toBeCloseTo(expectedExpiry, -3); // Within seconds
    });

    it("should handle schedule error", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockRejectedValue(new Error("Schedule failed"));

      const { result } = renderHook(() => useJobPublish(mockJobId));

      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await expect(async () => {
        await act(async () => {
          await result.current.schedulePublish(futureDate);
        });
      }).rejects.toThrow("Schedule failed");
    });
  });

  describe("Save as Draft", () => {
    it("should keep job in draft status", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockResolvedValue(undefined);

      const { result } = renderHook(() => useJobPublish(mockJobId));

      await act(async () => {
        await result.current.saveAsDraft();
      });

      expect(webJobUpdate).toHaveBeenCalledWith(
        expect.objectContaining({
          jobStatus: "draft",
        }),
        expect.any(String),
        mockJobId
      );
    });

    it("should call onSuccess callback after saving draft", async () => {
      const { webJobUpdate } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobUpdate).mockResolvedValue(undefined);

      const onSuccess = vi.fn();
      const { result } = renderHook(() => useJobPublish(mockJobId, { onSuccess }));

      await act(async () => {
        await result.current.saveAsDraft();
      });

      expect(onSuccess).toHaveBeenCalled();
    });
  });

  describe("Publishing State", () => {
    it("should reset error on new publish attempt", async () => {
      const { webJobPublish } = await import("@/lib/database/actions/jobs");
      vi.mocked(webJobPublish)
        .mockResolvedValueOnce({ success: false, error: "First error" })
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useJobPublish(mockJobId));

      // First attempt fails
      await act(async () => {
        await result.current.publishNow();
      });
      expect(result.current.error).toBe("First error");

      // Second attempt succeeds
      await act(async () => {
        await result.current.publishNow();
      });
      expect(result.current.error).toBeNull();
    });
  });
});
