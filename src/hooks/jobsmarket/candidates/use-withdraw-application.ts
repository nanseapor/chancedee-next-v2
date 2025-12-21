'use client';

import { useState, useCallback } from 'react';
import { useSWRConfig } from 'swr';
import { webJobApplicationWithdraw } from '@/lib/database/actions/job-applications';
import { getApplicationsKey } from './use-applications';
import type { ApplicationWithDetails } from '@/lib/database/actions/job-applications';
import { useToast } from '@/hooks/use-toast-notification';

interface UseWithdrawApplicationOptions {
  /** Candidate ID for cache invalidation */
  candidateId: string;
  /** Callback on successful withdrawal */
  onSuccess?: () => void;
  /** Callback on error */
  onError?: (error: Error) => void;
}

interface UseWithdrawApplicationReturn {
  /** Function to withdraw an application */
  withdraw: (applicationId: string) => Promise<void>;
  /** True while withdrawal is in progress */
  isWithdrawing: boolean;
  /** The application ID currently being withdrawn */
  withdrawingId: string | null;
  /** Error from last withdrawal attempt */
  error: Error | null;
  /** Clear the error state */
  clearError: () => void;
}

/**
 * Hook to withdraw a job application with optimistic update
 *
 * Features:
 * - Optimistic UI update (immediately updates status)
 * - Automatic rollback on error
 * - Toast notifications for success/error
 * - Loading state per application
 *
 * @param options - Configuration options
 * @returns Withdraw function and state
 *
 * Usage:
 * ```tsx
 * const { withdraw, isWithdrawing, withdrawingId } = useWithdrawApplication({
 *   candidateId: user.uid,
 *   onSuccess: () => setModalOpen(false),
 * });
 *
 * // In withdraw modal
 * <Button
 *   onClick={() => withdraw(applicationId)}
 *   disabled={isWithdrawing}
 * >
 *   {withdrawingId === applicationId ? 'กำลังถอน...' : 'ยืนยันถอนใบสมัคร'}
 * </Button>
 * ```
 */
export function useWithdrawApplication({
  candidateId,
  onSuccess,
  onError,
}: UseWithdrawApplicationOptions): UseWithdrawApplicationReturn {
  const { mutate } = useSWRConfig();
  const { addToast } = useToast();

  const [isWithdrawing, setIsWithdrawing] = useState(false);
  const [withdrawingId, setWithdrawingId] = useState<string | null>(null);
  const [error, setError] = useState<Error | null>(null);

  const swrKey = getApplicationsKey(candidateId);

  const withdraw = useCallback(async (applicationId: string) => {
    if (!candidateId || !applicationId) {
      console.error('Missing candidateId or applicationId');
      return;
    }

    setIsWithdrawing(true);
    setWithdrawingId(applicationId);
    setError(null);

    // Store previous data for rollback
    let previousData: ApplicationWithDetails[] | undefined;

    try {
      // 1. Optimistic update - update status to 'withdraw'
      await mutate<ApplicationWithDetails[]>(
        swrKey,
        (currentData) => {
          previousData = currentData;
          if (!currentData) return currentData;

          // Update status to 'withdraw' optimistically
          return currentData.map(app =>
            app.uid === applicationId
              ? { ...app, status: 'withdraw' }
              : app
          );
        },
        { revalidate: false }
      );

      // 2. Server action
      await webJobApplicationWithdraw(applicationId, candidateId);

      // 3. Revalidate to get fresh data
      await mutate(swrKey);

      // 4. Success toast
      addToast('ใบสมัครของคุณถูกถอนเรียบร้อยแล้ว', 'success');

      // 5. Callback
      onSuccess?.();

    } catch (err) {
      const error = err instanceof Error ? err : new Error('Failed to withdraw application');
      setError(error);

      // 6. Rollback on error
      if (previousData) {
        await mutate(swrKey, previousData, { revalidate: false });
      }

      // 7. Error toast
      addToast(error.message || 'กรุณาลองใหม่อีกครั้ง', 'error');

      // 8. Callback
      onError?.(error);

    } finally {
      setIsWithdrawing(false);
      setWithdrawingId(null);
    }
  }, [candidateId, swrKey, mutate, addToast, onSuccess, onError]);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  return {
    withdraw,
    isWithdrawing,
    withdrawingId,
    error,
    clearError,
  };
}
