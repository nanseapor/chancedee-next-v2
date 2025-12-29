import { useState, useEffect, useCallback } from "react";
import {
  webJobCreate,
  webJobUpdate,
  webJobGetById,
} from "@/lib/database/actions/jobs";
import type { JobFormData } from "@/types/jobsmarket/job-wizard.types";

/**
 * Job draft management hook
 * Handles creating, updating, and loading job drafts
 *
 * @param userId - User ID for job operations
 * @param initialDraftId - Optional draft ID to load on mount
 */
export function useJobDraft(userId: string, initialDraftId?: string) {
  const [draft, setDraft] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [draftId, setDraftId] = useState<string | undefined>(initialDraftId);

  /**
   * Load draft by ID
   */
  const loadDraft = useCallback(async (id: string) => {
    setIsLoading(true);
    setError(null);

    try {
      const draftData = await webJobGetById(id);
      setDraft(draftData);
      setDraftId(id);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Load failed";
      setError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Create new draft
   */
  const createDraft = useCallback(
    async (formData: Partial<JobFormData>): Promise<string> => {
      setIsSaving(true);
      setError(null);

      try {
        // Ensure jobStatus is set to draft
        const draftData = {
          ...formData,
          jobStatus: "draft",
        };

        const newDraftId = await webJobCreate(draftData as any, userId);
        setDraftId(newDraftId);
        return newDraftId;
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Create failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId]
  );

  /**
   * Update existing draft
   */
  const updateDraft = useCallback(
    async (updates: Partial<JobFormData>) => {
      if (!draftId) {
        throw new Error("Cannot update draft without draftId");
      }

      setIsSaving(true);
      setError(null);

      try {
        await webJobUpdate(updates as any, userId, draftId);
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Update failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsSaving(false);
      }
    },
    [userId, draftId]
  );

  /**
   * Load draft on mount if initialDraftId is provided
   */
  useEffect(() => {
    if (initialDraftId) {
      loadDraft(initialDraftId);
    }
  }, [initialDraftId, loadDraft]);

  return {
    draft,
    isLoading,
    isSaving,
    error,
    draftId,
    createDraft,
    updateDraft,
    loadDraft,
  };
}
