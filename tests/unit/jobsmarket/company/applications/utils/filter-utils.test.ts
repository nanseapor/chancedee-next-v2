/**
 * COMP-R08 Phase 5: Filter Utilities Unit Tests
 *
 * Tests for client-side filtering and sorting logic.
 * Covers filter by job, status, sorting, and count calculations.
 *
 * Target: 15 tests
 */

import { describe, it, expect } from 'vitest';
import { filterApplications, getStatusCounts, type FilterState } from '@/app/jobsmarket/companies/[id]/dashboard/applications/_components/utils/filter-utils';
import { mockApplication, mockApplicationRead, mockApplicationAccepted, mockApplicationRejected } from '../__fixtures__/applications';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';
import { MasterJobApplicationStatuses } from '@/constants/application';

// Helper to create filter state with defaults
const createFilters = (overrides: Partial<FilterState> = {}): FilterState => ({
  jobId: null,
  statuses: [],
  sortBy: 'newest',
  dateFrom: null,
  dateTo: null,
  minScore: 0,
  maxScore: 100,
  ...overrides,
});

describe('filterApplications', () => {
  const sampleApplications: ApplicationListItem[] = [
    mockApplication, // status: 'applied', matchScore: 85, updatedAt: now - 1h
    mockApplicationRead, // status: 'read', matchScore: 72, updatedAt: now - 1h
    mockApplicationAccepted, // status: 'accepted', matchScore: null
    mockApplicationRejected, // status: 'rejected', matchScore: 45
    {
      ...mockApplication,
      uid: 'app-test-5',
      jobId: 'job-test-2',
      status: MasterJobApplicationStatuses.scheduled,
      matchScore: 90,
      updatedAt: Date.now(), // Most recent
    },
    {
      ...mockApplication,
      uid: 'app-test-6',
      status: MasterJobApplicationStatuses.confirmed,
      matchScore: 88,
      updatedAt: Date.now() - 7200000, // 2 hours ago (oldest)
    },
  ];

  describe('Filter by Job ID', () => {
    it('filters applications by specific job ID', () => {
      const result = filterApplications(sampleApplications, createFilters({ jobId: 'job-test-1' }));

      expect(result.length).toBe(5); // All except the one with job-test-2
      expect(result.every((app) => app.jobId === 'job-test-1')).toBe(true);
    });

    it('returns all applications when jobId is null', () => {
      const result = filterApplications(sampleApplications, createFilters());

      expect(result.length).toBe(6);
    });
  });

  describe('Filter by Status', () => {
    it('filters applications by single status', () => {
      const result = filterApplications(
        sampleApplications,
        createFilters({ statuses: [MasterJobApplicationStatuses.new] })
      );

      expect(result.length).toBe(1);
      expect(result[0].status).toBe('applied');
    });

    it('filters applications by multiple statuses', () => {
      const result = filterApplications(
        sampleApplications,
        createFilters({ statuses: [MasterJobApplicationStatuses.new, MasterJobApplicationStatuses.read] })
      );

      expect(result.length).toBe(2);
      expect(result.every((app) => ['applied', 'read'].includes(app.status))).toBe(true);
    });

    it('returns all applications when statuses array is empty', () => {
      const result = filterApplications(sampleApplications, createFilters());

      expect(result.length).toBe(6);
    });
  });

  describe('Sorting', () => {
    it('sorts by newest first (default)', () => {
      const result = filterApplications(sampleApplications, createFilters());

      // Most recent should be first
      expect(result[0].uid).toBe('app-test-5');
      // Oldest should be last
      expect(result[result.length - 1].uid).toBe('app-test-6');
    });

    it('sorts by oldest first', () => {
      const result = filterApplications(sampleApplications, createFilters({ sortBy: 'oldest' }));

      // Oldest should be first
      expect(result[0].uid).toBe('app-test-6');
      // Most recent should be last
      expect(result[result.length - 1].uid).toBe('app-test-5');
    });

    it('sorts by score high to low', () => {
      const result = filterApplications(sampleApplications, createFilters({ sortBy: 'score_high' }));

      // Highest score (90) should be first
      expect(result[0].matchScore).toBe(90);
      // Lowest score (45) should be last among scored items
      const scoredItems = result.filter((app) => app.matchScore !== null);
      expect(scoredItems[scoredItems.length - 1].matchScore).toBe(45);
    });

    it('sorts by score low to high', () => {
      const result = filterApplications(sampleApplications, createFilters({ sortBy: 'score_low' }));

      // Lowest score (45) should be first among scored items
      const scoredItems = result.filter((app) => app.matchScore !== null);
      expect(scoredItems[0].matchScore).toBe(45);
      // Highest score (90) should be last
      expect(scoredItems[scoredItems.length - 1].matchScore).toBe(90);
    });

    it('handles null match scores in sorting', () => {
      const result = filterApplications(sampleApplications, createFilters({ sortBy: 'score_high' }));

      // Should not throw error
      expect(result.length).toBe(6);
      // Null scores treated as 0, so should be at the end
      const nullScoreItem = result.find((app) => app.matchScore === null);
      expect(nullScoreItem).toBeDefined();
    });
  });

  describe('Edge Cases', () => {
    it('handles empty input array', () => {
      const result = filterApplications([], createFilters());

      expect(result).toEqual([]);
    });

    it('preserves original array (no mutation)', () => {
      const original = [...sampleApplications];
      filterApplications(sampleApplications, createFilters({ sortBy: 'oldest' }));

      // Original array should not be modified
      expect(sampleApplications).toEqual(original);
    });
  });
});

describe('getStatusCounts', () => {
  const sampleApplications: ApplicationListItem[] = [
    mockApplication, // applied
    mockApplicationRead, // read
    mockApplicationAccepted, // accepted
    mockApplicationRejected, // rejected
    { ...mockApplication, uid: 'app-5', status: MasterJobApplicationStatuses.scheduled },
    { ...mockApplication, uid: 'app-6', status: MasterJobApplicationStatuses.scheduled },
  ];

  it('counts applications by status correctly', () => {
    const counts = getStatusCounts(sampleApplications);

    expect(counts['applied']).toBe(1);
    expect(counts['read']).toBe(1);
    expect(counts['accepted']).toBe(1);
    expect(counts['rejected']).toBe(1);
    expect(counts['scheduled']).toBe(2);
  });

  it('includes "all" count for total applications', () => {
    const counts = getStatusCounts(sampleApplications);

    expect(counts['all']).toBe(6);
  });

  it('handles empty input array', () => {
    const counts = getStatusCounts([]);

    expect(counts).toEqual({});
  });
});
