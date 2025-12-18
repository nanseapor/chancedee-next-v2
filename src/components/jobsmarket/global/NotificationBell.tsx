"use client";

import Link from "next/link";
import { Bell } from "lucide-react";

/**
 * Notification Bell Component
 * Per Section 2 of 01-navigation-shells.md
 *
 * Displays notification bell with unread count badge
 * Used in all authenticated shells
 */

export interface NotificationBellProps {
  /** Number of unread notifications */
  unreadCount?: number;
  /** Additional className */
  className?: string;
}

export function NotificationBell({ unreadCount = 0, className = "" }: NotificationBellProps) {
  return (
    <Link
      href="/jobsmarket/notifications"
      className={`relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors ${className}`}
      aria-label={`การแจ้งเตือน${unreadCount > 0 ? ` (${unreadCount} ใหม่)` : ""}`}
    >
      <Bell className="w-5 h-5" />

      {/* Unread Badge */}
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 bg-red-500 text-white text-xs font-medium px-1.5 py-0.5 rounded-full min-w-[18px] text-center leading-none">
          {unreadCount > 99 ? "99+" : unreadCount}
        </span>
      )}
    </Link>
  );
}
