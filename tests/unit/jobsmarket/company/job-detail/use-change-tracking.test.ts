import { describe, it, expect } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useChangeTracking } from '@/hooks/jobsmarket/jobs/use-change-tracking';

describe('useChangeTracking', () => {
  const originalData = {
    title: 'Software Engineer',
    description: 'Build amazing products',
    salary: 50000,
    location: 'Bangkok',
  };

  describe('Initialization', () => {
    it('should initialize with no changes', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      expect(result.current.isDirty).toBe(false);
    });

    it('should set isDirty to false initially', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      expect(result.current.isDirty).toBe(false);
    });

    it('should have empty changedFields set', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      expect(result.current.changedFields.size).toBe(0);
    });
  });

  describe('Change Detection', () => {
    it('should detect when a field changes', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
      });

      expect(result.current.changedFields.has('title')).toBe(true);
    });

    it('should track multiple changed fields', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
        result.current.trackChange('salary', 60000);
      });

      expect(result.current.changedFields.size).toBe(2);
      expect(result.current.changedFields.has('title')).toBe(true);
      expect(result.current.changedFields.has('salary')).toBe(true);
    });

    it('should set isDirty to true when changes exist', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
      });

      expect(result.current.isDirty).toBe(true);
    });

    it('should detect when field reverts to original', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
      });

      expect(result.current.changedFields.has('title')).toBe(true);

      act(() => {
        result.current.trackChange('title', 'Software Engineer');
      });

      expect(result.current.changedFields.has('title')).toBe(false);
    });

    it('should set isDirty to false when all changes reverted', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
        result.current.trackChange('salary', 60000);
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.trackChange('title', 'Software Engineer');
        result.current.trackChange('salary', 50000);
      });

      expect(result.current.isDirty).toBe(false);
    });
  });

  describe('Change Summary', () => {
    it('should return list of changed field names', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
        result.current.trackChange('salary', 60000);
      });

      expect(result.current.changes.length).toBe(2);
    });

    it('should return original and current values for changed fields', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
      });

      const titleChange = result.current.changes.find(c => c.field === 'title');
      expect(titleChange).toBeDefined();
      expect(titleChange?.originalValue).toBe('Software Engineer');
      expect(titleChange?.currentValue).toBe('Senior Software Engineer');
    });
  });

  describe('Reset', () => {
    it('should reset all tracking when reset is called', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
        result.current.trackChange('salary', 60000);
      });

      expect(result.current.isDirty).toBe(true);

      act(() => {
        result.current.reset();
      });

      expect(result.current.isDirty).toBe(false);
      expect(result.current.changedFields.size).toBe(0);
    });

    it('should update original data when setOriginal is called', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      const newOriginal = {
        ...originalData,
        title: 'Senior Software Engineer',
      };

      act(() => {
        result.current.setOriginal(newOriginal);
      });

      // After setting new original, the same value shouldn't be dirty
      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
      });

      expect(result.current.changedFields.has('title')).toBe(false);
    });
  });

  describe('Revert Field', () => {
    it('should revert single field to original value', () => {
      const { result } = renderHook(() => useChangeTracking(originalData));

      act(() => {
        result.current.trackChange('title', 'Senior Software Engineer');
        result.current.trackChange('salary', 60000);
      });

      expect(result.current.changedFields.size).toBe(2);

      act(() => {
        result.current.revertField('title');
      });

      expect(result.current.changedFields.has('title')).toBe(false);
      expect(result.current.changedFields.has('salary')).toBe(true);
      expect(result.current.changedFields.size).toBe(1);
    });
  });
});
