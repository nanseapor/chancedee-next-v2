"use client";

import { useState } from "react";
import { useFirebaseAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { webUserDataPropsGetById } from "@/lib/database/actions/user-data-props";
import {
  updateUserNotificationPreferences,
  type NotificationPreferences,
} from "@/domains/authentication/services/server/actions/jobsmarket/notification-preferences";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/domains/authentication/services/server/actions/jobsmarket/notification-preferences.types";
import { Card } from "@/components/ui/card";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { useToast } from "@/hooks/use-toast-notification";

export function NotificationsTab() {
  const { user: firebaseUser } = useFirebaseAuth();
  const { addToast } = useToast();
  const [isUpdating, setIsUpdating] = useState<string | null>(null);

  // Fetch user data
  const { data: user, mutate } = useSWR(
    firebaseUser?.uid ? ["user-data", firebaseUser.uid] : null,
    ([, uid]) => webUserDataPropsGetById(uid)
  );

  // Type assertion: notification_preferences is a new field we're adding to the schema
  const preferences: NotificationPreferences =
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (user as any)?.notification_preferences || DEFAULT_NOTIFICATION_PREFERENCES;

  // Handle toggle change
  async function handleToggle(
    category: "email" | "push",
    key: string,
    checked: boolean
  ) {
    if (!firebaseUser?.uid) return;

    const toggleKey = `${category}.${key}`;
    setIsUpdating(toggleKey);

    const updatedPreferences: NotificationPreferences = {
      ...preferences,
      [category]: {
        ...preferences[category],
        [key]: checked,
      },
    };

    const result = await updateUserNotificationPreferences(
      firebaseUser.uid,
      updatedPreferences
    );

    if (result.success) {
      // Update local cache
      mutate();
      addToast("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
    } else {
      addToast(result.error || "ไม่สามารถบันทึกการตั้งค่าได้", "error");
    }

    setIsUpdating(null);
  }

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-semibold">การแจ้งเตือน</h3>
        <p className="text-sm text-muted-foreground">Notifications</p>
      </div>

      {/* Email Notifications */}
      <div className="space-y-3">
        <h4 className="text-base font-medium">การแจ้งเตือนทางอีเมล</h4>
        <p className="text-sm text-muted-foreground">Email Notifications</p>

        <Card className="divide-y">
          {/* New Jobs */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="email-newJobs" className="text-base font-medium">
                งานที่แนะนำ
              </Label>
              <p className="text-sm text-muted-foreground">
                รับอีเมลแนะนำงานที่ตรงกับโปรไฟล์ของคุณ
              </p>
              <p className="text-xs text-muted-foreground">
                Job Recommendations
              </p>
            </div>
            <Switch
              id="email-newJobs"
              checked={preferences.email.newJobs}
              onCheckedChange={(checked) =>
                handleToggle("email", "newJobs", checked)
              }
              disabled={isUpdating === "email.newJobs"}
            />
          </div>

          {/* Application Updates */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label
                htmlFor="email-applicationUpdates"
                className="text-base font-medium"
              >
                อัปเดตใบสมัคร
              </Label>
              <p className="text-sm text-muted-foreground">
                รับแจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง
              </p>
              <p className="text-xs text-muted-foreground">
                Application Status Updates
              </p>
            </div>
            <Switch
              id="email-applicationUpdates"
              checked={preferences.email.applicationUpdates}
              onCheckedChange={(checked) =>
                handleToggle("email", "applicationUpdates", checked)
              }
              disabled={isUpdating === "email.applicationUpdates"}
            />
          </div>

          {/* Interview Reminders */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label
                htmlFor="email-interviewReminders"
                className="text-base font-medium"
              >
                การนัดสัมภาษณ์
              </Label>
              <p className="text-sm text-muted-foreground">
                รับแจ้งเตือนการนัดสัมภาษณ์และเตือนความจำ
              </p>
              <p className="text-xs text-muted-foreground">
                Interview Scheduling & Reminders
              </p>
            </div>
            <Switch
              id="email-interviewReminders"
              checked={preferences.email.interviewReminders}
              onCheckedChange={(checked) =>
                handleToggle("email", "interviewReminders", checked)
              }
              disabled={isUpdating === "email.interviewReminders"}
            />
          </div>

          {/* Weekly Digest */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label
                htmlFor="email-weeklyDigest"
                className="text-base font-medium"
              >
                สรุปรายสัปดาห์
              </Label>
              <p className="text-sm text-muted-foreground">
                รับอีเมลสรุปกิจกรรมทุกสัปดาห์
              </p>
              <p className="text-xs text-muted-foreground">Weekly Summary</p>
            </div>
            <Switch
              id="email-weeklyDigest"
              checked={preferences.email.weeklyDigest}
              onCheckedChange={(checked) =>
                handleToggle("email", "weeklyDigest", checked)
              }
              disabled={isUpdating === "email.weeklyDigest"}
            />
          </div>

          {/* Marketing */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="email-marketing" className="text-base font-medium">
                ข่าวสารและโปรโมชั่น
              </Label>
              <p className="text-sm text-muted-foreground">
                รับข่าวสารและโปรโมชั่นจาก ChanceDee
              </p>
              <p className="text-xs text-muted-foreground">
                News & Promotions
              </p>
            </div>
            <Switch
              id="email-marketing"
              checked={preferences.email.marketing}
              onCheckedChange={(checked) =>
                handleToggle("email", "marketing", checked)
              }
              disabled={isUpdating === "email.marketing"}
            />
          </div>
        </Card>
      </div>

      <Separator />

      {/* Push Notifications */}
      <div className="space-y-3">
        <h4 className="text-base font-medium">การแจ้งเตือนแบบพุช</h4>
        <p className="text-sm text-muted-foreground">Push Notifications</p>

        <Card className="divide-y">
          {/* New Messages */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label htmlFor="push-newMessages" className="text-base font-medium">
                ข้อความใหม่
              </Label>
              <p className="text-sm text-muted-foreground">
                รับแจ้งเตือนเมื่อมีข้อความใหม่ในแชท
              </p>
              <p className="text-xs text-muted-foreground">New Messages</p>
            </div>
            <Switch
              id="push-newMessages"
              checked={preferences.push.newMessages}
              onCheckedChange={(checked) =>
                handleToggle("push", "newMessages", checked)
              }
              disabled={isUpdating === "push.newMessages"}
            />
          </div>

          {/* Application Updates */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label
                htmlFor="push-applicationUpdates"
                className="text-base font-medium"
              >
                อัปเดตใบสมัคร
              </Label>
              <p className="text-sm text-muted-foreground">
                รับแจ้งเตือนเมื่อสถานะใบสมัครเปลี่ยนแปลง
              </p>
              <p className="text-xs text-muted-foreground">
                Application Status Updates
              </p>
            </div>
            <Switch
              id="push-applicationUpdates"
              checked={preferences.push.applicationUpdates}
              onCheckedChange={(checked) =>
                handleToggle("push", "applicationUpdates", checked)
              }
              disabled={isUpdating === "push.applicationUpdates"}
            />
          </div>

          {/* Interview Reminders */}
          <div className="flex items-start justify-between p-4">
            <div className="space-y-1 pr-4">
              <Label
                htmlFor="push-interviewReminders"
                className="text-base font-medium"
              >
                การนัดสัมภาษณ์
              </Label>
              <p className="text-sm text-muted-foreground">
                รับแจ้งเตือนการนัดสัมภาษณ์
              </p>
              <p className="text-xs text-muted-foreground">
                Interview Alerts
              </p>
            </div>
            <Switch
              id="push-interviewReminders"
              checked={preferences.push.interviewReminders}
              onCheckedChange={(checked) =>
                handleToggle("push", "interviewReminders", checked)
              }
              disabled={isUpdating === "push.interviewReminders"}
            />
          </div>
        </Card>
      </div>
    </div>
  );
}
