"use client";

import { useState, useEffect, useCallback, startTransition } from "react";
import type { TeamMember } from "@/types/jobsmarket/company/team";
import type { CompanyRole } from "@/types/jobsmarket/company/roles";
import {
  getCompanyTeam,
  getPendingEmployees,
  type PendingEmployee,
} from "@/lib/database/actions/company-team";

export interface UseCompanyTeamOptions {
  /** Company ID to fetch team for */
  companyId: string;
  /** Current user ID to check admin status */
  currentUserId?: string;
}

export interface UseCompanyTeamReturn {
  /** List of team members */
  staff: TeamMember[];
  /** List of pending employee applications */
  pending: PendingEmployee[];
  /** Whether the current user is an admin */
  isAdmin: boolean;
  /** Current user's role */
  currentUserRole: CompanyRole | null;
  /** Loading state */
  isLoading: boolean;
  /** Error if fetch failed */
  error: Error | null;
  /** Refresh data */
  mutate: () => Promise<void>;
}

/**
 * Hook to fetch and manage company team data
 *
 * @example
 * ```tsx
 * const { staff, pending, isAdmin, isLoading, error, mutate } = useCompanyTeam({
 *   companyId: "company-123",
 *   currentUserId: "user-456",
 * });
 * ```
 */
export function useCompanyTeam(
  options: UseCompanyTeamOptions
): UseCompanyTeamReturn {
  const { companyId, currentUserId } = options;

  const [staff, setStaff] = useState<TeamMember[]>([]);
  const [pending, setPending] = useState<PendingEmployee[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchData = useCallback(async () => {
    if (!companyId) {
      startTransition(() => {
        setIsLoading(false);
      });
      return;
    }

    startTransition(() => {
      setIsLoading(true);
      setError(null);
    });

    try {
      // Fetch team and pending in parallel
      const [teamResult, pendingResult] = await Promise.allSettled([
        getCompanyTeam(companyId),
        getPendingEmployees(companyId),
      ]);

      startTransition(() => {
        // Handle team result
        if (teamResult.status === "fulfilled") {
          const result = teamResult.value;
          if (result.success && result.data) {
            setStaff(result.data);
          } else {
            setError(new Error(result.error || "Failed to fetch team"));
          }
        } else {
          setError(teamResult.reason as Error);
        }

        // Handle pending result
        if (pendingResult.status === "fulfilled") {
          const result = pendingResult.value;
          if (result.success && result.data) {
            setPending(result.data);
          }
          // Don't set error for pending - not critical
        }

        setIsLoading(false);
      });
    } catch (err) {
      startTransition(() => {
        setError(err instanceof Error ? err : new Error("Unknown error"));
        setIsLoading(false);
      });
    }
  }, [companyId]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  // Derive admin status from staff list
  const currentMember = currentUserId
    ? staff.find((m) => m.uid === currentUserId)
    : null;

  const isAdmin =
    currentMember?.role === "admin" || currentMember?.role === "hr_manager";

  const currentUserRole = currentMember?.role ?? null;

  return {
    staff,
    pending,
    isAdmin,
    currentUserRole,
    isLoading,
    error,
    mutate: fetchData,
  };
}
