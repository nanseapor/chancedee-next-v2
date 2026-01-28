"use client";

import { Switch } from "@/components/ui/switch";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Loader2 } from "lucide-react";

// ============================================
// Types
// ============================================

interface NotificationSettingsData {
  notify_new_application?: boolean;
  daily_summary_enabled?: boolean;
  daily_summary_time?: string;
  interview_reminder_hours?: number;
}

interface NotificationSettingsProps {
  settings: NotificationSettingsData;
  onToggle: (key: keyof NotificationSettingsData, value: boolean | string | number) => void;
  disabled: boolean;
  loadingToggles?: Partial<Record<keyof NotificationSettingsData, boolean>>;
}

// ============================================
// Component
// ============================================

export function NotificationSettings({
  settings,
  onToggle,
  disabled,
  loadingToggles = {},
}: NotificationSettingsProps) {
  return (
    <div className="space-y-6">
      {/* Notify New Application */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="notify-new-application" className="text-base">
            แจ้งเตือนใบสมัครใหม่
          </Label>
          <p className="text-sm text-gray-500">
            รับการแจ้งเตือนเมื่อมีผู้สมัครงานใหม่
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loadingToggles.notify_new_application && (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-500"
              data-testid="toggle-loading-notify_new_application"
            />
          )}
          <Switch
            id="notify-new-application"
            checked={settings.notify_new_application ?? true}
            onCheckedChange={(checked) => onToggle("notify_new_application", checked)}
            disabled={disabled || loadingToggles.notify_new_application}
            aria-label="แจ้งเตือนใบสมัครใหม่"
          />
        </div>
      </div>

      {/* Daily Summary */}
      <div className="rounded-lg border p-4 space-y-4">
        <div className="flex items-center justify-between">
          <div className="space-y-0.5">
            <Label htmlFor="daily-summary" className="text-base">
              สรุปรายวัน
            </Label>
            <p className="text-sm text-gray-500">
              รับอีเมลสรุปใบสมัครและกิจกรรมประจำวัน
            </p>
          </div>
          <div className="flex items-center gap-2">
            {loadingToggles.daily_summary_enabled && (
              <Loader2
                className="h-4 w-4 animate-spin text-gray-500"
                data-testid="toggle-loading-daily_summary_enabled"
              />
            )}
            <Switch
              id="daily-summary"
              checked={settings.daily_summary_enabled ?? false}
              onCheckedChange={(checked) => onToggle("daily_summary_enabled", checked)}
              disabled={disabled || loadingToggles.daily_summary_enabled}
              aria-label="สรุปรายวัน"
            />
          </div>
        </div>

        {/* Time Picker - Only show when daily summary is enabled */}
        {settings.daily_summary_enabled && (
          <div className="ml-0 space-y-2">
            <Label htmlFor="daily-summary-time" className="text-sm text-gray-700">
              เวลาส่งสรุป
            </Label>
            <Input
              id="daily-summary-time"
              type="time"
              value={settings.daily_summary_time || "09:00"}
              onChange={(e) => onToggle("daily_summary_time", e.target.value)}
              disabled={disabled}
              className="w-32"
              aria-label="เวลาส่งสรุป"
            />
          </div>
        )}
      </div>

      {/* Interview Reminder */}
      <div className="flex items-center justify-between rounded-lg border p-4">
        <div className="space-y-0.5">
          <Label htmlFor="interview-reminder" className="text-base">
            เตือนก่อนสัมภาษณ์
          </Label>
          <p className="text-sm text-gray-500">
            รับการแจ้งเตือนก่อนนัดสัมภาษณ์
          </p>
        </div>
        <div className="flex items-center gap-2">
          {loadingToggles.interview_reminder_hours && (
            <Loader2
              className="h-4 w-4 animate-spin text-gray-500"
              data-testid="toggle-loading-interview_reminder_hours"
            />
          )}
          <Select
            value={String(settings.interview_reminder_hours ?? 24)}
            onValueChange={(value) => onToggle("interview_reminder_hours", parseInt(value, 10))}
            disabled={disabled || loadingToggles.interview_reminder_hours}
          >
            <SelectTrigger id="interview-reminder" className="w-[140px]">
              <SelectValue placeholder="เลือกเวลา" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1">1 ชั่วโมงก่อน</SelectItem>
              <SelectItem value="2">2 ชั่วโมงก่อน</SelectItem>
              <SelectItem value="6">6 ชั่วโมงก่อน</SelectItem>
              <SelectItem value="12">12 ชั่วโมงก่อน</SelectItem>
              <SelectItem value="24">24 ชั่วโมงก่อน</SelectItem>
              <SelectItem value="48">48 ชั่วโมงก่อน</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
    </div>
  );
}
