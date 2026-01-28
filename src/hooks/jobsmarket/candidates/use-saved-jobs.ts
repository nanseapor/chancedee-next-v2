'use client';

import useSWR from 'swr';
import { webCandidateSavedJobsGet } from '@/lib/database/actions/candidate-saved';
import type { SavedJobWithDetails } from '@/lib/database/actions/candidate-saved';

/**
 * CAND-R05: Saved Jobs Hook
 *
 * SWR hook to fetch saved jobs for a candidate with automatic caching and revalidation
 */

/**
 * SWR key for candidate saved jobs
 * Used for cache invalidation across components
 */
export const getSavedJobsKey = (candidateId: string | null | undefined) => {
  if (!candidateId) return null;
  return `candidate-saved-jobs-${candidateId}`;
};

/**
 * Hook to fetch candidate saved jobs with SWR
 *
 * @param candidateId - The candidate's UID
 * @returns SWR response with saved jobs, loading state, error, and mutate function
 *
 * @example
 * ```tsx
 * const { savedJobs, isLoading, error, mutate } = useSavedJobs(candidateId);
 *
 * // Manually revalidate after unsaving a job
 * await mutate();
 * ```
 */
export function useSavedJobs(candidateId: string | null | undefined) {
  const swrKey = getSavedJobsKey(candidateId);

  const { data, error, isLoading, isValidating, mutate } = useSWR<
    SavedJobWithDetails[]
  >(
    swrKey,
    async () => {
      if (!candidateId) return [];

      const result = await webCandidateSavedJobsGet({ candidateId });

      if (!result.success) {
        throw new Error(result.error || 'Failed to fetch saved jobs');
      }

      return result.savedJobs || [];
    },
    {
      revalidateOnFocus: true,
      revalidateOnReconnect: true,
      dedupingInterval: 5000, // 5 seconds
    }
  );

  return {
    /** Array of saved jobs with full job details */
    savedJobs: data,
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
