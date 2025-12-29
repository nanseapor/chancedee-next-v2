import { useState, useCallback } from "react";
import { webJobPublish, webJobUpdate } from "@/lib/database/actions/jobs";

/**
 * Job publish management hook
 * Handles publishing job, scheduling for future, or saving as draft
 *
 * @param jobId - Job ID to publish
 * @param options - Optional callbacks
 */
export function useJobPublish(
  jobId: string,
  options?: {
    onSuccess?: () => void;
  }
) {
  const [isPublishing, setIsPublishing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Publish job immediately
   */
  const publishNow = useCallback(async () => {
    setIsPublishing(true);
    setError(null);

    try {
      const result = await webJobPublish(jobId);

      if (!result.success) {
        setError(result.error || "Publish failed");
        return;
      }

      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Publish failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsPublishing(false);
    }
  }, [jobId, options]);

  /**
   * Schedule job for future publication
   */
  const schedulePublish = useCallback(
    async (scheduledDate: Date) => {
      // Validate future date
      if (scheduledDate <= new Date()) {
        throw new Error("วันที่ต้องเป็นอนาคต");
      }

      setIsPublishing(true);
      setError(null);

      try {
        const startTimestamp = scheduledDate.getTime();
        // Expiry is 30 days from start
        const expiryTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;

        const updatedJob = {
          jobStatus: "ontimer",
          postStartDate: startTimestamp,
          postExpiryDate: expiryTimestamp,
        };

        await webJobUpdate(updatedJob as any, "system", jobId);

        if (options?.onSuccess) {
          options.onSuccess();
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Schedule failed";
        setError(errorMessage);
        throw err;
      } finally {
        setIsPublishing(false);
      }
    },
    [jobId, options]
  );

  /**
   * Save job as draft
   */
  const saveAsDraft = useCallback(async () => {
    setIsPublishing(true);
    setError(null);

    try {
      await webJobUpdate({ jobStatus: "draft" } as any, "system", jobId);

      if (options?.onSuccess) {
        options.onSuccess();
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Save failed";
      setError(errorMessage);
      throw err;
    } finally {
      setIsPublishing(false);
    }
  }, [jobId, options]);

  return {
    isPublishing,
    error,
    publishNow,
    schedulePublish,
    saveAsDraft,
  };
}
