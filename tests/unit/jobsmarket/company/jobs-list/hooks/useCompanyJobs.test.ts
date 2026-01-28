import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, waitFor } from '@testing-library/react';
import { useCompanyJobs } from '@/hooks/jobsmarket/company/use-company-jobs';
import type { JobListItem } from '@/types/jobsmarket/jobs-list.types';

// Mock SWR
vi.mock('swr', () => ({
  default: vi.fn(),
}));

// Mock job actions
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobGetCompanyJobsList: vi.fn(),
  webJobGetCompanyJobsAggregation: vi.fn(),
}));

describe('useCompanyJobs', () => {
  const mockCompanyId = 'company-123';
  const mockJobs: JobListItem[] = [
    {
      uid: 'job-1',
      title: 'Senior Developer',
      jobStatus: 'published',
      isActive: true,
      applicationCount: 10,
      unreadApplicationCount: 2,
      viewCount: 50,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    },
  ];

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('fetches jobs list with default parameters (status: all, page: 1)', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 1,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() => useCompanyJobs(mockCompanyId));

    await waitFor(() => {
      expect(result.current.jobs).toEqual(mockJobs);
      expect(result.current.isLoading).toBe(false);
    });

    expect(webJobGetCompanyJobsList).toHaveBeenCalledWith(mockCompanyId, {
      status: 'all',
      page: 1,
      limit: 20,
    });
  });

  it('applies status filter when provided', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 1,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() =>
      useCompanyJobs(mockCompanyId, { status: 'published' })
    );

    await waitFor(() => {
      expect(result.current.jobs).toBeDefined();
    });

    expect(webJobGetCompanyJobsList).toHaveBeenCalledWith(
      mockCompanyId,
      expect.objectContaining({ status: 'published' })
    );
  });

  it('applies search query when provided', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 1,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() =>
      useCompanyJobs(mockCompanyId, { q: 'developer' })
    );

    await waitFor(() => {
      expect(result.current.jobs).toBeDefined();
    });

    expect(webJobGetCompanyJobsList).toHaveBeenCalledWith(
      mockCompanyId,
      expect.objectContaining({ q: 'developer' })
    );
  });

  it('applies pagination parameters (page, limit)', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 50,
      page: 3,
      limit: 10,
    });

    const { result } = renderHook(() =>
      useCompanyJobs(mockCompanyId, { page: 3, limit: 10 })
    );

    await waitFor(() => {
      expect(result.current.jobs).toBeDefined();
    });

    expect(webJobGetCompanyJobsList).toHaveBeenCalledWith(
      mockCompanyId,
      expect.objectContaining({ page: 3, limit: 10 })
    );
  });

  it('applies sort parameter (createdAt, applicationCount)', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: true,
      data: mockJobs,
      total: 1,
      page: 1,
      limit: 20,
    });

    const { result } = renderHook(() =>
      useCompanyJobs(mockCompanyId, { sort: 'applicationCount' })
    );

    await waitFor(() => {
      expect(result.current.jobs).toBeDefined();
    });

    expect(webJobGetCompanyJobsList).toHaveBeenCalledWith(
      mockCompanyId,
      expect.objectContaining({ sort: 'applicationCount' })
    );
  });

  it('returns error state when API call fails', async () => {
    const { webJobGetCompanyJobsList } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsList).mockResolvedValue({
      success: false,
      error: 'Failed to fetch jobs',
    });

    const { result } = renderHook(() => useCompanyJobs(mockCompanyId));

    await waitFor(() => {
      expect(result.current.error).toBeDefined();
      expect(result.current.jobs).toEqual([]);
    });
  });

  it('fetches aggregation counts for status tabs', async () => {
    const { webJobGetCompanyJobsAggregation } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobGetCompanyJobsAggregation).mockResolvedValue({
      success: true,
      data: {
        all: 50,
        published: 20,
        draft: 10,
        unpublished: 5,
        closed: 15,
      },
    });

    const { result } = renderHook(() => useCompanyJobs(mockCompanyId));

    await waitFor(() => {
      expect(result.current.aggregation).toEqual({
        all: 50,
        published: 20,
        draft: 10,
        unpublished: 5,
        closed: 15,
      });
    });

    expect(webJobGetCompanyJobsAggregation).toHaveBeenCalledWith(mockCompanyId);
  });
});
