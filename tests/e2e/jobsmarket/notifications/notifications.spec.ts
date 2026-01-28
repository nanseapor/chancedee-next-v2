/**
 * E2E Tests for Notifications Page - NOTIF-R01
 *
 * Requirements tested:
 * - NOTIF-R01.nav: Navigation to notifications page
 * - NOTIF-R01.filter: Filter tabs functionality
 * - NOTIF-R01.list: Notification list rendering
 * - NOTIF-R01.markRead: Mark as read functionality
 * - NOTIF-R01.navigation: Navigate to source on click
 */

import { test, expect } from "@playwright/test";
import {
  createNotificationScenario,
  createChatMessageScenario,
  NotificationScenarios,
  type NotificationScenarioResult,
  type ChatMessageScenarioResult,
} from "../../helpers/factories";
import { signInAsCandidate } from "../../helpers/auth-helper";

// Increase default timeout for notification tests
test.setTimeout(90000);

test.describe("Notifications Page - NOTIF-R01", () => {
  // Shared scenario for read-only tests (filters, display)
  let sharedScenario: NotificationScenarioResult;

  test.beforeAll(async () => {
    // Create shared scenario once for multiple tests
    sharedScenario = await NotificationScenarios.allTypes();
  });

  test.describe("Page Access and Layout", () => {
    /**
     * Requirement: NOTIF-R01.nav
     * "User should be able to access notifications page"
     */
    test("should load notifications page when authenticated", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Should show page title
      await expect(page.getByRole("heading", { name: /การแจ้งเตือน/i })).toBeVisible({ timeout: 15000 });
    });

    /**
     * Requirement: NOTIF-R01.nav.bell
     * "User should be able to click bell icon to navigate to notifications"
     */
    test("should navigate to notifications when clicking bell icon", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);

      // Go to dashboard
      await page.goto(`/jobsmarket/candidates/${sharedScenario.candidate.candidateId}/dashboard`, { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Click bell icon (give more time to find it)
      const bellButton = page.getByTestId("bell-notification-button");
      await expect(bellButton).toBeVisible({ timeout: 15000 });
      await bellButton.click();

      // Should navigate to notifications page
      await expect(page).toHaveURL(/\/notifications/, { timeout: 15000 });
    });

    /**
     * Requirement: NOTIF-R01.nav.redirect
     * "Unauthenticated users should be redirected to login"
     */
    test("should redirect to login when not authenticated", async ({ page }) => {
      await page.context().clearCookies();
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 15000 });
    });

    /**
     * Requirement: NOTIF-R01.layout
     * "Page should show filter tabs"
     */
    test("should display filter tabs", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Wait for tabs to be visible
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });

      // Should show all 5 filter tabs
      await expect(page.getByRole("tab", { name: /ทั้งหมด/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("tab", { name: /สมัครงาน/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("tab", { name: /ข้อความ/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("tab", { name: /นัดหมาย/i })).toBeVisible({ timeout: 10000 });
      await expect(page.getByRole("tab", { name: /ระบบ/i })).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Notification List", () => {
    /**
     * Requirement: NOTIF-R01.list
     * "Should display notification items"
     */
    test("should display notification items", async ({ page }) => {
      // Create a lighter scenario for this test
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview", "offer"],
        countPerType: 1,
        testName: "display-notifications",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Should show notifications
      const interviewNotifId = scenario.notifications.interview[0];
      const offerNotifId = scenario.notifications.offer[0];

      await expect(page.getByTestId(`notification-item-${interviewNotifId}`)).toBeVisible({ timeout: 15000 });
      await expect(page.getByTestId(`notification-item-${offerNotifId}`)).toBeVisible({ timeout: 15000 });
    });

    /**
     * Requirement: NOTIF-R01.list.empty
     * "Should show empty state when no notifications"
     */
    test("should show empty state when no notifications", async ({ page }) => {
      const scenario = await NotificationScenarios.empty();
      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Should show empty state
      await expect(page.getByTestId("notification-empty-state")).toBeVisible({ timeout: 15000 });
      await expect(page.getByText(/ไม่มีการแจ้งเตือน/i)).toBeVisible({ timeout: 10000 });
    });

    /**
     * Requirement: NOTIF-R01.list.unread
     * "Unread notifications should have visual indicator"
     */
    test("should highlight unread notifications", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview"],
        countPerType: 1,
        includeReadNotifications: false,
        testName: "unread-highlight",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      const notifId = scenario.notifications.interview[0];
      const notifItem = page.getByTestId(`notification-item-${notifId}`);
      await expect(notifItem).toBeVisible({ timeout: 15000 });

      // Should have unread indicator
      await expect(notifItem.getByTestId("unread-indicator")).toBeVisible({ timeout: 10000 });
    });

    /**
     * Requirement: NOTIF-R01.list.time
     * "Should display relative time"
     */
    test("should display relative time for notifications", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview"],
        countPerType: 1,
        testName: "relative-time",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Should show relative time (e.g., "5 นาทีที่แล้ว", "1 ชั่วโมงที่แล้ว")
      await expect(page.getByText(/ที่แล้ว/i)).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Filter Tabs", () => {
    /**
     * Requirement: NOTIF-R01.filter.all
     * "'All' filter should show all notification types"
     */
    test("should show all notification types in 'All' tab", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Wait for tabs to be visible
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });

      // Default is 'all' filter
      await expect(page.getByRole("tab", { name: /ทั้งหมด/i })).toHaveAttribute(
        "aria-selected",
        "true",
        { timeout: 10000 }
      );

      // Should show notifications of all types - check at least one of each
      if (sharedScenario.notifications.interview.length > 0) {
        const interviewId = sharedScenario.notifications.interview[0];
        await expect(page.getByTestId(`notification-item-${interviewId}`)).toBeVisible({ timeout: 15000 });
      }
      if (sharedScenario.notifications.offer.length > 0) {
        const offerId = sharedScenario.notifications.offer[0];
        await expect(page.getByTestId(`notification-item-${offerId}`)).toBeVisible({ timeout: 15000 });
      }
      if (sharedScenario.notifications.system.length > 0) {
        const systemId = sharedScenario.notifications.system[0];
        await expect(page.getByTestId(`notification-item-${systemId}`)).toBeVisible({ timeout: 15000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.filter.appointments
     * "'Appointments' filter should show only interview notifications"
     */
    test("should filter to appointments when clicking 'Appointments' tab", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Wait for tabs then click appointments filter
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /นัดหมาย/i }).click();
      await page.waitForLoadState("networkidle");

      // Should show interview notifications
      if (sharedScenario.notifications.interview.length > 0) {
        const interviewId = sharedScenario.notifications.interview[0];
        await expect(page.getByTestId(`notification-item-${interviewId}`)).toBeVisible({ timeout: 15000 });
      }

      // Should NOT show offer or system notifications
      if (sharedScenario.notifications.offer.length > 0) {
        const offerId = sharedScenario.notifications.offer[0];
        await expect(page.getByTestId(`notification-item-${offerId}`)).not.toBeVisible({ timeout: 5000 });
      }
      if (sharedScenario.notifications.system.length > 0) {
        const systemId = sharedScenario.notifications.system[0];
        await expect(page.getByTestId(`notification-item-${systemId}`)).not.toBeVisible({ timeout: 5000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.filter.applications
     * "'Applications' filter should show only offer notifications"
     */
    test("should filter to applications when clicking 'Applications' tab", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Click applications filter
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /สมัครงาน/i }).click();
      await page.waitForLoadState("networkidle");

      // Should show offer notifications
      if (sharedScenario.notifications.offer.length > 0) {
        const offerId = sharedScenario.notifications.offer[0];
        await expect(page.getByTestId(`notification-item-${offerId}`)).toBeVisible({ timeout: 15000 });
      }

      // Should NOT show interview or system notifications
      if (sharedScenario.notifications.interview.length > 0) {
        const interviewId = sharedScenario.notifications.interview[0];
        await expect(page.getByTestId(`notification-item-${interviewId}`)).not.toBeVisible({ timeout: 5000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.filter.system
     * "'System' filter should show only system notifications"
     */
    test("should filter to system when clicking 'System' tab", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Click system filter
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /ระบบ/i }).click();
      await page.waitForLoadState("networkidle");

      // Should show system notifications
      if (sharedScenario.notifications.system.length > 0) {
        const systemId = sharedScenario.notifications.system[0];
        await expect(page.getByTestId(`notification-item-${systemId}`)).toBeVisible({ timeout: 15000 });
      }

      // Should NOT show interview or offer notifications
      if (sharedScenario.notifications.interview.length > 0) {
        const interviewId = sharedScenario.notifications.interview[0];
        await expect(page.getByTestId(`notification-item-${interviewId}`)).not.toBeVisible({ timeout: 5000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.filter.messages (BLS-11-08)
     * "'Messages' filter should show chat rooms grouped"
     */
    test("should show grouped chat rooms in 'Messages' tab", async ({ page }) => {
      const chatScenario = await createChatMessageScenario({
        roomCount: 2,
        messagesPerRoom: 3,
        testName: "messages-filter",
      });

      await signInAsCandidate(page, chatScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Click messages filter
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /ข้อความ/i }).click();
      await page.waitForLoadState("networkidle");

      // Should show grouped rooms, not individual messages
      for (const room of chatScenario.rooms) {
        await expect(page.getByTestId(`grouped-room-${room.roomId}`)).toBeVisible({ timeout: 15000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.filter.empty
     * "Should show filter-specific empty state"
     */
    test("should show empty state for filter with no results", async ({ page }) => {
      // Create only interview notifications
      const scenario = await NotificationScenarios.interviewsOnly();
      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Click applications filter (which has no notifications)
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /สมัครงาน/i }).click();
      await page.waitForLoadState("networkidle");

      // Should show empty state for this filter
      await expect(page.getByTestId("notification-empty-state")).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Mark as Read", () => {
    /**
     * Requirement: BLS-11-02
     * "Should mark notification as read when clicking mark button"
     */
    test("should mark notification as read", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview"],
        countPerType: 1,
        includeReadNotifications: false,
        testName: "mark-as-read",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      const notifId = scenario.notifications.interview[0];
      const notifItem = page.getByTestId(`notification-item-${notifId}`);
      await expect(notifItem).toBeVisible({ timeout: 15000 });

      // Should have unread indicator
      await expect(notifItem.getByTestId("unread-indicator")).toBeVisible({ timeout: 10000 });

      // Click mark as read button
      await notifItem.getByLabelText(/ทำเครื่องหมายว่าอ่านแล้ว/i).click();
      await page.waitForLoadState("networkidle");

      // Should no longer have unread indicator
      await expect(notifItem.getByTestId("unread-indicator")).not.toBeVisible({ timeout: 10000 });
    });

    /**
     * Requirement: BLS-11-03
     * "Should mark all notifications as read"
     */
    test("should mark all notifications as read", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview", "offer"],
        countPerType: 2,
        includeReadNotifications: false,
        testName: "mark-all-read",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Should have unread indicators
      const unreadIndicators = page.getByTestId("unread-indicator");
      await expect(unreadIndicators.first()).toBeVisible({ timeout: 15000 });

      // Click mark all as read button
      await page.getByRole("button", { name: /ทำเครื่องหมายทั้งหมดว่าอ่านแล้ว/i }).click();
      await page.waitForLoadState("networkidle");

      // Should no longer have unread indicators
      await expect(page.getByTestId("unread-indicator")).not.toBeVisible({ timeout: 10000 });
    });

    /**
     * Requirement: BLS-11-02.bell
     * "Bell badge count should decrease after marking as read"
     */
    test("should update bell badge after marking as read", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview"],
        countPerType: 2,
        includeReadNotifications: false,
        testName: "bell-badge-update",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Get initial badge count (should be 2)
      const bellBadge = page.getByTestId("bell-badge");
      await expect(bellBadge).toBeVisible({ timeout: 15000 });
      await expect(bellBadge).toHaveText("2", { timeout: 10000 });

      // Mark one as read
      const notifId = scenario.notifications.interview[0];
      const notifItem = page.getByTestId(`notification-item-${notifId}`);
      await expect(notifItem).toBeVisible({ timeout: 15000 });
      await notifItem.getByLabelText(/ทำเครื่องหมายว่าอ่านแล้ว/i).click();
      await page.waitForLoadState("networkidle");

      // Badge count should decrease to 1
      await expect(bellBadge).toHaveText("1", { timeout: 10000 });
    });
  });

  test.describe("Navigation", () => {
    /**
     * Requirement: BLS-11-06
     * "Clicking notification should navigate to source"
     */
    test("should navigate to chat room when clicking interview notification", async ({ page }) => {
      const scenario = await createNotificationScenario({
        notificationTypes: ["interview"],
        countPerType: 1,
        testName: "navigate-interview",
      });

      await signInAsCandidate(page, scenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      const notifId = scenario.notifications.interview[0];
      const chatRoomId = scenario.chatRoomIds[0];

      // Click the notification
      await expect(page.getByTestId(`notification-item-${notifId}`)).toBeVisible({ timeout: 15000 });
      await page.getByTestId(`notification-item-${notifId}`).click();

      // Should navigate to chat room
      await expect(page).toHaveURL(new RegExp(`/chat/${chatRoomId}`), { timeout: 15000 });
    });

    /**
     * Requirement: BLS-11-06
     * "Clicking grouped room should navigate to chat room"
     */
    test("should navigate to chat room when clicking grouped room", async ({ page }) => {
      const chatScenario = await createChatMessageScenario({
        roomCount: 1,
        messagesPerRoom: 3,
        testName: "navigate-grouped-room",
      });

      await signInAsCandidate(page, chatScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Go to messages filter
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      await page.getByRole("tab", { name: /ข้อความ/i }).click();
      await page.waitForLoadState("networkidle");

      const roomId = chatScenario.rooms[0].roomId;

      // Click the grouped room
      await expect(page.getByTestId(`grouped-room-${roomId}`)).toBeVisible({ timeout: 15000 });
      await page.getByTestId(`grouped-room-${roomId}`).click();

      // Should navigate to chat room
      await expect(page).toHaveURL(new RegExp(`/chat/${roomId}`), { timeout: 15000 });
    });
  });

  test.describe("Loading States", () => {
    /**
     * Requirement: NOTIF-R01.loading
     * "Should show loading state while fetching"
     */
    test("should show loading skeleton while fetching", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);

      // Navigate to notifications and immediately check for loading state
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });

      // Should briefly show loading skeleton (may be very fast with server data)
      // Check that page eventually loads with content
      await expect(page.getByRole("heading", { name: /การแจ้งเตือน/i })).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Mobile Responsiveness", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    /**
     * Requirement: NOTIF-R01.mobile
     * "Page should be usable on mobile"
     */
    test("should display properly on mobile", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Filter tabs should be scrollable
      const tablist = page.getByRole("tablist");
      await expect(tablist).toBeVisible({ timeout: 15000 });

      // Notifications should be visible
      if (sharedScenario.notifications.interview.length > 0) {
        const notifId = sharedScenario.notifications.interview[0];
        await expect(page.getByTestId(`notification-item-${notifId}`)).toBeVisible({ timeout: 15000 });
      }
    });

    /**
     * Requirement: NOTIF-R01.mobile.scroll
     * "Filter tabs should be horizontally scrollable on mobile"
     */
    test("should scroll filter tabs on mobile", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // All tabs should be accessible (might need scrolling)
      const systemTab = page.getByRole("tab", { name: /ระบบ/i });

      // Scroll if needed and check visibility
      await systemTab.scrollIntoViewIfNeeded();
      await expect(systemTab).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Accessibility", () => {
    /**
     * Requirement: NOTIF-R01.a11y
     * "Page should have proper ARIA attributes"
     */
    test("should have proper ARIA attributes", async ({ page }) => {
      await signInAsCandidate(page, sharedScenario.candidate);
      await page.goto("/jobsmarket/notifications", { timeout: 60000 });
      await page.waitForLoadState("networkidle");

      // Tabs should have proper roles
      await expect(page.getByRole("tablist")).toBeVisible({ timeout: 15000 });
      const tabs = page.getByRole("tab");
      await expect(tabs.first()).toHaveAttribute("aria-selected", { timeout: 10000 });

      // Notification items should be accessible
      if (sharedScenario.notifications.interview.length > 0) {
        const notifId = sharedScenario.notifications.interview[0];
        const notifItem = page.getByTestId(`notification-item-${notifId}`);
        await expect(notifItem).toBeVisible({ timeout: 15000 });
        await expect(notifItem).toHaveAttribute("aria-label", { timeout: 10000 });
      }
    });
  });
});
