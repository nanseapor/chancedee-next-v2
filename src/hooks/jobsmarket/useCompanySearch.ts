import useSWR from "swr";
import { getPublicCompaniesList } from "@/lib/database/actions/company-listing";
import type {
  CompanySearchParams,
  CompanySearchResponse,
  CompanyFilterState,
} from "@/types/public-companies";

export interface UseCompanySearchProps {
  filters: CompanyFilterState;
  enabled?: boolean;
}

export interface UseCompanySearchReturn {
  data: CompanySearchResponse["data"] | undefined;
  isLoading: boolean;
  isError: boolean;
  error: string | undefined;
  mutate: () => void;
}

/**
 * Hook for fetching company search results with SWR
 *
 * Features:
 * - Stable cache key from filter state
 * - keepPreviousData for smooth transitions
 * - Automatic error handling
 *
 * @param props - Filter state and enabled flag
 * @returns SWR data, loading state, error state
 */
export function useCompanySearch({
  filters,
  enabled = true,
}: UseCompanySearchProps): UseCompanySearchReturn {
  // Build search params (omit empty values)
  const searchParams: CompanySearchParams = {
    q: filters.q || undefined,
    industries: filters.industries.length > 0 ? filters.industries : undefined,
    sizes: filters.sizes.length > 0 ? filters.sizes : undefined,
    sort: filters.sort,
    page: filters.page,
    pageSize: 20,
  };

  // Stable cache key from params
  const cacheKey = enabled
    ? ["companies-search", JSON.stringify(searchParams)]
    : null;

  // Fetcher function
  const fetcher = async () => {
    const result = await getPublicCompaniesList(searchParams);
    if (!result.success) {
      throw new Error(result.error || "Failed to search companies");
    }
    return result.data;
  };

  const { data, error, mutate, isLoading } = useSWR(cacheKey, fetcher, {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    dedupingInterval: 5000,
    keepPreviousData: true,
  });

  return {
    data,
    isLoading,
    isError: !!error,
    error: error?.message,
    mutate,
  };
}
