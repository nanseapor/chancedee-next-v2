import { useState, useRef, useCallback, useEffect } from "react";

/**
 * Auto-save hook with debouncing
 * Manages auto-save state and debounced save operations
 *
 * @param onSave - Async function to call when saving (receives field name and value)
 * @param debounceMs - Debounce delay in milliseconds (default: 1000)
 */
export function useAutoSave(
  onSave: (fieldName: string, value: any) => Promise<void>,
  debounceMs: number = 1000
) {
  const [isDirty, setIsDirty] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [lastSaved, setLastSaved] = useState<Date | null>(null);
  const [error, setError] = useState<string | null>(null);

  const timeoutRef = useRef<NodeJS.Timeout | undefined>(undefined);
  const pendingFieldRef = useRef<{ name: string; value: any } | null>(null);
  const savePromiseRef = useRef<Promise<void> | null>(null);

  /**
   * Execute the save operation
   */
  const executeSave = useCallback(
    async (name: string, value: any) => {
      setIsSaving(true);

      try {
        await onSave(name, value);
        setLastSaved(new Date());
        setIsDirty(false);
        setError(null);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Save failed";
        setError(errorMessage);
        // Keep dirty state on error
      } finally {
        setIsSaving(false);
        pendingFieldRef.current = null;
      }
    },
    [onSave]
  );

  /**
   * Mark field as dirty and schedule auto-save
   */
  const markDirty = useCallback(
    (fieldName: string, value: any) => {
      setIsDirty(true);
      setError(null);

      // Store pending field
      pendingFieldRef.current = { name: fieldName, value };

      // Clear previous timeout
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      // Schedule save
      timeoutRef.current = setTimeout(() => {
        if (!pendingFieldRef.current) return;

        const { name, value: pendingValue } = pendingFieldRef.current;

        // Execute save and store promise reference
        savePromiseRef.current = executeSave(name, pendingValue);
      }, debounceMs);
    },
    [executeSave, debounceMs]
  );

  // Cleanup timeout on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  /**
   * Save immediately without debounce
   */
  const saveNow = useCallback(async () => {
    // Cancel pending debounced save
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = undefined;
    }

    if (!pendingFieldRef.current) return;

    const { name, value } = pendingFieldRef.current;

    await executeSave(name, value);
  }, [executeSave]);

  return {
    isDirty,
    isSaving,
    lastSaved,
    error,
    markDirty,
    saveNow,
  };
}
