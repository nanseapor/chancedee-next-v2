"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { RoomListItem } from "@/types/chat.types";

interface ChatRoomCardProps {
  /** Room UID */
  uid: string;
  /** ID of the other party */
  otherPartyId: string;
  /** Display name of the other party */
  otherPartyName: string;
  /** Avatar URL of the other party */
  otherPartyPhoto: string | null;
  /** Job position context */
  positionContext: string | null;
  /** Last message preview */
  lastMessageText: string | null;
  /** Timestamp of last message */
  lastMessageTime: number;
  /** Who sent the last message */
  lastMessageSender: "candidate" | "hr";
  /** Number of unread messages */
  unreadCount: number;
  /** Whether there's a pending appointment */
  hasPendingAppointment: boolean;
  /** Whether this room is selected */
  isSelected: boolean;
  /** Callback when room is selected */
  onSelect: (roomId: string) => void;
}

/**
 * Format timestamp to relative Thai time
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 1) return "เมื่อกี้";
  if (minutes < 60) return `${minutes} นาทีที่แล้ว`;
  if (hours < 24) return `${hours} ชั่วโมงที่แล้ว`;
  if (days < 7) return `${days} วันที่แล้ว`;

  return new Date(timestamp).toLocaleDateString("th-TH", {
    day: "numeric",
    month: "short",
  });
}

/**
 * Get first character for avatar fallback
 */
function getAvatarFallback(name: string): string {
  return name.charAt(0).toUpperCase() || "?";
}

/**
 * ChatRoomCard Component
 *
 * Displays a single chat room in the list.
 * Shows other party info, last message preview, unread count, and appointment indicator.
 *
 * Per CHAT-R01 RIS §3.1 RoomCard Layout
 */
export function ChatRoomCard({
  uid,
  otherPartyName,
  otherPartyPhoto,
  positionContext,
  lastMessageText,
  lastMessageTime,
  unreadCount,
  hasPendingAppointment,
  isSelected,
  onSelect,
}: ChatRoomCardProps) {
  // Build aria-label for accessibility
  const ariaLabel = [
    `การสนทนากับ ${otherPartyName}`,
    unreadCount > 0 ? `${unreadCount} ข้อความที่ยังไม่ได้อ่าน` : null,
    hasPendingAppointment ? "มีนัดสัมภาษณ์" : null,
  ]
    .filter(Boolean)
    .join(", ");

  const handleClick = () => {
    onSelect(uid);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      onSelect(uid);
    }
  };

  return (
    <div
      data-testid="chat-room-card"
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "w-full p-4 flex items-start gap-3 text-left transition-colors cursor-pointer",
        "hover:bg-muted/50 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-inset",
        "border-b border-border",
        isSelected && "bg-secondary-50"
      )}
    >
      {/* Avatar */}
      <Avatar className="h-12 w-12 flex-shrink-0">
        <AvatarImage
          src={otherPartyPhoto || undefined}
          alt={otherPartyName}
        />
        <AvatarFallback className="bg-secondary-100 text-secondary-700">
          {getAvatarFallback(otherPartyName)}
        </AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header: Name and Time */}
        <div className="flex items-center justify-between gap-2 mb-0.5">
          <span className="font-medium text-foreground truncate">
            {otherPartyName}
          </span>
          <span className="text-xs text-muted-foreground flex-shrink-0">
            {formatRelativeTime(lastMessageTime)}
          </span>
        </div>

        {/* Position context */}
        {positionContext && (
          <p
            data-testid="position-context"
            className="text-xs text-muted-foreground truncate mb-0.5"
          >
            {positionContext}
          </p>
        )}

        {/* Footer: Message preview and badges */}
        <div className="flex items-center justify-between gap-2">
          {/* Last message */}
          <p
            data-testid="last-message"
            className="text-sm text-muted-foreground truncate"
          >
            {lastMessageText || "ไม่มีข้อความ"}
          </p>

          {/* Badges */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Pending appointment indicator */}
            {hasPendingAppointment && (
              <span className="text-sm" title="มีนัดสัมภาษณ์">
                📅
              </span>
            )}

            {/* Unread badge */}
            {unreadCount > 0 && (
              <Badge
                data-testid="unread-badge"
                variant="destructive"
                className="h-5 min-w-5 px-1.5 text-xs font-medium"
              >
                {unreadCount > 99 ? "99+" : unreadCount}
              </Badge>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
