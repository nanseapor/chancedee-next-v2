"use client";

import { useState, useEffect, useCallback, useRef } from "react";

import {
  getAdminCompanyDetail,
  type AdminCompanyDetail,
  type AdminCompanyStats,
} from "@/lib/database/actions/admin-companies";

/**
 * Hook for fetching company detail in admin panel
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Provides:
 * - Company detail data
 * - Company stats (job count, team size, application count)
 * - Loading/error/404 states
 * - Refresh capability
 * - Mutate for optimistic updates
 */

export interface UseAdminCompanyDetailResult {
  company: AdminCompanyDetail | null;
  stats: AdminCompanyStats | null;
  isLoading: boolean;
  error: Error | null;
  notFound: boolean;
  refresh: () => void;
  mutate: (data: { company?: AdminCompanyDetail; stats?: AdminCompanyStats }) => void;
}

export function useAdminCompanyDetail(
  companyId: string
): UseAdminCompanyDetailResult {
  const [company, setCompany] = useState<AdminCompanyDetail | null>(null);
  const [stats, setStats] = useState<AdminCompanyStats | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  const [notFound, setNotFound] = useState(false);

  // Track previous companyId to detect changes
  const prevCompanyIdRef = useRef(companyId);

  const fetchCompanyDetail = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      setNotFound(false);

      const result = await getAdminCompanyDetail(companyId);

      if (!result.success) {
        if (result.notFound) {
          setNotFound(true);
          setCompany(null);
          setStats(null);
        } else {
          throw new Error(result.error || "Failed to fetch company details");
        }
        return;
      }

      if (result.data) {
        setCompany(result.data.company);
        setStats(result.data.stats);
      }
    } catch (err) {
      console.error("[useAdminCompanyDetail] Error:", err);
      setError(err instanceof Error ? err : new Error("Unknown error"));
      setCompany(null);
      setStats(null);
    } finally {
      setIsLoading(false);
    }
  }, [companyId]);

  // Initial load and companyId change detection
  useEffect(() => {
    if (prevCompanyIdRef.current !== companyId) {
      // Reset state when companyId changes
      setCompany(null);
      setStats(null);
      setNotFound(false);
      prevCompanyIdRef.current = companyId;
    }

    fetchCompanyDetail();
  }, [companyId, fetchCompanyDetail]);

  const refresh = useCallback(() => {
    fetchCompanyDetail();
  }, [fetchCompanyDetail]);

  const mutate = useCallback(
    (data: { company?: AdminCompanyDetail; stats?: AdminCompanyStats }) => {
      if (data.company !== undefined) {
        setCompany(data.company);
      }
      if (data.stats !== undefined) {
        setStats(data.stats);
      }
    },
    []
  );

  return {
    company,
    stats,
    isLoading,
    error,
    notFound,
    refresh,
    mutate,
  };
}
