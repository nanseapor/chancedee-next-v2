"use client";

/**
 * NotificationItemCard Component - NOTIF-R01
 *
 * Card for displaying a single notification item.
 * Supports interview, offer, and system notification types.
 */

import { useCallback, useMemo } from "react";
import { Calendar, Gift, Info } from "lucide-react";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { cn } from "@/lib/utils";
import type { NotificationItem, NotificationItemProps } from "@/types/notification.types";

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

// Format interview date to Thai
function formatInterviewDate(dateStr: string): string {
  const date = new Date(dateStr);
  const buddhistYear = date.getFullYear() + 543;
  const months = [
    "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
    "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค.",
  ];
  return `${date.getDate()} ${months[date.getMonth()]} ${buddhistYear}`;
}

// Get notification icon based on type
function NotificationIcon({ type }: { type: NotificationItem["type"] }) {
  const iconClass = "h-4 w-4";

  switch (type) {
    case "interview":
    case "interview-reschedule":
      return (
        <div data-testid="notification-icon-interview" className="p-1 bg-blue-100 rounded-full">
          <Calendar className={cn(iconClass, "text-blue-600")} />
        </div>
      );
    case "offer":
      return (
        <div data-testid="notification-icon-offer" className="p-1 bg-green-100 rounded-full">
          <Gift className={cn(iconClass, "text-green-600")} />
        </div>
      );
    case "system":
      return (
        <div data-testid="notification-icon-system" className="p-1 bg-gray-100 rounded-full">
          <Info className={cn(iconClass, "text-gray-600")} />
        </div>
      );
    default:
      return null;
  }
}

export function NotificationItemCard({
  notification,
  onMarkAsRead,
  onClick,
}: NotificationItemProps) {
  const { uid, type, message, timestamp, isRead, sender, jobTitle, interviewDate, interviewTimeFrom, interviewTimeTo, interviewChannel } = notification;

  const handleClick = useCallback(() => {
    onClick(notification);
  }, [notification, onClick]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === "Enter" || e.key === " ") {
        e.preventDefault();
        onClick(notification);
      }
    },
    [notification, onClick]
  );

  const handleMarkAsRead = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      onMarkAsRead(uid);
    },
    [uid, onMarkAsRead]
  );

  const ariaLabel = useMemo(() => {
    const parts = [sender.name, message];
    if (!isRead) {
      parts.push("ยังไม่ได้อ่าน");
    }
    return parts.join(" - ");
  }, [sender.name, message, isRead]);

  const avatarFallback = sender.name.charAt(0);

  return (
    <div
      data-testid={`notification-item-${uid}`}
      role="button"
      tabIndex={0}
      aria-label={ariaLabel}
      onClick={handleClick}
      onKeyDown={handleKeyDown}
      className={cn(
        "relative flex gap-3 p-4 rounded-lg cursor-pointer transition-colors",
        "hover:bg-gray-50 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500",
        !isRead && "bg-secondary-50"
      )}
    >
      {/* Unread indicator */}
      {!isRead && (
        <div
          data-testid="unread-indicator"
          className="absolute left-1 top-1/2 -translate-y-1/2 w-2 h-2 rounded-full bg-secondary-500"
        />
      )}

      {/* Avatar */}
      <Avatar className="h-10 w-10 flex-shrink-0" aria-label={sender.name}>
        <AvatarImage src={sender.avatar || undefined} alt={sender.name} />
        <AvatarFallback>{avatarFallback}</AvatarFallback>
      </Avatar>

      {/* Content */}
      <div className="flex-1 min-w-0">
        {/* Header row */}
        <div className="flex items-center gap-2 mb-1">
          <NotificationIcon type={type} />
          <span className={cn("text-sm font-medium text-gray-900 truncate", !isRead && "font-semibold")}>
            {sender.name}
          </span>
        </div>

        {/* Message */}
        <p className="text-sm text-gray-700 line-clamp-2">{message}</p>

        {/* Interview details */}
        {(type === "interview" || type === "interview-reschedule") && interviewDate && (
          <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-gray-500">
            <span>{formatInterviewDate(interviewDate)}</span>
            {interviewTimeFrom && interviewTimeTo && (
              <span>{interviewTimeFrom} - {interviewTimeTo}</span>
            )}
            {interviewChannel && (
              <span className="px-2 py-0.5 bg-gray-100 rounded-full">
                {interviewChannel === "online" ? "ออนไลน์" : "ออนไซต์"}
              </span>
            )}
          </div>
        )}

        {/* Job title */}
        {jobTitle && (
          <p className="mt-1 text-xs text-gray-500 truncate">{jobTitle}</p>
        )}

        {/* Timestamp */}
        <p className="mt-1 text-xs text-gray-400">{formatRelativeTime(timestamp)}</p>
      </div>

      {/* Mark as read button */}
      {!isRead && (
        <button
          type="button"
          aria-label="ทำเครื่องหมายว่าอ่านแล้ว"
          onClick={handleMarkAsRead}
          className="flex-shrink-0 p-1 rounded-full hover:bg-gray-200 focus:outline-none focus-visible:ring-2 focus-visible:ring-secondary-500"
        >
          <div className="w-2 h-2 rounded-full bg-secondary-400" />
        </button>
      )}
    </div>
  );
}

export default NotificationItemCard;
