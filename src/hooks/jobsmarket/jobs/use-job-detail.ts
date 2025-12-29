"use client";

import useSWR from "swr";
import { webJobGetById } from "@/lib/database/actions/jobs";
import type { JobWithAnalytics } from "@/types/jobsmarket/job-detail.types";

interface UseJobDetailReturn {
  job: JobWithAnalytics | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => Promise<void>;
}

/**
 * Hook to fetch and manage job detail data
 * Uses SWR for caching and revalidation
 *
 * @param jobId - Job ID to fetch (null to skip fetching)
 * @returns Job data, loading state, error, and mutate function
 */
export function useJobDetail(jobId: string | null): UseJobDetailReturn {
  // Don't fetch if jobId is null or empty
  const shouldFetch = jobId && jobId.trim() !== "";
  const key = shouldFetch ? `job-detail-${jobId}` : null;

  const { data, error, isLoading, mutate } = useSWR(
    key,
    async () => {
      if (!jobId) return undefined;
      const job = await webJobGetById(jobId);
      return job as JobWithAnalytics;
    },
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 5000,
    }
  );

  return {
    job: data,
    isLoading,
    error,
    mutate: async () => {
      await mutate();
    },
  };
}
