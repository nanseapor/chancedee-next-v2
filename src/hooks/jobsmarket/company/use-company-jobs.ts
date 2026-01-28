"use client";

import { useState, useEffect, startTransition, useCallback } from "react";
import type {
  JobListItem,
  JobListQuery,
  JobListAggregation,
} from "@/types/jobsmarket/jobs-list.types";
import {
  webJobGetCompanyJobsList,
  webJobGetCompanyJobsAggregation,
} from "@/lib/database/actions/jobs";

interface UseCompanyJobsResult {
  jobs: JobListItem[];
  aggregation: JobListAggregation | null;
  total: number;
  page: number;
  limit: number;
  isLoading: boolean;
  error: Error | null;
  mutate: () => void;
}

/**
 * Hook to fetch company jobs list with filters and aggregation
 */
export function useCompanyJobs(
  companyId: string,
  query?: JobListQuery
): UseCompanyJobsResult {
  const {
    status = "all",
    q,
    page = 1,
    limit = 20,
    sort = "createdAt",
  } = query || {};

  const [jobs, setJobs] = useState<JobListItem[]>([]);
  const [aggregation, setAggregation] = useState<JobListAggregation | null>(
    null
  );
  const [total, setTotal] = useState(0);
  const [currentPage, setCurrentPage] = useState(1);
  const [currentLimit, setCurrentLimit] = useState(20);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    // Build query object with only defined values
    const queryParams: JobListQuery = {
      status,
      page,
      limit,
    };

    if (q) {
      queryParams.q = q;
    }

    if (sort && sort !== "createdAt") {
      queryParams.sort = sort;
    }

    // Fetch jobs list and aggregation in parallel
    const [jobsResult, aggResult] = await Promise.allSettled([
      webJobGetCompanyJobsList(companyId, queryParams),
      webJobGetCompanyJobsAggregation(companyId),
    ]);

    startTransition(() => {
      // Handle jobs list result
      if (jobsResult.status === "fulfilled") {
        const result = jobsResult.value;
        if (result.success && result.data) {
          setJobs(result.data);
          setTotal(result.total || 0);
          setCurrentPage(result.page || 1);
          setCurrentLimit(result.limit || 20);
        } else {
          setError(new Error(result.error || "Failed to fetch jobs"));
        }
      } else {
        setError(jobsResult.reason as Error);
      }

      // Handle aggregation result
      if (aggResult.status === "fulfilled" && aggResult.value) {
        const result = aggResult.value;
        if (result.success && result.data) {
          setAggregation(result.data);
        }
      }

      setIsLoading(false);
    });
  }, [companyId, status, q, page, limit, sort]);

  useEffect(() => {
    if (companyId) {
      startTransition(() => {
        fetchData();
      });
    }
  }, [companyId, fetchData]);

  return {
    jobs,
    aggregation,
    total,
    page: currentPage,
    limit: currentLimit,
    isLoading,
    error,
    mutate: fetchData,
  };
}
