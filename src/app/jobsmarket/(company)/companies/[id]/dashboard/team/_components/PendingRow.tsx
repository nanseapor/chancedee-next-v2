"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Loader2, Check, X } from "lucide-react";
import type { PendingEmployee } from "@/lib/database/actions/company-team";

export interface PendingRowProps {
  /** Pending employee data */
  pending: PendingEmployee;
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Handler for accept action */
  onAccept: (userId: string) => void;
  /** Handler for reject action */
  onReject: (userId: string) => void;
  /** Loading state for accept */
  isAccepting?: boolean;
  /** Loading state for reject */
  isRejecting?: boolean;
}

/**
 * Format relative time in Thai
 */
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (days > 0) return `${days} วันที่แล้ว`;
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
  if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
  return "เมื่อสักครู่";
}

/**
 * Get initials from name for avatar fallback
 */
function getInitials(name: string): string {
  const parts = name.split(" ").filter(Boolean);
  if (parts.length === 0) return "?";
  const first = parts[0]?.[0] ?? "?";
  if (parts.length === 1) return first.toUpperCase();
  const last = parts[parts.length - 1]?.[0] ?? "";
  return (first + last).toUpperCase();
}

/**
 * Row component for pending employee application
 */
export function PendingRow({
  pending,
  isAdmin,
  onAccept,
  onReject,
  isAccepting = false,
  isRejecting = false,
}: PendingRowProps) {
  const isLoading = isAccepting || isRejecting;

  return (
    <div
      data-testid={`pending-row-${pending.uid}`}
      className="flex items-center justify-between gap-4 rounded-lg border border-gray-200 bg-white p-4"
    >
      {/* User Info */}
      <div className="flex items-center gap-3 min-w-0 flex-1">
        {/* Avatar */}
        {pending.avatarUrl ? (
          <Avatar className="h-10 w-10">
            <AvatarImage
              src={pending.avatarUrl}
              alt={pending.displayName}
            />
            <AvatarFallback data-testid="avatar-fallback">
              {getInitials(pending.displayName)}
            </AvatarFallback>
          </Avatar>
        ) : (
          <div
            data-testid="avatar-fallback"
            className="flex h-10 w-10 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 font-medium"
          >
            {getInitials(pending.displayName)}
          </div>
        )}

        {/* Name and Email */}
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <p className="font-medium text-gray-900 truncate">
              {pending.displayName}
            </p>
            {pending.isExpired && (
              <Badge
                variant="outline"
                className="bg-amber-100 text-amber-700 border-amber-300 text-xs"
              >
                หมดอายุ
              </Badge>
            )}
          </div>
          <p className="text-sm text-gray-500 truncate">{pending.email}</p>
          <p className="text-xs text-gray-400">
            {formatRelativeTime(pending.requestTimestamp)}
          </p>
        </div>
      </div>

      {/* Action Buttons (Admin only) */}
      {isAdmin && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onReject(pending.uid)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50 border-red-300"
          >
            {isRejecting ? (
              <>
                <Loader2
                  className="mr-1 h-4 w-4 animate-spin"
                  data-testid="reject-loading"
                />
                กำลังปฏิเสธ...
              </>
            ) : (
              <>
                <X className="mr-1 h-4 w-4" />
                ปฏิเสธ
              </>
            )}
          </Button>

          <Button
            variant="default"
            size="sm"
            onClick={() => onAccept(pending.uid)}
            disabled={isLoading}
            className="bg-green-600 hover:bg-green-700"
          >
            {isAccepting ? (
              <>
                <Loader2
                  className="mr-1 h-4 w-4 animate-spin"
                  data-testid="accept-loading"
                />
                กำลังตอบรับ...
              </>
            ) : (
              <>
                <Check className="mr-1 h-4 w-4" />
                ตอบรับ
              </>
            )}
          </Button>
        </div>
      )}
    </div>
  );
}
