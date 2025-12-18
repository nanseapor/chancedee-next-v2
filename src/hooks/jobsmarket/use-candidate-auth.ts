"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";

import {
  activeRoleAtom,
  sessionStateAtom,
  authenticatedUserIdAtom,
} from "@/store/jobsmarket/global-atoms";

/**
 * Candidate authentication and authorization hook
 * Per CAND-R00 Cross-Cutting RIS §3 and CAND-R01 RIS §6.1
 *
 * Implements the auth flow state machine:
 * loading → auth_check → owner_check → onboard_check → ready
 *
 * @param candidateId - The candidate UID from route params ([id])
 * @param requireOnboarded - Whether to enforce onboarding completion (default: true)
 * @returns Auth state and candidate data
 */

export type CandidateAuthState =
  | "loading"              // Initial load
  | "auth_check"           // Checking session validity
  | "redirect_login"       // Redirecting to login (unauthenticated)
  | "redirect_role"        // Redirecting to role selector (wrong role)
  | "owner_check"          // Checking ownership
  | "redirect_own"         // Redirecting to own resource (not owner)
  | "onboard_check"        // Checking onboarding status
  | "redirect_onboarding"  // Redirecting to profile (not onboarded)
  | "ready";               // Ready to render

export interface CandidateAuthResult {
  state: CandidateAuthState;
  isLoading: boolean;
  isReady: boolean;
  currentUserId: string | null;
  setOnboardingComplete: () => void;
}

export function useCandidateAuth(
  candidateId: string,
  requireOnboarded: boolean = true
): CandidateAuthResult {
  const router = useRouter();
  const [state, setState] = useState<CandidateAuthState>("loading");

  const sessionState = useAtomValue(sessionStateAtom);
  const currentUserId = useAtomValue(authenticatedUserIdAtom);
  const setActiveRole = useSetAtom(activeRoleAtom);

  useEffect(() => {
    // State machine execution
    const runAuthChecks = async () => {
      // Step 1: Initial loading
      if (state === "loading") {
        setState("auth_check");
        return;
      }

      // Step 2: Check authentication
      if (state === "auth_check") {
        // Wait for session state to be determined
        if (sessionState === "loading") {
          return; // Still waiting for auth state
        }

        // AUTH_FAILED event
        if (sessionState === "unauthenticated" || sessionState === "expired") {
          setState("redirect_login");
          const currentPath = encodeURIComponent(window.location.pathname);
          router.replace(`/jobsmarket/auth/login?from=${currentPath}`);
          return;
        }

        // AUTH_SUCCESS event - check if user has candidate role
        if (sessionState === "authenticated" && currentUserId) {
          // Note: Role check will be done via user data fetch in the component
          // For now, proceed to owner check
          setState("owner_check");
          return;
        }
      }

      // Step 3: Check ownership
      if (state === "owner_check") {
        if (!currentUserId) {
          // Still waiting for user ID
          return;
        }

        // IS_OWNER event
        if (candidateId === currentUserId) {
          // Set active role to candidate
          setActiveRole("candidate");

          if (requireOnboarded) {
            setState("onboard_check");
          } else {
            setState("ready");
          }
          return;
        }

        // NOT_OWNER event - redirect to own resource
        setState("redirect_own");
        const pathSuffix = window.location.pathname.split(candidateId)[1] || "";
        router.replace(`/jobsmarket/candidates/${currentUserId}${pathSuffix}`);
        return;
      }

      // Step 4: Check onboarding (will be implemented with candidate data)
      // This state transition happens in the component after fetching candidate data
      if (state === "onboard_check") {
        // The component will call setOnboardingComplete() after checking is_onboarded
        // For now, we stay in this state until component updates
        return;
      }
    };

    runAuthChecks();
  }, [
    state,
    sessionState,
    currentUserId,
    candidateId,
    requireOnboarded,
    router,
    setActiveRole,
  ]);

  const setOnboardingComplete = () => {
    if (state === "onboard_check") {
      setState("ready");
    }
  };

  return {
    state,
    isLoading: state !== "ready",
    isReady: state === "ready",
    currentUserId,
    setOnboardingComplete,
  };
}

/**
 * Hook to handle onboarding check after candidate data is loaded
 * Called from the dashboard component after fetching candidate info
 */
export function useCandidateOnboardingCheck(
  isOnboarded: boolean | undefined,
  candidateId: string,
  authState: CandidateAuthState,
  setOnboardingComplete: () => void
) {
  const router = useRouter();
  const hasCheckedRef = useRef(false);

  useEffect(() => {
    // Only run check when we're in onboard_check state and have the onboarding data
    if (authState !== "onboard_check" || isOnboarded === undefined || hasCheckedRef.current) {
      return;
    }

    // Mark as checked to prevent re-runs
    hasCheckedRef.current = true;

    // NOT_ONBOARDED event
    if (!isOnboarded) {
      router.replace(`/jobsmarket/candidates/${candidateId}/profile`);
      return;
    }

    // IS_ONBOARDED event - transition to ready state
    setOnboardingComplete();
  }, [authState, isOnboarded, candidateId, router, setOnboardingComplete]);

  return {
    shouldCheckOnboarding: authState === "onboard_check",
    isOnboarded,
  };
}
