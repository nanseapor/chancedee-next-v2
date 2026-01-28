'use client';

import { useCallback, useState } from 'react';
import { useAtomValue } from 'jotai';
import { sessionStateAtom } from '@/store/jobsmarket/global-atoms';
import { userAtom } from '@/store/atom-store';
import { saveJob, unsaveJob } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';
import { toast } from 'sonner';

export interface UseSaveJobMutationOptions {
  onAuthRequired?: () => void;
}

export interface UseSaveJobMutationReturn {
  savedJobIds: Set<string>;
  isSaving: boolean;
  toggleSave: (jobId: string) => Promise<void>;
  isJobSaved: (jobId: string) => boolean;
}

/**
 * Hook for managing save/unsave job mutations with optimistic updates
 *
 * Features:
 * - Optimistic UI updates
 * - Automatic rollback on error
 * - Authentication check
 * - Toast notifications
 *
 * @param initialSavedIds - Array of initially saved job IDs
 * @param options - Configuration options
 * @returns Save mutation state and handlers
 */
export function useSaveJobMutation(
  initialSavedIds: string[] = [],
  options?: UseSaveJobMutationOptions
): UseSaveJobMutationReturn {
  const sessionState = useAtomValue(sessionStateAtom);
  const user = useAtomValue(userAtom);
  const isAuthenticated = sessionState === 'authenticated' && user;

  const [savedJobIds, setSavedJobIds] = useState<Set<string>>(
    new Set(initialSavedIds)
  );
  const [isSaving, setIsSaving] = useState(false);

  const toggleSave = useCallback(
    async (jobId: string) => {
      // Check authentication first
      if (!isAuthenticated) {
        options?.onAuthRequired?.();
        return;
      }

      const candidateId = user?.uid;
      if (!candidateId) return;

      const currentlySaved = savedJobIds.has(jobId);

      // Optimistic update
      setSavedJobIds((prev) => {
        const next = new Set(prev);
        if (currentlySaved) {
          next.delete(jobId);
        } else {
          next.add(jobId);
        }
        return next;
      });

      setIsSaving(true);

      try {
        if (currentlySaved) {
          const result = await unsaveJob({ candidateId, jobId });
          if (result.success) {
            toast.success('ยกเลิกบันทึกแล้ว');
          } else {
            throw new Error(result.error);
          }
        } else {
          const result = await saveJob({ candidateId, jobId });
          if (result.success) {
            toast.success('บันทึกงานแล้ว');
          } else {
            throw new Error(result.error);
          }
        }
      } catch (error) {
        // Rollback on error
        setSavedJobIds((prev) => {
          const next = new Set(prev);
          if (currentlySaved) {
            next.add(jobId); // Restore
          } else {
            next.delete(jobId); // Remove
          }
          return next;
        });

        toast.error('เกิดข้อผิดพลาด กรุณาลองใหม่');
        console.error('Save job error:', error);
      } finally {
        setIsSaving(false);
      }
    },
    [isAuthenticated, user, savedJobIds, options]
  );

  const isJobSaved = useCallback(
    (jobId: string) => {
      return savedJobIds.has(jobId);
    },
    [savedJobIds]
  );

  return {
    savedJobIds,
    isSaving,
    toggleSave,
    isJobSaved,
  };
}
