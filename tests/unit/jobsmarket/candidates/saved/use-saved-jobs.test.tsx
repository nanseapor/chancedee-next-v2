import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { SWRConfig } from 'swr';
import React from 'react';
import { useSavedJobs } from '@/hooks/jobsmarket/candidates/use-saved-jobs';
import { webCandidateSavedJobsGet } from '@/lib/database/actions/candidate-saved';

// Mock the server action
vi.mock('@/lib/database/actions/candidate-saved');

// Test wrapper with SWR provider (clears cache between tests)
const wrapper = ({ children }: { children: React.ReactNode }) => (
  <SWRConfig value={{ provider: () => new Map(), dedupingInterval: 0 }}>
    {children}
  </SWRConfig>
);

describe('useSavedJobs', () => {
  const mockCandidateId = 'test-candidate-123';

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('should return loading state initially', async () => {
    vi.mocked(webCandidateSavedJobsGet).mockResolvedValue({
      success: true,
      savedJobs: [],
    });

    const { result } = renderHook(() => useSavedJobs(mockCandidateId), { wrapper });

    // Initially loading
    expect(result.current.isLoading).toBe(true);
    expect(result.current.savedJobs).toBeUndefined();

    // Wait for SWR to complete
    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    expect(result.current.savedJobs).toEqual([]);
    expect(result.current.error).toBeUndefined();
  });

  it('should fetch saved jobs for candidate', async () => {
    const mockSavedJobs = [
      {
        savedAt: Date.now(),
        job: {
          uid: 'job-1',
          title: 'Test Job',
          companyName: 'Test Company',
          location: 'Bangkok',
          isActive: true,
        },
      },
    ];

    vi.mocked(webCandidateSavedJobsGet).mockResolvedValue({
      success: true,
      savedJobs: mockSavedJobs,
    });

    const { result } = renderHook(() => useSavedJobs(mockCandidateId), { wrapper });

    await waitFor(() => {
      expect(result.current.isLoading).toBe(false);
    });

    // Verify server action was called
    expect(webCandidateSavedJobsGet).toHaveBeenCalledWith({
      candidateId: mockCandidateId,
    });

    expect(result.current.savedJobs).toEqual(mockSavedJobs);
    expect(result.current.error).toBeUndefined();
  });

  it('should handle error state', async () => {
    vi.mocked(webCandidateSavedJobsGet).mockResolvedValue({
      success: false,
      error: 'Failed to fetch',
    });

    const { result } = renderHook(() => useSavedJobs(mockCandidateId), { wrapper });

    // Wait for SWR to attempt fetch and fail
    await waitFor(() => {
      expect(result.current.error).toBeDefined();
    });

    expect(result.current.error).toBeTruthy();
    expect(result.current.isLoading).toBe(false);
  });
});
