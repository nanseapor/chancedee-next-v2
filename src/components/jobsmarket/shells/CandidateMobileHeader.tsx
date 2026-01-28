"use client";

import { Logo } from "@/components/jobsmarket/global/Logo";
import { NotificationBell } from "@/components/jobsmarket/global/NotificationBell";
import { UserMenu } from "@/components/jobsmarket/global/UserMenu";
import { Role } from "@/components/jobsmarket/global/RoleSwitcher";

/**
 * Candidate Mobile Header
 * Per Section 2.3 of 01-navigation-shells.md
 *
 * Mobile-only header with:
 * - Logo (left)
 * - Notification bell (right)
 * - User avatar/menu (right)
 *
 * Note: Role switcher appears inside user menu on mobile
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
  userAvatarUrl,
  unreadNotifications = 0,
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
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell unreadCount={unreadNotifications} />

        {/* User Menu */}
        <UserMenu
          userName={userName}
          avatarUrl={userAvatarUrl}
          onLogout={onLogout}
        />
      </div>

    </header>
  );
}
