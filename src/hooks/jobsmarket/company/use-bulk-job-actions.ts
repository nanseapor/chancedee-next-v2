"use client";

import {
  webJobBulkUnpublish,
  webJobBulkClose,
} from "@/lib/database/actions/jobs";

interface UseBulkJobActionsResult {
  handleBulkPause: (jobIds: Set<string>) => Promise<void>;
  handleBulkClose: (jobIds: Set<string>) => Promise<void>;
}

/**
 * Hook for bulk job actions
 */
export function useBulkJobActions(
  onSuccess?: () => void
): UseBulkJobActionsResult {
  const handleBulkPause = async (jobIds: Set<string>) => {
    const idsArray = Array.from(jobIds);
    const result = await webJobBulkUnpublish(idsArray);
    if (onSuccess) {
      onSuccess();
    }
  };

  const handleBulkClose = async (jobIds: Set<string>) => {
    const idsArray = Array.from(jobIds);
    const result = await webJobBulkClose(idsArray);
    if (onSuccess) {
      onSuccess();
    }
  };

  return {
    handleBulkPause,
    handleBulkClose,
  };
}
