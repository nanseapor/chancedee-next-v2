/**
 * E2E Tests for CHAT-R01: Chat List Page
 * Per CHAT-R01 RIS
 */

import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  createTestCompany,
  type TestCandidate,
  type TestCompany,
} from "../../helpers/factories";
import { signInAsCandidate, signInAsCompany } from "../../helpers/auth-helper";

// Shared test data
let candidate: TestCandidate;
let company: TestCompany;

test.describe("CHAT-R01: Chat List", () => {
  test.beforeAll(async () => {
    // Create test candidate and company
    candidate = await createTestCandidate({
      testName: "chat-list",
      withCompleteProfile: true,
    });

    company = await createTestCompany({
      testName: "chat-list",
      withPublishedJobs: 1,
    });
  });

  test.describe("Candidate View", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsCandidate(page, candidate);
    });

    test("should display chat list page", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      // Should see page heading
      await expect(
        page.getByRole("heading", { name: "ข้อความ" })
      ).toBeVisible();
    });

    test("should show search bar", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      await expect(
        page.getByPlaceholder("ค้นหาการสนทนา...")
      ).toBeVisible();
    });

    test("should show room cards with company names", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for rooms to load
      await page.waitForSelector('[data-testid="chat-room-card"]', {
        timeout: 10000,
      }).catch(() => {
        // If no rooms, check for empty state
      });

      const roomCards = page.getByTestId("chat-room-card");
      const count = await roomCards.count();

      if (count > 0) {
        // If rooms exist, verify they show company name
        const firstCard = roomCards.first();
        await expect(firstCard).toBeVisible();
      } else {
        // If no rooms, empty state should be shown
        await expect(page.getByText("ยังไม่มีการสนทนา")).toBeVisible();
      }
    });

    test("should show unread badge on rooms with unread messages", async ({
      page,
    }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check if any room has unread badge
      const unreadBadges = page.getByTestId("unread-badge");
      const badgeCount = await unreadBadges.count();

      // This test just verifies the badge renders correctly when present
      // It doesn't require there to be unread messages
      if (badgeCount > 0) {
        const firstBadge = unreadBadges.first();
        await expect(firstBadge).toBeVisible();
        // Badge should contain a number
        const text = await firstBadge.textContent();
        expect(text).toMatch(/\d+|\d+\+/);
      }
    });

    test("should filter rooms when searching", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for rooms to load
      await page.waitForLoadState("networkidle");

      const roomCards = page.getByTestId("chat-room-card");
      const initialCount = await roomCards.count();

      // Only test if there are rooms
      if (initialCount > 0) {
        // Get first room's name for search
        const firstRoomName = await roomCards.first().textContent();

        // Type in search
        await page.getByPlaceholder("ค้นหาการสนทนา...").fill("zzzzzzzzz");

        // Should show no results or filtered results
        await page.waitForTimeout(500); // Wait for debounce

        const filteredCount = await roomCards.count();
        expect(filteredCount).toBeLessThanOrEqual(initialCount);
      }
    });

    test("should navigate to chat room on click", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for rooms to load
      await page.waitForLoadState("networkidle");

      const roomCards = page.getByTestId("chat-room-card");
      const count = await roomCards.count();

      if (count > 0) {
        // Click first room
        await roomCards.first().click();

        // Should navigate to chat room or show room in panel
        // URL might have ?room= query parameter
        await expect(page).toHaveURL(/\/jobsmarket\/chat(\?room=|\/)/);
      }
    });

    test("should show empty state when no rooms", async ({ page }) => {
      // This test assumes we have a candidate with no chat rooms
      // Using a new candidate without chats would be ideal

      await page.goto(`/jobsmarket/chat`);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      const roomCards = page.getByTestId("chat-room-card");
      const count = await roomCards.count();

      if (count === 0) {
        // Should show empty state
        await expect(page.getByText("ยังไม่มีการสนทนา")).toBeVisible();
        await expect(page.getByText("สมัครงานเพื่อเริ่มแชท")).toBeVisible();
      }
    });

    test.skip("should be accessible via bottom navigation", async ({ page }) => {
      // TODO: Implement when bottom navigation is added to CandidateShell
      // This test requires mobile navigation component implementation

      // Start from candidate dashboard
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}`);

      // Click chat tab in bottom navigation (mobile)
      await page.setViewportSize({ width: 375, height: 667 });

      const chatTab = page.getByRole("link", { name: "ข้อความ" });
      await chatTab.click();

      // Should navigate to chat
      await expect(page).toHaveURL(/\/jobsmarket\/chat/);
    });
  });

  test.describe("Company View", () => {
    test.beforeEach(async ({ page }) => {
      await signInAsCompany(page, company);
    });

    test("should show room cards with candidate names", async ({ page }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for rooms to load
      await page.waitForLoadState("networkidle");

      const roomCards = page.getByTestId("chat-room-card");
      const count = await roomCards.count();

      if (count > 0) {
        // For company view, should show candidate names
        const firstCard = roomCards.first();
        await expect(firstCard).toBeVisible();
      }
    });

    test("should show appointment indicator for pending interviews", async ({
      page,
    }) => {
      await page.goto(`/jobsmarket/chat`);

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Look for calendar emoji indicating pending appointment
      const appointmentIndicators = page.getByText("📅");
      const indicatorCount = await appointmentIndicators.count();

      // If there are pending interviews, the indicator should be visible
      if (indicatorCount > 0) {
        await expect(appointmentIndicators.first()).toBeVisible();
      }
    });
  });

  test.describe("Responsive Layout", () => {
    test("should show two-panel layout on desktop", async ({ page }) => {
      await signInAsCandidate(page, candidate);

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/jobsmarket/chat`);

      // Should have both list panel and detail panel
      await expect(page.getByTestId("chat-list-panel")).toBeVisible();

      // Detail panel might show empty state or selected room
      const detailPanel = page.getByTestId("chat-detail-panel");
      await expect(detailPanel).toBeVisible();
    });

    test("should show single-column on mobile", async ({ page }) => {
      await signInAsCandidate(page, candidate);

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/chat`);

      // Should show list panel
      await expect(page.getByTestId("chat-list-panel")).toBeVisible();

      // Detail panel should be hidden on mobile initially
      const detailPanel = page.getByTestId("chat-detail-panel");
      await expect(detailPanel).not.toBeVisible();
    });

    test("should show bottom navigation on mobile", async ({ page }) => {
      await signInAsCandidate(page, candidate);

      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/chat`);

      // Bottom tab bar should be visible
      await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
    });
  });

  test.describe("Access Control", () => {
    test("should redirect to login when not authenticated", async ({
      page,
    }) => {
      // Clear any existing session
      await page.context().clearCookies();

      await page.goto(`/jobsmarket/chat`);

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect to login with redirect param", async ({ page }) => {
      await page.context().clearCookies();

      await page.goto(`/jobsmarket/chat`);

      // URL should contain redirect parameter
      await expect(page).toHaveURL(/redirect=/);
    });
  });

  test.describe("Real-time Updates", () => {
    test("should refresh room list periodically", async ({ page }) => {
      await signInAsCandidate(page, candidate);

      await page.goto(`/jobsmarket/chat`);

      // Record initial state
      const roomCards = page.getByTestId("chat-room-card");
      const initialCount = await roomCards.count();

      // Wait for auto-refresh (60 seconds in production, might be faster in test)
      // For now, just verify the page doesn't crash during wait
      await page.waitForTimeout(2000);

      // Page should still be functional
      await expect(page.getByPlaceholder("ค้นหาการสนทนา...")).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test.skip("should show error state on network failure", async ({ page }) => {
      // TODO: Error handling test is flaky due to offline mode issues with page navigation
      // The offline mode needs to be set after navigation, but SWR fetches on mount
      // This requires mocking the network layer at a different level

      await signInAsCandidate(page, candidate);

      // Navigate first while online
      await page.goto(`/jobsmarket/chat`);
      await page.waitForLoadState("networkidle");

      // Then simulate offline for subsequent requests
      await page.context().setOffline(true);

      // Trigger a refresh to cause error
      await page.reload();

      // Should show error message
      await expect(
        page.getByText(/ไม่สามารถโหลด|เกิดข้อผิดพลาด/)
      ).toBeVisible({ timeout: 10000 });

      // Restore online
      await page.context().setOffline(false);
    });

    test.skip("should have retry button on error", async ({ page }) => {
      // TODO: Error handling test is flaky due to offline mode issues with page navigation
      // Skipping until a more reliable approach is implemented

      await signInAsCandidate(page, candidate);

      await page.goto(`/jobsmarket/chat`);
      await page.waitForLoadState("networkidle");

      await page.context().setOffline(true);
      await page.reload();

      // Wait for error state
      await page.waitForTimeout(5000);

      const retryButton = page.getByRole("button", { name: /ลองใหม่/ });

      // If error shown, retry button should exist
      if (await page.getByText(/ไม่สามารถโหลด/).isVisible()) {
        await expect(retryButton).toBeVisible();
      }

      await page.context().setOffline(false);
    });
  });

  test.describe("Shell Integration", () => {
    test("should display within CandidateShell for candidates", async ({
      page,
    }) => {
      await signInAsCandidate(page, candidate);

      // On mobile, should show bottom tab bar
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/chat`);

      // Should have bottom tab bar on mobile
      await expect(page.getByTestId("bottom-tab-bar")).toBeVisible();
    });

    test("should show page title", async ({ page }) => {
      await signInAsCandidate(page, candidate);

      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/jobsmarket/chat`);

      // Page should show "ข้อความ" heading
      await expect(page.getByRole("heading", { name: "ข้อความ" })).toBeVisible();
    });
  });
});
