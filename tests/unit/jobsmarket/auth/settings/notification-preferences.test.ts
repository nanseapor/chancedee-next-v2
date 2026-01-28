import { describe, it, expect, vi, beforeEach } from "vitest";
import {
  updateUserNotificationPreferences,
  type NotificationPreferences,
} from "@/domains/authentication/services/server/actions/jobsmarket/notification-preferences";
import { DEFAULT_NOTIFICATION_PREFERENCES } from "@/domains/authentication/services/server/actions/jobsmarket/notification-preferences.types";
import { webUserDataPropsUpdate } from "@/lib/database/actions/user-data-props";

// Mock the database action
vi.mock("@/lib/database/actions/user-data-props", () => ({
  webUserDataPropsUpdate: vi.fn(),
}));

/**
 * Unit tests for AUTH-R06 Settings Notification Preferences
 * Tests notification preference structure and update logic
 */

describe("Notification Preferences", () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe("DEFAULT_NOTIFICATION_PREFERENCES structure", () => {
    it("should have correct email preference defaults", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.email).toEqual({
        newJobs: true,
        applicationUpdates: true,
        interviewReminders: true,
        weeklyDigest: false,
        marketing: false,
      });
    });

    it("should have correct push preference defaults", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.push).toEqual({
        newMessages: true,
        applicationUpdates: true,
        interviewReminders: true,
      });
    });

    it("should have all required email notification types", () => {
      const emailKeys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES.email);
      expect(emailKeys).toContain("newJobs");
      expect(emailKeys).toContain("applicationUpdates");
      expect(emailKeys).toContain("interviewReminders");
      expect(emailKeys).toContain("weeklyDigest");
      expect(emailKeys).toContain("marketing");
    });

    it("should have all required push notification types", () => {
      const pushKeys = Object.keys(DEFAULT_NOTIFICATION_PREFERENCES.push);
      expect(pushKeys).toContain("newMessages");
      expect(pushKeys).toContain("applicationUpdates");
      expect(pushKeys).toContain("interviewReminders");
    });

    it("should default marketing emails to false (opt-in)", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.email.marketing).toBe(false);
    });

    it("should default weeklyDigest to false (opt-in)", () => {
      expect(DEFAULT_NOTIFICATION_PREFERENCES.email.weeklyDigest).toBe(false);
    });
  });

  describe("updateUserNotificationPreferences", () => {
    const mockUid = "test-user-123";

    it("should call webUserDataPropsUpdate with correct parameters", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
      };

      await updateUserNotificationPreferences(mockUid, preferences);

      expect(webUserDataPropsUpdate).toHaveBeenCalledWith(mockUid, {
        notification_preferences: preferences,
      });
    });

    it("should return success: true when update succeeds", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result).toEqual({ success: true });
    });

    it("should return error when update fails", async () => {
      const errorMessage = "Database connection failed";
      vi.mocked(webUserDataPropsUpdate).mockRejectedValue(new Error(errorMessage));

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result).toEqual({
        success: false,
        error: errorMessage,
      });
    });

    it("should handle partial email preference updates", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        email: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.email,
          marketing: true, // User opts in to marketing
        },
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result.success).toBe(true);
      expect(webUserDataPropsUpdate).toHaveBeenCalledWith(mockUid, {
        notification_preferences: preferences,
      });
    });

    it("should handle partial push preference updates", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        ...DEFAULT_NOTIFICATION_PREFERENCES,
        push: {
          ...DEFAULT_NOTIFICATION_PREFERENCES.push,
          newMessages: false, // User turns off new message alerts
        },
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result.success).toBe(true);
      expect(webUserDataPropsUpdate).toHaveBeenCalledWith(mockUid, {
        notification_preferences: preferences,
      });
    });

    it("should handle all preferences disabled", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        email: {
          newJobs: false,
          applicationUpdates: false,
          interviewReminders: false,
          weeklyDigest: false,
          marketing: false,
        },
        push: {
          newMessages: false,
          applicationUpdates: false,
          interviewReminders: false,
        },
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result.success).toBe(true);
    });

    it("should handle all preferences enabled", async () => {
      vi.mocked(webUserDataPropsUpdate).mockResolvedValue(undefined);

      const preferences: NotificationPreferences = {
        email: {
          newJobs: true,
          applicationUpdates: true,
          interviewReminders: true,
          weeklyDigest: true,
          marketing: true,
        },
        push: {
          newMessages: true,
          applicationUpdates: true,
          interviewReminders: true,
        },
      };

      const result = await updateUserNotificationPreferences(mockUid, preferences);

      expect(result.success).toBe(true);
    });
  });

  describe("Preference toggle logic", () => {
    it("should correctly toggle single email preference", () => {
      const currentPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
      const category = "email";
      const key = "marketing";
      const checked = true;

      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        [category]: {
          ...currentPreferences[category],
          [key]: checked,
        },
      };

      expect(updatedPreferences.email.marketing).toBe(true);
      expect(updatedPreferences.email.newJobs).toBe(DEFAULT_NOTIFICATION_PREFERENCES.email.newJobs);
    });

    it("should correctly toggle single push preference", () => {
      const currentPreferences = { ...DEFAULT_NOTIFICATION_PREFERENCES };
      const category = "push";
      const key = "newMessages";
      const checked = false;

      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        [category]: {
          ...currentPreferences[category],
          [key]: checked,
        },
      };

      expect(updatedPreferences.push.newMessages).toBe(false);
      expect(updatedPreferences.push.applicationUpdates).toBe(DEFAULT_NOTIFICATION_PREFERENCES.push.applicationUpdates);
    });

    it("should preserve other preferences when toggling one", () => {
      const currentPreferences: NotificationPreferences = {
        email: {
          newJobs: false,
          applicationUpdates: true,
          interviewReminders: false,
          weeklyDigest: true,
          marketing: false,
        },
        push: {
          newMessages: true,
          applicationUpdates: false,
          interviewReminders: true,
        },
      };

      const updatedPreferences: NotificationPreferences = {
        ...currentPreferences,
        email: {
          ...currentPreferences.email,
          marketing: true, // Toggle this one
        },
      };

      // Check the toggled value
      expect(updatedPreferences.email.marketing).toBe(true);

      // Check all other values remain unchanged
      expect(updatedPreferences.email.newJobs).toBe(false);
      expect(updatedPreferences.email.applicationUpdates).toBe(true);
      expect(updatedPreferences.email.interviewReminders).toBe(false);
      expect(updatedPreferences.email.weeklyDigest).toBe(true);
      expect(updatedPreferences.push).toEqual(currentPreferences.push);
    });
  });
});
