"use client";

import { useState, useRef, useCallback, useEffect } from 'react';

type AutoSaveStatus = 'idle' | 'saving' | 'saved' | 'error';

interface AutoSaveOptions {
  enabled: boolean;
  debounceMs?: number;
}

interface AutoSaveResult {
  success: boolean;
  error?: string;
}

interface UseAutoSaveReturn {
  status: AutoSaveStatus;
  error: string | undefined;
  lastSaved: Date | undefined;
  trigger: () => void;
  cancel: () => void;
}

export function useAutoSave(
  saveFn: () => Promise<AutoSaveResult>,
  options: AutoSaveOptions
): UseAutoSaveReturn {
  const { enabled, debounceMs = 2000 } = options;

  const [status, setStatus] = useState<AutoSaveStatus>('idle');
  const [error, setError] = useState<string | undefined>();
  const [lastSaved, setLastSaved] = useState<Date | undefined>();

  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const isMountedRef = useRef(true);

  useEffect(() => {
    isMountedRef.current = true;
    return () => {
      isMountedRef.current = false;
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  const executeSave = useCallback(async () => {
    if (!isMountedRef.current) return;

    setStatus('saving');
    setError(undefined);

    try {
      const result = await saveFn();

      if (!isMountedRef.current) return;

      if (result.success) {
        setStatus('saved');
        setLastSaved(new Date());
      } else {
        setStatus('error');
        setError(result.error);
      }
    } catch (err) {
      if (!isMountedRef.current) return;
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Auto-save failed');
    }
  }, [saveFn]);

  const trigger = useCallback(() => {
    if (!enabled) return;

    // Clear existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    // Set new debounced timeout
    timeoutRef.current = setTimeout(() => {
      executeSave();
    }, debounceMs);
  }, [enabled, debounceMs, executeSave]);

  const cancel = useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  return {
    status,
    error,
    lastSaved,
    trigger,
    cancel,
  };
}
