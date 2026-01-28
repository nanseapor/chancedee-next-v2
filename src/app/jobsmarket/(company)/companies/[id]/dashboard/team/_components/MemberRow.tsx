"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, UserCog, UserMinus } from "lucide-react";
import type { TeamMember } from "@/types/jobsmarket/company/team";
import { ROLE_LABELS } from "@/types/jobsmarket/company/roles";

export interface MemberRowProps {
  /** Team member data */
  member: TeamMember;
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Whether this is the current user */
  isSelf: boolean;
  /** Handler for change role action */
  onChangeRole?: (userId: string) => void;
  /** Handler for remove member action */
  onRemove?: (userId: string) => void;
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
 * Get badge color based on role
 */
function getRoleBadgeClass(role: string): string {
  switch (role) {
    case "admin":
      return "bg-red-100 text-red-700 border-red-300";
    case "hr_manager":
      return "bg-purple-100 text-purple-700 border-purple-300";
    case "recruiter":
      return "bg-blue-100 text-blue-700 border-blue-300";
    case "interviewer":
      return "bg-green-100 text-green-700 border-green-300";
    default:
      return "bg-gray-100 text-gray-700 border-gray-300";
  }
}

/**
 * Format date for joined at
 */
function formatDate(timestamp: number): string {
  return new Intl.DateTimeFormat("th-TH", {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(timestamp));
}

/**
 * Row component for a team member
 */
export function MemberRow({
  member,
  isAdmin,
  isSelf,
  onChangeRole,
  onRemove,
}: MemberRowProps) {
  const showActions = isAdmin && !isSelf;

  return (
    <tr
      data-testid={`member-row-${member.uid}`}
      className="border-b border-gray-100 last:border-0 hover:bg-gray-50/50"
    >
      {/* Member Info */}
      <td className="py-3 px-4">
        <div className="flex items-center gap-3">
          {member.avatarUrl ? (
            <Avatar className="h-9 w-9">
              <AvatarImage src={member.avatarUrl} alt={member.displayName} />
              <AvatarFallback data-testid="avatar-fallback">
                {getInitials(member.displayName)}
              </AvatarFallback>
            </Avatar>
          ) : (
            <div
              data-testid="avatar-fallback"
              className="flex h-9 w-9 items-center justify-center rounded-full bg-secondary-100 text-secondary-700 font-medium text-sm"
            >
              {getInitials(member.displayName)}
            </div>
          )}

          <div>
            <p className="font-medium text-gray-900">{member.displayName}</p>
            <p className="text-sm text-gray-500">{member.email}</p>
          </div>
        </div>
      </td>

      {/* Role */}
      <td className="py-3 px-4">
        <Badge
          variant="outline"
          className={getRoleBadgeClass(member.role)}
        >
          {ROLE_LABELS[member.role]}
        </Badge>
      </td>

      {/* Joined At */}
      <td className="py-3 px-4 text-sm text-gray-500">
        {formatDate(member.joinedAt)}
      </td>

      {/* Actions */}
      <td className="py-3 px-4">
        {showActions ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                data-testid="member-action-menu"
                className="h-8 w-8 p-0"
              >
                <MoreVertical className="h-4 w-4" />
                <span className="sr-only">เปิดเมนู</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => onChangeRole?.(member.uid)}>
                <UserCog className="mr-2 h-4 w-4" />
                เปลี่ยนบทบาท
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => onRemove?.(member.uid)}
                className="text-red-600 focus:text-red-600"
              >
                <UserMinus className="mr-2 h-4 w-4" />
                ลบออก
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <div className="h-8 w-8" /> // Placeholder for alignment
        )}
      </td>
    </tr>
  );
}
