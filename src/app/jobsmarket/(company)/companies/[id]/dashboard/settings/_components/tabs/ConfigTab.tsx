"use client";

import { useState } from "react";
import { DefaultJobSettings } from "../config/DefaultJobSettings";
import { NotificationSettings } from "../config/NotificationSettings";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

// ============================================
// Types
// ============================================

interface NotificationSettingsData {
  notify_new_application?: boolean;
  daily_summary_enabled?: boolean;
  daily_summary_time?: string;
  interview_reminder_hours?: number;
}

interface CompanyConfig {
  job_defaults?: {
    default_location?: string;
    default_job_type?: string;
    auto_close_days?: number;
  };
  notifications?: NotificationSettingsData;
}

interface JobDefaultsData {
  default_location?: string;
  default_job_type?: string;
  auto_close_days?: number;
}

interface ConfigTabProps {
  config: CompanyConfig;
  onUpdate: (type: string, data: Record<string, unknown>) => Promise<void>;
  canEdit: boolean;
}

// ============================================
// Component
// ============================================

export function ConfigTab({ config, onUpdate, canEdit }: ConfigTabProps) {
  // Track local overrides for optimistic updates
  const [localOverrides, setLocalOverrides] = useState<NotificationSettingsData>({});

  // Merge config from parent with local optimistic overrides
  // When server refetches and updates config.notifications, the merge will still
  // show correct values since localOverrides will match the saved values
  const optimisticNotifications = {
    ...(config.notifications || {}),
    ...localOverrides,
  };

  const handleJobDefaultsSubmit = (data: JobDefaultsData) => {
    void onUpdate("job_defaults", data as unknown as Record<string, unknown>);
  };

  const handleNotificationToggle = async (
    key: keyof NotificationSettingsData,
    value: boolean | string | number
  ) => {
    // Optimistic update - update local overrides immediately
    setLocalOverrides((prev) => ({
      ...prev,
      [key]: value,
    }));

    // Then persist to backend
    await onUpdate("notifications", { [key]: value });
  };

  return (
    <div className="space-y-8">
      {/* Job Defaults Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">ค่าเริ่มต้นประกาศงาน</CardTitle>
        </CardHeader>
        <CardContent>
          <DefaultJobSettings
            initialData={config.job_defaults || {}}
            onSubmit={handleJobDefaultsSubmit}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>

      {/* Notification Settings Section */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">การแจ้งเตือน</CardTitle>
        </CardHeader>
        <CardContent>
          <NotificationSettings
            settings={optimisticNotifications}
            onToggle={handleNotificationToggle}
            disabled={!canEdit}
          />
        </CardContent>
      </Card>
    </div>
  );
}
