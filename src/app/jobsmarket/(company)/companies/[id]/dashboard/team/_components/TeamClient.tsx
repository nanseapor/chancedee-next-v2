"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback } from "react";
import { Loader2, AlertCircle, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { TeamTabs } from "./TeamTabs";
import { useCompanyTeam } from "@/hooks/jobsmarket/company/use-company-team";
import { useTeamActions } from "@/hooks/jobsmarket/company/use-team-actions";
import type { CompanyRole } from "@/types/jobsmarket/company/roles";

export interface TeamClientProps {
  /** Company ID */
  companyId: string;
  /** Current user ID */
  currentUserId?: string;
}

/**
 * Client component for team management page
 */
export function TeamClient({ companyId, currentUserId }: TeamClientProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Get current tab from URL or default to "members"
  const activeTab = searchParams.get("tab") || "members";

  // Fetch team data
  const { staff, pending, isAdmin, isLoading, error, mutate } = useCompanyTeam({
    companyId,
    currentUserId,
  });

  // Team actions
  const {
    acceptEmployee,
    rejectEmployee,
    changeRole,
    removeEmployee,
  } = useTeamActions({
    companyId,
    onSuccess: mutate,
  });

  // Handle tab change - update URL
  const handleTabChange = useCallback(
    (tab: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (tab === "members") {
        params.delete("tab");
      } else {
        params.set("tab", tab);
      }
      const newUrl = params.toString()
        ? `${pathname}?${params.toString()}`
        : pathname;
      router.push(newUrl);
    },
    [pathname, router, searchParams]
  );

  // Action handlers with async wrapper
  const handleAcceptEmployee = async (userId: string) => {
    await acceptEmployee(userId);
  };

  const handleRejectEmployee = async (userId: string) => {
    await rejectEmployee(userId);
  };

  const handleChangeRole = async (userId: string, newRole: CompanyRole) => {
    await changeRole(userId, newRole);
  };

  const handleRemoveEmployee = async (userId: string) => {
    await removeEmployee(userId);
  };

  // Loading state
  if (isLoading) {
    return (
      <div
        data-testid="loading-skeleton"
        className="flex items-center justify-center py-16"
      >
        <div className="flex flex-col items-center gap-3 text-gray-500">
          <Loader2 className="h-8 w-8 animate-spin" />
          <p>กำลังโหลดข้อมูลทีม...</p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div
        data-testid="error-state"
        className="flex flex-col items-center justify-center py-16 text-center"
      >
        <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100 mb-4">
          <AlertCircle className="h-8 w-8 text-red-600" />
        </div>
        <h3 className="text-lg font-medium text-gray-900 mb-2">
          เกิดข้อผิดพลาด
        </h3>
        <p className="text-gray-500 mb-4 max-w-md">{error.message}</p>
        <Button onClick={() => mutate()} variant="outline">
          <RefreshCw className="mr-2 h-4 w-4" />
          ลองใหม่อีกครั้ง
        </Button>
      </div>
    );
  }

  // Check for last admin protection message
  const hasLastAdminWarning = staff.filter((m) => m.role === "admin").length === 1;

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold text-gray-900">ทีมงาน</h1>
        <p className="text-gray-500">จัดการสมาชิกและบทบาทในบริษัท</p>
      </div>

      {/* Last Admin Warning */}
      {hasLastAdminWarning && isAdmin && (
        <div className="rounded-lg bg-amber-50 border border-amber-200 p-4 text-sm text-amber-800">
          <p className="font-medium">ต้องมี Admin อย่างน้อย 1 คน</p>
          <p className="text-amber-600">
            คุณไม่สามารถลบหรือลดตำแหน่งตัวเองได้จนกว่าจะมี Admin คนอื่น
          </p>
        </div>
      )}

      {/* Tab Navigation and Content */}
      <TeamTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        isAdmin={isAdmin}
        members={staff}
        pending={pending}
        currentUserId={currentUserId}
        onAcceptEmployee={handleAcceptEmployee}
        onRejectEmployee={handleRejectEmployee}
        onChangeRole={handleChangeRole}
        onRemoveEmployee={handleRemoveEmployee}
      />
    </div>
  );
}
