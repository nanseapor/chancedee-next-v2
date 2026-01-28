"use client";

import { useState, useCallback } from "react";

import {
  approveCompany,
  rejectCompany,
  suspendCompany,
  reactivateCompany,
} from "@/lib/database/actions/admin-company-actions";

/**
 * Hook for company action mutations
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Provides methods to approve, reject, suspend, and reactivate companies
 * with loading states and success/error callbacks.
 */

export interface UseCompanyActionsOptions {
  onSuccess?: () => void;
  onError?: (error: string) => void;
}

export interface UseCompanyActionsResult {
  approve: (companyId: string) => Promise<void>;
  reject: (companyId: string, reason: string) => Promise<void>;
  suspend: (companyId: string, reason: string, duration?: number) => Promise<void>;
  reactivate: (companyId: string, note?: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
}

export function useCompanyActions(
  options: UseCompanyActionsOptions = {}
): UseCompanyActionsResult {
  const { onSuccess, onError } = options;

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const approve = useCallback(
    async (companyId: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await approveCompany(companyId);

        if (result.success) {
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Failed to approve company";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to approve company";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reject = useCallback(
    async (companyId: string, reason: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await rejectCompany(companyId, reason);

        if (result.success) {
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Failed to reject company";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reject company";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const suspend = useCallback(
    async (companyId: string, reason: string, duration?: number) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await suspendCompany(companyId, reason, duration);

        if (result.success) {
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Failed to suspend company";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to suspend company";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  const reactivate = useCallback(
    async (companyId: string, note?: string) => {
      setIsLoading(true);
      setError(null);

      try {
        const result = await reactivateCompany(companyId, note);

        if (result.success) {
          onSuccess?.();
        } else {
          const errorMessage = result.error || "Failed to reactivate company";
          setError(errorMessage);
          onError?.(errorMessage);
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : "Failed to reactivate company";
        setError(errorMessage);
        onError?.(errorMessage);
      } finally {
        setIsLoading(false);
      }
    },
    [onSuccess, onError]
  );

  return {
    approve,
    reject,
    suspend,
    reactivate,
    isLoading,
    error,
  };
}
