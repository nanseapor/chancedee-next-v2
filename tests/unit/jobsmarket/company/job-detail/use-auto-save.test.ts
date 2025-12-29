import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { renderHook, act } from '@testing-library/react';
import { useAutoSave } from '@/hooks/jobsmarket/jobs/use-auto-save';

describe('useAutoSave', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('Initialization', () => {
    it('should initialize with idle status', () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAutoSave(saveFn, { enabled: true }));

      expect(result.current.status).toBe('idle');
    });

    it('should not trigger save when disabled', () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() => useAutoSave(saveFn, { enabled: false }));

      act(() => {
        result.current.trigger();
      });

      vi.advanceTimersByTime(5000);

      expect(saveFn).not.toHaveBeenCalled();
    });
  });

  describe('Debounced Save', () => {
    it('should debounce multiple triggers', async () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 1000 })
      );

      act(() => {
        result.current.trigger();
        result.current.trigger();
        result.current.trigger();
      });

      vi.advanceTimersByTime(500);
      expect(saveFn).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(1000);
        await Promise.resolve();
      });
      expect(saveFn).toHaveBeenCalledTimes(1);
    });

    it('should reset debounce timer on new trigger', async () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });
      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 1000 })
      );

      act(() => {
        result.current.trigger();
      });

      vi.advanceTimersByTime(800);

      act(() => {
        result.current.trigger(); // Reset timer
      });

      vi.advanceTimersByTime(800);
      expect(saveFn).not.toHaveBeenCalled();

      await act(async () => {
        vi.advanceTimersByTime(200);
        await Promise.resolve();
      });
      expect(saveFn).toHaveBeenCalledTimes(1);
    });
  });

  describe('Status Updates', () => {
    it('should set status to saving when save starts', async () => {
      const saveFn = vi.fn().mockImplementation(
        () => new Promise((resolve) => setTimeout(() => resolve({ success: true }), 100))
      );

      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 100 })
      );

      act(() => {
        result.current.trigger();
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
        await Promise.resolve();
      });

      expect(result.current.status).toBe('saving');
    });

    it('should set status to saved on success', async () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 100 })
      );

      act(() => {
        result.current.trigger();
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
        await vi.runAllTimersAsync();
      });

      expect(result.current.status).toBe('saved');
    });

    it('should set status to error on failure', async () => {
      const saveFn = vi.fn().mockResolvedValue({ success: false, error: 'Failed' });

      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 100 })
      );

      act(() => {
        result.current.trigger();
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
        await vi.runAllTimersAsync();
      });

      expect(result.current.status).toBe('error');
      expect(result.current.error).toBe('Failed');
    });
  });

  describe('Last Saved Time', () => {
    it('should update lastSaved after successful save', async () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 100 })
      );

      expect(result.current.lastSaved).toBeUndefined();

      act(() => {
        result.current.trigger();
      });

      await act(async () => {
        vi.advanceTimersByTime(100);
        await vi.runAllTimersAsync();
      });

      expect(result.current.lastSaved).toBeInstanceOf(Date);
    });
  });

  describe('Cancel', () => {
    it('should cancel pending save when cancel called', () => {
      const saveFn = vi.fn().mockResolvedValue({ success: true });

      const { result } = renderHook(() =>
        useAutoSave(saveFn, { enabled: true, debounceMs: 1000 })
      );

      act(() => {
        result.current.trigger();
      });

      act(() => {
        result.current.cancel();
      });

      vi.advanceTimersByTime(2000);

      expect(saveFn).not.toHaveBeenCalled();
    });
  });
});
