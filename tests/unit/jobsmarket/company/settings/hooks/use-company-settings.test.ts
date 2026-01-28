/**
 * COMP-R03: useCompanySettings Hook Tests
 *
 * RED Phase: All tests should FAIL until implementation
 */

import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// This import will fail until implementation exists
import { useCompanySettings } from "@/hooks/jobsmarket/company/use-company-settings";

// Mock SWR
vi.mock("swr", () => ({
  default: vi.fn(() => ({
    data: null,
    error: null,
    isLoading: true,
    mutate: vi.fn(),
  })),
}));

// Mock the server action
vi.mock("@/lib/database/actions/company-settings", () => ({
  updateCompanyProfile: vi.fn(() => Promise.resolve({ success: true })),
  updateCompanyLinks: vi.fn(() => Promise.resolve({ success: true })),
  updateCompanyConfig: vi.fn(() => Promise.resolve({ success: true })),
  getCompanySettings: vi.fn(() =>
    Promise.resolve({
      success: true,
      data: {
        profile: { company_name: "Test Company" },
        links: {},
        config: {},
      },
    })
  ),
}));

describe("COMP-R03: useCompanySettings Hook", () => {
  const mockCompanyId = "test-company-id";

  beforeEach(() => {
    vi.clearAllMocks();
  });

  // ============================================
  // Data Fetching Tests (~4 tests)
  // ============================================
  describe("Data Fetching", () => {
    it("should fetch company settings on mount", async () => {
      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      expect(result.current.isLoading).toBe(true);
    });

    it("should return company data when loaded", async () => {
      const mockData = {
        uid: mockCompanyId,
        company_name: "Test Company",
        industry: "Technology",
      };

      vi.mocked(await import("swr")).default.mockReturnValue({
        data: mockData,
        error: null,
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await waitFor(() => {
        expect(result.current.company).toEqual(mockData);
      });
    });

    it("should handle fetch errors", async () => {
      vi.mocked(await import("swr")).default.mockReturnValue({
        data: null,
        error: new Error("Network error"),
        isLoading: false,
        mutate: vi.fn(),
      });

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });
    });

    it("should not fetch when companyId is null", async () => {
      const { result } = renderHook(() => useCompanySettings(null));

      expect(result.current.company).toBeNull();
    });
  });

  // ============================================
  // Update Profile Tests (~3 tests)
  // ============================================
  describe("Update Profile", () => {
    it("should update profile and invalidate cache", async () => {
      const mutateFn = vi.fn();
      vi.mocked(await import("swr")).default.mockReturnValue({
        data: { uid: mockCompanyId },
        error: null,
        isLoading: false,
        mutate: mutateFn,
      });

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        await result.current.updateProfile({ company_name: "New Name" });
      });

      expect(mutateFn).toHaveBeenCalled();
    });

    it("should return success state after update", async () => {
      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        const updateResult = await result.current.updateProfile({
          company_name: "New Name",
        });
        expect(updateResult.success).toBe(true);
      });
    });

    it("should handle update errors", async () => {
      vi.mocked(
        await import("@/lib/database/actions/company-settings")
      ).updateCompanyProfile.mockRejectedValueOnce(new Error("Update failed"));

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        const updateResult = await result.current.updateProfile({
          company_name: "New Name",
        });
        expect(updateResult.success).toBe(false);
      });
    });
  });

  // ============================================
  // Update Config Tests (~3 tests)
  // ============================================
  describe("Update Config", () => {
    it("should update config and invalidate cache", async () => {
      const mutateFn = vi.fn();
      vi.mocked(await import("swr")).default.mockReturnValue({
        data: { uid: mockCompanyId },
        error: null,
        isLoading: false,
        mutate: mutateFn,
      });

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        await result.current.updateConfig({
          job_defaults: { auto_close_days: 30 },
        });
      });

      expect(mutateFn).toHaveBeenCalled();
    });

    it("should update notification settings", async () => {
      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        const updateResult = await result.current.updateConfig({
          notifications: { notify_new_application: true },
        });
        expect(updateResult.success).toBe(true);
      });
    });

    it("should handle config update errors", async () => {
      vi.mocked(
        await import("@/lib/database/actions/company-settings")
      ).updateCompanyConfig.mockRejectedValueOnce(new Error("Config update failed"));

      const { result } = renderHook(() => useCompanySettings(mockCompanyId));

      await act(async () => {
        const updateResult = await result.current.updateConfig({
          notifications: { notify_new_application: false },
        });
        expect(updateResult.success).toBe(false);
      });
    });
  });
});
