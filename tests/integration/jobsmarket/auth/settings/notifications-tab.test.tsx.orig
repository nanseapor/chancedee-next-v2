import { describe, it, expect, vi, beforeEach } from "vitest";
import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { NotificationsTab } from "@/app/jobsmarket/auth/settings/_components/NotificationsTab";

// Mock dependencies
vi.mock("@/hooks/use-auth", () => ({
  useFirebaseAuth: vi.fn(),
}));

vi.mock("swr", () => ({
  default: vi.fn(),
}));

vi.mock("@/hooks/use-toast-notification", () => ({
  useToast: vi.fn(),
}));

vi.mock("@/domains/authentication/services/server/actions/jobsmarket/notification-preferences", () => ({
  updateUserNotificationPreferences: vi.fn(),
  DEFAULT_NOTIFICATION_PREFERENCES: {
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
  },
}));

import { useFirebaseAuth } from "@/hooks/use-auth";
import useSWR from "swr";
import { useToast } from "@/hooks/use-toast-notification";
import { updateUserNotificationPreferences } from "@/domains/authentication/services/server/actions/jobsmarket/notification-preferences";

/**
 * Integration tests for AUTH-R06 Settings Notifications Tab
 * Tests notification preferences display and toggle functionality
 */

describe("NotificationsTab Component", () => {
  const mockAddToast = vi.fn();
  const mockMutate = vi.fn();

  beforeEach(() => {
    vi.clearAllMocks();

    vi.mocked(useFirebaseAuth).mockReturnValue({
      user: {
        uid: "test-uid",
        email: "test@example.com",
      } as any,
      loading: false,
      isAuthenticated: true,
    });

    vi.mocked(useToast).mockReturnValue({
      addToast: mockAddToast,
    } as any);

    vi.mocked(useSWR).mockReturnValue({
      data: {
        uid: "test-uid",
        info: { roles: ["candidate"] },
        notification_preferences: {
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
        },
      },
      mutate: mockMutate,
    } as any);
  });

  describe("Email notifications section", () => {
    it("should render email notifications heading", () => {
      render(<NotificationsTab />);

      expect(screen.getByText("การแจ้งเตือนทางอีเมล")).toBeInTheDocument();
      expect(screen.getByText("Email Notifications")).toBeInTheDocument();
    });

    it("should render all 5 email notification options", () => {
      render(<NotificationsTab />);

      expect(screen.getByText("งานที่แนะนำ")).toBeInTheDocument();
      expect(screen.getByText("อัปเดตใบสมัคร")).toBeInTheDocument();
      expect(screen.getByText("การนัดสัมภาษณ์")).toBeInTheDocument();
      expect(screen.getByText("สรุปรายสัปดาห์")).toBeInTheDocument();
      expect(screen.getByText("ข่าวสารและโปรโมชั่น")).toBeInTheDocument();
    });

    it("should show correct initial switch states for email preferences", () => {
      render(<NotificationsTab />);

      const newJobsSwitch = screen.getByRole("switch", { name: /งานที่แนะนำ/i });
      const applicationUpdatesSwitch = screen.getAllByRole("switch", { name: /อัปเดตใบสมัคร/i })[0];
      const interviewRemindersSwitch = screen.getAllByRole("switch", { name: /การนัดสัมภาษณ์/i })[0];
      const weeklyDigestSwitch = screen.getByRole("switch", { name: /สรุปรายสัปดาห์/i });
      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });

      expect(newJobsSwitch).toBeChecked();
      expect(applicationUpdatesSwitch).toBeChecked();
      expect(interviewRemindersSwitch).toBeChecked();
      expect(weeklyDigestSwitch).not.toBeChecked();
      expect(marketingSwitch).not.toBeChecked();
    });
  });

  describe("Push notifications section", () => {
    it("should render push notifications heading", () => {
      render(<NotificationsTab />);

      expect(screen.getByText("การแจ้งเตือนแบบพุช")).toBeInTheDocument();
      expect(screen.getByText("Push Notifications")).toBeInTheDocument();
    });

    it("should render all 3 push notification options", () => {
      render(<NotificationsTab />);

      expect(screen.getByText("ข้อความใหม่")).toBeInTheDocument();
      // อัปเดตใบสมัคร appears in both email and push sections
      const applicationUpdates = screen.getAllByText("อัปเดตใบสมัคร");
      expect(applicationUpdates).toHaveLength(2);
    });

    it("should show correct initial switch states for push preferences", () => {
      render(<NotificationsTab />);

      const newMessagesSwitch = screen.getByRole("switch", { name: /ข้อความใหม่/i });
      const applicationUpdatesSwitch = screen.getAllByRole("switch", { name: /อัปเดตใบสมัคร/i })[1];
      const interviewRemindersSwitch = screen.getAllByRole("switch", { name: /การนัดสัมภาษณ์/i })[1];

      expect(newMessagesSwitch).toBeChecked();
      expect(applicationUpdatesSwitch).toBeChecked();
      expect(interviewRemindersSwitch).toBeChecked();
    });
  });

  describe("Toggle functionality", () => {
    it("should call updateUserNotificationPreferences when toggling email preference", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({ success: true });

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      await user.click(marketingSwitch);

      await waitFor(() => {
        expect(updateUserNotificationPreferences).toHaveBeenCalledWith(
          "test-uid",
          expect.objectContaining({
            email: expect.objectContaining({
              marketing: true,
            }),
          })
        );
      });
    });

    it("should call updateUserNotificationPreferences when toggling push preference", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({ success: true });

      render(<NotificationsTab />);

      const newMessagesSwitch = screen.getByRole("switch", { name: /ข้อความใหม่/i });
      await user.click(newMessagesSwitch);

      await waitFor(() => {
        expect(updateUserNotificationPreferences).toHaveBeenCalledWith(
          "test-uid",
          expect.objectContaining({
            push: expect.objectContaining({
              newMessages: false,
            }),
          })
        );
      });
    });

    it("should show success toast when toggle succeeds", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({ success: true });

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      await user.click(marketingSwitch);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith("บันทึกการตั้งค่าเรียบร้อยแล้ว", "success");
      });
    });

    it("should show error toast when toggle fails", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({
        success: false,
        error: "Database error",
      });

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      await user.click(marketingSwitch);

      await waitFor(() => {
        expect(mockAddToast).toHaveBeenCalledWith("Database error", "error");
      });
    });

    it("should mutate SWR cache after successful toggle", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({ success: true });

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      await user.click(marketingSwitch);

      await waitFor(() => {
        expect(mockMutate).toHaveBeenCalled();
      });
    });

    it("should disable switch while update is in progress", async () => {
      const user = userEvent.setup();
      let resolveUpdate: (value: any) => void;
      const updatePromise = new Promise((resolve) => {
        resolveUpdate = resolve;
      });
      vi.mocked(updateUserNotificationPreferences).mockReturnValue(updatePromise as any);

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      await user.click(marketingSwitch);

      expect(marketingSwitch).toBeDisabled();

      resolveUpdate!({ success: true });
      await waitFor(() => {
        expect(marketingSwitch).not.toBeDisabled();
      });
    });
  });

  describe("Default preferences fallback", () => {
    it("should use DEFAULT_NOTIFICATION_PREFERENCES when user data has no preferences", () => {
      vi.mocked(useSWR).mockReturnValue({
        data: {
          uid: "test-uid",
          info: { roles: ["candidate"] },
          // No notification_preferences field
        },
        mutate: mockMutate,
      } as any);

      render(<NotificationsTab />);

      // Should show default values
      const newJobsSwitch = screen.getByRole("switch", { name: /งานที่แนะนำ/i });
      const weeklyDigestSwitch = screen.getByRole("switch", { name: /สรุปรายสัปดาห์/i });
      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });

      expect(newJobsSwitch).toBeChecked(); // default: true
      expect(weeklyDigestSwitch).not.toBeChecked(); // default: false
      expect(marketingSwitch).not.toBeChecked(); // default: false
    });
  });

  describe("Multiple toggle operations", () => {
    it("should handle toggling multiple preferences sequentially", async () => {
      const user = userEvent.setup();
      vi.mocked(updateUserNotificationPreferences).mockResolvedValue({ success: true });

      render(<NotificationsTab />);

      const marketingSwitch = screen.getByRole("switch", { name: /ข่าวสารและโปรโมชั่น/i });
      const weeklyDigestSwitch = screen.getByRole("switch", { name: /สรุปรายสัปดาห์/i });

      await user.click(marketingSwitch);
      await waitFor(() => {
        expect(updateUserNotificationPreferences).toHaveBeenCalledTimes(1);
      });

      await user.click(weeklyDigestSwitch);
      await waitFor(() => {
        expect(updateUserNotificationPreferences).toHaveBeenCalledTimes(2);
      });
    });
  });
});
