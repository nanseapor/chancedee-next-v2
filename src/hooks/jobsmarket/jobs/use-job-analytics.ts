"use client";

import useSWR from "swr";
import { webJobFetchAnalytics } from "@/lib/database/actions/jobs";
import type { JobAnalytics } from "@/types/jobsmarket/job-detail.types";

interface UseJobAnalyticsReturn {
  analytics: JobAnalytics | undefined;
  isLoading: boolean;
  error: Error | undefined;
  refresh: () => Promise<void>;
}

/**
 * Hook to fetch and manage job analytics data
 * Auto-refreshes every 60 seconds
 *
 * @param jobId - Job ID to fetch analytics for (null to skip fetching)
 * @returns Analytics data, loading state, error, and refresh function
 */
export function useJobAnalytics(jobId: string | null): UseJobAnalyticsReturn {
  // Don't fetch if jobId is null or empty
  const shouldFetch = jobId && jobId.trim() !== "";
  const key = shouldFetch ? `job-analytics-${jobId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!jobId) return undefined;
      const result = await webJobFetchAnalytics(jobId);
      if (result.success && result.data) {
        return result.data as JobAnalytics;
      }
      return undefined;
    },
    {
      refreshInterval: 60000, // Auto-refresh every 60 seconds
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    analytics: data,
    isLoading,
    error,
    refresh: async () => {
      await mutate();
    },
  };
}
