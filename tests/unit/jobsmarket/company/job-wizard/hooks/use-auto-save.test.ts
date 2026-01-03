import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useAutoSave } from "@/hooks/jobsmarket/jobs/use-auto-save-field";

describe("useAutoSave", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    vi.restoreAllMocks();
  });

  describe("Debounce Behavior", () => {
    it("should debounce save calls to 1000ms", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      // Trigger multiple changes quickly
      act(() => {
        result.current.markDirty("title", "Test 1");
        result.current.markDirty("title", "Test 2");
        result.current.markDirty("title", "Test 3");
      });

      // Fast forward 500ms - should not save yet
      act(() => {
        vi.advanceTimersByTime(500);
      });
      expect(onSave).not.toHaveBeenCalled();

      // Fast forward another 500ms - should save once
      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith("title", "Test 3");
    });

    it("should reset debounce timer on new changes", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "First");
      });

      // Wait 800ms
      act(() => {
        vi.advanceTimersByTime(800);
      });

      // New change resets timer
      act(() => {
        result.current.markDirty("title", "Second");
      });

      // Wait another 800ms (1600ms total, but timer was reset)
      act(() => {
        vi.advanceTimersByTime(800);
      });
      expect(onSave).not.toHaveBeenCalled();

      // Wait final 200ms
      await act(async () => {
        vi.advanceTimersByTime(200);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith("title", "Second");
    });
  });

  describe("Save State", () => {
    it("should track dirty state", () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      expect(result.current.isDirty).toBe(false);

      act(() => {
        result.current.markDirty("title", "Test");
      });

      expect(result.current.isDirty).toBe(true);
    });

    it("should track saving state", async () => {
      let resolvePromise: () => void;
      const savePromise = new Promise<void>((resolve) => {
        resolvePromise = resolve;
      });
      const onSave = vi.fn().mockReturnValue(savePromise);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Trigger the debounced save
      await act(async () => {
        vi.advanceTimersByTime(1000);
      });

      // Save should be in progress
      expect(result.current.isSaving).toBe(true);

      // Resolve the save promise
      await act(async () => {
        resolvePromise!();
        await savePromise;
      });

      expect(result.current.isSaving).toBe(false);
    });

    it("should update lastSaved timestamp after successful save", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      expect(result.current.lastSaved).toBeNull();

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Trigger and complete the save
      await act(async () => {
        vi.advanceTimersByTime(1000);
        // Allow the save promise to resolve
        await Promise.resolve();
      });

      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });

    it("should clear dirty state after successful save", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      expect(result.current.isDirty).toBe(true);

      // Trigger and complete the save
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe("Error Handling", () => {
    it("should handle save errors", async () => {
      const onSave = vi.fn().mockRejectedValue(new Error("Save failed"));
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Trigger and wait for the rejected save
      await act(async () => {
        vi.advanceTimersByTime(1000);
        // Let the promise rejection settle
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.error).toBe("Save failed");
    });

    it("should keep dirty state on save error", async () => {
      const onSave = vi.fn().mockRejectedValue(new Error("Network error"));
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Trigger and wait for the rejected save
      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.isDirty).toBe(true);
    });

    it("should retry save after error", async () => {
      const onSave = vi
        .fn()
        .mockRejectedValueOnce(new Error("First fail"))
        .mockResolvedValueOnce(undefined);

      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      // First attempt fails
      act(() => {
        result.current.markDirty("title", "Test 1");
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
        await Promise.resolve();
      });

      expect(result.current.error).toBe("First fail");

      // Second attempt succeeds
      act(() => {
        result.current.markDirty("title", "Test 2");
      });

      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
      });

      expect(result.current.error).toBeNull();
      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });
  });

  describe("Manual Save", () => {
    it("should allow manual save bypassing debounce", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Manual save immediately
      await act(async () => {
        await result.current.saveNow();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
      expect(onSave).toHaveBeenCalledWith("title", "Test");
    });

    it("should cancel pending debounced save on manual save", async () => {
      const onSave = vi.fn().mockResolvedValue(undefined);
      const { result } = renderHook(() => useAutoSave(onSave, 1000));

      act(() => {
        result.current.markDirty("title", "Test");
      });

      // Manual save before debounce completes
      await act(async () => {
        vi.advanceTimersByTime(500);
        await result.current.saveNow();
      });

      expect(onSave).toHaveBeenCalledTimes(1);

      // Continue timer - should not save again
      await act(async () => {
        vi.advanceTimersByTime(500);
        await vi.runAllTimersAsync();
      });

      expect(onSave).toHaveBeenCalledTimes(1);
    });
  });
});
