"use client";

import { ReactNode, useEffect, useState } from "react";
import { useSetAtom } from "jotai";
import { usePathname } from "next/navigation";

import { activeRoleAtom } from "@/store/jobsmarket/global-atoms";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import type { BreadcrumbItem } from "@/components/jobsmarket/global/Breadcrumb";
import type { Role } from "@/components/jobsmarket/global/RoleSwitcher";

import { CandidateSidebar } from "./CandidateSidebar";
import { CandidateTopBar } from "./CandidateTopBar";
import { CandidateMobileHeader } from "./CandidateMobileHeader";

/**
 * Candidate Shell - Main layout for all /candidates/* routes
 * Per CAND-R00 Cross-Cutting RIS §2 and Section 2.3 of 01-navigation-shells.md
 *
 * Provides:
 * - Top Bar with breadcrumb, notifications, role switcher, user menu (desktop)
 * - Mobile Header with logo, notifications, user menu (mobile)
 * - Sidebar navigation (desktop)
 * - Bottom tab bar (mobile)
 * - Chat FAB (floating action button) [TODO]
 *
 * Shell Behavior:
 * - Sets activeRoleAtom to 'candidate' on mount
 * - Restricts navigation if user not onboarded (is_onboarded=false)
 * - Responsive: sidebar (desktop) → bottom tabs (mobile)
 * - Theme: Teal (#3593a5) accent
 */

export interface CandidateShellProps {
  children: ReactNode;
  candidateId: string;
  isOnboarded?: boolean;
  currentPath?: string;
}

