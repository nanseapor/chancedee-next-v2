"use client";

import { Breadcrumb, BreadcrumbItem } from "@/components/jobsmarket/global/Breadcrumb";
import { NotificationBell } from "@/components/jobsmarket/global/NotificationBell";
import { RoleSwitcher, Role } from "@/components/jobsmarket/global/RoleSwitcher";
import { UserMenu } from "@/components/jobsmarket/global/UserMenu";

/**
 * Candidate Top Bar
 * Per Section 2.3 of 01-navigation-shells.md
 *
 * Desktop-only top bar with:
 * - Breadcrumb navigation (left)
 * - Notification bell (right)
 * - Role switcher (right, if multi-role)
 * - User menu (right)
 *
 * Theme: Teal (#3593a5) accent
 */

export interface CandidateTopBarProps {
  /** Breadcrumb items */
  breadcrumbItems?: BreadcrumbItem[];
  /** User's full name */
  userName: string;
  /** User's avatar URL */
  userAvatarUrl?: string;
  /** Unread notification count */
  unreadNotifications?: number;
  /** Available roles for role switcher */
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

export function CandidateTopBar({
  breadcrumbItems = [],
  userName,
  userAvatarUrl,
  unreadNotifications = 0,
  availableRoles = [],
  currentRole,
  onRoleSwitch = () => {},
  onLogout,
  className = "",
}: CandidateTopBarProps) {
  return (
    <header
      className={`sticky top-0 z-30 h-14 border-b border-gray-200 bg-white flex items-center justify-between px-6 ${className}`}
    >
      {/* Left: Breadcrumb */}
      <div className="flex-1">
        {breadcrumbItems.length > 0 && <Breadcrumb items={breadcrumbItems} />}
      </div>

      {/* Right: Actions */}
      <div className="flex items-center gap-3">
        {/* Notification Bell */}
        <NotificationBell unreadCount={unreadNotifications} />

        {/* Role Switcher (only if multi-role) */}
        {availableRoles.length > 1 && currentRole && (
          <RoleSwitcher
            roles={availableRoles}
            currentRole={currentRole}
            onRoleSwitch={onRoleSwitch}
          />
        )}

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
