"use client";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Users, UserPlus } from "lucide-react";
import { MembersTab } from "./MembersTab";
import type { TeamMember } from "@/types/jobsmarket/company/team";
import type { PendingEmployee } from "@/lib/database/actions/company-team";
import type { CompanyRole } from "@/types/jobsmarket/company/roles";

export interface TeamTabsProps {
  /** Active tab value */
  activeTab: string;
  /** Handler for tab change */
  onTabChange: (tab: string) => void;
  /** Whether current user is admin */
  isAdmin: boolean;
  /** List of team members */
  members: TeamMember[];
  /** List of pending applications */
  pending: PendingEmployee[];
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
 * Tab navigation component for team management
 */
export function TeamTabs({
  activeTab,
  onTabChange,
  isAdmin,
  members,
  pending,
  currentUserId,
  onAcceptEmployee,
  onRejectEmployee,
  onChangeRole,
  onRemoveEmployee,
}: TeamTabsProps) {
  return (
    <Tabs value={activeTab} onValueChange={onTabChange} className="w-full">
      <TabsList className="w-full justify-start border-b bg-transparent px-0">
        <TabsTrigger
          value="members"
          data-testid="tab-members"
          className="data-[state=active]:border-b-2 data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent rounded-none"
        >
          <Users className="mr-2 h-4 w-4" />
          สมาชิก
          {members.length > 0 && (
            <span className="ml-2 rounded-full bg-gray-100 px-2 py-0.5 text-xs text-gray-600">
              {members.length}
            </span>
          )}
        </TabsTrigger>

        {isAdmin && (
          <TabsTrigger
            value="invite"
            data-testid="tab-invite"
            className="data-[state=active]:border-b-2 data-[state=active]:border-secondary-500 data-[state=active]:bg-transparent rounded-none"
          >
            <UserPlus className="mr-2 h-4 w-4" />
            เชิญสมาชิก
          </TabsTrigger>
        )}
      </TabsList>

      <TabsContent value="members" className="mt-6">
        <MembersTab
          members={members}
          pending={pending}
          isAdmin={isAdmin}
          currentUserId={currentUserId}
          onAcceptEmployee={onAcceptEmployee}
          onRejectEmployee={onRejectEmployee}
          onChangeRole={onChangeRole}
          onRemoveEmployee={onRemoveEmployee}
        />
      </TabsContent>

      {isAdmin && (
        <TabsContent value="invite" className="mt-6">
          <div className="rounded-lg border border-gray-200 bg-white p-8 text-center">
            <UserPlus className="mx-auto h-12 w-12 text-gray-300 mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              เชิญสมาชิกใหม่
            </h3>
            <p className="text-gray-500 mb-4">
              ผู้ใช้สามารถสมัครเข้าร่วมบริษัทได้ผ่านหน้าบริษัท
            </p>
            <p className="text-sm text-gray-400">
              เมื่อมีผู้ส่งคำขอเข้าร่วม คุณจะเห็นในแท็บ
              &quot;สมาชิก&quot;
            </p>
          </div>
        </TabsContent>
      )}
    </Tabs>
  );
}
