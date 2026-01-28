/**
 * COMP-R00: Company Shell Component
 *
 * Full layout shell for approved companies
 * Includes header, sidebar, mobile bottom nav, and main content area
 * Per COMP-R00 implementation plan Phase 3
 */

"use client";

import { useState, useCallback } from "react";
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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const handleMenuToggle = useCallback(() => {
    setSidebarOpen((prev) => !prev);
  }, []);

  const handleCloseSidebar = useCallback(() => {
    setSidebarOpen(false);
  }, []);

  const handleLogout = useCallback(async () => {
    // TODO: Implement logout logic
    // await signOut();
    router.push("/auth/login");
  }, [router]);

  return (
    <div className="min-h-screen bg-muted/30">
      {/* Header */}
      <CompanyHeader
        company={company}
        userName={user?.displayName || user?.email || undefined}
        userAvatar={user?.photoURL || undefined}
        onMenuToggle={handleMenuToggle}
        onLogout={handleLogout}
      />

      <div className="flex">
        {/* Sidebar - Desktop */}
        <CompanySidebar
          companyId={company.uid}
          hasPermission={hasPermission}
          badgeCounts={badgeCounts}
          isOpen={sidebarOpen}
          onClose={handleCloseSidebar}
        />

        {/* Main content */}
        <main className="flex-1 min-h-[calc(100vh-3.5rem)] pb-20 md:pb-0">
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
