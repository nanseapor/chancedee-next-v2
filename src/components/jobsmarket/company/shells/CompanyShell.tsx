/**
 * COMP-R00: Company Shell Component
 *
 * Full layout shell for approved companies
 * Includes header, sidebar (desktop), mobile bottom nav, and main content area
 * Per COMP-R00 implementation plan Phase 3
 */

"use client";

import { useCallback } from "react";
import { useRouter } from "next/navigation";
import { useAtomValue } from "jotai";
import { userAtom } from "@/store/atom-store";

import CompanyHeader from "../navigation/CompanyHeader";
import CompanySidebar from "../navigation/CompanySidebar";
import MobileBottomNav from "../navigation/MobileBottomNav";

import type {
  CompanyProfile,
  Permission,
  NavBadgeCounts,
} from "@/types/jobsmarket/company";

interface CompanyShellProps {
  children: React.ReactNode;
  company: CompanyProfile;
  hasPermission: (permission: Permission) => boolean;
  badgeCounts?: NavBadgeCounts;
}

export default function CompanyShell({
  children,
  company,
  hasPermission,
  badgeCounts,
}: CompanyShellProps) {
  const router = useRouter();
  const user = useAtomValue(userAtom);

  const handleLogout = useCallback(async () => {
    // TODO: Implement logout logic
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <CompanyHeader
        company={company}
        userName={user?.displayName || user?.email || undefined}
        userAvatar={user?.photoURL || undefined}
        onLogout={handleLogout}
        hasPermission={hasPermission}
        badgeCounts={badgeCounts}
      />

      <div className="flex">
        {/* Sidebar - Desktop only */}
        <div className="hidden lg:block">
          <CompanySidebar
            companyId={company.uid}
            hasPermission={hasPermission}
            badgeCounts={badgeCounts}
          />
        </div>

        {/* Main content */}
        <main className="flex-1 min-w-0 min-h-[calc(100vh-3.5rem)] pb-20 lg:pb-0">
          {children}
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <MobileBottomNav
        companyId={company.uid}
        hasPermission={hasPermission}
        badgeCounts={badgeCounts}
      />
    </div>
  );
}
