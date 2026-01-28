/**
 * Notification Preferences Types
 * Extracted from notification-preferences.ts for Next.js 15+ compatibility
 * "use server" files can only export async functions
 */

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
