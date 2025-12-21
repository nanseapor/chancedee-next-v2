import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useBulkJobActions } from '@/hooks/jobsmarket/company/use-bulk-job-actions';

// Mock server actions
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobBulkUnpublish: vi.fn(),
  webJobBulkClose: vi.fn(),
}));

describe('useBulkJobActions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  it('bulk pause calls webJobBulkUnpublish with selected job IDs', async () => {
    const { webJobBulkUnpublish } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobBulkUnpublish).mockResolvedValue({
      success: true,
      successCount: 3,
      failureCount: 0,
    });

    const selectedJobIds = new Set(['job-1', 'job-2', 'job-3']);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() => useBulkJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleBulkPause(selectedJobIds);
    });

    expect(webJobBulkUnpublish).toHaveBeenCalledWith(['job-1', 'job-2', 'job-3']);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('bulk close calls webJobBulkClose with selected job IDs', async () => {
    const { webJobBulkClose } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobBulkClose).mockResolvedValue({
      success: true,
      successCount: 5,
      failureCount: 0,
    });

    const selectedJobIds = new Set(['job-1', 'job-2', 'job-3', 'job-4', 'job-5']);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() => useBulkJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleBulkClose(selectedJobIds);
    });

    expect(webJobBulkClose).toHaveBeenCalledWith([
      'job-1',
      'job-2',
      'job-3',
      'job-4',
      'job-5',
    ]);
    expect(mockOnSuccess).toHaveBeenCalled();
  });

  it('returns partial success when some operations fail', async () => {
    const { webJobBulkUnpublish } = await import('@/lib/database/actions/jobs');
    vi.mocked(webJobBulkUnpublish).mockResolvedValue({
      success: false,
      successCount: 2,
      failureCount: 1,
      errors: ['job-3: Permission denied'],
    });

    const selectedJobIds = new Set(['job-1', 'job-2', 'job-3']);
    const mockOnSuccess = vi.fn();

    const { result } = renderHook(() => useBulkJobActions(mockOnSuccess));

    await act(async () => {
      await result.current.handleBulkPause(selectedJobIds);
    });

    expect(webJobBulkUnpublish).toHaveBeenCalledWith(['job-1', 'job-2', 'job-3']);
    // Should still call onSuccess to refresh data
    expect(mockOnSuccess).toHaveBeenCalled();
  });
});
