"use client";

import { useState } from "react";
import { MemberTable } from "./MemberTable";
import { PendingSection } from "./PendingSection";
import { RolePickerModal } from "./RolePickerModal";
import { RemoveConfirmModal } from "./RemoveConfirmModal";
import { RejectConfirmModal } from "./RejectConfirmModal";
import type { TeamMember } from "@/types/jobsmarket/company/team";
import type { PendingEmployee } from "@/lib/database/actions/company-team";
import type { CompanyRole } from "@/types/jobsmarket/company/roles";

export interface MembersTabProps {
  /** List of team members */
  members: TeamMember[];
  /** List of pending applications */
  pending: PendingEmployee[];
  /** Whether current user is admin */
  isAdmin: boolean;
  /** Current user's ID */
  currentUserId?: string;
  /** Handler for accepting employee */
  onAcceptEmployee: (userId: string) => Promise<void>;
  /** Handler for rejecting employee */
  onRejectEmployee: (userId: string) => Promise<void>;
  /** Handler for changing role */
  onChangeRole: (userId: string, newRole: CompanyRole) => Promise<void>;
  /** Handler for removing employee */
  onRemoveEmployee: (userId: string) => Promise<void>;
}

/**
 * Tab content for the Members tab
 */
export function MembersTab({
  members,
  pending,
  isAdmin,
  currentUserId,
  onAcceptEmployee,
  onRejectEmployee,
  onChangeRole,
  onRemoveEmployee,
}: MembersTabProps) {
  // Modal states
  const [rolePickerMember, setRolePickerMember] = useState<TeamMember | null>(
    null
  );
  const [removeMember, setRemoveMember] = useState<TeamMember | null>(null);
  const [rejectPending, setRejectPending] = useState<PendingEmployee | null>(
    null
  );

  // Loading states
  const [acceptingUserId, setAcceptingUserId] = useState<string | null>(null);
  const [rejectingUserId, setRejectingUserId] = useState<string | null>(null);
  const [isChangingRole, setIsChangingRole] = useState(false);
  const [isRemoving, setIsRemoving] = useState(false);

  // Accept pending employee
  const handleAccept = async (userId: string) => {
    setAcceptingUserId(userId);
    try {
      await onAcceptEmployee(userId);
    } finally {
      setAcceptingUserId(null);
    }
  };

  // Open reject modal
  const handleRejectClick = (userId: string) => {
    const pendingUser = pending.find((p) => p.uid === userId);
    if (pendingUser) {
      setRejectPending(pendingUser);
    }
  };

  // Confirm reject
  const handleRejectConfirm = async (userId: string) => {
    setRejectingUserId(userId);
    try {
      await onRejectEmployee(userId);
      setRejectPending(null);
    } finally {
      setRejectingUserId(null);
    }
  };

  // Open role picker modal
  const handleChangeRoleClick = (userId: string) => {
    const member = members.find((m) => m.uid === userId);
    if (member) {
      setRolePickerMember(member);
    }
  };

  // Confirm role change
  const handleRoleConfirm = async (userId: string, newRole: CompanyRole) => {
    setIsChangingRole(true);
    try {
      await onChangeRole(userId, newRole);
      setRolePickerMember(null);
    } finally {
      setIsChangingRole(false);
    }
  };

  // Open remove modal
  const handleRemoveClick = (userId: string) => {
    const member = members.find((m) => m.uid === userId);
    if (member) {
      setRemoveMember(member);
    }
  };

  // Confirm remove
  const handleRemoveConfirm = async (userId: string) => {
    setIsRemoving(true);
    try {
      await onRemoveEmployee(userId);
      setRemoveMember(null);
    } finally {
      setIsRemoving(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Pending Applications Section */}
      {pending.length > 0 && (
        <PendingSection
          pending={pending}
          isAdmin={isAdmin}
          onAccept={handleAccept}
          onReject={handleRejectClick}
          acceptingUserId={acceptingUserId ?? undefined}
          rejectingUserId={rejectingUserId ?? undefined}
        />
      )}

      {/* Team Members Section */}
      <div className="rounded-lg border border-gray-200 bg-white">
        <div className="border-b border-gray-200 px-4 py-3">
          <h3 className="text-lg font-semibold text-gray-900">สมาชิกในทีม</h3>
        </div>
        <MemberTable
          members={members}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onChangeRole={handleChangeRoleClick}
          onRemove={handleRemoveClick}
        />
      </div>

      {/* Role Picker Modal */}
      {rolePickerMember && (
        <RolePickerModal
          isOpen={true}
          member={rolePickerMember}
          onConfirm={handleRoleConfirm}
          onClose={() => setRolePickerMember(null)}
          isLoading={isChangingRole}
        />
      )}

      {/* Remove Confirm Modal */}
      {removeMember && (
        <RemoveConfirmModal
          isOpen={true}
          member={removeMember}
          onConfirm={handleRemoveConfirm}
          onClose={() => setRemoveMember(null)}
          isLoading={isRemoving}
        />
      )}

      {/* Reject Confirm Modal */}
      {rejectPending && (
        <RejectConfirmModal
          isOpen={true}
          pendingUser={rejectPending}
          onConfirm={handleRejectConfirm}
          onClose={() => setRejectPending(null)}
          isLoading={rejectingUserId === rejectPending.uid}
        />
      )}
    </div>
  );
}
