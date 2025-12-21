'use client';

import { useMemo } from 'react';
import type { ApplicationWithDetails } from '@/lib/database/actions/job-applications';
import { STATUS_TAB_MAPPING, type StatusTab } from './use-applications';

/**
 * Tab counts for status filter tabs
 */
export interface ApplicationCounts {
  all: number;
  applied: number;
  reviewing: number;
  interviewing: number;
  rejected: number;
}

/**
 * Calculate counts for each status tab
 *
 * @param applications - Array of applications (unfiltered)
 * @returns Counts object for each tab
 */
function calculateCounts(applications: ApplicationWithDetails[]): ApplicationCounts {
  const counts: ApplicationCounts = {
    all: applications.length,
    applied: 0,
    reviewing: 0,
    interviewing: 0,
    rejected: 0,
  };

  for (const app of applications) {
    // Check each tab's statuses
    if (STATUS_TAB_MAPPING.applied.includes(app.status)) {
      counts.applied++;
    } else if (STATUS_TAB_MAPPING.reviewing.includes(app.status)) {
      counts.reviewing++;
    } else if (STATUS_TAB_MAPPING.interviewing.includes(app.status)) {
      counts.interviewing++;
    } else if (STATUS_TAB_MAPPING.rejected.includes(app.status)) {
      counts.rejected++;
    }
    // Note: 'withdraw', 'closed', 'systemclosed', 'cancelled' are not shown in any specific tab
    // but are included in 'all' count
  }

  return counts;
}

/**
 * Hook to derive tab counts from applications
 *
 * Uses useMemo for performance - recalculates only when applications change
 *
 * @param applications - Array of applications from useApplications (allApplications)
 * @returns Counts for each status tab
 *
 * Usage:
 * ```tsx
 * const { allApplications } = useApplications(candidateId);
 * const counts = useApplicationCounts(allApplications);
 *
 * // In StatusTabs
 * <Tab label="ทั้งหมด" count={counts.all} />
 * <Tab label="สมัครแล้ว" count={counts.applied} />
 * ```
 */
export function useApplicationCounts(
  applications: ApplicationWithDetails[] | undefined
): ApplicationCounts {
  return useMemo(() => {
    if (!applications || applications.length === 0) {
      return {
        all: 0,
        applied: 0,
        reviewing: 0,
        interviewing: 0,
        rejected: 0,
      };
    }

    return calculateCounts(applications);
  }, [applications]);
}

/**
 * Get the count for a specific tab
 * Utility function for convenience
 */
export function getCountForTab(counts: ApplicationCounts, tab: StatusTab): number {
  return counts[tab];
}
