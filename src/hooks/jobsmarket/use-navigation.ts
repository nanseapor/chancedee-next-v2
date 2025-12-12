"use client";

import { useRouter } from "next/navigation";
import { useSetAtom } from "jotai";

import { activeRoleAtom } from "@/store/jobsmarket/global-atoms";

/**
 * Navigation hook for jobsmarket subdomain
 * Per AUTH-R01 RIS §9.1
 */

export interface UserData {
  uid: string;
  roles: string[];
  companyId?: string;
}

/**
 * navigateUserByRole - Smart post-login routing
 * Per AUTH-R01 RIS §9.1
 *
 * @param pageType - Target context: 'candidate', 'company', or 'auto'
 * @param userData - User data from authentication
 * @param refCode - Optional referral code (redirects to /auth/register?refCode=...)
 * @param jobId - Optional job ID (redirects to /jobs/[jobId])
 */
export function useNavigation() {
  const router = useRouter();
  const setActiveRole = useSetAtom(activeRoleAtom);

  const navigateUserByRole = (
    pageType: "candidate" | "company" | "auto",
    userData: UserData,
    refCode?: string | null,
    jobId?: string | null
  ): string => {
    const { uid, roles, companyId } = userData;

    // Priority 1: Check for deleted account
    if (roles.includes("deleted")) {
      const destination = "/jobsmarket/auth/status?type=deleted";
      router.replace(destination);
      return destination;
    }

    // Priority 2: Check for ChanceDee platform admin
    if (roles.includes("chancedee")) {
      setActiveRole(null); // Platform admin doesn't use role switcher
      const destination = "/platform/dashboard";
      router.replace(destination);
      return destination;
    }

    // Priority 3: Check for pending users
    if (roles.includes("pending")) {
      const destination = determinePendingDestination(roles, companyId);
      router.replace(destination);
      return destination;
    }

    // Priority 4: Handle referral code (new registration flow)
    if (refCode) {
      const destination = `/jobsmarket/auth/register?refCode=${refCode}`;
      router.replace(destination);
      return destination;
    }

    // Priority 5: Handle job application flow
    if (jobId && (roles.includes("candidate") || pageType === "candidate")) {
      setActiveRole("candidate");
      const destination = `/jobsmarket/jobs/${jobId}`;
      router.replace(destination);
      return destination;
    }

    // Priority 6: Check for multi-role users
    const hasCandidate = roles.includes("candidate");
    const hasCompany = roles.includes("company");

    if (hasCandidate && hasCompany) {
      // Check for saved preference
      const savedRole = getSavedRolePreference();

      if (savedRole && (savedRole === pageType || pageType === "auto")) {
        // Use saved preference
        setActiveRole(savedRole);
        const destination = savedRole === "candidate"
          ? `/jobsmarket/candidates/${uid}`
          : `/jobsmarket/companies/${companyId}/dashboard`;
        router.replace(destination);
        return destination;
      }

      // No saved preference or pageType override - go to role selector
      const destination = "/jobsmarket/auth/select-role";
      router.replace(destination);
      return destination;
    }

    // Priority 7: pageType-specific routing
    if (pageType === "company" || (pageType === "auto" && hasCompany)) {
      if (hasCompany && companyId) {
        setActiveRole("company");
        const destination = `/jobsmarket/companies/${companyId}/dashboard`;
        router.replace(destination);
        return destination;
      }
      // User doesn't have company role - show context mismatch
      const destination = "/jobsmarket/auth/login?context=company&error=role-mismatch";
      router.replace(destination);
      return destination;
    }

    if (pageType === "candidate" || (pageType === "auto" && hasCandidate)) {
      setActiveRole("candidate");
      const destination = `/jobsmarket/candidates/${uid}`;
      router.replace(destination);
      return destination;
    }

    // Fallback: default to jobsmarket home
    const destination = "/jobsmarket";
    router.replace(destination);
    return destination;
  };

  return { navigateUserByRole };
}

/**
 * Determine destination for pending users
 * Per AUTH-R01 RIS §9.5
 */
function determinePendingDestination(roles: string[], companyId?: string): string {
  // Company Admin (new company) - pending platform approval
  if (roles.includes("company") && roles.includes("admin") && companyId) {
    return `/jobsmarket/companies/${companyId}/pending`;
  }

  // Company Staff - pending company admin approval
  if (roles.includes("company") && companyId) {
    return "/jobsmarket/auth/status?type=staff-pending";
  }

  // Generic pending (e.g., role addition)
  return "/jobsmarket/auth/status?type=pending";
}

/**
 * Get saved role preference from localStorage
 * Per AUTH-R01 RIS §9.4
 */
function getSavedRolePreference(): "candidate" | "company" | null {
  if (typeof window === "undefined") return null;

  const saved = localStorage.getItem("lastActiveRole");
  if (saved === "candidate" || saved === "company") {
    return saved;
  }
  return null;
}

/**
 * Save role preference to localStorage
 * Called from /auth/select-role page
 */
export function saveRolePreference(role: "candidate" | "company", remember: boolean): void {
  if (typeof window === "undefined") return;

  if (remember) {
    localStorage.setItem("lastActiveRole", role);
  } else {
    localStorage.removeItem("lastActiveRole");
  }
}
