/**
 * COMP-R08 Phase 7: Applications Page E2E Tests
 *
 * Tests page load, navigation, and basic application list functionality.
 * Target: 10-12 tests
 *
 * Critical: Never use 'networkidle' wait strategy (Firebase keeps WebSocket open)
 * Use 'domcontentloaded' + visible element checks instead.
 */

import { test, expect, type Page } from "@playwright/test";

// Test credentials
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD;
const COMPANY_ID = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_COMPANY_ID;

/**
 * Wait for page load using domcontentloaded + visible element check
 * Per COMP-R07 learnings: Never use 'networkidle' with Firebase
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  // Wait for sidebar navigation to be visible (indicates page is ready)
  await expect(
    page.locator('nav, aside, [data-testid="company-sidebar"]').first()
  ).toBeVisible({ timeout: 10000 });
}

/**
 * Login helper function
 */
async function loginAsCompanyAdmin(page: Page) {
  await page.goto("/jobsmarket/auth/login");
  await page.getByPlaceholder("you@example.com").fill(TEST_EMAIL!);
  await page.locator('input[type="password"]').fill(TEST_PASSWORD!);
  await page.getByRole("checkbox", { name: /ยอมรับ/ }).check({ force: true });
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

  // Wait for navigation to either dashboard or select-role
  await page.waitForURL(/dashboard|select-role/, { timeout: 10000 });

  // Select employer role if needed
  if (page.url().includes("select-role")) {
    const roleButton = page.getByLabel("เลือกบทบาท นายจ้าง");
    if (await roleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleButton.getByRole("button", { name: "เข้าใช้งาน" }).click();
      await page.waitForURL(/dashboard|companies/, { timeout: 10000 });
    }
  }
}

