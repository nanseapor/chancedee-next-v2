"use client";

/**
 * GroupedRoomCard Component - NOTIF-R01
 *
 * Card for displaying a chat room with grouped messages.
 * Used in the "Messages" filter tab.
 */

import { useCallback, useMemo } from "react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { GroupedRoomItem, GroupedRoomItemProps } from "@/types/notification.types";

// Thai relative time formatter
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) {
    return "เมื่อสักครู่";
  } else if (minutes < 60) {
    return `${minutes} นาทีที่แล้ว`;
  } else if (hours < 24) {
    return `${hours} ชั่วโมงที่แล้ว`;
  } else if (days < 7) {
    return `${days} วันที่แล้ว`;
  } else {
    // Format as date
    const date = new Date(timestamp);
    const buddhistYear = date.getFullYear() + 543;
    const months = [
      "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
      "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
    ];
    return `${date.getDate()} ${months[date.getMonth()]} ${buddhistYear}`;
  }
}

// Format badge count
function formatBadgeCount(count: number): string {
  return count > 99 ? "99+" : count.toString();
}

export function GroupedRoomCard({ room, onClick }: GroupedRoomItemProps) {
  const {
    roomId,
    otherPartyName,
    otherPartyPhoto,
    positionContext,
    unreadCount,
    lastMessagePreview,
    lastMessageTime,
    lastMessageSender,
  } = room;

  const hasUnread = unreadCount > 0;

  const handleClick = useCallback(() => {
    onClick(roomId);
  }, [roomId, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(roomId);
      }
    },
    [roomId, onClick]
  );

  const ariaLabel = useMemo(() => {
    const parts = [otherPartyName];
    if (hasUnread) {
      parts.push(`${unreadCount} ข้อความที่ยังไม่ได้อ่าน`);
    }
    return parts.join(" - ");
  }, [otherPartyName, hasUnread, unreadCount]);

  const avatarFallback = otherPartyName.charAt(0);

  // Message preview with "คุณ:" prefix if sent by current user
  const displayMessage = lastMessageSender === "me"
    ? `คุณ: ${lastMessagePreview}`
    : lastMessagePreview;

  return (
    <div
      data-testid={`grouped-room-${roomId}`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "flex gap-3 p-4 rounded-lg cursor-pointer transition-colors",
        "hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500",
        hasUnread && "bg-secondary-50"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0" aria-label={otherPartyName}>
        <AvatarImage src={otherPartyPhoto || undefined} alt={otherPartyName} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Name row */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span
            className={cn(
              "text-sm text-gray-900 truncate",
              hasUnread ? "font-semibold" : "font-normal"
            )}
          >
            {otherPartyName}
          </span>
          <span className="text-xs text-gray-400 flex-shrink-0">
            {formatRelativeTime(lastMessageTime)}
          </span>
        </div>

        {/* Position context */}
        {positionContext && (
          <p data-testid="position-context" className="text-xs text-gray-500 truncate mb-1">
            {positionContext}
          </p>
        )}

        {/* Last message preview */}
        <div className="flex items-center justify-between gap-2">
          <p
            data-testid="last-message-preview"
            className={cn(
              "text-sm text-gray-600 truncate",
              hasUnread && "text-gray-800"
            )}
          >
            {displayMessage}
          </p>

          {/* Unread badge */}
          {hasUnread && (
            <span
              data-testid="unread-badge"
              className="flex-shrink-0 inline-flex items-center justify-center min-w-[1.25rem] h-5 px-1.5 text-xs font-medium rounded-full bg-secondary-500 text-white"
            >
              {formatBadgeCount(unreadCount)}
            </span>
          )}
        </div>
      </div>
    </div>
  );
}

export default GroupedRoomCard;
