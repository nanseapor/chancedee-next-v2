"use client";

import { useState, useMemo, useCallback } from "react";
import {
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobDelete,
  webJobDuplicate,
} from "@/lib/database/actions/jobs";
import { STATUS_ACTIONS, canDeleteJob } from "@/types/jobsmarket/job-detail.types";
import type { JobWithAnalytics, ActionResult } from "@/types/jobsmarket/job-detail.types";

export interface UseJobActionsDetailOptions {
  onSuccess?: (action: string, result?: unknown) => void;
  onError?: (action: string, error: string) => void;
}

export interface UseJobActionsDetailReturn {
  availableActions: string[];
  isProcessing: boolean;
  currentAction: string | null;
  canDelete: boolean;
  publish: () => Promise<ActionResult>;
  unpublish: () => Promise<ActionResult>;
  close: () => Promise<ActionResult>;
  deleteJob: () => Promise<ActionResult>;
  duplicate: () => Promise<{ success: boolean; data?: { uid: string }; error?: string }>;
}

/**
 * Enhanced hook for job detail page actions
 * Provides action availability, processing state, and callbacks
 *
 * @param job - Job data with analytics
 * @param options - Optional callbacks for success/error
 * @returns Action methods and state
 */
export function useJobActionsDetail(
  job: JobWithAnalytics,
  options?: UseJobActionsDetailOptions
): UseJobActionsDetailReturn {
  const [isProcessing, setIsProcessing] = useState(false);
  const [currentAction, setCurrentAction] = useState<string | null>(null);

  // Determine available actions based on job status
  const availableActions = useMemo(() => {
    return STATUS_ACTIONS[job.jobStatus] || [];
  }, [job.jobStatus]);

  // Check if job can be deleted
  const canDelete = useMemo(() => {
    return canDeleteJob(job.jobStatus, job.applicationCount);
  }, [job.jobStatus, job.applicationCount]);

  // Helper to wrap action with processing state and callbacks
  const wrapAction = useCallback(
    async <T,>(
      actionName: string,
      actionFn: () => Promise<T>
    ): Promise<T> => {
      setIsProcessing(true);
      setCurrentAction(actionName);

      try {
        const result = await actionFn();

        // Check if result has success property
        if (typeof result === "object" && result !== null && "success" in result) {
          const actionResult = result as ActionResult;
          if (actionResult.success) {
            options?.onSuccess?.(actionName, result);
          } else {
            options?.onError?.(actionName, actionResult.error || "Action failed");
          }
        } else {
          options?.onSuccess?.(actionName, result);
        }

        return result;
      } catch (error) {
        const errorMessage = error instanceof Error ? error.message : "Action failed";
        options?.onError?.(actionName, errorMessage);
        throw error;
      } finally {
        setIsProcessing(false);
        setCurrentAction(null);
      }
    },
    [options]
  );

  // Publish action
  const publish = useCallback(async (): Promise<ActionResult> => {
    if (!job.uid) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }
    return wrapAction("publish", () => webJobPublish(job.uid!));
  }, [job.uid, wrapAction]);

  // Unpublish action
  const unpublish = useCallback(async (): Promise<ActionResult> => {
    if (!job.uid) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }
    return wrapAction("unpublish", () => webJobUnpublish(job.uid!));
  }, [job.uid, wrapAction]);

  // Close action
  const close = useCallback(async (): Promise<ActionResult> => {
    if (!job.uid) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }
    return wrapAction("close", () => webJobClose(job.uid!));
  }, [job.uid, wrapAction]);

  // Delete action
  const deleteJob = useCallback(async (): Promise<ActionResult> => {
    if (!job.uid) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }

    if (!canDelete) {
      return {
        success: false,
        error: "Cannot delete job with applications",
      };
    }

    return wrapAction("delete", async () => {
      await webJobDelete(job.uid!);
      return { success: true };
    });
  }, [job.uid, canDelete, wrapAction]);

  // Duplicate action
  const duplicate = useCallback(async () => {
    if (!job.uid) {
      return {
        success: false,
        error: "Job ID is required",
      };
    }
    return wrapAction("duplicate", () => webJobDuplicate(job.uid!));
  }, [job.uid, wrapAction]);

  return {
    availableActions,
    isProcessing,
    currentAction,
    canDelete,
    publish,
    unpublish,
    close,
    deleteJob,
    duplicate,
  };
}
