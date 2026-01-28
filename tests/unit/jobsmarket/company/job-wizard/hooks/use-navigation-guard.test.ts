import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, act } from "@testing-library/react";
import { useNavigationGuard } from "@/hooks/jobsmarket/jobs/use-navigation-guard";

// Mock Next.js router
const mockPush = vi.fn();
const mockReplace = vi.fn();
vi.mock("next/navigation", () => ({
  useRouter: () => ({
    push: mockPush,
    replace: mockReplace,
  }),
}));

describe("useNavigationGuard", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("Guard Activation", () => {
    it("should not block navigation when form is clean", () => {
      const { result } = renderHook(() => useNavigationGuard(false));

      const shouldBlock = result.current.shouldBlockNavigation();

      expect(shouldBlock).toBe(false);
    });

    it("should block navigation when form is dirty", () => {
      const { result } = renderHook(() => useNavigationGuard(true));

      const shouldBlock = result.current.shouldBlockNavigation();

      expect(shouldBlock).toBe(true);
    });

    it("should show confirmation modal when blocking navigation", () => {
      const { result } = renderHook(() => useNavigationGuard(true));

      act(() => {
        result.current.attemptNavigation("/some-path");
      });

      expect(result.current.showConfirmModal).toBe(true);
      expect(result.current.pendingPath).toBe("/some-path");
    });

    it("should not show modal when form is clean", () => {
      const { result } = renderHook(() => useNavigationGuard(false));

      act(() => {
        result.current.attemptNavigation("/some-path");
      });

      expect(result.current.showConfirmModal).toBe(false);
      expect(mockPush).toHaveBeenCalledWith("/some-path");
    });
  });

  describe("Confirmation Modal", () => {
    it("should navigate when user confirms", () => {
      const { result } = renderHook(() => useNavigationGuard(true));

      // Attempt navigation
      act(() => {
        result.current.attemptNavigation("/jobs/list");
      });

      // Confirm
      act(() => {
        result.current.confirmNavigation();
      });

      expect(mockPush).toHaveBeenCalledWith("/jobs/list");
      expect(result.current.showConfirmModal).toBe(false);
    });

    it("should stay on page when user cancels", () => {
      const { result } = renderHook(() => useNavigationGuard(true));

      // Attempt navigation
      act(() => {
        result.current.attemptNavigation("/jobs/list");
      });

      // Cancel
      act(() => {
        result.current.cancelNavigation();
      });

      expect(mockPush).not.toHaveBeenCalled();
      expect(result.current.showConfirmModal).toBe(false);
      expect(result.current.pendingPath).toBeNull();
    });
  });

  describe("Browser beforeunload", () => {
    it("should register beforeunload listener when dirty", () => {
      const addEventListenerSpy = vi.spyOn(window, "addEventListener");

      renderHook(() => useNavigationGuard(true));

      expect(addEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should remove beforeunload listener on unmount", () => {
      const removeEventListenerSpy = vi.spyOn(window, "removeEventListener");

      const { unmount } = renderHook(() => useNavigationGuard(true));

      unmount();

      expect(removeEventListenerSpy).toHaveBeenCalledWith(
        "beforeunload",
        expect.any(Function)
      );
    });

    it("should prevent default on beforeunload when dirty", () => {
      renderHook(() => useNavigationGuard(true));

      const event = new Event("beforeunload");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).toHaveBeenCalled();
    });

    it("should not prevent beforeunload when clean", () => {
      renderHook(() => useNavigationGuard(false));

      const event = new Event("beforeunload");
      const preventDefaultSpy = vi.spyOn(event, "preventDefault");

      window.dispatchEvent(event);

      expect(preventDefaultSpy).not.toHaveBeenCalled();
    });
  });

  describe("Dynamic Dirty State", () => {
    it("should update guard when dirty state changes", () => {
      const { result, rerender } = renderHook(
        ({ isDirty }) => useNavigationGuard(isDirty),
        { initialProps: { isDirty: false } }
      );

      expect(result.current.shouldBlockNavigation()).toBe(false);

      // Change to dirty
      rerender({ isDirty: true });

      expect(result.current.shouldBlockNavigation()).toBe(true);
    });

    it("should allow navigation after form becomes clean", () => {
      const { result, rerender } = renderHook(
        ({ isDirty }) => useNavigationGuard(isDirty),
        { initialProps: { isDirty: true } }
      );

      // Form is dirty
      act(() => {
        result.current.attemptNavigation("/jobs/list");
      });
      expect(result.current.showConfirmModal).toBe(true);

      // Form becomes clean
      rerender({ isDirty: false });

      // Try navigation again
      act(() => {
        result.current.attemptNavigation("/jobs/list");
      });

      expect(mockPush).toHaveBeenCalledWith("/jobs/list");
      expect(result.current.showConfirmModal).toBe(false);
    });
  });
});
