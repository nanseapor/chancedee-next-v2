import useSWR from 'swr';
import { searchPublicJobs } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';
import type { JobSearchParams, JobSearchResponse, JobFilterState } from '@/types/public-jobs';

export interface UseJobSearchProps {
  filters: JobFilterState;
  enabled?: boolean;
}

export interface UseJobSearchReturn {
  data: JobSearchResponse['data'] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | undefined;
  mutate: () => void;
}

/**
 * Hook for fetching job search results with SWR
 *
 * Generates cache key from filter state to ensure proper cache invalidation
 * when filters change
 *
 * @param props - Search parameters (filters, sort, page)
 * @returns SWR response with job data
 */
export function useJobSearch({
  filters,
  enabled = true,
}: UseJobSearchProps): UseJobSearchReturn {
  // Build search params
  const searchParams: JobSearchParams = {
    q: filters.q || undefined,
    locations: filters.locations.length > 0 ? filters.locations : undefined,
    types: filters.types.length > 0 ? filters.types : undefined,
    salaryMin: filters.salaryMin ?? undefined,
    salaryMax: filters.salaryMax ?? undefined,
    education: filters.education.length > 0 ? filters.education : undefined,
    experience: filters.experience ?? undefined,
    remote: filters.remote ?? undefined,
    sort: filters.sort,
    page: filters.page,
    pageSize: 20,
  };

  // Generate stable cache key from params
  const cacheKey = enabled
    ? ['jobs-search', JSON.stringify(searchParams)]
    : null;

  // Fetcher function
  const fetcher = async () => {
    const result = await searchPublicJobs(searchParams);

    if (!result.success) {
      throw new Error(result.error || 'Failed to search jobs');
    }

    return result.data;
  };

  // Use SWR for data fetching with caching
  const { data, error, mutate, isLoading } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000, // 5 seconds deduping
    keepPreviousData: true, // Keep showing old data while loading new
  });

  return {
    data,
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate,
  };
}
