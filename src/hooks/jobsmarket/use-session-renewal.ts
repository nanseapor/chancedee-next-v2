"use client";

/**
 * Session Renewal Hook for Jobsmarket
 * Per AUTH-R00 Session Renewal System
 *
 * Proactively renews session cookies before expiry to maintain
 * seamless user experience without forced re-authentication.
 *
 * Features:
 * - Tracks user activity (mouse, keyboard, touch, scroll)
 * - Checks session age periodically (every 5 minutes)
 * - Refreshes when session > 80% of max age AND user is active
 * - Handles tab visibility (pauses when tab hidden)
 * - Coordinates across tabs via localStorage timestamps
 * - Updates sessionStateAtom on expiry
 */

import { useEffect, useRef, useCallback } from "react";
import { useSetAtom } from "jotai";
import { getFirebaseAuth } from "@/lib/firebase";
import { sessionStateAtom } from "@/store/jobsmarket/global-atoms";

/**
 * Configuration for session renewal
 */
const SESSION_CONFIG = {
  MAX_AGE_MS: 5 * 24 * 60 * 60 * 1000, // 5 days
  REFRESH_THRESHOLD: 0.8, // Refresh at 80% of max age (4 days)
  ACTIVITY_TIMEOUT_MS: 30 * 60 * 1000, // 30 minutes
  CHECK_INTERVAL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

/**
 * localStorage keys
 */
const STORAGE_KEYS = {
  LAST_ACTIVITY: "lastActivity",
  SESSION_CREATED: "sessionCreated",
  LAST_REFRESH: "lastRefresh",
} as const;

/**
 * useSessionRenewal Hook
 *
 * Call this hook in your root layout or auth provider component
 * to enable automatic session renewal for jobsmarket.
 *
 * @example
 * ```tsx
 * function JobsmarketLayout() {
 *   useSessionRenewal();
 *   return <YourLayout />;
 * }
 * ```
 */
export function useSessionRenewal() {
  const setSessionState = useSetAtom(sessionStateAtom);
  const auth = getFirebaseAuth();

  const lastActivityRef = useRef<number>(Date.now());
  const checkIntervalRef = useRef<NodeJS.Timeout | null>(null);
  const isCheckingRef = useRef<boolean>(false);

  /**
   * Update last activity timestamp
   * Called on user interactions
   */
  const updateActivity = () => {
    const now = Date.now();
    lastActivityRef.current = now;

    // Persist to localStorage for cross-tab coordination
    try {
      localStorage.setItem(STORAGE_KEYS.LAST_ACTIVITY, now.toString());
    } catch {
      // Ignore storage errors (e.g., incognito mode, quota exceeded)
    }
  };

  /**
   * Check if user is active (within last 30 minutes)
   */
  const isUserActive = (): boolean => {
    const now = Date.now();
    const lastActivity = lastActivityRef.current;
    return now - lastActivity < SESSION_CONFIG.ACTIVITY_TIMEOUT_MS;
  };

  /**
   * Get session age from localStorage or estimate
   */
  const getSessionAge = (): number => {
    try {
      const sessionCreated = localStorage.getItem(STORAGE_KEYS.SESSION_CREATED);
      if (sessionCreated) {
        return Date.now() - parseInt(sessionCreated, 10);
      }
    } catch {
      // Ignore storage errors
    }

    // Fallback: assume session is fresh if we don't know
    return 0;
  };

  /**
   * Check if session needs refresh
   */
  const needsRefresh = (): boolean => {
    const sessionAge = getSessionAge();
    const threshold = SESSION_CONFIG.MAX_AGE_MS * SESSION_CONFIG.REFRESH_THRESHOLD;
    return sessionAge > threshold;
  };

  /**
   * Check session and renew if needed
   */
  const checkAndRenewSession = useCallback(async () => {
    // Prevent concurrent checks
    if (isCheckingRef.current) {
      return;
    }

    // Skip if tab is hidden (browser optimization)
    if (document.hidden) {
      return;
    }

    const currentUser = auth.currentUser;

    if (!currentUser) {
      setSessionState("unauthenticated");
      return;
    }

    // Check if user is active
    if (!isUserActive()) {
      // User idle, skip renewal but don't mark as expired
      return;
    }

    // Check if session needs refresh
    if (!needsRefresh()) {
      // Session is still fresh
      return;
    }

    try {
      isCheckingRef.current = true;

      // Check if another tab already refreshed recently (within last minute)
      try {
        const lastRefresh = localStorage.getItem(STORAGE_KEYS.LAST_REFRESH);
        if (lastRefresh) {
          const timeSinceRefresh = Date.now() - parseInt(lastRefresh, 10);
          if (timeSinceRefresh < 60 * 1000) {
            // Another tab refreshed within last minute, skip
            return;
          }
        }
      } catch {
        // Ignore storage errors
      }

      console.log("[Session] Proactively renewing session");

      // Get fresh ID token from Firebase (forces refresh)
      await currentUser.getIdToken(true);

      // Call server action to renew session cookie
      const { refreshSession } = await import(
        "@/domains/authentication/services/server/actions/session"
      );

      const result = await refreshSession();

      if (result.success) {
        setSessionState("authenticated");

        // Update timestamps
        const now = Date.now();
        try {
          localStorage.setItem(STORAGE_KEYS.SESSION_CREATED, now.toString());
          localStorage.setItem(STORAGE_KEYS.LAST_REFRESH, now.toString());
        } catch {
          // Ignore storage errors
        }

        console.log("[Session] Session renewed successfully");
      } else {
        console.error("[Session] Renewal failed:", result.error);
        setSessionState("expired");
      }
    } catch (error) {
      console.error("[Session] Check and renew failed:", error);
      setSessionState("expired");
    } finally {
      isCheckingRef.current = false;
    }
  }, [auth, setSessionState]);

  useEffect(() => {
    // Initialize last activity
    updateActivity();

    // Activity tracking events
    const events = [
      "click",
      "keypress",
      "mousemove",
      "scroll",
      "touchstart",
    ] as const;

    // Add activity listeners with passive flag for performance
    events.forEach((event) => {
      window.addEventListener(event, updateActivity, { passive: true });
    });

    // Handle visibility change (pause when tab hidden)
    const handleVisibilityChange = () => {
      if (!document.hidden) {
        // Tab became visible, update activity and check session
        updateActivity();
        checkAndRenewSession();
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    // Start periodic check (every 5 minutes)
    checkIntervalRef.current = setInterval(
      checkAndRenewSession,
      SESSION_CONFIG.CHECK_INTERVAL_MS
    );

    // Initial check (after mount)
    checkAndRenewSession();

    // Cleanup
    return () => {
      events.forEach((event) => {
        window.removeEventListener(event, updateActivity);
      });

      document.removeEventListener("visibilitychange", handleVisibilityChange);

      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [checkAndRenewSession]);
}
