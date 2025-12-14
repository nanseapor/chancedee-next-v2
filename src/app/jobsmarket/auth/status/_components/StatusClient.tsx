"use client";

import { useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { webUserDataPropsGetById } from "@/lib/database/actions/user-data-props";
import {
  detectStatusType,
  validateStatusType,
  getTargetCompanyId,
  type StatusType,
} from "../_lib/status-detection";
import { DeletedStatusView } from "./DeletedStatusView";
import { StaffPendingView } from "./StaffPendingView";
import { CompanyPendingView } from "./CompanyPendingView";
import { RejectedView } from "./RejectedView";

/**
 * StatusClient - Main client component for status page
 * Per AUTH-R05 RIS §4-8
 *
 * Flow:
 * 1. Get Firebase user from useFirebaseAuth
 * 2. Fetch user data from Firestore using Server Action
 * 3. Detect status type from user data (priority: deleted > company-pending > staff-pending)
 * 4. Validate against ?type query param
 * 5. Route to appropriate view component
 */
export function StatusClient() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();

  // Fetch user data using Server Action (NOT API route)
  // Per CLAUDE.md - Use webUserDataPropsGetById from src/lib/database/actions/user-data-props.ts
  const { data: userData, isLoading: userDataLoading } = useSWR(
    firebaseUser?.uid ? ["user-data", firebaseUser.uid] : null,
    ([, uid]) => webUserDataPropsGetById(uid),
    {
      revalidateOnFocus: false,
    }
  );

  // Compute final status type using useMemo (derived state, not setState in useEffect)
  const finalStatusType = useMemo<StatusType | "rejected" | null>(() => {
    // Still loading
    if (authLoading || userDataLoading) {
      return null;
    }

    const queryType = searchParams.get("type");

    // Special case: ?type=rejected always shows rejected view (no user data check needed)
    if (queryType === "rejected") {
      return "rejected";
    }

    // Detect status from user data
    const detectedType = detectStatusType(userData);

    // Validate query param against detected type
    return validateStatusType(queryType, detectedType);
  }, [authLoading, userDataLoading, userData, searchParams]);

  // Compute target company ID using useMemo
  const targetCompanyId = useMemo(() => {
    if (finalStatusType === "staff-pending" || finalStatusType === "company-pending") {
      return getTargetCompanyId(userData);
    }
    return null;
  }, [finalStatusType, userData]);

  // Handle redirects in useEffect (side effect)
  useEffect(() => {
    // Wait for auth and user data to load
    if (authLoading || userDataLoading) {
      return;
    }

    // No Firebase user - redirect to login
    if (!firebaseUser) {
      router.push("/jobsmarket/auth/login");
      return;
    }

    // No valid status - redirect to dashboard (user shouldn't be on this page)
    if (finalStatusType === null) {
      router.push("/jobsmarket/dashboard");
    }
  }, [authLoading, userDataLoading, firebaseUser, finalStatusType, router]);

  // Loading state
  if (authLoading || userDataLoading || finalStatusType === null) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="text-center">
          <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
          <p className="mt-4 text-sm text-muted-foreground">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Route to appropriate view based on status type
  return (
    <div className="flex min-h-screen items-center justify-center p-4">
      {finalStatusType === "deleted" && <DeletedStatusView />}
      {finalStatusType === "staff-pending" && (
        <StaffPendingView targetCompanyId={targetCompanyId} />
      )}
      {finalStatusType === "company-pending" && (
        <CompanyPendingView targetCompanyId={targetCompanyId} />
      )}
      {finalStatusType === "rejected" && <RejectedView />}
    </div>
  );
}
