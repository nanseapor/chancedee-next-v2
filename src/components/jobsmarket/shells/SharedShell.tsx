"use client";

/**
 * SharedShell Component
 *
 * Shell for shared routes (chat, notifications, auth/settings).
 * Detects user role and renders the appropriate shell:
 * - candidate → CandidateShell
 * - company → CompanyShell (via CompanyLayoutClient pattern)
 * - fallback → PublicHeader + PublicFooter
 */

import { useAtomValue } from "jotai";
import { activeRoleAtom } from "@/store/jobsmarket/global-atoms";
import { CandidateShell } from "./CandidateShell";
import CompanyShell from "@/components/jobsmarket/company/shells/CompanyShell";
import { PublicHeader } from "../jobs/PublicHeader";
import { PublicFooter } from "../jobs/PublicFooter";
import { hasPermission as checkPermission } from "@/types/jobsmarket/company";
import type { CompanyProfile, CompanyRole, Permission } from "@/types/jobsmarket/company";

interface SharedShellProps {
  children: React.ReactNode;
  uid: string;
  roles: string[];
  isOnboarded: boolean;
  companyProfile?: CompanyProfile;
  userRole?: CompanyRole;
}

export function SharedShell({
  children,
  uid,
  roles,
  isOnboarded,
  companyProfile,
  userRole,
}: SharedShellProps) {
  const activeRole = useAtomValue(activeRoleAtom);

  // Determine effective role: activeRoleAtom (for multi-role users) > infer from roles array
  let effectiveRole: "candidate" | "company" | null = null;

  if (activeRole === "company" || activeRole === "candidate") {
    effectiveRole = activeRole;
  } else if (roles.includes("company") && companyProfile) {
    effectiveRole = "company";
  } else if (roles.includes("candidate")) {
    effectiveRole = "candidate";
  }

  // Candidate shell
  if (effectiveRole === "candidate") {
    return (
      <CandidateShell candidateId={uid} isOnboarded={isOnboarded}>
        {children}
      </CandidateShell>
    );
  }

  // Company shell
  if (effectiveRole === "company" && companyProfile && userRole) {
    const hasPermission = (permission: Permission): boolean => {
      return checkPermission(userRole, permission);
    };

    return (
      <CompanyShell
        company={companyProfile}
        hasPermission={hasPermission}
      >
        {children}
      </CompanyShell>
    );
  }

  // Fallback: PublicHeader + PublicFooter
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <PublicHeader />
      <main className="flex-1">{children}</main>
      <PublicFooter />
    </div>
  );
}
