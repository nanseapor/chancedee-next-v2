import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useSaveJobMutation } from '@/hooks/jobsmarket/useSaveJobMutation';
import type { SessionState } from '@/store/jobsmarket/global-atoms';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';

// Mock server actions
const mockSaveJob = vi.fn();
const mockUnsaveJob = vi.fn();
vi.mock('@/domains/jobs/services/server/actions/jobsmarket/public-jobs', () => ({
  saveJob: (...args: unknown[]) => mockSaveJob(...args),
  unsaveJob: (...args: unknown[]) => mockUnsaveJob(...args),
}));

// Mock toast
const mockToastSuccess = vi.fn();
const mockToastError = vi.fn();
vi.mock('sonner', () => ({
  toast: {
    success: (...args: unknown[]) => mockToastSuccess(...args),
    error: (...args: unknown[]) => mockToastError(...args),
  },
}));

// Mock Jotai atoms - create a map to track atom state
let mockAtomValues: Map<unknown, unknown> = new Map();

vi.mock('jotai', () => ({
  useAtomValue: (atom: unknown) => mockAtomValues.get(atom),
  atom: vi.fn((init) => ({ init })),
  createStore: vi.fn(() => ({
    get: vi.fn(),
    set: vi.fn(),
    sub: vi.fn(),
  })),
}));

