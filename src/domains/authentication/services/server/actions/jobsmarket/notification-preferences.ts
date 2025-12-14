"use server";

import { webUserDataPropsUpdate } from "@/lib/database/actions/user-data-props";

export interface NotificationPreferences {
  email: {
    newJobs: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
    weeklyDigest: boolean;
    marketing: boolean;
  };
  push: {
    newMessages: boolean;
    applicationUpdates: boolean;
    interviewReminders: boolean;
  };
}

export const DEFAULT_NOTIFICATION_PREFERENCES: NotificationPreferences = {
  email: {
    newJobs: true,
    applicationUpdates: true,
    interviewReminders: true,
    weeklyDigest: false,
    marketing: false,
  },
  push: {
    newMessages: true,
    applicationUpdates: true,
    interviewReminders: true,
  },
};

export async function updateUserNotificationPreferences(
  uid: string,
  preferences: NotificationPreferences
) {
  try {
    // Type assertion: notification_preferences is a new field we're adding to the schema
    await webUserDataPropsUpdate(uid, {
      notification_preferences: preferences,
    } as any);
    return { success: true };
  } catch (error) {
    return { success: false, error: (error as Error).message };
  }
}
