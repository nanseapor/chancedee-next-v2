import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useJobActions } from '@/hooks/jobsmarket/company/use-job-actions';
import type { JobListItem } from '@/types/jobsmarket/jobs-list.types';

// Mock server actions
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobPublish: vi.fn(),
  webJobUnpublish: vi.fn(),
  webJobClose: vi.fn(),
  webJobDelete: vi.fn(),
  webJobDuplicate: vi.fn(),
}));

// Mock router
vi.mock('next/navigation', () => ({
  useRouter: () => ({
    push: vi.fn(),
    refresh: vi.fn(),
  }),
}));

describe('useJobActions', () => {
  const mockJob: JobListItem = {
    uid: 'job-123',
    title: 'Senior Developer',
    jobStatus: 'draft',
    isActive: false,
    applicationCount: 0,
    unreadApplicationCount: 0,
    viewCount: 5,
    createdAt: Date.now(),
    updatedAt: Date.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('publish action calls webJobPublish and refreshes data', async () => {
    const { webJobPublish } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobPublish).mockResolvedValue({ success: true });

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handlePublish(mockJob.uid);
    });

    expect(webJobPublish).toHaveBeenCalledWith(mockJob.uid);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('unpublish action calls webJobUnpublish and refreshes data', async () => {
    const { webJobUnpublish } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobUnpublish).mockResolvedValue({ success: true });

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleUnpublish(mockJob.uid);
    });

    expect(webJobUnpublish).toHaveBeenCalledWith(mockJob.uid);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('close action calls webJobClose and refreshes data', async () => {
    const { webJobClose } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobClose).mockResolvedValue({ success: true });

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleClose(mockJob.uid);
    });

    expect(webJobClose).toHaveBeenCalledWith(mockJob.uid);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('delete action calls webJobDelete and refreshes data', async () => {
    const { webJobDelete } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobDelete).mockResolvedValue({ success: true });

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleDelete(mockJob.uid);
    });

    expect(webJobDelete).toHaveBeenCalledWith(mockJob.uid);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('duplicate action calls webJobDuplicate and navigates to edit page', async () => {
    const { webJobDuplicate } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobDuplicate).mockResolvedValue({
      success: true,
      data: { uid: 'new-job-456' },
    });

    const mockOnSuccess = vi.fn();
    const { result } = renderHook(() => useJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleDuplicate(mockJob.uid);
    });

    expect(webJobDuplicate).toHaveBeenCalledWith(mockJob.uid);
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
