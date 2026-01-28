"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import {
  getAdminCompanies,
  type AdminCompanyListItem,
  type AdminCompanyCounts,
  type GetAdminCompaniesOptions,
} from "@/lib/database/actions/admin-companies";
import type { CompanyStatus } from "@/types/jobsmarket/company/status";

/**
 * Hook for fetching and managing company list in admin panel
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Provides:
 * - Paginated company list
 * - Status filtering
 * - Search functionality
 * - Loading/error states
 * - Refresh capability
 */

export interface UseAdminCompaniesOptions {
  status?: CompanyStatus;
  search?: string;
  limit?: number;
}

export interface UseAdminCompaniesResult {
  companies: AdminCompanyListItem[];
  counts: AdminCompanyCounts | undefined;
  isLoading: boolean;
  error: Error | null;
  hasMore: boolean;
  loadMore: () => void;
  refresh: () => void;
}

const defaultCounts: AdminCompanyCounts = {
  all: 0,
  pending: 0,
  approved: 0,
  rejected: 0,
  suspended: 0,
};

export function useAdminCompanies(
  options: UseAdminCompaniesOptions = {}
): UseAdminCompaniesResult {
  const { status, search, limit = 20 } = options;

  const [companies, setCompanies] = useState<AdminCompanyListItem[]>([]);
  const [counts, setCounts] = useState<AdminCompanyCounts | undefined>(
    undefined
  );
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [hasMore, setHasMore] = useState(false);
  const [lastDocId, setLastDocId] = useState<string | null>(null);

  // Track if we're loading more (pagination) vs initial load
  const isLoadingMore = useRef(false);

  // Track current filter values to detect changes
  const prevFiltersRef = useRef({ status, search });

  // Use ref to always have latest lastDocId for loadMore
  const lastDocIdRef = useRef<string | null>(null);
  lastDocIdRef.current = lastDocId;

  // Fetch companies with explicit parameters to avoid stale closure issues
  const fetchCompanies = useCallback(
    async (
      filterStatus: CompanyStatus | undefined,
      filterSearch: string | undefined,
      loadMore = false
    ) => {
      try {
        if (!loadMore) {
          setIsLoading(true);
          setError(null);
        }

        const fetchOptions: GetAdminCompaniesOptions = {
          status: filterStatus,
          search: filterSearch,
          limit,
          startAfter: loadMore ? lastDocIdRef.current || undefined : undefined,
        };

        const result = await getAdminCompanies(fetchOptions);

        if (!result.success || !result.data) {
          throw new Error(result.error || "Failed to fetch companies");
        }

        const { companies: newCompanies, counts: newCounts, hasMore: more, lastDocId: newLastDocId } = result.data;

        if (loadMore) {
          setCompanies((prev) => [...prev, ...newCompanies]);
        } else {
          setCompanies(newCompanies);
        }

        setCounts(newCounts);
        setHasMore(more);
        setLastDocId(newLastDocId);
      } catch (err) {
        console.error("[useAdminCompanies] Error:", err);
        setError(err instanceof Error ? err : new Error("Unknown error"));
      } finally {
        setIsLoading(false);
        isLoadingMore.current = false;
      }
    },
    [limit]
  );

  // Initial load and filter change detection
  useEffect(() => {
    const filtersChanged =
      prevFiltersRef.current.status !== status ||
      prevFiltersRef.current.search !== search;

    if (filtersChanged) {
      // Reset pagination when filters change
      setLastDocId(null);
      prevFiltersRef.current = { status, search };
    }

    // Pass current status/search directly to avoid stale closure
    fetchCompanies(status, search, false);
  }, [status, search, fetchCompanies]);

  const loadMore = useCallback(() => {
    if (!hasMore || isLoadingMore.current || isLoading) {
      return;
    }
    isLoadingMore.current = true;
    fetchCompanies(status, search, true);
  }, [hasMore, isLoading, fetchCompanies, status, search]);

  const refresh = useCallback(() => {
    setLastDocId(null);
    fetchCompanies(status, search, false);
  }, [fetchCompanies, status, search]);

  return {
    companies,
    counts,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}
