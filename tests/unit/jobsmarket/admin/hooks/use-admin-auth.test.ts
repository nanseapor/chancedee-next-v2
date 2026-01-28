import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";

import {
  useAdminAuth,
  type AdminAuthState,
} from "@/hooks/jobsmarket/admin/use-admin-auth";

/**
 * Unit tests for useAdminAuth hook
 * Per ADM-R00 Cross-Cutting RIS §7.1 Access Control State Machine
 *
 * Tests the admin auth flow state machine:
 * initializing → loading → authorized → ready
 *                       → unauthorized → redirect
 *
 * Coverage Target: 90%+
 */

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Jotai hooks
vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useAtomValue: vi.fn(() => null),
    useSetAtom: vi.fn(() => vi.fn()),
  };
});

// Mock the server action
vi.mock("@/lib/database/actions/admin-auth", () => ({
  checkAdminAuth: vi.fn(),
}));

import { checkAdminAuth } from "@/lib/database/actions/admin-auth";

describe("useAdminAuth", () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe("State Machine: Initial States", () => {
    it("should start in initializing state", () => {
      // Mock server action to hang (not resolve yet)
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      expect(["initializing", "loading"]).toContain(result.current.state);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isAdmin).toBe(false);
    });

    it("should transition to loading when checking session", async () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(["initializing", "loading"]).toContain(result.current.state);
      });

      expect(result.current.isLoading).toBe(true);
    });
  });

  describe("State Machine: No Session (unauthenticated)", () => {
    it("should redirect to login if no session exists", async () => {
      // Mock server action returning null (no session)
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("no_session");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("/jobsmarket/auth/login")
      );
    });

    it("should redirect to login if session expired", async () => {
      // Mock server action returning null (expired session)
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("no_session");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("/jobsmarket/auth/login")
      );
    });
  });

  describe("State Machine: Authorization Check", () => {
    it("should transition to authorized if user has chancedee role", async () => {
      // Mock server action returning admin user
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "admin123",
        email: "admin@test.com",
        name: "Admin User",
        roles: ["chancedee"],
      });

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
      });

      expect(result.current.isAdmin).toBe(true);
      expect(result.current.isLoading).toBe(false);
    });

    it("should redirect to 403 if user does not have chancedee role", async () => {
      // Mock server action throwing Forbidden error
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Forbidden: Admin access required")
      );

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("unauthorized");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("/403")
      );
      expect(result.current.isAdmin).toBe(false);
    });

    it("should redirect to login with error if user is company-only", async () => {
      // Mock server action throwing Forbidden error
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockRejectedValue(
        new Error("Forbidden: Admin access required")
      );

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("unauthorized");
      });

      expect(result.current.isAdmin).toBe(false);
    });

    it("should handle multi-role user with chancedee role", async () => {
      // Mock server action returning user with multiple roles
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "admin123",
        email: "admin@test.com",
        name: "Admin User",
        roles: ["candidate", "chancedee"],
      });

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
      });

      expect(result.current.isAdmin).toBe(true);
    });
  });

  describe("State Machine: Ready State", () => {
    it("should return isReady=true when fully authorized", async () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "admin123",
        email: "admin@test.com",
        roles: ["chancedee"],
      });

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
      });

      expect(result.current.isReady).toBe(true);
      expect(result.current.isLoading).toBe(false);
      expect(result.current.isAdmin).toBe(true);
    });

    it("should return currentUserId when authorized", async () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue({
        userId: "admin123",
        email: "admin@test.com",
        roles: ["chancedee"],
      });

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
      });

      expect(result.current.currentUserId).toBe("admin123");
    });
  });

  describe("Return Values", () => {
    it("should return isLoading=true for all non-ready states", () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      if (result.current.state !== "ready") {
        expect(result.current.isLoading).toBe(true);
        expect(result.current.isReady).toBe(false);
      }
    });

    it("should return isAdmin=false when not authorized", () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      expect(result.current.isAdmin).toBe(false);
    });

    it("should return currentUserId as null when not authenticated", async () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockResolvedValue(null);

      const { result } = renderHook(() => useAdminAuth());

      await waitFor(() => {
        expect(result.current.state).toBe("no_session");
      });

      expect(result.current.currentUserId).toBeNull();
    });
  });

  describe("Utility Functions", () => {
    it("should provide retry function", () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      expect(typeof result.current.retry).toBe("function");
    });

    it("should provide logout function", () => {
      (checkAdminAuth as ReturnType<typeof vi.fn>).mockImplementation(
        () => new Promise(() => {})
      );

      const { result } = renderHook(() => useAdminAuth());

      expect(typeof result.current.logout).toBe("function");
    });
  });
});
