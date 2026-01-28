"use client";

import Link from "next/link";
import { User, Settings, LogOut } from "lucide-react";
import { Separator } from "@/components/ui/separator";

import { Logo } from "@/components/jobsmarket/global/Logo";
import { NotificationBell } from "@/components/jobsmarket/global/NotificationBell";
import { MobileNavbar } from "@/components/layout/mobile-navbar";
import { Role } from "@/components/jobsmarket/global/RoleSwitcher";

/**
 * Candidate Mobile Header
 * Per Section 2.3 of 01-navigation-shells.md
 *
 * Mobile-only header with:
 * - Logo (left)
 * - Notification bell (right)
 * - Hamburger menu (right) with user actions panel
 */

export interface CandidateMobileHeaderProps {
  /** User's full name */
  userName: string;
  /** User's avatar URL */
  userAvatarUrl?: string;
  /** Unread notification count */
  unreadNotifications?: number;
  /** Available roles for role switcher (shown in user menu) */
  availableRoles?: Role[];
  /** Current active role */
  currentRole?: Role;
  /** Role switch handler */
  onRoleSwitch?: (role: Role) => void;
  /** Logout handler */
  onLogout?: () => void;
  /** Additional className */
  className?: string;
}

export function CandidateMobileHeader({
  userName,
  unreadNotifications = 0,
  availableRoles,
  currentRole,
  onRoleSwitch,
  onLogout,
  className = "",
}: CandidateMobileHeaderProps) {
  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-4 relative ${className}`}
    >
      {/* Left: Logo */}
      <Logo variant="compact" href="/" />

      {/* Right: Actions */}
      <div className="flex items-center gap-1">
        {/* Notification Bell */}
        <NotificationBell unreadCount={unreadNotifications} />

        {/* Hamburger Menu */}
        <MobileNavbar breakpointClass="lg:hidden" topOffset="top-[56px]">
          <div className="rounded-b-lg bg-white px-4 py-6 shadow-xl border-t border-gray-200">
            {/* User info */}
            <div className="flex items-center gap-3 px-2 mb-4">
              <div className="w-10 h-10 rounded-full bg-secondary-600 flex items-center justify-center">
                <span className="text-sm font-semibold text-white">
                  {userName.substring(0, 2).toUpperCase()}
                </span>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-900">{userName}</p>
                {currentRole && (
                  <p className="text-xs text-gray-500">{currentRole.name}</p>
                )}
              </div>
            </div>

            <Separator className="mb-2" />

            {/* Navigation links */}
            <nav className="flex flex-col">
              <Link
                href="/auth/settings"
                className="flex items-center gap-3 px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <User className="w-4 h-4" />
                <span>โปรไฟล์</span>
              </Link>
              <Link
                href="/auth/settings"
                className="flex items-center gap-3 px-2 py-3 text-sm text-gray-700 hover:bg-gray-50 rounded-lg"
              >
                <Settings className="w-4 h-4" />
                <span>การตั้งค่า</span>
              </Link>
            </nav>

            {/* Role switcher */}
            {availableRoles && availableRoles.length > 1 && (
              <>
                <Separator className="my-2" />
                <div className="px-2 py-2">
                  <p className="text-xs text-gray-500 mb-2">สลับบทบาท</p>
                  {availableRoles.map((role) => (
                    <button
                      key={role.type}
                      onClick={() => onRoleSwitch?.(role)}
                      className={`w-full text-left px-2 py-2 text-sm rounded-lg ${
                        role.isCurrent
                          ? "text-secondary-700 bg-secondary-50 font-medium"
                          : "text-gray-700 hover:bg-gray-50"
                      }`}
                    >
                      {role.name}
                    </button>
                  ))}
                </div>
              </>
            )}

            <Separator className="my-2" />

            {/* Logout */}
            <button
              onClick={onLogout}
              className="w-full flex items-center gap-3 px-2 py-3 text-sm text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </MobileNavbar>
      </div>
    </header>
  );
}
