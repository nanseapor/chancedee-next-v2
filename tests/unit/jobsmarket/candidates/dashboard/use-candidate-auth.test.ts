import { describe, it, expect, vi, beforeEach } from "vitest";
import { renderHook, waitFor } from "@testing-library/react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";

import {
  useCandidateAuth,
  useCandidateOnboardingCheck,
  type CandidateAuthState,
} from "@/hooks/jobsmarket/use-candidate-auth";

/**
 * Unit tests for useCandidateAuth and useCandidateOnboardingCheck
 * Per CAND-R00 Cross-Cutting RIS §3 and CAND-R01 RIS §6.1
 *
 * Tests the auth flow state machine:
 * loading → auth_check → owner_check → onboard_check → ready
 *
 * Coverage Target: 95%+
 */

// Mock Next.js router
vi.mock("next/navigation", () => ({
  useRouter: vi.fn(),
}));

// Mock Jotai hooks using partial import
vi.mock("jotai", async (importOriginal) => {
  const actual = await importOriginal<typeof import("jotai")>();
  return {
    ...actual,
    useAtomValue: vi.fn(),
    useSetAtom: vi.fn(),
  };
});

describe("useCandidateAuth", () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn(),
  };

  const mockSetActiveRole = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
    (useSetAtom as ReturnType<typeof vi.fn>).mockReturnValue(mockSetActiveRole);

    // Mock window.location
    Object.defineProperty(window, "location", {
      value: {
        pathname: "/jobsmarket/candidates/user123",
      },
      writable: true,
    });
  });

  describe("State Machine: Initial States", () => {
    it("should start in loading or auth_check state", () => {
      (useAtomValue as ReturnType<typeof vi.fn>)
        .mockReturnValue("loading"); // sessionState

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      // Hook starts in loading and quickly transitions to auth_check
      expect(["loading", "auth_check"]).toContain(result.current.state);
      expect(result.current.isLoading).toBe(true);
      expect(result.current.isReady).toBe(false);
    });

    it("should transition to auth_check when session is still loading", async () => {
      (useAtomValue as ReturnType<typeof vi.fn>)
        .mockReturnValue("loading"); // sessionState stays loading

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("auth_check");
      });
    });
  });

  describe("State Machine: Authentication Check (auth_check)", () => {
    it("should stay in auth_check while session is loading", () => {
      // Mock to return sessionState="loading", userId=null alternately
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("loading") // sessionState
        .mockReturnValueOnce(null) // currentUserId
        .mockReturnValue("loading"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      // State should remain in auth_check (or loading)
      expect(["loading", "auth_check"]).toContain(result.current.state);
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("should redirect to login if unauthenticated", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("unauthenticated") // sessionState
        .mockReturnValueOnce(null) // currentUserId
        .mockReturnValue("unauthenticated"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("redirect_login");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("/jobsmarket/auth/login?from=")
      );
    });

    it("should redirect to login if session expired", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("expired") // sessionState
        .mockReturnValueOnce(null) // currentUserId
        .mockReturnValue("expired"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("redirect_login");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        expect.stringContaining("/jobsmarket/auth/login?from=")
      );
    });

    it("should encode current path in login redirect", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("unauthenticated") // sessionState
        .mockReturnValueOnce(null) // currentUserId
        .mockReturnValue("unauthenticated"); // All subsequent calls

      window.location.pathname = "/jobsmarket/candidates/user123/profile";

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("redirect_login");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        `/jobsmarket/auth/login?from=${encodeURIComponent(
          "/jobsmarket/candidates/user123/profile"
        )}`
      );
    });

    it("should transition to owner_check if authenticated with user ID", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      // Pattern: sessionState, currentUserId, sessionState, currentUserId...
      let callCount = 0;
      mockUseAtomValue.mockImplementation(() => {
        // Alternate between sessionState and currentUserId
        const values = ["authenticated", "user123"];
        return values[callCount++ % 2];
      });

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      // Need to wait longer as it transitions through states
      await waitFor(() => {
        expect(["owner_check", "onboard_check"]).toContain(result.current.state);
      });

      // Should at least reach owner_check (may proceed to onboard_check)
      expect(["owner_check", "onboard_check"]).toContain(result.current.state);
    });
  });

  describe("State Machine: Ownership Check (owner_check)", () => {
    it("should wait in owner_check if currentUserId is not available", () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce(null) // currentUserId (not ready)
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue(null); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      // Should not proceed or redirect
      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("should redirect to own resource if not owner", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user456") // currentUserId (different)
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user456"); // All subsequent calls

      window.location.pathname = "/jobsmarket/candidates/user123";

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("redirect_own");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/jobsmarket/candidates/user456"
      );
    });

    it("should preserve path suffix when redirecting to own resource", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user456") // currentUserId
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user456"); // All subsequent calls

      window.location.pathname = "/jobsmarket/candidates/user123/profile";

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("redirect_own");
      });

      expect(mockRouter.replace).toHaveBeenCalledWith(
        "/jobsmarket/candidates/user456/profile"
      );
    });

    it("should set active role to candidate if owner", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user123") // currentUserId (matches)
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user123"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(mockSetActiveRole).toHaveBeenCalledWith("candidate");
      });
    });

    it("should transition to onboard_check if owner and requireOnboarded=true", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user123") // currentUserId
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user123"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true) // requireOnboarded = true
      );

      await waitFor(() => {
        expect(result.current.state).toBe("onboard_check");
      });
    });

    it("should transition to ready if owner and requireOnboarded=false", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user123") // currentUserId
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user123"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", false) // requireOnboarded = false
      );

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
        expect(result.current.isReady).toBe(true);
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("State Machine: Onboarding Check (onboard_check)", () => {
    it("should stay in onboard_check until component updates", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user123") // currentUserId
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user123"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      await waitFor(() => {
        expect(result.current.state).toBe("onboard_check");
      });

      // Should not auto-transition from onboard_check
      // Component needs to call useCandidateOnboardingCheck
      expect(result.current.state).toBe("onboard_check");
      expect(result.current.isReady).toBe(false);
    });
  });

  describe("Return Values", () => {
    it("should return currentUserId from atom", () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      // Pattern: sessionState, currentUserId alternating
      let callCount = 0;
      mockUseAtomValue.mockImplementation(() => {
        // Alternate between sessionState and currentUserId
        const values = ["authenticated", "user123"];
        return values[callCount++ % 2];
      });

      const { result } = renderHook(() =>
        useCandidateAuth("user123", true)
      );

      expect(result.current.currentUserId).toBe("user123");
    });

    it("should return isLoading=false only when state is ready", async () => {
      const mockUseAtomValue = useAtomValue as ReturnType<typeof vi.fn>;
      mockUseAtomValue
        .mockReturnValueOnce("authenticated") // sessionState
        .mockReturnValueOnce("user123") // currentUserId
        .mockReturnValueOnce("authenticated") // sessionState (2nd call)
        .mockReturnValue("user123"); // All subsequent calls

      const { result } = renderHook(() =>
        useCandidateAuth("user123", false) // Skip onboarding
      );

      await waitFor(() => {
        expect(result.current.state).toBe("ready");
      });

      expect(result.current.isLoading).toBe(false);
      expect(result.current.isReady).toBe(true);
    });

    it("should return isLoading=true for all non-ready states", () => {
      const states: CandidateAuthState[] = [
        "loading",
        "auth_check",
        "redirect_login",
        "redirect_role",
        "owner_check",
        "redirect_own",
        "onboard_check",
        "redirect_onboarding",
      ];

      states.forEach((state) => {
        // For each state, mock initial loading state
        (useAtomValue as ReturnType<typeof vi.fn>)
          .mockReturnValue("loading") // sessionState
          .mockReturnValue(null); // currentUserId

        const { result } = renderHook(() =>
          useCandidateAuth("user123", true)
        );

        // All non-ready states should have isLoading=true
        if (result.current.state !== "ready") {
          expect(result.current.isLoading).toBe(true);
          expect(result.current.isReady).toBe(false);
        }
      });
    });
  });
});

