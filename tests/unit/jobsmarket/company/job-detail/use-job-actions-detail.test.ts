import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobActionsDetail } from '@/hooks/jobsmarket/jobs/use-job-actions-detail';
import type { JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';

// Mock the server actions
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobPublish: vi.fn(),
  webJobUnpublish: vi.fn(),
  webJobClose: vi.fn(),
  webJobDelete: vi.fn(),
  webJobDuplicate: vi.fn(),
}));

describe('useJobActionsDetail', () => {
  const mockDraftJob: JobWithAnalytics = {
    uid: 'job-123',
    companyId: 'company-123',
    companyName: 'Test Company',
    title: 'Software Engineer',
    jobStatus: 'draft',
    isActive: false,
    positions: 1,
    applicationCount: 0,
    unreadApplicationCount: 0,
    viewCount: 0,
    createdBy: 'user-123',
    updatedBy: 'user-123',
    createdAt: Date.now(),
    updatedAt: Date.now(),
  } as JobWithAnalytics;

  const mockPublishedJob: JobWithAnalytics = {
    ...mockDraftJob,
    jobStatus: 'published',
    isActive: true,
  };

  const mockClosedJob: JobWithAnalytics = {
    ...mockDraftJob,
    jobStatus: 'closed',
    isActive: false,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('Available Actions', () => {
    it('should return available actions based on job status', () => {
      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      expect(result.current.availableActions).toBeDefined();
      expect(Array.isArray(result.current.availableActions)).toBe(true);
    });

    it('should return [publish, close, delete, duplicate] for draft', () => {
      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      const actions = result.current.availableActions;
      expect(actions).toContain('publish');
      expect(actions).toContain('close');
      expect(actions).toContain('delete');
      expect(actions).toContain('duplicate');
    });

    it('should return [unpublish, close, duplicate] for published', () => {
      const { result } = renderHook(() => useJobActionsDetail(mockPublishedJob));

      const actions = result.current.availableActions;
      expect(actions).toContain('unpublish');
      expect(actions).toContain('close');
      expect(actions).toContain('duplicate');
      expect(actions).not.toContain('publish');
    });

    it('should return [duplicate] for closed', () => {
      const { result } = renderHook(() => useJobActionsDetail(mockClosedJob));

      const actions = result.current.availableActions;
      expect(actions).toContain('duplicate');
      expect(actions.length).toBe(1);
    });
  });

  describe('Publish Action', () => {
    it('should call webJobPublish with job id', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      await act(async () => {
        await result.current.publish();
      });

      expect(webJobPublish).toHaveBeenCalledWith('job-123');
    });

    it('should set isProcessing true during action', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');

      // Use a deferred promise to control timing
      let resolvePromise: (value: { success: boolean }) => void;
      const deferredPromise = new Promise<{ success: boolean }>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(webJobPublish).mockReturnValue(deferredPromise);

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      // Start the action but don't await it yet
      let publishPromise: Promise<unknown>;
      act(() => {
        publishPromise = result.current.publish();
      });

      // Now isProcessing should be true while waiting
      await waitFor(() => {
        expect(result.current.isProcessing).toBe(true);
      });

      // Complete the action
      await act(async () => {
        resolvePromise!({ success: true });
        await publishPromise;
      });
    });

    it('should return success result on completion', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      let publishResult: unknown;
      await act(async () => {
        publishResult = await result.current.publish();
      });

      expect((publishResult as { success: boolean }).success).toBe(true);
    });

    it('should return error on failure', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({
        success: false,
        error: 'Failed to publish',
      });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      let publishResult: unknown;
      await act(async () => {
        publishResult = await result.current.publish();
      });

      expect((publishResult as { success: boolean; error?: string }).success).toBe(false);
      expect((publishResult as { success: boolean; error?: string }).error).toBe('Failed to publish');
    });
  });

  describe('Unpublish Action', () => {
    it('should call webJobUnpublish with job id', async () => {
      const { webJobUnpublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobUnpublish).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobActionsDetail(mockPublishedJob));

      await act(async () => {
        await result.current.unpublish();
      });

      expect(webJobUnpublish).toHaveBeenCalledWith('job-123');
    });
  });

  describe('Close Action', () => {
    it('should call webJobClose with job id', async () => {
      const { webJobClose } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobClose).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      await act(async () => {
        await result.current.close();
      });

      expect(webJobClose).toHaveBeenCalledWith('job-123');
    });
  });

  describe('Delete Action', () => {
    it('should call webJobDelete with job id', async () => {
      const { webJobDelete } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobDelete).mockResolvedValue(undefined);

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      await act(async () => {
        await result.current.deleteJob();
      });

      expect(webJobDelete).toHaveBeenCalledWith('job-123');
    });

    it('should check canDelete before allowing delete', () => {
      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      expect(result.current.canDelete).toBe(true);
    });

    it('should not allow delete if job has applications', () => {
      const jobWithApps = {
        ...mockDraftJob,
        applicationCount: 5,
      };

      const { result } = renderHook(() => useJobActionsDetail(jobWithApps));

      expect(result.current.canDelete).toBe(false);
    });
  });

  describe('Duplicate Action', () => {
    it('should call webJobDuplicate with job id', async () => {
      const { webJobDuplicate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobDuplicate).mockResolvedValue({
        success: true,
        data: { uid: 'new-job-456' },
      });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      await act(async () => {
        await result.current.duplicate();
      });

      expect(webJobDuplicate).toHaveBeenCalledWith('job-123');
    });

    it('should return new job id on success', async () => {
      const { webJobDuplicate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobDuplicate).mockResolvedValue({
        success: true,
        data: { uid: 'new-job-456' },
      });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      let duplicateResult: unknown;
      await act(async () => {
        duplicateResult = await result.current.duplicate();
      });

      expect((duplicateResult as { success: boolean }).success).toBe(true);
      expect((duplicateResult as { success: boolean; data?: { uid: string } }).data?.uid).toBe('new-job-456');
    });
  });

  describe('Callbacks', () => {
    it('should call onSuccess callback after successful action', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const onSuccess = vi.fn();
      const { result } = renderHook(() =>
        useJobActionsDetail(mockDraftJob, { onSuccess })
      );

      await act(async () => {
        await result.current.publish();
      });

      expect(onSuccess).toHaveBeenCalledWith('publish', expect.anything());
    });

    it('should call onError callback after failed action', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({
        success: false,
        error: 'Failed to publish',
      });

      const onError = vi.fn();
      const { result } = renderHook(() =>
        useJobActionsDetail(mockDraftJob, { onError })
      );

      await act(async () => {
        await result.current.publish();
      });

      expect(onError).toHaveBeenCalledWith('publish', 'Failed to publish');
    });
  });

  describe('Processing State', () => {
    it('should set isProcessing to false after action completes', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobPublish).mockResolvedValue({ success: true });

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      await act(async () => {
        await result.current.publish();
      });

      expect(result.current.isProcessing).toBe(false);
    });

    it('should track current action during processing', async () => {
      const { webJobPublish } = await import('@/lib/database/actions/jobs');

      // Use a deferred promise to control timing
      let resolvePromise: (value: { success: boolean }) => void;
      const deferredPromise = new Promise<{ success: boolean }>((resolve) => {
        resolvePromise = resolve;
      });
      vi.mocked(webJobPublish).mockReturnValue(deferredPromise);

      const { result } = renderHook(() => useJobActionsDetail(mockDraftJob));

      // Start the action but don't await it yet
      let publishPromise: Promise<unknown>;
      act(() => {
        publishPromise = result.current.publish();
      });

      // Now currentAction should be set while waiting
      await waitFor(() => {
        expect(result.current.currentAction).toBe('publish');
      });

      // Complete the action
      await act(async () => {
        resolvePromise!({ success: true });
        await publishPromise;
      });
    });
  });
});
