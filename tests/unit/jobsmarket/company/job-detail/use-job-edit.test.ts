import { describe, it, expect, vi, beforeEach } from 'vitest';
import { renderHook, act, waitFor } from '@testing-library/react';
import { useJobEdit } from '@/hooks/jobsmarket/jobs/use-job-edit';
import type { FirebaseJobData } from '@/types/job.types';

// Mock the server action
vi.mock('@/lib/database/actions/jobs', () => ({
  webJobUpdate: vi.fn(),
}));

// Mock the change tracking hook
vi.mock('@/hooks/jobsmarket/jobs/use-change-tracking', () => ({
  useChangeTracking: vi.fn(() => ({
    isDirty: false,
    changedFields: new Set(),
    changes: [],
    trackChange: vi.fn(),
    revertField: vi.fn(),
    reset: vi.fn(),
    setOriginal: vi.fn(),
  })),
}));

describe('useJobEdit', () => {
  const mockJob: FirebaseJobData = {
    uid: 'job-123',
    companyId: 'company-123',
    companyName: 'Test Company',
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

  describe('Initialization', () => {
    it('should initialize form with job data', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      expect(result.current.formData).toBeDefined();
      expect(result.current.formData.title).toBe('Software Engineer');
    });

    it('should set editState to clean initially', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      expect(result.current.editState).toBe('clean');
    });
  });

  describe('Field Updates', () => {
    it('should update field value when setField is called', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      expect(result.current.formData.title).toBe('Senior Software Engineer');
    });

    it('should mark form as dirty after field change', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      expect(result.current.editState).toBe('dirty');
    });

    it('should track changed fields', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      expect(result.current.changedFields).toBeDefined();
    });
  });

  describe('Validation', () => {
    it('should validate required fields', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', '');
      });

      expect(result.current.validationErrors.length).toBeGreaterThan(0);
    });

    it('should return validation errors for invalid data', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('positions', -1);
      });

      const positionError = result.current.validationErrors.find(
        e => e.field === 'positions'
      );
      expect(positionError).toBeDefined();
    });

    it('should return isValid true when all fields valid', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      expect(result.current.isValid).toBe(true);
    });
  });

  describe('Save', () => {
    it('should call webJobUpdate with form data on save', async () => {
      const { webJobUpdate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobUpdate).mockResolvedValue('job-123');

      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      await act(async () => {
        await result.current.save();
      });

      expect(webJobUpdate).toHaveBeenCalled();
    });

    it('should set editState to saving during save', async () => {
      const { webJobUpdate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobUpdate).mockImplementation(
        () => new Promise(resolve => setTimeout(() => resolve('job-123'), 100))
      );

      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      const savePromise = act(async () => {
        return result.current.save();
      });

      await waitFor(() => {
        expect(['saving', 'clean']).toContain(result.current.editState);
      });

      await savePromise;
    });

    it('should set editState to clean after successful save', async () => {
      const { webJobUpdate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobUpdate).mockResolvedValue('job-123');

      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      await act(async () => {
        await result.current.save();
      });

      expect(result.current.editState).toBe('clean');
    });

    it('should return error on save failure', async () => {
      const { webJobUpdate } = await import('@/lib/database/actions/jobs');
      vi.mocked(webJobUpdate).mockRejectedValue(new Error('Save failed'));

      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      const saveResult = await act(async () => {
        return await result.current.save();
      });

      expect(saveResult.success).toBe(false);
      expect(saveResult.error).toBeDefined();
    });
  });

  describe('Cancel', () => {
    it('should reset form to original data on cancel', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      act(() => {
        result.current.cancel();
      });

      expect(result.current.formData.title).toBe('Software Engineer');
    });

    it('should clear all tracked changes on cancel', () => {
      const { result } = renderHook(() => useJobEdit(mockJob));

      act(() => {
        result.current.setField('title', 'Senior Software Engineer');
      });

      act(() => {
        result.current.cancel();
      });

      expect(result.current.changedFields.size).toBe(0);
    });
  });
});
