"use client";

import { useState, useCallback } from "react";
import { useRouter } from "next/navigation";

import {
  confirmInterview,
  declineInterview,
  cancelInterview,
  rescheduleInterview,
  scheduleInterview,
} from "@/lib/database/actions/interview-management";

export type InterviewActionType =
  | "confirm"
  | "decline"
  | "cancel"
  | "reschedule"
  | "scheduleNew";

interface ScheduleData {
  applicationId: string;
  date: string;
  from: string;
  to: string;
  channel: "online" | "onsite";
  location?: string;
  meetingLink?: string;
  note?: string;
}

interface UseInterviewActionsOptions {
  interviewId?: string;
  applicationId?: string;
  onSuccess?: (action: InterviewActionType, extra?: { rewardAwarded?: boolean }) => void;
  onError?: (action: InterviewActionType, error: Error) => void;
}

interface UseInterviewActionsReturn {
  isLoading: boolean;
  loadingAction: InterviewActionType | null;
  error: Error | null;
  handleConfirm: () => Promise<void>;
  handleDecline: (reason?: string) => Promise<void>;
  handleCancel: (reason?: string) => Promise<void>;
  handleReschedule: (data: RescheduleData) => Promise<void>;
  handleScheduleNew: (data: ScheduleData) => Promise<void>;
  clearError: () => void;
}

interface RescheduleData {
  date: string;
  from: string;
  to: string;
  channel?: "online" | "onsite";
  location?: string;
  room?: string;
}

export function useInterviewActions(
  options: UseInterviewActionsOptions = {}
): UseInterviewActionsReturn {
  const { interviewId, onSuccess, onError } = options;
  const router = useRouter();

  const [isLoading, setIsLoading] = useState(false);
  const [loadingAction, setLoadingAction] = useState<InterviewActionType | null>(
    null
  );
  const [error, setError] = useState<Error | null>(null);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (!interviewId) return;

    setIsLoading(true);
    setLoadingAction("confirm");
    setError(null);

    try {
      const result = await confirmInterview({ interviewId });
      onSuccess?.("confirm", { rewardAwarded: result.rewardAwarded });
      router.refresh();
    } catch (err) {
      const error = err instanceof Error ? err : new Error("Unknown error");
      setError(error);
      onError?.("confirm", error);
    } finally {
      setIsLoading(false);
      setLoadingAction(null);
    }
  }, [interviewId, onSuccess, onError, router]);

  const handleDecline = useCallback(
    async (reason?: string) => {
      if (!interviewId) return;

      setIsLoading(true);
      setLoadingAction("decline");
      setError(null);

      try {
        await declineInterview({ interviewId, reason });
        onSuccess?.("decline");
        router.refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.("decline", error);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [interviewId, onSuccess, onError, router]
  );

  const handleCancel = useCallback(
    async (reason?: string) => {
      if (!interviewId) return;

      setIsLoading(true);
      setLoadingAction("cancel");
      setError(null);

      try {
        await cancelInterview({ interviewId, reason });
        onSuccess?.("cancel");
        router.refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.("cancel", error);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [interviewId, onSuccess, onError, router]
  );

  const handleReschedule = useCallback(
    async (data: RescheduleData) => {
      if (!interviewId) return;

      setIsLoading(true);
      setLoadingAction("reschedule");
      setError(null);

      try {
        await rescheduleInterview({
          interviewId,
          ...data,
        });
        onSuccess?.("reschedule");
        router.refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.("reschedule", error);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [interviewId, onSuccess, onError, router]
  );

  const handleScheduleNew = useCallback(
    async (data: ScheduleData) => {
      setIsLoading(true);
      setLoadingAction("scheduleNew");
      setError(null);

      try {
        await scheduleInterview(data);
        onSuccess?.("scheduleNew");
        router.refresh();
      } catch (err) {
        const error = err instanceof Error ? err : new Error("Unknown error");
        setError(error);
        onError?.("scheduleNew", error);
      } finally {
        setIsLoading(false);
        setLoadingAction(null);
      }
    },
    [onSuccess, onError, router]
  );

  return {
    isLoading,
    loadingAction,
    error,
    handleConfirm,
    handleDecline,
    handleCancel,
    handleReschedule,
    handleScheduleNew,
    clearError,
  };
}
