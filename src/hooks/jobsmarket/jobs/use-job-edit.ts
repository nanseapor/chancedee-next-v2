"use client";

import { useState, useMemo, useCallback } from "react";
import { webJobUpdate } from "@/lib/database/actions/jobs";
import { useChangeTracking, type ChangeInfo } from "./use-change-tracking";
import type { FirebaseJobData } from "@/types/job.types";

type EditState = "clean" | "dirty" | "saving" | "error";

interface ValidationError {
  field: string;
  message: string;
}

interface UseJobEditReturn {
  formData: Partial<FirebaseJobData>;
  editState: EditState;
  isDirty: boolean;
  changedFields: Set<string>;
  changes: ChangeInfo[];
  validationErrors: ValidationError[];
  isValid: boolean;
  setField: (field: keyof FirebaseJobData, value: unknown) => void;
  save: () => Promise<{ success: boolean; error?: string }>;
  cancel: () => void;
  reset: () => void;
}

/**
 * Hook for managing job edit form state
 * Integrates change tracking, validation, and save functionality
 *
 * @param job - Original job data
 * @returns Form state and methods
 */
export function useJobEdit(job: FirebaseJobData): UseJobEditReturn {
  const [formData, setFormData] = useState<Partial<FirebaseJobData>>(job);
  const [editState, setEditState] = useState<EditState>("clean");
  const [validationErrors, setValidationErrors] = useState<ValidationError[]>([]);

  // Use change tracking to detect modifications
  const changeTracking = useChangeTracking(job as unknown as Record<string, unknown>);

  // Update form data and track changes with realtime validation
  const setField = useCallback(
    (field: keyof FirebaseJobData, value: unknown) => {
      setFormData((prev) => {
        const newData = { ...prev, [field]: value };

        // Realtime validation - check errors after field update
        const errors: ValidationError[] = [];

        // Required: title
        if (!newData.title || (newData.title as string).trim() === "") {
          errors.push({ field: "title", message: "Title is required" });
        }

        // Required: positions >= 1
        if (newData.positions !== undefined && (newData.positions as number) < 1) {
          errors.push({ field: "positions", message: "Positions must be at least 1" });
        }

        // Update validation errors for realtime feedback
        setValidationErrors(errors);

        return newData;
      });

      changeTracking.trackChange(field, value);
      setEditState("dirty");
    },
    [changeTracking]
  );

  // Validate form data
  const validate = useCallback((): boolean => {
    const errors: ValidationError[] = [];

    // Required field validation
    if (!formData.title || formData.title.trim() === "") {
      errors.push({ field: "title", message: "Title is required" });
    }

    // Positions validation
    if (formData.positions !== undefined && formData.positions < 1) {
      errors.push({ field: "positions", message: "Positions must be at least 1" });
    }

    // Add more validation rules as needed based on job-form-validation.ts

    setValidationErrors(errors);
    return errors.length === 0;
  }, [formData]);

  const isValid = useMemo(() => {
    return validationErrors.length === 0;
  }, [validationErrors]);

  // Save changes
  const save = useCallback(async (): Promise<{ success: boolean; error?: string }> => {
    // Validate before saving
    if (!validate()) {
      return { success: false, error: "Validation failed" };
    }

    if (!job.uid) {
      return { success: false, error: "Job ID is required" };
    }

    setEditState("saving");

    try {
      await webJobUpdate(formData as FirebaseJobData, job.updatedBy || "system", job.uid);

      // Update change tracking original data
      changeTracking.setOriginal(formData as unknown as Record<string, unknown>);
      setEditState("clean");

      return { success: true };
    } catch (error) {
      setEditState("error");
      const errorMessage = error instanceof Error ? error.message : "Save failed";
      return { success: false, error: errorMessage };
    }
  }, [formData, validate, job, changeTracking]);

  // Cancel changes
  const cancel = useCallback(() => {
    setFormData(job);
    changeTracking.reset();
    setEditState("clean");
    setValidationErrors([]);
  }, [job, changeTracking]);

  // Reset to original
  const reset = useCallback(() => {
    cancel();
  }, [cancel]);

  return {
    formData,
    editState,
    isDirty: changeTracking.isDirty,
    changedFields: changeTracking.changedFields,
    changes: changeTracking.changes,
    validationErrors,
    isValid,
    setField,
    save,
    cancel,
    reset,
  };
}