describe('useSaveJobMutation', () => {
  const mockUser = { uid: 'test-candidate-123' };

  beforeEach(() => {
    vi.clearAllMocks();
    mockAtomValues = new Map();
  });

  describe('when guest (not authenticated)', () => {
    beforeEach(() => {
      // Mock unauthenticated state
      mockAtomValues.set(sessionStateAtom, 'unauthenticated' as SessionState);
      mockAtomValues.set(userAtom, null);
    });

    it('calls onAuthRequired callback', async () => {
      const onAuthRequired = vi.fn();
      const { result } = renderHook(() =>
        useSaveJobMutation([], { onAuthRequired })
      );

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(onAuthRequired).toHaveBeenCalledOnce();
    });

    it('does not call saveJob action', async () => {
      const { result } = renderHook(() =>
        useSaveJobMutation([], { onAuthRequired: vi.fn() })
      );

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(mockSaveJob).not.toHaveBeenCalled();
    });

    it('does not update savedJobIds', async () => {
      const { result } = renderHook(() =>
        useSaveJobMutation([], { onAuthRequired: vi.fn() })
      );

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(result.current.savedJobIds.has('job-123')).toBe(false);
    });
  });

  describe('when authenticated', () => {
    beforeEach(() => {
      // Mock authenticated state
      mockAtomValues.set(sessionStateAtom, 'authenticated' as SessionState);
      mockAtomValues.set(userAtom, mockUser);
    });

    describe('save job', () => {
      it('debug test - check mock setup', () => {
        const { result } = renderHook(() => useSaveJobMutation([]));

        // Check the hook is created
        expect(result.current.toggleSave).toBeDefined();
        expect(typeof result.current.toggleSave).toBe('function');

        // Check initial state
        expect(result.current.savedJobIds.size).toBe(0);
        expect(result.current.isSaving).toBe(false);
      });

      it('optimistically adds job to savedJobIds', async () => {
        const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

        mockSaveJob.mockResolvedValue({ success: true } as any);

        const { result } = renderHook(() => useSaveJobMutation([]));

        // Before save
        expect(result.current.savedJobIds.has('job-123')).toBe(false);

        // Perform save
        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        // After save - should be optimistically added
        expect(result.current.savedJobIds.has('job-123')).toBe(true);

        // Verify no error was logged
        expect(consoleErrorSpy).not.toHaveBeenCalled();

        consoleErrorSpy.mockRestore();
      });

      it('calls saveJob action with correct params', async () => {
        mockSaveJob.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useSaveJobMutation([]));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        expect(mockSaveJob).toHaveBeenCalledWith({
          candidateId: 'test-candidate-123',
          jobId: 'job-123',
        });
      });

      it('shows success toast on success', async () => {
        mockSaveJob.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useSaveJobMutation([]));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          expect(mockToastSuccess).toHaveBeenCalledWith('บันทึกงานแล้ว');
        });
      });

      it('rolls back on error', async () => {
        mockSaveJob.mockResolvedValue({ success: false, error: 'Test error' });

        const { result } = renderHook(() => useSaveJobMutation([]));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          // Should rollback - job should not be saved
          expect(result.current.savedJobIds.has('job-123')).toBe(false);
        });
      });

      it('shows error toast on error', async () => {
        mockSaveJob.mockResolvedValue({ success: false, error: 'Test error' });

        const { result } = renderHook(() => useSaveJobMutation([]));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          expect(mockToastError).toHaveBeenCalledWith('เกิดข้อผิดพลาด กรุณาลองใหม่');
        });
      });

      it('handles server action exception', async () => {
        mockSaveJob.mockRejectedValue(new Error('Network error'));

        const { result } = renderHook(() => useSaveJobMutation([]));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          expect(result.current.savedJobIds.has('job-123')).toBe(false);
          expect(mockToastError).toHaveBeenCalledWith('เกิดข้อผิดพลาด กรุณาลองใหม่');
        });
      });
    });

    describe('unsave job', () => {
      it('optimistically removes job from savedJobIds', async () => {
        mockUnsaveJob.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useSaveJobMutation(['job-123']));

        // Before unsave
        expect(result.current.savedJobIds.has('job-123')).toBe(true);

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        // After unsave
        expect(result.current.savedJobIds.has('job-123')).toBe(false);
      });

      it('calls unsaveJob action with correct params', async () => {
        mockUnsaveJob.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useSaveJobMutation(['job-123']));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        expect(mockUnsaveJob).toHaveBeenCalledWith({
          candidateId: 'test-candidate-123',
          jobId: 'job-123',
        });
      });

      it('shows success toast on success', async () => {
        mockUnsaveJob.mockResolvedValue({ success: true });

        const { result } = renderHook(() => useSaveJobMutation(['job-123']));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          expect(mockToastSuccess).toHaveBeenCalledWith('ยกเลิกบันทึกแล้ว');
        });
      });

      it('rolls back on error', async () => {
        mockUnsaveJob.mockResolvedValue({ success: false, error: 'Test error' });

        const { result } = renderHook(() => useSaveJobMutation(['job-123']));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          // Should rollback - job should still be saved
          expect(result.current.savedJobIds.has('job-123')).toBe(true);
        });
      });

      it('shows error toast on error', async () => {
        mockUnsaveJob.mockResolvedValue({ success: false, error: 'Test error' });

        const { result } = renderHook(() => useSaveJobMutation(['job-123']));

        await act(async () => {
          await result.current.toggleSave('job-123');
        });

        await waitFor(() => {
          expect(mockToastError).toHaveBeenCalledWith('เกิดข้อผิดพลาด กรุณาลองใหม่');
        });
      });
    });

    describe('isSaving state', () => {
      it('sets isSaving to true during operation', async () => {
        let resolveSave: (value: any) => void;
        const savePromise = new Promise((resolve) => {
          resolveSave = resolve;
        });
        mockSaveJob.mockReturnValue(savePromise);

        const { result } = renderHook(() => useSaveJobMutation([]));

        // Start save operation
        act(() => {
          result.current.toggleSave('job-123');
        });

        // Should be saving
        expect(result.current.isSaving).toBe(true);

        // Complete save
        await act(async () => {
          resolveSave!({ success: true });
          await savePromise;
        });

        // Should no longer be saving
        expect(result.current.isSaving).toBe(false);
      });
    });
  });

  describe('isJobSaved', () => {
    beforeEach(() => {
      mockAtomValues.set(sessionStateAtom, 'authenticated' as SessionState);
      mockAtomValues.set(userAtom, mockUser);
    });

    it('returns true for saved jobs', () => {
      const { result } = renderHook(() =>
        useSaveJobMutation(['job-123', 'job-456'])
      );

      expect(result.current.isJobSaved('job-123')).toBe(true);
      expect(result.current.isJobSaved('job-456')).toBe(true);
    });

    it('returns false for unsaved jobs', () => {
      const { result } = renderHook(() =>
        useSaveJobMutation(['job-123'])
      );

      expect(result.current.isJobSaved('job-456')).toBe(false);
      expect(result.current.isJobSaved('job-789')).toBe(false);
    });

    it('updates when job is saved', async () => {
      mockSaveJob.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSaveJobMutation([]));

      expect(result.current.isJobSaved('job-123')).toBe(false);

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(result.current.isJobSaved('job-123')).toBe(true);
    });

    it('updates when job is unsaved', async () => {
      mockUnsaveJob.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSaveJobMutation(['job-123']));

      expect(result.current.isJobSaved('job-123')).toBe(true);

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(result.current.isJobSaved('job-123')).toBe(false);
    });
  });

  describe('edge cases', () => {
    it('handles missing candidateId gracefully', async () => {
      mockAtomValues.set(sessionStateAtom, 'authenticated' as SessionState);
      mockAtomValues.set(userAtom, null); // No user

      const { result } = renderHook(() => useSaveJobMutation([]));

      await act(async () => {
        await result.current.toggleSave('job-123');
      });

      expect(mockSaveJob).not.toHaveBeenCalled();
    });

    it('handles multiple rapid toggles', async () => {
      mockAtomValues.set(sessionStateAtom, 'authenticated' as SessionState);
      mockAtomValues.set(userAtom, mockUser);

      mockSaveJob.mockResolvedValue({ success: true });
      mockUnsaveJob.mockResolvedValue({ success: true });

      const { result } = renderHook(() => useSaveJobMutation([]));

      await act(async () => {
        await result.current.toggleSave('job-123'); // Save
        await result.current.toggleSave('job-123'); // Unsave
        await result.current.toggleSave('job-123'); // Save again
      });

      expect(result.current.isJobSaved('job-123')).toBe(true);
    });
  });
});
