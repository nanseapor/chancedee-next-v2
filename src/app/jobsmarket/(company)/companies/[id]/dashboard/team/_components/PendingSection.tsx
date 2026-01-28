"use client";

import { Badge } from "@/components/ui/badge";
import { PendingRow } from "./PendingRow";
import type { PendingEmployee } from "@/lib/database/actions/company-team";

export interface PendingSectionProps {
  /** List of pending employee applications */
  pending: PendingEmployee[];
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Handler for accept action */
  onAccept: (userId: string) => void;
  /** Handler for reject action */
  onReject: (userId: string) => void;
  /** User ID currently being accepted */
  acceptingUserId?: string;
  /** User ID currently being rejected */
  rejectingUserId?: string;
}

/**
 * Section component showing pending employee applications
 */
export function PendingSection({
  pending,
  isAdmin,
  onAccept,
  onReject,
  acceptingUserId,
  rejectingUserId,
}: PendingSectionProps) {
  if (pending.length === 0) {
    return null;
  }

  const expiredCount = pending.filter((p) => p.isExpired).length;

  return (
    <div data-testid="pending-section" className="space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <h3 className="text-lg font-semibold text-gray-900">
            คำขอที่รอการตอบรับ
          </h3>
          <Badge variant="secondary" className="bg-amber-100 text-amber-800">
            {pending.length}
          </Badge>
        </div>

        {expiredCount > 0 && (
          <span className="text-sm text-gray-500">
            {expiredCount} รายการหมดอายุ
          </span>
        )}
      </div>

      {/* Pending List */}
      <div className="space-y-3" data-testid="pending-list">
        {pending.map((employee) => (
          <PendingRow
            key={employee.uid}
            pending={employee}
            isAdmin={isAdmin}
            onAccept={onAccept}
            onReject={onReject}
            isAccepting={acceptingUserId === employee.uid}
            isRejecting={rejectingUserId === employee.uid}
          />
        ))}
      </div>
    </div>
  );
}
