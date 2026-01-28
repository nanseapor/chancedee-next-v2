/**
 * COMP-R00: Company Access Control Hook
 *
 * 5-level access control state machine for company routes
 * Per COMP-R00 implementation plan Phase 2
 */

"use client";

import { useEffect, useState, useCallback, useMemo } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import useSWR from "swr";

// Import atoms
import { userAtom } from "@/store/atom-store";

// Import types
import type {
  AccessCheckState,
  AccessCheckResult,
  UseCompanyAuthOptions,
  UseCompanyAuthReturn,
  CompanyRole,
  Permission,
  CompanyStatus,
} from "@/types/jobsmarket/company";

import {
  ROLE_TO_PERMISSION_LEVEL,
  hasPermission as checkPermission,
  ACCESS_DENIED_STATES,
  MINIMAL_SHELL_STATES,
} from "@/types/jobsmarket/company";

// Import fetchers and keys
import {
  fetchCompanyProfile,
  fetchUserMembership,
} from "@/lib/jobsmarket/company/fetchers";
import { companySwrKeys } from "@/lib/jobsmarket/company/swr-keys";

/**
 * Determine redirect path based on access state
 */
function getRedirectPath(
  state: AccessCheckState,
  companyId: string
): string | undefined {
  switch (state) {
    case "unauthorized":
      return "/jobsmarket/auth/login";
    case "not_member":
      return "/jobsmarket/auth/select-role";
    case "pending_approval":
      return `/jobsmarket/companies/pending`;
    case "rejected":
      return `/jobsmarket/companies/pending`; // Same page shows rejection message
    case "suspended":
      return `/jobsmarket/companies/${companyId}/suspended`;
    case "insufficient_permission":
      return `/jobsmarket/companies/${companyId}/dashboard`;
    default:
      return undefined;
  }
}

/**
 * 5-level access control hook for company routes
 *
 * Levels:
 * 1. Firebase Auth - Is user logged in?
 * 2. Company Membership - Is user a member of this company?
 * 3. Company Status - Is company approved/active?
 * 4. Role Resolution - What role does user have?
 * 5. Permission Check - Does role have required permission?
 *
 * @param options - Configuration options
 * @returns Access check result and utilities
 *
 * Usage:
 * ```tsx
 * const { isReady, isLoading, role, hasPermission } = useCompanyAuth({
 *   companyId: params.id,
 *   requiredPermission: 'post_jobs', // Optional
 * });
 *
 * if (isLoading) return <Skeleton />;
 * if (!isReady) return null; // Hook handles redirect
 *
 * // Render protected content
 * ```
 */
export function useCompanyAuth(
  options: UseCompanyAuthOptions
): UseCompanyAuthReturn {
  const { companyId, requiredPermission, skipRedirect = false } = options;

  const router = useRouter();
  const user = useAtomValue(userAtom);

  // Track current state in the state machine
  const [checkState, setCheckState] = useState<AccessCheckState>("loading");
  const [isRedirecting, setIsRedirecting] = useState(false);

  // Fetch company profile
  const { data: companyProfile, isLoading: isLoadingProfile } = useSWR(
    companySwrKeys.profile(companyId),
    () => fetchCompanyProfile(companyId),
    { revalidateOnFocus: false }
  );

  // Fetch user membership
  const { data: membership, isLoading: isLoadingMembership } = useSWR(
    user?.uid ? companySwrKeys.membership(user.uid, companyId) : null,
    () => fetchUserMembership(user!.uid, companyId),
    { revalidateOnFocus: false }
  );

  // Derived state
  const role = membership?.role as CompanyRole | null;
  const companyStatus = companyProfile?.status as CompanyStatus | null;
  const permissionLevel = role ? ROLE_TO_PERMISSION_LEVEL[role] : null;

  // State machine logic
  useEffect(() => {
    const runAccessChecks = async () => {
      // Level 1: Auth check
      if (user === undefined) {
        setCheckState("loading");
        return;
      }

      if (user === null) {
        setCheckState("unauthorized");
        return;
      }

      setCheckState("auth_check");

      // Level 2: Membership check
      if (isLoadingMembership) {
        setCheckState("membership_check");
        return;
      }

      if (!membership?.isMember) {
        setCheckState("not_member");
        return;
      }

      // Level 3: Company status check
      if (isLoadingProfile) {
        setCheckState("status_check");
        return;
      }

      if (!companyProfile) {
        setCheckState("not_member"); // Company doesn't exist
        return;
      }

      switch (companyProfile.status) {
        case "pending":
          setCheckState("pending_approval");
          return;
        case "rejected":
          setCheckState("rejected");
          return;
        case "suspended":
          setCheckState("suspended");
          return;
        case "approved":
          // Continue to role check
          break;
        default:
          setCheckState("pending_approval");
          return;
      }

      // Level 4: Role check
      if (!role) {
        setCheckState("not_member");
        return;
      }

      setCheckState("role_check");

      // Level 5: Permission check (if required)
      if (requiredPermission) {
        const hasRequiredPermission = checkPermission(role, requiredPermission);

        if (!hasRequiredPermission) {
          setCheckState("insufficient_permission");
          return;
        }
      }

      // All checks passed!
      setCheckState("ready");
    };

    runAccessChecks();
  }, [
    user,
    membership,
    companyProfile,
    role,
    requiredPermission,
    isLoadingMembership,
    isLoadingProfile,
  ]);

  // Handle redirects
  useEffect(() => {
    const handleRedirect = async () => {
      if (skipRedirect || isRedirecting) return;

      if (ACCESS_DENIED_STATES.includes(checkState)) {
        const redirectTo = getRedirectPath(checkState, companyId);

        if (redirectTo) {
          setIsRedirecting(true);
          router.replace(redirectTo);
        }
      }
    };

    handleRedirect();
  }, [checkState, companyId, router, skipRedirect, isRedirecting]);

  // Build access result
  const access: AccessCheckResult = useMemo(() => {
    const isLoading =
      checkState === "loading" ||
      checkState === "auth_check" ||
      checkState === "membership_check" ||
      checkState === "status_check" ||
      checkState === "role_check" ||
      checkState === "permission_check";

    const isGranted = checkState === "ready";
    const useMinimalShell = MINIMAL_SHELL_STATES.includes(checkState);
    const redirectTo = getRedirectPath(checkState, companyId);

    return {
      state: checkState,
      isGranted,
      isLoading,
      useMinimalShell,
      redirectTo,
      role: role ?? undefined,
      permissionLevel: permissionLevel ?? undefined,
      companyStatus: companyStatus ?? undefined,
    };
  }, [checkState, companyId, role, permissionLevel, companyStatus]);

  // Permission check helper
  const hasPermissionFn = useCallback(
    (permission: Permission): boolean => {
      if (!role) return false;
      return checkPermission(role, permission);
    },
    [role]
  );

  return {
    access,
    role,
    permissionLevel,
    companyStatus,
    hasPermission: hasPermissionFn,
    isLoading: access.isLoading || isRedirecting,
    isReady: access.isGranted && !isRedirecting,
  };
}

export type { UseCompanyAuthOptions, UseCompanyAuthReturn };
