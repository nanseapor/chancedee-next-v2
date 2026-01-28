import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

import { useCompanyActions } from "@/hooks/jobsmarket/admin/use-company-actions";

/**
 * Unit tests for useCompanyActions hook
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Hook that provides company action mutations with loading states
 * and success/error callbacks.
 *
 * Coverage Target: 90%+
 */

// Mock the server actions
vi.mock("@/lib/database/actions/admin-company-actions", () => ({
  approveCompany: vi.fn(),
  rejectCompany: vi.fn(),
  suspendCompany: vi.fn(),
  reactivateCompany: vi.fn(),
}));

import {
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
} from "@/lib/database/actions/admin-company-actions";

describe("useCompanyActions", () => {
  const mockOnSuccess = vi.fn();
  const mockOnError = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    // Default: all actions succeed
    (approveCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
    (rejectCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
    (suspendCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
    (reactivateCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
      success: true,
    });
  });

  describe("approve", () => {
    it("should call approveCompany action", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(approveCompany).toHaveBeenCalledWith("company-1");
    });

    it("should set isLoading during action", async () => {
      let resolvePromise: (value: unknown) => void;
      (approveCompany as ReturnType<typeof vi.fn>).mockReturnValue(
        new Promise((resolve) => {
          resolvePromise = resolve;
        })
      );

      const { result } = renderHook(() => useCompanyActions({}));

      act(() => {
        result.current.approve("company-1");
      });

      expect(result.current.isLoading).toBe(true);

      await act(async () => {
        resolvePromise!({ success: true });
      });

      expect(result.current.isLoading).toBe(false);
    });

    it("should call onSuccess callback on success", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });

    it("should call onError callback on failure", async () => {
      (approveCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Failed to approve",
      });

      const { result } = renderHook(() =>
        useCompanyActions({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(mockOnError).toHaveBeenCalledWith("Failed to approve");
    });
  });

  describe("reject", () => {
    it("should call rejectCompany action with reason", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.reject("company-1", "ข้อมูลไม่ถูกต้อง");
      });

      expect(rejectCompany).toHaveBeenCalledWith("company-1", "ข้อมูลไม่ถูกต้อง");
    });

    it("should call onSuccess callback on success", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.reject("company-1", "reason");
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe("suspend", () => {
    it("should call suspendCompany action with reason", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.suspend("company-2", "ละเมิดข้อกำหนด");
      });

      expect(suspendCompany).toHaveBeenCalledWith(
        "company-2",
        "ละเมิดข้อกำหนด",
        undefined // duration is optional
      );
    });

    it("should call onSuccess callback on success", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.suspend("company-2", "reason");
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe("reactivate", () => {
    it("should call reactivateCompany action", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.reactivate("company-3");
      });

      expect(reactivateCompany).toHaveBeenCalledWith("company-3", undefined);
    });

    it("should call reactivateCompany action with note", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.reactivate("company-3", "แก้ไขแล้ว");
      });

      expect(reactivateCompany).toHaveBeenCalledWith("company-3", "แก้ไขแล้ว");
    });

    it("should call onSuccess callback on success", async () => {
      const { result } = renderHook(() =>
        useCompanyActions({ onSuccess: mockOnSuccess })
      );

      await act(async () => {
        await result.current.reactivate("company-3");
      });

      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  describe("Error Handling", () => {
    it("should handle network errors", async () => {
      (approveCompany as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Network error")
      );

      const { result } = renderHook(() =>
        useCompanyActions({ onError: mockOnError })
      );

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(mockOnError).toHaveBeenCalledWith("Network error");
    });

    it("should set error state on failure", async () => {
      (approveCompany as ReturnType<typeof vi.fn>).mockResolvedValue({
        success: false,
        error: "Action failed",
      });

      const { result } = renderHook(() => useCompanyActions({}));

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(result.current.error).toBe("Action failed");
    });

    it("should clear error on new action", async () => {
      (approveCompany as ReturnType<typeof vi.fn>)
        .mockResolvedValueOnce({ success: false, error: "First error" })
        .mockResolvedValueOnce({ success: true });

      const { result } = renderHook(() => useCompanyActions({}));

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(result.current.error).toBe("First error");

      await act(async () => {
        await result.current.approve("company-1");
      });

      expect(result.current.error).toBeNull();
    });
  });
});
