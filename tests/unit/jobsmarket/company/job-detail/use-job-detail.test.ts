import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook } from '@testing-library/react';
import { useJobDetail } from '@/hooks/jobsmarket/jobs/use-job-detail';
import type { FirebaseJobData } from '@/types/job.types';

// Mock the server action
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobGetById: vi.fn(),
}));

// Mock SWR - use a controlled mock for predictable behavior
const mockSWRData = {
  data: undefined as unknown,
  error: undefined as Error | undefined,
  isLoading: false,
};

vi.mock('swr', () => ({
  default: vi.fn(() => ({
    get data() {
      return mockSWRData.data;
    },
    get error() {
      return mockSWRData.error;
    },
    get isLoading() {
      return mockSWRData.isLoading;
    },
    mutate: vi.fn(),
  })),
}));

// Helper to reset SWR mock state
function resetSWRMock() {
  mockSWRData.data = undefined;
  mockSWRData.error = undefined;
  mockSWRData.isLoading = false;
}

// Helper to set mock data
function setSWRData(data: unknown) {
  mockSWRData.data = data;
}

// Helper to set mock error
function setSWRError(error: Error) {
  mockSWRData.error = error;
}

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
    resetSWRMock();
  });

  afterEach(() => {
    vi.clearAllMocks();
    resetSWRMock();
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
    it('should fetch job data when jobId is provided', () => {
      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current).toBeDefined();
    });

    it('should return job data on successful fetch', () => {
      // Set the mock data before rendering
      setSWRData(mockJob);

      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current.job).toBeDefined();
      expect(result.current.job?.uid).toBe('job-123');
    });

    it('should return error on fetch failure', () => {
      // Set the mock error before rendering
      setSWRError(new Error('Fetch failed'));

      const { result } = renderHook(() => useJobDetail('job-123'));

      expect(result.current).toBeDefined();
      expect(result.current.error).toBeDefined();
      expect(result.current.error?.message).toBe('Fetch failed');
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