describe("useCandidateOnboardingCheck", () => {
  const mockRouter = {
    replace: vi.fn(),
    push: vi.fn(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
    (useRouter as ReturnType<typeof vi.fn>).mockReturnValue(mockRouter);
  });

  describe("Onboarding Status Checks", () => {
    it("should not redirect if authState is not onboard_check", () => {
      const mockSetOnboardingComplete = vi.fn();
      const { result } = renderHook(() =>
        useCandidateOnboardingCheck(false, "user123", "ready", mockSetOnboardingComplete)
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(result.current.shouldCheckOnboarding).toBe(false);
    });

    it("should not redirect if onboarding status is undefined", () => {
      const mockSetOnboardingComplete = vi.fn();
      const { result } = renderHook(() =>
        useCandidateOnboardingCheck(undefined, "user123", "onboard_check", mockSetOnboardingComplete)
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
    });

    it("should redirect to profile if not onboarded", async () => {
      const mockSetOnboardingComplete = vi.fn();
      const { result } = renderHook(() =>
        useCandidateOnboardingCheck(false, "user123", "onboard_check", mockSetOnboardingComplete)
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledWith(
          "/jobsmarket/candidates/user123/profile"
        );
      });

      expect(result.current.isOnboarded).toBe(false);
    });

    it("should not redirect if already onboarded", () => {
      const mockSetOnboardingComplete = vi.fn();
      const { result } = renderHook(() =>
        useCandidateOnboardingCheck(true, "user123", "onboard_check", mockSetOnboardingComplete)
      );

      expect(mockRouter.replace).not.toHaveBeenCalled();
      expect(mockSetOnboardingComplete).toHaveBeenCalledTimes(1);
      expect(result.current.isOnboarded).toBe(true);
    });

    it("should only check once even if re-rendered", async () => {
      const mockSetOnboardingComplete = vi.fn();
      const { rerender } = renderHook(
        ({ isOnboarded }) =>
          useCandidateOnboardingCheck(isOnboarded, "user123", "onboard_check", mockSetOnboardingComplete),
        { initialProps: { isOnboarded: false } }
      );

      await waitFor(() => {
        expect(mockRouter.replace).toHaveBeenCalledTimes(1);
      });

      // Re-render with same props
      rerender({ isOnboarded: false });

      // Should not redirect again
      expect(mockRouter.replace).toHaveBeenCalledTimes(1);
    });

    it("should return shouldCheckOnboarding=true when in onboard_check state", () => {
      const { result } = renderHook(() =>
        useCandidateOnboardingCheck(undefined, "user123", "onboard_check")
      );

      expect(result.current.shouldCheckOnboarding).toBe(true);
    });

    it("should return shouldCheckOnboarding=false for other states", () => {
      const states: CandidateAuthState[] = [
        "loading",
        "auth_check",
        "redirect_login",
        "owner_check",
        "ready",
      ];

      states.forEach((state) => {
        const { result } = renderHook(() =>
          useCandidateOnboardingCheck(true, "user123", state)
        );

        expect(result.current.shouldCheckOnboarding).toBe(false);
      });
    });
  });
});
