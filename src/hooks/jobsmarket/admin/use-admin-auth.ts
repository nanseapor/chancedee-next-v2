"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue, useSetAtom } from "jotai";

import {
  sessionStateAtom,
  authenticatedUserIdAtom,
} from "@/store/jobsmarket/global-atoms";
import { userRolesAtom } from "@/store/jobsmarket/admin-atoms";
import { checkAdminAuth } from "@/lib/database/actions/admin-auth";

/**
 * Admin authentication and authorization hook
 * Per ADM-R00 Cross-Cutting RIS §7.1 Access Control State Machine
 *
 * Implements the admin auth flow state machine:
 * initializing → loading → authorized → ready
 *             → no_session → redirect to login
 *             → unauthorized → redirect to 403
 *
 * Admin users must have the 'chancedee' role in their user_accounts.roles array.
 */

export type AdminAuthState =
  | "initializing"   // Initial state before any checks
  | "loading"        // Checking session and authorization
  | "no_session"     // No valid session found
  | "unauthorized"   // Authenticated but not admin
  | "ready"          // Fully authorized as admin
  | "error";         // Error occurred

export interface AdminAuthResult {
  state: AdminAuthState;
  isAdmin: boolean;
  isLoading: boolean;
  isReady: boolean;
  currentUserId: string | null;
  currentUserName?: string;
  currentUserEmail?: string;
  error?: Error;
  retry: () => void;
  logout: () => Promise<void>;
}

export function useAdminAuth(): AdminAuthResult {
  const router = useRouter();
  const [state, setState] = useState<AdminAuthState>("initializing");
  const [error, setError] = useState<Error | undefined>();
  const [adminUser, setAdminUser] = useState<{
    userId: string;
    email: string;
    name?: string;
    roles: string[];
  } | null>(null);

  const sessionState = useAtomValue(sessionStateAtom);
  const currentUserId = useAtomValue(authenticatedUserIdAtom);
  const setUserRoles = useSetAtom(userRolesAtom);

  // Check if user has admin role (from server-verified data)
  const isAdmin = adminUser?.roles?.includes("chancedee") ?? false;

  useEffect(() => {
    const runAuthChecks = async () => {
      // Step 1: Initial loading
      if (state === "initializing") {
        setState("loading");
        return;
      }

      // Step 2: Check authorization via server action
      if (state === "loading") {
        try {
          // Call server action to verify admin auth
          // This checks the session cookie and roles in Firestore
          const result = await checkAdminAuth();

          if (result) {
            // User is admin - set state and cache roles
            setAdminUser(result);
            setUserRoles(result.roles);
            setState("ready");
            return;
          }

          // Not authenticated or not admin
          // checkAdminAuth returns null if unauthorized
          const currentPath = typeof window !== "undefined"
            ? encodeURIComponent(window.location.pathname)
            : "";
          setState("no_session");
          router.replace(`/auth/login?from=${currentPath}&context=admin`);
        } catch (err) {
          console.error("[useAdminAuth] Error checking auth:", err);

          // Check if it's a specific error type
          if (err instanceof Error) {
            if (err.message.includes("Forbidden")) {
              setState("unauthorized");
              router.replace("/403");
              return;
            }
          }

          // Default: redirect to login
          const currentPath = typeof window !== "undefined"
            ? encodeURIComponent(window.location.pathname)
            : "";
          setState("no_session");
          router.replace(`/auth/login?from=${currentPath}&context=admin`);
        }
      }
    };

    runAuthChecks();
  }, [state, router, setUserRoles]);

  const retry = useCallback(() => {
    setError(undefined);
    setState("initializing");
  }, []);

  const logout = useCallback(async () => {
    try {
      // Clear session and redirect to login
      // This will be implemented when we add the logout server action
      router.replace("/auth/login");
    } catch (e) {
      console.error("Logout failed:", e);
    }
  }, [router]);

  return {
    state,
    isAdmin: state === "ready" && isAdmin,
    isLoading: state !== "ready" && state !== "error",
    isReady: state === "ready",
    currentUserId: adminUser?.userId ?? currentUserId,
    currentUserName: adminUser?.name,
    currentUserEmail: adminUser?.email,
    error,
    retry,
    logout,
  };
}
