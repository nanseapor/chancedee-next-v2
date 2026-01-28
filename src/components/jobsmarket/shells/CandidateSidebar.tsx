"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Logo } from "../global/Logo";

/**
 * Candidate Sidebar Navigation
 * Per CAND-R00 Cross-Cutting RIS §2.2 and navigation.md
 *
 * Desktop sidebar with:
 * - Logo
 * - Navigation items
 * - Active state indication
 * - Disabled state when not onboarded
 */

export interface CandidateSidebarProps {
  candidateId: string;
  isOnboarded: boolean;
  currentPath?: string;
}

export function CandidateSidebar({
  candidateId,
  isOnboarded,
  currentPath,
}: CandidateSidebarProps) {
  const pathname = usePathname() || currentPath || "";

  const navItems = [
    {
      id: "dashboard",
      href: `/candidates/${candidateId}`,
      icon: <DashboardIcon />,
      labelTh: "แดชบอร์ด",
      labelEn: "Dashboard",
      matchExact: true,
      requireOnboarded: true,
    },
    {
      id: "profile",
      href: `/candidates/${candidateId}/profile`,
      icon: <ProfileIcon />,
      labelTh: "โปรไฟล์",
      labelEn: "Profile",
      matchExact: false,
      requireOnboarded: false, // Always accessible
    },
    {
      id: "jobs",
      href: "/jobs",
      icon: <JobsIcon />,
      labelTh: "ค้นหางาน",
      labelEn: "Find Jobs",
      matchExact: false,
      requireOnboarded: true,
      external: true,
    },
    {
      id: "applications",
      href: `/candidates/${candidateId}/applications`,
      icon: <ApplicationsIcon />,
      labelTh: "ใบสมัคร",
      labelEn: "Applications",
      matchExact: false,
      requireOnboarded: true,
    },
    {
      id: "saved",
      href: `/candidates/${candidateId}/saved`,
      icon: <SavedIcon />,
      labelTh: "รายการที่บันทึก",
      labelEn: "Saved",
      matchExact: false,
      requireOnboarded: true,
    },
    {
      id: "settings",
      href: `/candidates/${candidateId}/settings`,
      icon: <SettingsIcon />,
      labelTh: "การตั้งค่า",
      labelEn: "Settings",
      matchExact: true,
      requireOnboarded: true,
    },
  ];

  const isItemActive = (item: typeof navItems[0]) => {
    if (item.matchExact) {
      return pathname === item.href;
    }
    return pathname.startsWith(item.href);
  };

  const isItemDisabled = (item: typeof navItems[0]) => {
    return item.requireOnboarded && !isOnboarded;
  };

  return (
    <aside data-testid="sidebar" className="hidden lg:flex lg:flex-col lg:fixed lg:inset-y-0 lg:w-64 lg:bg-white lg:border-r lg:border-gray-200">
      {/* Logo Header */}
      <div className="flex items-center h-14 px-6 border-b border-gray-200">
        <Logo href="/" className="" />
      </div>

      {/* Navigation Items */}
      <nav data-testid="sidebar-nav" className="flex-1 px-3 py-4 overflow-y-auto">
        <ul className="space-y-1">
          {navItems.map((item) => {
            const active = isItemActive(item);
            const disabled = isItemDisabled(item);

            return (
              <li key={item.id}>
                {disabled ? (
                  <button
                    type="button"
                    disabled
                    className="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-400 cursor-not-allowed opacity-50"
                    title="กรุณากรอกข้อมูลโปรไฟล์ให้ครบก่อน"
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                    <span className="flex-1 text-left">{item.labelTh}</span>
                  </button>
                ) : (
                  <Link
                    href={item.href}
                    className={`
                      flex items-center gap-3 px-3 py-2 text-sm rounded-lg transition-colors
                      ${
                        active
                          ? "bg-secondary-50 text-secondary-700 font-medium"
                          : "text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                      }
                    `}
                  >
                    <span className="w-5 h-5">{item.icon}</span>
                    <span className="flex-1">{item.labelTh}</span>
                  </Link>
                )}
              </li>
            );
          })}
        </ul>
      </nav>

    </aside>
  );
}

// Navigation Icons
function DashboardIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"
      />
    </svg>
  );
}

function ProfileIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
      />
    </svg>
  );
}

function JobsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
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
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
      />
    </svg>
  );
}

function SavedIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"
      />
    </svg>
  );
}

function SettingsIcon() {
  return (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"
      />
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeWidth={2}
        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"
      />
    </svg>
  );
}
