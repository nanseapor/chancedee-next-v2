/**
 * COMP-R08: SWR hook for fetching company applications
 *
 * Implements data fetching with:
 * - 30s polling (per SA decision)
 * - Revalidate on focus
 * - SWR cache key pattern: `company-applications-${companyId}`
 *
 * Per COMP-R08 RIS §4.1 and Assessment Phase 2
 */

'use client';

import useSWR from 'swr';
import { webJobApplicationGetByCompany } from '@/lib/database/actions/job-applications';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';

interface UseCompanyApplicationsFilters {
  status?: string | null;
  jobId?: string | null;
}

interface UseCompanyApplicationsReturn {
  applications: ApplicationListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: Error | undefined;
  mutate: () => void;
}

/**
 * Fetch applications for a company with optional filters
 *
 * @param companyId - Company UID
 * @param filters - Optional status and jobId filters
 * @returns SWR hook result with applications data
 */
export function useCompanyApplications(
  companyId: string | null,
  filters?: UseCompanyApplicationsFilters
): UseCompanyApplicationsReturn {
  // Build SWR cache key with filters
  const key = companyId
    ? [
        'company-applications',
        companyId,
        filters?.status || 'all',
        filters?.jobId || 'all',
      ]
    : null;

  const { data, error, isLoading, mutate } = useSWR<ApplicationListItem[]>(
    key,
    async () => {
      if (!companyId) return [];

      const result = await webJobApplicationGetByCompany(
        companyId,
        filters?.status || undefined,
        filters?.jobId || undefined
      );

      return result as ApplicationListItem[];
    },
    {
      // Revalidate on window focus
      revalidateOnFocus: true,
      // Poll every 30 seconds (per SA decision)
      refreshInterval: 30000,
      // Don't revalidate on mount if we have cached data
      revalidateIfStale: false,
      // Keep previous data while revalidating
      keepPreviousData: true,
    }
  );

  return {
    applications: data,
    isLoading,
    isError: !!error,
    error,
    mutate,
  };
}
