"use client";

import { useRouter } from "next/navigation";
import {
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobDelete,
  webJobDuplicate,
} from "@/lib/database/actions/jobs";

interface UseJobActionsResult {
  handlePublish: (jobId: string) => Promise<void>;
  handleUnpublish: (jobId: string) => Promise<void>;
  handleClose: (jobId: string) => Promise<void>;
  handleDelete: (jobId: string) => Promise<void>;
  handleDuplicate: (jobId: string) => Promise<void>;
}

/**
 * Hook for individual job actions
 */
export function useJobActions(
  onSuccess?: () => void
): UseJobActionsResult {
  const router = useRouter();

  const handlePublish = async (jobId: string) => {
    const result = await webJobPublish(jobId);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleUnpublish = async (jobId: string) => {
    const result = await webJobUnpublish(jobId);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleClose = async (jobId: string) => {
    const result = await webJobClose(jobId);
    if (result.success && onSuccess) {
      onSuccess();
    }
  };

  const handleDelete = async (jobId: string) => {
    await webJobDelete(jobId);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleDuplicate = async (jobId: string) => {
    const result = await webJobDuplicate(jobId);
    if (result.success) {
      if (onSuccess) {
        onSuccess();
      }
      // Navigate to edit page for duplicated job
      if (result.data?.uid) {
        router.push(`/jobsmarket/jobs/${result.data.uid}/edit`);
      }
    }
  };

  return {
    handlePublish,
    handleUnpublish,
    handleClose,
    handleDelete,
    handleDuplicate,
  };
}
