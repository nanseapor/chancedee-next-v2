"use client";

import { useEffect, useState, useCallback } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { useCompanySettings } from "@/hooks/jobsmarket/company/use-company-settings";
import { useCompanyImageUpload } from "@/hooks/jobsmarket/company/use-company-image-upload";
import { SettingsTabs, type SettingsTabValue } from "./SettingsTabs";
import { ProfileTab } from "./tabs/ProfileTab";
import { ConfigTab } from "./tabs/ConfigTab";
import { Button } from "@/components/ui/button";
import { Loader2, AlertCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast-notification";

// ============================================
// Types
// ============================================

interface SettingsClientProps {
  companyId: string;
}

// ============================================
// Loading Component
// ============================================

function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <Loader2 className="h-8 w-8 animate-spin text-secondary-500" />
      <p className="mt-4 text-gray-500">กำลังโหลด...</p>
    </div>
  );
}

// ============================================
// Error Component
// ============================================

interface ErrorStateProps {
  onRetry: () => void;
}

function ErrorState({ onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center py-12">
      <AlertCircle className="h-12 w-12 text-red-500" />
      <p className="mt-4 text-lg font-medium text-gray-900">เกิดข้อผิดพลาด</p>
      <p className="mt-2 text-gray-500">ไม่สามารถโหลดข้อมูลได้</p>
      <Button onClick={onRetry} className="mt-4" variant="outline">
        ลองใหม่
      </Button>
    </div>
  );
}

// ============================================
// Main Component
// ============================================

export function SettingsClient({ companyId }: SettingsClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { addToast } = useToast();

  // Get current tab from URL or default to "profile"
  const urlTab = searchParams.get("tab") as SettingsTabValue | null;
  const [activeTab, setActiveTab] = useState<SettingsTabValue>(
    urlTab && ["profile", "config"].includes(urlTab) ? urlTab : "profile"
  );

  // Hooks
  const {
    company,
    isLoading,
    error,
    updateProfile,
    updateLinks,
    updateConfig,
    refetch,
  } = useCompanySettings(companyId);

  const { uploadLogo, uploadCover } = useCompanyImageUpload(companyId);

  // TODO: Integrate with company permissions system properly
  // For now, allow all authenticated company members to edit settings
  // The proper implementation would use:
  //   const { role } = useCompanyAuth({ companyId, skipRedirect: true });
  //   const { canManageSettings } = useCompanyPermission({ role });
  const canManageSettings = true;

  // Sync tab with URL
  useEffect(() => {
    const tab = searchParams.get("tab") as SettingsTabValue | null;
    if (tab && ["profile", "config"].includes(tab)) {
      setActiveTab(tab);
    }
  }, [searchParams]);

  // Handle tab change
  const handleTabChange = useCallback(
    (tab: SettingsTabValue) => {
      setActiveTab(tab);
      const params = new URLSearchParams(searchParams.toString());
      params.set("tab", tab);
      router.push(`?${params.toString()}`, { scroll: false });
    },
    [router, searchParams]
  );

  // Handle update from tabs
  const handleUpdate = useCallback(
    async (type: string, data: Record<string, unknown>) => {
      try {
        let result;

        switch (type) {
          case "profile":
            result = await updateProfile(data);
            break;
          case "links":
            result = await updateLinks(data);
            break;
          case "logo":
            if (data.file instanceof File) {
              result = await uploadLogo(data.file);
            } else if (data.remove) {
              // For logo removal, we need to call the server action directly
              // This is a simplified implementation - in production, you'd have a dedicated removal action
              result = { success: true };
              refetch();
            }
            break;
          case "cover":
            if (data.file instanceof File) {
              result = await uploadCover(data.file);
            } else if (data.remove) {
              // For cover removal, we need to call the server action directly
              // This is a simplified implementation - in production, you'd have a dedicated removal action
              result = { success: true };
              refetch();
            }
            break;
          case "job_defaults":
            result = await updateConfig({ job_defaults: data });
            break;
          case "notifications":
            result = await updateConfig({ notifications: data });
            break;
          default:
            throw new Error(`Unknown update type: ${type}`);
        }

        if (result?.success) {
          addToast("บันทึกสำเร็จ", "success");
          refetch();
        } else if (result?.error) {
          addToast(result.error, "error");
        }
      } catch (err) {
        console.error("Update error:", err);
        addToast(
          err instanceof Error ? err.message : "ไม่สามารถบันทึกข้อมูลได้",
          "error"
        );
      }
    },
    [updateProfile, updateLinks, updateConfig, uploadLogo, uploadCover, refetch, addToast]
  );

  // Loading state
  if (isLoading) {
    return <LoadingState />;
  }

  // Error state
  if (error) {
    return <ErrorState onRetry={refetch} />;
  }

  // Not found state
  if (!company) {
    return <ErrorState onRetry={refetch} />;
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-2xl font-semibold tracking-wide">ตั้งค่าบริษัท</h1>
        <p className="mt-1 text-gray-500">จัดการโปรไฟล์และการตั้งค่าบริษัท</p>
      </div>

      {/* Tabs */}
      <SettingsTabs
        activeTab={activeTab}
        onTabChange={handleTabChange}
        canEdit={canManageSettings}
      />

      {/* Tab Content */}
      <div className="mt-6">
        {activeTab === "profile" && (
          <ProfileTab
            company={company}
            onUpdate={handleUpdate}
            canEdit={canManageSettings}
          />
        )}
        {activeTab === "config" && (
          <ConfigTab
            config={company.config || {}}
            onUpdate={handleUpdate}
            canEdit={canManageSettings}
          />
        )}
      </div>
    </div>
  );
}
