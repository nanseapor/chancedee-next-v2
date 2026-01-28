"use client";

import useSWR from "swr";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import type { FirebaseCompanyData } from "@/types/company.types";
import type { JobCardData } from "@/types/public-jobs";

interface UsePublicCompanyProfileResult {
  company: FirebaseCompanyData | null;
  jobs: JobCardData[];
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Fetches a company profile for public display
 * Only returns approved, active companies
 *
 * @param companyId - The company UID
 * @returns Company data, jobs, and loading state
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 */
export function usePublicCompanyProfile(
  companyId: string
): UsePublicCompanyProfileResult {
  // Fetch company data
  const {
    data: company,
    error: companyError,
    isLoading: isLoadingCompany,
    mutate: mutateCompany,
  } = useSWR<FirebaseCompanyData | null>(
    companyId ? `public-company-${companyId}` : null,
    async () => {
      if (!companyId) return null;

      const result = await webCompanyInformationGetById(companyId);

      // Return null if company doesn't exist or is not publicly visible
      if (!result) return null;
      if (result.status !== "approved") return null;
      if (!result.isActive) return null;

      return result;
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000, // Cache for 1 minute
    }
  );

  // Fetch company's active jobs
  const {
    data: jobs,
    error: jobsError,
    isLoading: isLoadingJobs,
  } = useSWR<JobCardData[]>(
    company ? `public-company-jobs-${companyId}` : null,
    async () => {
      if (!company) return [];

      // Use the job search to get company's active jobs
      // For now, return empty array - will be implemented with job search
      // This should call a server action to fetch jobs by companyId
      const { getCompanyActiveJobs } = await import(
        "@/lib/database/actions/company-public"
      );
      return await getCompanyActiveJobs(companyId, 10);
    },
    {
      revalidateOnFocus: false,
      dedupingInterval: 60000,
    }
  );

  return {
    company: company ?? null,
    jobs: jobs ?? [],
    isLoading: isLoadingCompany || isLoadingJobs,
    error: companyError || jobsError || null,
    mutate: mutateCompany,
  };
}