export function CandidateShell({
  children,
  candidateId,
  isOnboarded = false,
  currentPath,
}: CandidateShellProps) {
  const setActiveRole = useSetAtom(activeRoleAtom);
  const pathname = usePathname();
  const [userName, setUserName] = useState<string>("ผู้ใช้");
  const [userAvatarUrl, setUserAvatarUrl] = useState<string | undefined>();

  // Set active role to candidate on mount
  useEffect(() => {
    setActiveRole("candidate");
  }, [setActiveRole]);

  // Fetch candidate data for user name and avatar
  useEffect(() => {
    const fetchCandidateData = async () => {
      try {
        const candidate = await webCandidateInformationGetById(candidateId);
        if (candidate) {
          const fullName = `${candidate.firstnameTH} ${candidate.lastnameTH}`;
          setUserName(fullName);
          setUserAvatarUrl(candidate.resumePhotoURL || undefined);
        }
      } catch (error) {
        console.error("Failed to fetch candidate data for shell:", error);
        // Continue with default values
      }
    };

    fetchCandidateData();
  }, [candidateId]);

  // Generate breadcrumb items based on current path
  const getBreadcrumbItems = (): BreadcrumbItem[] => {
    const currentPathName = pathname || currentPath || "";

    const items: BreadcrumbItem[] = [];

    if (currentPathName.includes("/profile")) {
      items.push({ label: "โปรไฟล์" });
    } else if (currentPathName.includes("/applications")) {
      items.push({ label: "ใบสมัครงาน" });
    } else if (currentPathName === `/candidates/${candidateId}`) {
      items.push({ label: "แดชบอร์ด" });
    }

    return items;
  };

  // Mock data for role switcher (to be replaced with actual multi-role logic)
  // Only show role switcher if user has multiple roles
  const availableRoles: Role[] = [
    { type: "candidate", name: "ผู้หางาน", isCurrent: true },
    // Add company roles if user has them
  ];

  const currentRole: Role = { type: "candidate", name: "ผู้หางาน", isCurrent: true };

  const handleRoleSwitch = (role: Role) => {
    console.log("Role switched to:", role);
    // TODO: Implement actual role switching logic
  };

  const handleLogout = () => {
    console.log("Logout triggered");
    // TODO: Implement actual logout logic
    window.location.href = "/auth/login";
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      {/* Mobile Header (hidden on desktop) */}
      <CandidateMobileHeader
        userName={userName}
        userAvatarUrl={userAvatarUrl}
        unreadNotifications={0} // TODO: Get from notifications API
        onLogout={handleLogout}
        className="lg:hidden"
      />

      <div className="flex flex-1">
        {/* Sidebar (hidden on mobile) */}
        <div className="hidden lg:block">
          <CandidateSidebar
            candidateId={candidateId}
            isOnboarded={isOnboarded}
            currentPath={pathname || currentPath}
          />
        </div>

        <div className="flex-1 flex flex-col lg:ml-64">
          {/* Top Bar (hidden on mobile) */}
          <CandidateTopBar
            breadcrumbItems={getBreadcrumbItems()}
            userName={userName}
            userAvatarUrl={userAvatarUrl}
            unreadNotifications={0} // TODO: Get from notifications API
            availableRoles={availableRoles}
            currentRole={currentRole}
            onRoleSwitch={handleRoleSwitch}
            onLogout={handleLogout}
            className="hidden lg:flex"
          />

          {/* Main Content */}
          <main className="flex-1 pb-20 lg:pb-0">
            {children}
          </main>
        </div>
      </div>

      {/* Mobile Bottom Tab Bar (hidden on desktop) */}
      <nav data-testid="bottom-tab-bar" className="lg:hidden fixed bottom-0 inset-x-0 bg-white border-t border-gray-200 z-20">
        <div className="flex items-center justify-around h-16">
          <MobileTabItem
            href={`/candidates/${candidateId}`}
            icon={<HomeIcon />}
            label="หน้าหลัก"
            isActive={(pathname || currentPath) === `/candidates/${candidateId}`}
            disabled={!isOnboarded}
          />
          <MobileTabItem
            href="/jobs"
            icon={<JobsIcon />}
            label="งาน"
            isActive={(pathname || currentPath)?.startsWith("/jobs")}
            disabled={!isOnboarded}
          />
          <MobileTabItem
            href={`/candidates/${candidateId}/applications`}
            icon={<ApplicationsIcon />}
            label="ใบสมัคร"
            isActive={(pathname || currentPath)?.startsWith(`/candidates/${candidateId}/applications`)}
            disabled={!isOnboarded}
          />
          <MobileTabItem
            href="/chat"
            icon={<ChatIcon />}
            label="ข้อความ"
            isActive={(pathname || currentPath)?.startsWith("/chat")}
            disabled={!isOnboarded}
          />
          <MobileTabItem
            href={`/candidates/${candidateId}/profile`}
            icon={<ProfileIcon />}
            label="โปรไฟล์"
            isActive={(pathname || currentPath)?.startsWith(`/candidates/${candidateId}/profile`)}
            disabled={false} // Always allow profile access
          />
        </div>
      </nav>

      {/* TODO: Chat FAB */}
    </div>
  );
}

// Mobile Tab Item Component
interface MobileTabItemProps {
  href: string;
  icon: ReactNode;
  label: string;
  isActive?: boolean;
  disabled?: boolean;
  badge?: number;
}

function MobileTabItem({
  href,
  icon,
  label,
  isActive = false,
  disabled = false,
  badge,
}: MobileTabItemProps) {
  const handleClick = (e: React.MouseEvent) => {
    if (disabled) {
      e.preventDefault();
      // TODO: Show toast: "กรุณากรอกข้อมูลโปรไฟล์ให้ครบก่อน"
    }
  };

  return (
    <a
      href={disabled ? "#" : href}
      onClick={handleClick}
      className={`
        flex flex-col items-center justify-center flex-1 h-full relative
        ${disabled ? "opacity-40 cursor-not-allowed" : ""}
        ${isActive ? "text-teal-600" : "text-gray-400"}
      `}
      aria-label={label}
    >
      <div className="relative">
        {icon}
        {badge !== undefined && badge > 0 && (
          <span className="absolute -top-1 -right-1 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
            {badge > 99 ? "99+" : badge}
          </span>
        )}
      </div>
      <span className="text-xs mt-1">{label}</span>
    </a>
  );
}

// Tab Icons
function HomeIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2 2v2m4 6h.01M5 20h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
      />
    </svg>
  );
}

function ApplicationsIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function ChatIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}
