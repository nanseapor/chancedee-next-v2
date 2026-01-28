"use client";

import { Users } from "lucide-react";
import { MemberRow } from "./MemberRow";
import type { TeamMember } from "@/types/jobsmarket/company/team";

export interface MemberTableProps {
  /** List of team members */
  members: TeamMember[];
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Current user's ID */
  currentUserId?: string;
  /** Handler for change role action */
  onChangeRole?: (userId: string) => void;
  /** Handler for remove member action */
  onRemove?: (userId: string) => void;
}

/**
 * Table component for displaying team members
 */
export function MemberTable({
  members,
  isAdmin,
  currentUserId,
  onChangeRole,
  onRemove,
}: MemberTableProps) {
  if (members.length === 0) {
    return (
      <div
        data-testid="empty-state"
        className="flex flex-col items-center justify-center py-12 text-gray-500"
      >
        <Users className="h-12 w-12 mb-4 text-gray-300" />
        <p className="text-lg font-medium">ยังไม่มีสมาชิกในทีม</p>
        <p className="text-sm">เชิญสมาชิกเพื่อเริ่มสร้างทีมของคุณ</p>
      </div>
    );
  }

  return (
    <div className="overflow-x-auto" data-testid="member-table">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200 bg-gray-50/50">
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
              สมาชิก
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
              บทบาท
            </th>
            <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
              เข้าร่วมเมื่อ
            </th>
            {isAdmin && (
              <th className="py-3 px-4 text-left text-sm font-medium text-gray-600">
                จัดการ
              </th>
            )}
          </tr>
        </thead>
        <tbody>
          {members.map((member) => (
            <MemberRow
              key={member.uid}
              member={member}
              isAdmin={isAdmin}
              isSelf={member.uid === currentUserId}
              onChangeRole={onChangeRole}
              onRemove={onRemove}
            />
          ))}
        </tbody>
      </table>
    </div>
  );
}
