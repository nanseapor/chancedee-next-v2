/**
 * COMP-R08 Phase 5: Filter Utilities
 *
 * Client-side filtering and sorting logic for applications.
 * Handles filtering by job, status, and sorting by various criteria.
 *
 * Per COMP-R08 RIS §2 (Filtering & Sorting)
 */

import type {
  ApplicationListItem,
  ApplicationFilterState,
  ApplicationSortOption,
} from '@/types/jobsmarket/applications.types';

export interface FilterState extends ApplicationFilterState {
  sortBy: ApplicationSortOption;
}

/**
 * Filter and sort applications based on filter state
 */
export function filterApplications(
  applications: ApplicationListItem[],
  filters: FilterState
): ApplicationListItem[] {
  let result = [...applications]; // Create copy to avoid mutation

  // Filter by job ID
  if (filters.jobId) {
    result = result.filter((app) => app.jobId === filters.jobId);
  }

  // Filter by status
  // Empty statuses array means show all
  if (filters.statuses.length > 0) {
    result = result.filter((app) => filters.statuses.includes(app.status));
  }

  // Sort
  result.sort((a, b) => {
    switch (filters.sortBy) {
      case 'newest':
        return b.updatedAt - a.updatedAt;
      case 'oldest':
        return a.updatedAt - b.updatedAt;
      case 'score_high':
        return (b.matchScore ?? 0) - (a.matchScore ?? 0);
      case 'score_low':
        return (a.matchScore ?? 0) - (b.matchScore ?? 0);
      default:
        return 0;
    }
  });

  return result;
}

/**
 * Count applications by status
 * Includes "all" count for total applications
 */
export function getStatusCounts(
  applications: ApplicationListItem[]
): Record<string, number> {
  return applications.reduce(
    (acc, app) => {
      acc[app.status] = (acc[app.status] || 0) + 1;
      acc['all'] = (acc['all'] || 0) + 1;
      return acc;
    },
    {} as Record<string, number>
  );
}
