"use client";

import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Loader2 } from "lucide-react";

interface NotificationPreferencesSectionProps {
  emailJobRecommendations: boolean;
  onToggleEmail: (value: boolean) => void;
  isSavingEmail: boolean;
}

/**
 * CAND-R03: Notification Preferences Section
 *
 * MVP includes only email job recommendations toggle.
 * Push notifications deferred to Phase 2 (separate task).
 */
export function NotificationPreferencesSection({
  emailJobRecommendations,
  onToggleEmail,
  isSavingEmail,
}: NotificationPreferencesSectionProps) {
  return (
    <Card className="p-6">
      <div className="space-y-4">
        <div>
          <h2 className="text-xl font-medium tracking-wide leading-normal text-gray-900">
            การแจ้งเตือนงาน
          </h2>
          <p className="text-sm text-gray-500 mt-1">Job Notifications</p>
        </div>

        <Separator />

        {/* Email Job Recommendations Toggle */}
        <div className="flex items-start justify-between">
          <div className="flex-1 pr-4">
            <Label
              htmlFor="email-job-recommendations-toggle"
              className="text-base font-medium text-gray-900 cursor-pointer"
            >
              รับงานแนะนำทางอีเมล
            </Label>
            <p className="text-sm text-gray-500 mt-1">
              รับอีเมลแนะนำงานที่ตรงกับโปรไฟล์ของคุณ
            </p>
            <p className="text-xs text-gray-400 mt-0.5">
              Receive job recommendations via email
            </p>
          </div>

          <div className="flex items-center gap-2">
            {isSavingEmail && (
              <Loader2 className="w-4 h-4 animate-spin text-secondary-600" />
            )}
            <Switch
              id="email-job-recommendations-toggle"
              checked={emailJobRecommendations}
              onCheckedChange={onToggleEmail}
              disabled={isSavingEmail}
            />
          </div>
        </div>

        {/* Push Notifications - Coming Soon (Deferred to Phase 2) */}
        <div className="pt-4 border-t border-gray-200">
          <div className="flex items-start justify-between opacity-50">
            <div className="flex-1 pr-4">
              <Label className="text-base font-medium text-gray-900">
                รับการแจ้งเตือนแบบ Push
              </Label>
              <p className="text-sm text-gray-500 mt-1">
                เปิดการแจ้งเตือนแบบ push บนอุปกรณ์ของคุณ
              </p>
              <p className="text-xs text-gray-400 mt-0.5">
                Receive push notifications
              </p>
              <p className="text-xs text-amber-600 mt-2 font-medium">
                เร็วๆ นี้ (Coming soon)
              </p>
            </div>

            <Switch disabled />
          </div>
        </div>
      </div>
    </Card>
  );
}
