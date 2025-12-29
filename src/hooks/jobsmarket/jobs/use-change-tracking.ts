"use client";

import { useState, useMemo, useCallback } from "react";

export interface ChangeInfo {
  field: string;
  originalValue: unknown;
  currentValue: unknown;
}

export interface UseChangeTrackingReturn<T> {
  isDirty: boolean;
  changedFields: Set<string>;
  changes: ChangeInfo[];
  trackChange: (field: keyof T, value: unknown) => void;
  revertField: (field: keyof T) => void;
  reset: () => void;
  setOriginal: (data: T) => void;
}

/**
 * Generic hook for tracking changes to an object
 * Compares current values to original values
 *
 * @param originalData - Original data object to compare against
 * @returns Change tracking state and methods
 */
export function useChangeTracking<T extends Record<string, unknown>>(
  originalData: T
): UseChangeTrackingReturn<T> {
  const [original, setOriginal] = useState<T>(originalData);
  const [current, setCurrent] = useState<Record<string, unknown>>({});

  // Track which fields have been changed
  const changedFields = useMemo(() => {
    const changed = new Set<string>();
    Object.keys(current).forEach((field) => {
      const currentValue = current[field];
      const originalValue = original[field as keyof T];

      // Deep equality check (simple version - may need to enhance for nested objects)
      if (JSON.stringify(currentValue) !== JSON.stringify(originalValue)) {
        changed.add(field);
      }
    });
    return changed;
  }, [current, original]);

  // Check if any fields are dirty
  const isDirty = changedFields.size > 0;

  // Get list of changes with original and current values
  const changes = useMemo<ChangeInfo[]>(() => {
    return Array.from(changedFields).map((field) => ({
      field,
      originalValue: original[field as keyof T],
      currentValue: current[field],
    }));
  }, [changedFields, original, current]);

  // Track a field change
  const trackChange = useCallback(
    (field: keyof T, value: unknown) => {
      const fieldName = String(field);
      const originalValue = original[field];

      // If value matches original, remove from current (revert)
      if (JSON.stringify(value) === JSON.stringify(originalValue)) {
        setCurrent((prev) => {
          const newCurrent = { ...prev };
          delete newCurrent[fieldName];
          return newCurrent;
        });
      } else {
        // Value is different, track it
        setCurrent((prev) => ({
          ...prev,
          [fieldName]: value,
        }));
      }
    },
    [original]
  );

  // Revert a single field to original value
  const revertField = useCallback((field: keyof T) => {
    const fieldName = String(field);
    setCurrent((prev) => {
      const newCurrent = { ...prev };
      delete newCurrent[fieldName];
      return newCurrent;
    });
  }, []);

  // Reset all changes
  const reset = useCallback(() => {
    setCurrent({});
  }, []);

  // Update original data
  const setOriginalData = useCallback((data: T) => {
    setOriginal(data);
    setCurrent({}); // Reset current when original changes
  }, []);

  return {
    isDirty,
    changedFields,
    changes,
    trackChange,
    revertField,
    reset,
    setOriginal: setOriginalData,
  };
}
