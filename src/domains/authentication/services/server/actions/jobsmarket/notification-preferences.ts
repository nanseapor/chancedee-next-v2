"use server";

import { webUserDataPropsUpdate } from "@/lib/database/actions/user-data-props";
import type { NotificationPreferences } from "./notification-preferences.types";

// Re-export types for consumers (only type exports allowed in "use server" files)
export type { NotificationPreferences } from "./notification-preferences.types";
// Note: DEFAULT_NOTIFICATION_PREFERENCES must be imported directly from ./notification-preferences.types

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
