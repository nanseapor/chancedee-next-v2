"use client";

import { useAtomValue, useSetAtom } from "jotai";
import { useEffect, useCallback } from "react";

import {
  adminStatsAtom,
  adminStatsLoadingAtom,
  type AdminStats,
} from "@/store/jobsmarket/admin-atoms";

/**
 * Hook to fetch and manage admin statistics for sidebar badges
 * Per ADM-R00 Cross-Cutting RIS §2.2 Sidebar Specification
 *
 * Returns pending counts for:
 * - Companies awaiting approval
 * - Candidates with issues
 * - Jobs needing review
 */

export interface UseAdminStatsResult {
  pendingCompanies: number;
  pendingCandidates: number;
  pendingJobs: number;
  isLoading: boolean;
  refresh: () => void;
}

export function useAdminStats(): UseAdminStatsResult {
  const stats = useAtomValue(adminStatsAtom);
  const isLoading = useAtomValue(adminStatsLoadingAtom);
  const setStats = useSetAtom(adminStatsAtom);
  const setLoading = useSetAtom(adminStatsLoadingAtom);

  const fetchStats = useCallback(async () => {
    try {
      setLoading(true);
      // TODO: Implement server action to fetch stats
      // For now, return mock data
      const mockStats: AdminStats = {
        pendingCompanies: 0,
        pendingCandidates: 0,
        pendingJobs: 0,
      };
      setStats(mockStats);
    } catch (error) {
      console.error("Failed to fetch admin stats:", error);
    } finally {
      setLoading(false);
    }
  }, [setStats, setLoading]);

  useEffect(() => {
    if (stats === null) {
      fetchStats();
    }
  }, [stats, fetchStats]);

  return {
    pendingCompanies: stats?.pendingCompanies ?? 0,
    pendingCandidates: stats?.pendingCandidates ?? 0,
    pendingJobs: stats?.pendingJobs ?? 0,
    isLoading,
    refresh: fetchStats,
  };
}
