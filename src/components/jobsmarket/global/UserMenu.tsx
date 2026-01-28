"use client";

import { useState } from "react";
import Link from "next/link";
import { User, Settings, LogOut, ChevronDown } from "lucide-react";

/**
 * User Menu Component
 * Per Section 2 of 01-navigation-shells.md
 *
 * Displays user avatar + name with dropdown menu
 * Shows: Profile, Settings, Logout options
 * Optionally shows role badge
 */

export interface UserMenuProps {
  /** User's full name */
  userName: string;
  /** User's avatar URL (optional) */
  avatarUrl?: string;
  /** User's role badge (e.g., "Admin", "HR") */
  roleBadge?: string;
  /** Profile link href */
  profileHref?: string;
  /** Settings link href */
  settingsHref?: string;
  /** Logout handler */
  onLogout?: () => void;
  /** Additional className */
  className?: string;
}

export function UserMenu({
  userName,
  avatarUrl,
  roleBadge,
  profileHref = "/auth/settings",
  settingsHref = "/auth/settings",
  onLogout,
  className = "",
}: UserMenuProps) {
  const [isOpen, setIsOpen] = useState(false);

  const handleLogout = () => {
    setIsOpen(false);
    if (onLogout) {
      onLogout();
    } else {
      // Default logout behavior
      window.location.href = "/auth/login";
    }
  };

  // Get user initials for avatar fallback
  const getInitials = (name: string) => {
    const parts = name.split(" ");
    if (parts.length >= 2) {
      const firstPart = parts[0];
      const lastPart = parts[parts.length - 1];
      if (firstPart && lastPart && firstPart[0] && lastPart[0]) {
        return `${firstPart[0]}${lastPart[0]}`.toUpperCase();
      }
    }
    return name.substring(0, 2).toUpperCase();
  };

  return (
    <div className={`relative ${className}`}>
      {/* Trigger Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center gap-2 p-2 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="เมนูผู้ใช้"
      >
        {/* Avatar */}
        {avatarUrl ? (
          <img
            src={avatarUrl}
            alt={userName}
            className="w-8 h-8 rounded-full object-cover"
          />
        ) : (
          <div className="w-8 h-8 rounded-full bg-teal-600 flex items-center justify-center">
            <span className="text-xs font-semibold text-white">{getInitials(userName)}</span>
          </div>
        )}

        {/* Name + Role Badge (Desktop only) - max-width prevents long Thai names from breaking layout */}
        <div className="hidden md:block text-left max-w-[150px]">
          <div className="text-sm font-medium text-gray-900 truncate" title={userName}>
            {userName}
          </div>
          {roleBadge && (
            <div className="text-xs text-gray-500 truncate">{roleBadge}</div>
          )}
        </div>

        <ChevronDown
          className={`hidden md:block w-4 h-4 text-gray-500 transition-transform ${isOpen ? "rotate-180" : ""}`}
        />
      </button>

      {/* Dropdown Menu */}
      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />

          {/* Menu */}
          <div className="absolute right-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-20">
            {/* Profile */}
            <Link
              href={profileHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <User className="w-4 h-4" />
              <span>โปรไฟล์</span>
            </Link>

            {/* Settings */}
            <Link
              href={settingsHref}
              onClick={() => setIsOpen(false)}
              className="flex items-center gap-3 px-4 py-2 text-sm text-gray-700 hover:bg-gray-50"
            >
              <Settings className="w-4 h-4" />
              <span>การตั้งค่า</span>
            </Link>

            {/* Divider */}
            <div className="my-1 border-t border-gray-100" />

            {/* Logout */}
            <button
              onClick={handleLogout}
              className="w-full flex items-center gap-3 px-4 py-2 text-sm text-red-600 hover:bg-red-50"
            >
              <LogOut className="w-4 h-4" />
              <span>ออกจากระบบ</span>
            </button>
          </div>
        </>
      )}
    </div>
  );
}