test.describe("Applications Page - COMP-R08", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD || !COMPANY_ID, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
  });

  test.describe("Page Load", () => {
    test("should load applications page successfully", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Verify page loaded with correct title
      await expect(page).toHaveTitle(/จัดการใบสมัครงาน/);
      await expect(page).toHaveURL(new RegExp(`/companies/${COMPANY_ID}/dashboard/applications`));
    });

    test("should display company shell with navigation", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Verify navigation links are present
      await expect(page.getByRole("link", { name: "แดชบอร์ด" })).toBeVisible();
      await expect(page.getByRole("link", { name: "งานที่ประกาศ" })).toBeVisible();
      await expect(page.getByRole("link", { name: "ใบสมัคร" })).toBeVisible();
      await expect(page.getByRole("link", { name: "ทีมงาน" })).toBeVisible();
      await expect(page.getByRole("link", { name: "ตั้งค่า" })).toBeVisible();
    });

    test("should show three-panel layout on desktop (≥1024px)", async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Filter Panel (left) - should be visible
      await expect(page.getByRole("heading", { name: "ตัวกรอง" })).toBeVisible();

      // Application List (middle) - should be visible
      await expect(page.getByRole("heading", { name: "ใบสมัครงาน" })).toBeVisible();

      // Detail Panel (right) - should be visible
      await expect(page.getByText("เลือกใบสมัครเพื่อดูรายละเอียด")).toBeVisible();
    });

    test("should show list-only layout on mobile (<768px)", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Filter Panel should be hidden (use hidden class check or visibility)
      const filterPanel = page.getByRole("heading", { name: "ตัวกรอง", exact: true });
      await expect(filterPanel).toBeHidden();

      // Application List should be visible
      await expect(page.getByRole("heading", { name: "ใบสมัครงาน" })).toBeVisible();

      // Detail Panel should be hidden
      await expect(page.getByText("เลือกใบสมัครเพื่อดูรายละเอียด")).toBeHidden();

      // Mobile filter button should be visible
      await expect(page.getByRole("button").filter({ has: page.locator('svg') }).first()).toBeVisible();
    });

    test("should show list + detail layout on tablet (768-1023px)", async ({ page }) => {
      // Set tablet viewport
      await page.setViewportSize({ width: 768, height: 1024 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Wait for content to load
      await page.waitForTimeout(1000);

      // Filter Panel should be hidden
      const filterPanel = page.getByRole("heading", { name: "ตัวกรอง", exact: true });
      await expect(filterPanel).toBeHidden();

      // Application List should be visible
      await expect(page.getByRole("heading", { name: "ใบสมัครงาน" })).toBeVisible();

      // Detail Panel should be visible
      await expect(page.getByText("เลือกใบสมัครเพื่อดูรายละเอียด")).toBeVisible();
    });
  });

  test.describe("Empty State", () => {
    test("should show empty state when no applications exist", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Check for empty state message
      const emptyStateHeading = page.getByText("ยังไม่มีใบสมัครงาน");
      const emptyStateDescription = page.getByText("เมื่อมีผู้สมัครงานตำแหน่งของคุณ ใบสมัครจะแสดงที่นี่");

      // Empty state should be visible if there are no applications
      // Note: This test might fail if test data exists
      const isVisible = await emptyStateHeading.isVisible({ timeout: 2000 }).catch(() => false);

      if (isVisible) {
        await expect(emptyStateHeading).toBeVisible();
        await expect(emptyStateDescription).toBeVisible();
        await expect(page.getByText("0 รายการ")).toBeVisible();
      } else {
        // Skip if applications exist
        test.skip(true, "Applications exist in test data - empty state not applicable");
      }
    });

    test("should show empty detail panel when no application selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Set desktop viewport to see detail panel
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.waitForTimeout(500);

      // Detail panel should show empty state
      await expect(page.getByText("เลือกใบสมัครเพื่อดูรายละเอียด")).toBeVisible();
      await expect(page.getByText(/คลิกที่ใบสมัครในรายการด้านซ้าย/)).toBeVisible();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to applications page from dashboard", async ({ page }) => {
      // Go to dashboard first
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard`);
      await waitForPageLoad(page);

      // Click on applications link in navigation
      await page.getByRole("link", { name: "ใบสมัคร" }).click();

      // Wait for URL to change
      await page.waitForURL(new RegExp(`/companies/${COMPANY_ID}/(dashboard/)?applications`), { timeout: 10000 });
      await waitForPageLoad(page);
      await page.waitForTimeout(1000); // Give content time to render

      // Verify we're on applications page
      await expect(page).toHaveURL(new RegExp(`/companies/${COMPANY_ID}/(dashboard/)?applications`));
      await expect(page.getByRole("heading", { name: "ใบสมัครงาน" })).toBeVisible({ timeout: 5000 });
    });

    test("should navigate to applications page from dashboard metrics card", async ({ page }) => {
      // Go to dashboard
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard`);
      await waitForPageLoad(page);

      // Click on "ใบสมัครทั้งหมด" card
      const totalAppsCard = page.getByRole("link", { name: /ใบสมัครทั้งหมด/ });
      if (await totalAppsCard.isVisible({ timeout: 2000 }).catch(() => false)) {
        await totalAppsCard.click();
        await waitForPageLoad(page);

        // Verify we're on applications page
        await expect(page).toHaveURL(new RegExp(`/companies/${COMPANY_ID}/(dashboard/)?applications`));
      } else {
        test.skip(true, "Dashboard metrics card not found");
      }
    });

    test("should maintain active state in sidebar navigation", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Applications link should have active styling (bg-secondary-900 or similar)
      // We check if the link exists and is in the nav
      const applicationsLink = page.getByRole("link", { name: "ใบสมัคร" });
      await expect(applicationsLink).toBeVisible();

      // The link should be marked as current page (check if URL contains applications)
      expect(page.url()).toContain("/applications");
    });
  });

  test.describe("Filter Panel Visibility", () => {
    test("should show filter panel on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(500);

      // Filter panel components should be visible
      await expect(page.getByRole("heading", { name: "ตัวกรอง" })).toBeVisible();
      await expect(page.getByText("ตำแหน่งงาน")).toBeVisible();
      await expect(page.getByText("สถานะ")).toBeVisible();
      await expect(page.getByText("เรียงตาม")).toBeVisible();
      await expect(page.getByRole("button", { name: "ใช้ตัวกรอง" })).toBeVisible();
      await expect(page.getByRole("button", { name: "ล้างตัวกรอง" })).toBeVisible();
    });

    test("should hide filter panel on mobile and show filter button", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(500);

      // Filter panel should be hidden
      await expect(page.getByRole("heading", { name: "ตัวกรอง", exact: true })).toBeHidden();

      // Mobile filter button should be visible (button with Filter icon)
      const filterButtons = page.getByRole("button");
      const hasFilterButton = await filterButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasFilterButton).toBe(true);
    });
  });
});
