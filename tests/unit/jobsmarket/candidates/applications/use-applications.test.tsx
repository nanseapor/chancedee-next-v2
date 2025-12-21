import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import React from 'react';
import {
  useApplications,
  getApplicationsKey,
  STATUS_TAB_MAPPING,
} from '@/hooks/jobsmarket/candidates/use-applications';

// Mock the server action
vi.mock('@/lib/database/actions/job-applications', () => ({
  webJobApplicationGetByCandidate: vi.fn(),
}));

import { webJobApplicationGetByCandidate } from '@/lib/database/actions/job-applications';

const mockWebJobApplicationGetByCandidate = vi.mocked(webJobApplicationGetByCandidate);

// Test wrapper with SWR provider (clears cache between tests)
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

// Mock application data
const mockApplications = [
  { uid: '1', status: 'applied', jobTitle: 'Job 1', companyName: 'Company 1', createdAt: 1000, jobId: 'j1', candidateId: 'c1', companyId: 'co1', jobIsActive: true, updatedAt: 1000, interview: null },
  { uid: '2', status: 'read', jobTitle: 'Job 2', companyName: 'Company 2', createdAt: 2000, jobId: 'j2', candidateId: 'c1', companyId: 'co2', jobIsActive: true, updatedAt: 2000, interview: null },
  { uid: '3', status: 'accepted', jobTitle: 'Job 3', companyName: 'Company 3', createdAt: 3000, jobId: 'j3', candidateId: 'c1', companyId: 'co3', jobIsActive: true, updatedAt: 3000, interview: null },
  { uid: '4', status: 'scheduled', jobTitle: 'Job 4', companyName: 'Company 4', createdAt: 4000, jobId: 'j4', candidateId: 'c1', companyId: 'co4', jobIsActive: true, updatedAt: 4000, interview: null },
  { uid: '5', status: 'rejected', jobTitle: 'Job 5', companyName: 'Company 5', createdAt: 5000, jobId: 'j5', candidateId: 'c1', companyId: 'co5', jobIsActive: true, updatedAt: 5000, interview: null },
  { uid: '6', status: 'withdraw', jobTitle: 'Job 6', companyName: 'Company 6', createdAt: 6000, jobId: 'j6', candidateId: 'c1', companyId: 'co6', jobIsActive: true, updatedAt: 6000, interview: null },
];

describe('useApplications', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockWebJobApplicationGetByCandidate.mockResolvedValue(mockApplications as any);
  });

  describe('getApplicationsKey', () => {
    it('should return null for null candidateId', () => {
      expect(getApplicationsKey(null)).toBeNull();
    });

    it('should return null for undefined candidateId', () => {
      expect(getApplicationsKey(undefined)).toBeNull();
    });

    it('should return formatted key for valid candidateId', () => {
      expect(getApplicationsKey('user-123')).toBe('candidate-applications-user-123');
    });
  });

  describe('STATUS_TAB_MAPPING', () => {
    it('should map "all" to empty array', () => {
      expect(STATUS_TAB_MAPPING.all).toEqual([]);
    });

    it('should map "applied" to applied and read statuses', () => {
      expect(STATUS_TAB_MAPPING.applied).toEqual(['applied', 'read']);
    });

    it('should map "reviewing" to accepted status', () => {
      expect(STATUS_TAB_MAPPING.reviewing).toEqual(['accepted']);
    });

    it('should map "interviewing" to scheduled and confirmed statuses', () => {
      expect(STATUS_TAB_MAPPING.interviewing).toEqual(['scheduled', 'confirmed']);
    });

    it('should map "rejected" to rejected and declined statuses', () => {
      expect(STATUS_TAB_MAPPING.rejected).toEqual(['rejected', 'declined']);
    });
  });

  describe('hook behavior', () => {
    it('should return undefined when candidateId is null', async () => {
      const { result } = renderHook(() => useApplications(null), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // When candidateId is null, SWR key is null, so data is undefined
      expect(result.current.applications).toBeUndefined();
      expect(result.current.allApplications).toBeUndefined();
      expect(mockWebJobApplicationGetByCandidate).not.toHaveBeenCalled();
    });

    it('should fetch applications for valid candidateId', async () => {
      const { result } = renderHook(() => useApplications('user-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(mockWebJobApplicationGetByCandidate).toHaveBeenCalledWith('user-123');
      expect(result.current.applications).toHaveLength(6);
    });

    it('should filter applications by "applied" status tab', async () => {
      const { result } = renderHook(() => useApplications('user-123', 'applied'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.applications).toHaveLength(2);
      expect(result.current.applications?.every(app =>
        ['applied', 'read'].includes(app.status)
      )).toBe(true);
    });

    it('should filter applications by "reviewing" status tab', async () => {
      const { result } = renderHook(() => useApplications('user-123', 'reviewing'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      expect(result.current.applications).toHaveLength(1);
      expect(result.current.applications?.[0].status).toBe('accepted');
    });

    it('should return allApplications unfiltered', async () => {
      const { result } = renderHook(() => useApplications('user-123', 'applied'), { wrapper });

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });

      // applications is filtered
      expect(result.current.applications).toHaveLength(2);
      // allApplications is not filtered
      expect(result.current.allApplications).toHaveLength(6);
    });

    it('should handle fetch error', async () => {
      const testError = new Error('Network error');
      mockWebJobApplicationGetByCandidate.mockRejectedValueOnce(testError);

      const { result } = renderHook(() => useApplications('user-123'), { wrapper });

      await waitFor(() => {
        expect(result.current.error).toBeDefined();
      });

      expect(result.current.error?.message).toBe('Network error');
    });
  });
});
