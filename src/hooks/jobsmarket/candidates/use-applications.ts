'use client';

import useSWR from 'swr';
import { webJobApplicationGetByCandidate } from '@/lib/database/actions/job-applications';
import type { ApplicationWithDetails } from '@/lib/database/actions/job-applications';

/**
 * SWR key for candidate applications
 * Used for cache invalidation across components
 */
export const getApplicationsKey = (candidateId: string | null | undefined) => {
  if (!candidateId) return null;
  return `candidate-applications-${candidateId}`;
};

/**
 * Status filter tabs
 */
export type StatusTab = 'all' | 'applied' | 'reviewing' | 'interviewing' | 'rejected';

/**
 * Map status tab to actual application statuses
 */
export const STATUS_TAB_MAPPING: Record<StatusTab, string[]> = {
  all: [], // Empty means no filter
  applied: ['applied', 'read'],
  reviewing: ['accepted'],
  interviewing: ['scheduled', 'confirmed'],
  rejected: ['rejected', 'declined'],
};

/**
 * Filter applications by status tab
 */
function filterByStatusTab(
  applications: ApplicationWithDetails[],
  statusTab: StatusTab
): ApplicationWithDetails[] {
  if (statusTab === 'all') {
    return applications;
  }

  const allowedStatuses = STATUS_TAB_MAPPING[statusTab];
  return applications.filter(app => allowedStatuses.includes(app.status));
}

/**
 * Hook to fetch candidate applications with SWR
 *
 * @param candidateId - The candidate's UID
 * @param statusTab - Optional status filter (defaults to 'all')
 * @returns SWR response with applications, loading state, error, and mutate function
 *
 * Usage:
 * ```tsx
 * const { applications, isLoading, error, mutate } = useApplications(candidateId);
 * const { applications: appliedOnly } = useApplications(candidateId, 'applied');
 * ```
 */
export function useApplications(
  candidateId: string | null | undefined,
  statusTab: StatusTab = 'all'
) {
  const swrKey = getApplicationsKey(candidateId);

  const { data, error, isLoading, isValidating, mutate } = useSWR<ApplicationWithDetails[]>(
    swrKey,
    async () => {
      if (!candidateId) return [];
      return webJobApplicationGetByCandidate(candidateId);
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  // Apply client-side filtering
  const filteredApplications = data ? filterByStatusTab(data, statusTab) : undefined;

  return {
    /** Filtered applications based on statusTab */
    applications: filteredApplications,
    /** All applications (unfiltered) - useful for counts */
    allApplications: data,
    /** True during initial load */
    isLoading,
    /** True during revalidation */
    isValidating,
    /** Error if fetch failed */
    error,
    /** Function to manually revalidate */
    mutate,
  };
}
