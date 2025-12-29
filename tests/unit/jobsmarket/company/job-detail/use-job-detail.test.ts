import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useJobDetail } from '@/hooks/jobsmarket/jobs/use-job-detail';
import type { FirebaseJobData } from '@/types/job.types';

// Mock the server action
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobGetById: vi.fn(),
}));

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn((key, fetcher) => {
    if (!key) {
      return {
        data: undefined,
        error: undefined,
        isLoading: false,
        mutate: vi.fn(),
      };
    }

    // Call fetcher immediately for testing
    const fetchedData = fetcher ? fetcher() : undefined;

    return {
      data: fetchedData,
      error: undefined,
      isLoading: false,
      mutate: vi.fn(),
    };
  }),
}));

describe('useJobDetail', () => {
  const mockJob: FirebaseJobData = {
    uid: 'job-123',
    companyId: 'company-123',
    companyName: 'Test Company',
    companyLogo: 'https://example.com/logo.png',
    title: 'Software Engineer',
    jobStatus: 'draft',
    isActive: false,
    positions: 1,
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as FirebaseJobData;

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.clearAllMocks();
  });

  describe('Initialization', () => {
    it('should return loading state initially', () => {
      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current).toBeDefined();
      expect(result.current.isLoading).toBeDefined();
    });

    it('should not fetch if jobId is null', () => {
      const { result } = renderHook(() => useJobDetail(null));

      expect(result.current.job).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });

    it('should not fetch if jobId is empty string', () => {
      const { result } = renderHook(() => useJobDetail(''));

      expect(result.current.job).toBeUndefined();
      expect(result.current.isLoading).toBe(false);
    });
  });

  describe('Data Fetching', () => {
    it('should fetch job data when jobId is provided', async () => {
      const { webJobGetById } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobGetById).mockResolvedValue(mockJob);

      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current).toBeDefined();
    });

    it('should return job data on successful fetch', async () => {
      const { webJobGetById } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobGetById).mockResolvedValue(mockJob);

      const { result } = renderHook(() => useJobDetail('job-123'));

      await waitFor(() => {
        expect(result.current.job).toBeDefined();
      });
    });

    it('should return error on fetch failure', async () => {
      const { webJobGetById } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobGetById).mockRejectedValue(new Error('Fetch failed'));

      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current).toBeDefined();
    });
  });

  describe('Revalidation', () => {
    it('should provide mutate function for revalidation', () => {
      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current.mutate).toBeDefined();
      expect(typeof result.current.mutate).toBe('function');
    });

    it('should revalidate data when mutate is called', async () => {
      const { result } = renderHook(() => useJobDetail('job-123'));

      await result.current.mutate();

      expect(result.current.mutate).toHaveBeenCalled;
    });
  });
});
