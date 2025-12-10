/**
 * Shared SWR Configuration for ChanceDee Application
 *
 * Purpose: Optimize client-side data fetching and caching to reduce redundant
 * Firestore queries and improve perceived performance.
 *
 * See: docs/performance-optimization-plan.md - Phase 4
 */

import type { SWRConfiguration } from "swr";

/**
 * Base SWR configuration for user data fetching
 *
 * Optimizations:
 * - Disable focus revalidation (reduces unnecessary fetches)
 * - Disable reconnect revalidation (prevent double fetches)
 * - 60s deduping interval (prevent duplicate requests)
 * - No automatic polling (on-demand only)
 */
export const userDataSWRConfig: SWRConfiguration = {
  // Revalidation settings
  revalidateOnFocus: false, // Don't refetch when window regains focus
  revalidateOnReconnect: false, // Don't refetch when network reconnects
  revalidateOnMount: true, // Do fetch on component mount (initial load)
  revalidateIfStale: true, // Revalidate if data is marked stale

  // Deduplication and throttling
  dedupingInterval: 60000, // Dedupe identical requests within 60 seconds
  focusThrottleInterval: 300000, // Throttle focus revalidation to 5 minutes

  // Refresh settings
  refreshInterval: 0, // Disable automatic polling (manual refresh only)

  // Error handling
  errorRetryCount: 3, // Retry failed requests up to 3 times
  errorRetryInterval: 5000, // Wait 5 seconds between retries
  shouldRetryOnError: true, // Enable retry on error

  // Cache settings
  keepPreviousData: false, // Don't keep old data while fetching new (show loading state)
};

/**
 * Enhanced SWR configuration for profile page
 *
 * Additional optimizations for the profile page:
 * - Keep previous data during refetch (smoother UX)
 * - Don't revalidate stale data automatically
 */
export const profileDataSWRConfig: SWRConfiguration = {
  ...userDataSWRConfig,

  // Keep showing old data while fetching new (better UX)
  keepPreviousData: true,

  // Don't automatically revalidate stale data (manual control)
  revalidateIfStale: false,
};

/**
 * Aggressive caching configuration for rarely-changing data
 *
 * Use for:
 * - Master data (countries, industries, etc.)
 * - Static configuration
 * - Reference data
 */
export const staticDataSWRConfig: SWRConfiguration = {
  ...userDataSWRConfig,

  // More aggressive caching
  dedupingInterval: 300000, // Dedupe for 5 minutes
  revalidateOnMount: false, // Don't revalidate on mount if cached
  revalidateIfStale: false, // Never auto-revalidate stale data

  // Longer retry intervals for static data
  errorRetryInterval: 10000, // Wait 10 seconds between retries
};

/**
 * Real-time data configuration for frequently-changing data
 *
 * Use for:
 * - Chat messages
 * - Notifications
 * - Live updates
 */
export const realtimeDataSWRConfig: SWRConfiguration = {
  ...userDataSWRConfig,

  // Enable automatic revalidation
  revalidateOnFocus: true, // Revalidate on window focus
  revalidateOnReconnect: true, // Revalidate on network reconnect

  // Shorter deduping interval
  dedupingInterval: 10000, // Only dedupe for 10 seconds
  focusThrottleInterval: 30000, // Throttle to 30 seconds

  // Optional: Enable polling for real-time updates
  // refreshInterval: 30000,        // Poll every 30 seconds (enable if needed)
};

/**
 * Helper function to create SWR key with namespace
 *
 * Example:
 * ```typescript
 * const key = createSWRKey('userData', userId);
 * // Result: 'userData:abc123'
 * ```
 */
export function createSWRKey(
  namespace: string,
  ...args: (string | number | undefined | null)[]
): string | null {
  const validArgs = args.filter((arg) => arg !== undefined && arg !== null);
  if (validArgs.length === 0) return null;
  return `${namespace}:${validArgs.join(":")}`;
}

/**
 * SWR key generators for consistent cache keys across the application
 */
export const swrKeys = {
  userData: (idToken: string | undefined) => createSWRKey("userData", idToken),
  candidateData: (idToken: string | undefined) =>
    createSWRKey("candidateData", idToken),
  userProfile: (uid: string | undefined) => createSWRKey("userProfile", uid),
  bookmarkedBlogs: (uid: string | undefined) =>
    createSWRKey("bookmarkedBlogs", uid),
  masterData: (dataType: string) => createSWRKey("masterData", dataType),
  chatMessages: (chatId: string | undefined) =>
    createSWRKey("chatMessages", chatId),
};
