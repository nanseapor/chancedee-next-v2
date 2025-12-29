"use client";

import useSWR from 'swr';
import type { JobApplication } from '@/types/jobsmarket/job-detail.types';

interface UseJobApplicationsOptions {
  limit?: number;
}

interface UseJobApplicationsReturn {
  applications: JobApplication[];
  isLoading: boolean;
  error: Error | undefined;
  mutate: () => void;
}

async function fetchRecentApplications(jobId: string, limit: number): Promise<JobApplication[]> {
  const response = await fetch(`/api/jobsmarket/jobs/${jobId}/applications?limit=${limit}`);
  if (!response.ok) {
    throw new Error('Failed to fetch applications');
  }
  return response.json();
}

export function useJobApplications(
  jobId: string,
  options: UseJobApplicationsOptions = {}
): UseJobApplicationsReturn {
  const { limit = 5 } = options;

  const { data, error, isLoading, mutate } = useSWR<JobApplication[]>(
    jobId ? [`/api/jobsmarket/jobs/${jobId}/applications`, limit] : null,
    () => fetchRecentApplications(jobId, limit),
    {
      revalidateOnFocus: false,
      revalidateOnReconnect: true,
      dedupingInterval: 30000, // 30 seconds
    }
  );

  return {
    applications: data || [],
    isLoading,
    error,
    mutate,
  };
}
