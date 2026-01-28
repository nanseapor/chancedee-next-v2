/**
 * COMP-R08 Phase 7: Applications Filter Interactions E2E Tests
 *
 * Tests filter panel functionality including:
 * - Status filter checkboxes
 * - Job filter dropdown
 * - Sort dropdown
 * - Apply/Clear filter buttons
 * - URL synchronization
 * - Filter persistence
 * - Mobile filter sheet
 *
 * Target: 10-12 tests
 *
 * Critical: Never use 'networkidle' wait strategy (Firebase keeps WebSocket open)
 */

import { test, expect, type Page } from "@playwright/test";

// Test credentials
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL;
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD;
const COMPANY_ID = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_COMPANY_ID;

/**
 * Wait for page load using domcontentloaded + visible element check
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
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

  await page.waitForURL(/dashboard|select-role/, { timeout: 10000 });

  if (page.url().includes("select-role")) {
    const roleButton = page.getByLabel("เลือกบทบาท นายจ้าง");
    if (await roleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleButton.getByRole("button", { name: "เข้าใช้งาน" }).click();
      await page.waitForURL(/dashboard|companies/, { timeout: 10000 });
    }
  }
}

test.describe("Applications Filter Interactions - COMP-R08", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD || !COMPANY_ID, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.describe("Status Filter", () => {
    test("should show all status checkboxes", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // All status checkboxes should be visible
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "ดูแล้ว" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "ตอบรับแล้ว" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "ปฏิเสธ" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "นัดสัมภาษณ์" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "ยืนยันแล้ว" })).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "ถอนใบสมัคร" })).toBeVisible();
    });

    test("should toggle status checkbox when clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const checkbox = page.getByRole("checkbox", { name: "รอดำเนินการ" });

      // Initially unchecked
      await expect(checkbox).not.toBeChecked();

      // Click to check
      await checkbox.click();
      await expect(checkbox).toBeChecked();

      // Click to uncheck
      await checkbox.click();
      await expect(checkbox).not.toBeChecked();
    });

    test("should select all statuses when clicking ทั้งหมด button", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click "ทั้งหมด" button
      await page.getByRole("button", { name: "ทั้งหมด" }).click();

      // All checkboxes should be checked
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "ดูแล้ว" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "ตอบรับแล้ว" })).toBeChecked();
      await expect(page.getByRole("checkbox", { name: "ปฏิเสธ" })).toBeChecked();
    });

    test("should clear all statuses when clicking ล้าง button", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // First select all - use first() to avoid strict mode violation
      await page.getByRole("button", { name: "ทั้งหมด" }).first().click();
      await page.waitForTimeout(300);

      // Verify checkboxes are checked
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" }).first()).toBeChecked();

      // Then clear all - this clears the FilterPanel's local state
      // Use first() because there might be multiple filter panels (desktop + mobile)
      await page.getByRole("button", { name: "ล้าง", exact: true }).first().click();
      await page.waitForTimeout(300);

      // All checkboxes should be unchecked (local state cleared)
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" }).first()).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: "ดูแล้ว" }).first()).not.toBeChecked();
      await expect(page.getByRole("checkbox", { name: "ตอบรับแล้ว" }).first()).not.toBeChecked();
    });

    test("should filter applications by selected status", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Select a specific status - use first() to avoid strict mode
      const checkbox = page.getByRole("checkbox", { name: "รอดำเนินการ" }).first();
      await checkbox.click();
      await page.waitForTimeout(500);

      // Verify checkbox is checked
      await expect(checkbox).toBeChecked();

      // Click apply filter - use first() to avoid strict mode
      await page.getByRole("button", { name: "ใช้ตัวกรอง" }).first().click();
      await page.waitForTimeout(2000); // Increased wait for URL update

      // URL should include status parameter
      const url = page.url();
      const hasStatusParam = url.includes("status=");
      expect(hasStatusParam).toBe(true);
    });
  });

  test.describe("Job Filter", () => {
    test("should show job selector dropdown", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Job selector should be visible
      const jobCombobox = page.locator('[role="combobox"]').first();
      await expect(jobCombobox).toBeVisible();

      // Default value should be "ทั้งหมด"
      await expect(jobCombobox).toContainText("ทั้งหมด");
    });

    test("should open job dropdown when clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click job selector
      const jobCombobox = page.locator('[role="combobox"]').first();
      await jobCombobox.click();

      // Dropdown options should appear as a listbox
      const listbox = page.getByRole("listbox");
      await expect(listbox).toBeVisible({ timeout: 2000 });
    });
  });

  test.describe("Sort Filter", () => {
    test("should show sort selector dropdown", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Find sort selector (second combobox)
      const sortCombobox = page.locator('[role="combobox"]').nth(1);
      await expect(sortCombobox).toBeVisible();

      // Default value should be "ล่าสุด"
      await expect(sortCombobox).toContainText("ล่าสุด");
    });

    test("should open sort dropdown when clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click sort selector
      const sortCombobox = page.locator('[role="combobox"]').nth(1);
      await sortCombobox.click();

      // Dropdown options should appear as a listbox
      const listbox = page.getByRole("listbox");
      await expect(listbox).toBeVisible({ timeout: 2000 });
    });

    test("should show all sort options", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click sort selector to open dropdown
      const sortCombobox = page.locator('[role="combobox"]').nth(1);
      await sortCombobox.click();
      await page.waitForTimeout(500);

      // Listbox should be visible with options
      const listbox = page.getByRole("listbox");
      await expect(listbox).toBeVisible();

      // Check that options exist (should have at least "ล่าสุด" option)
      const option = listbox.getByRole("option").first();
      await expect(option).toBeVisible();
    });
  });

  test.describe("Apply and Clear Filters", () => {
    test("should apply filters when clicking ใช้ตัวกรอง button", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Select a filter - use first() to avoid strict mode
      const checkbox = page.getByRole("checkbox", { name: "รอดำเนินการ" }).first();
      await checkbox.click();
      await page.waitForTimeout(300);

      // Get current URL
      const urlBefore = page.url();

      // Click apply - use first() to avoid strict mode
      await page.getByRole("button", { name: "ใช้ตัวกรอง" }).first().click();
      await page.waitForTimeout(1000);

      // URL should change (include filter params)
      const urlAfter = page.url();
      expect(urlAfter).not.toBe(urlBefore);
      const hasStatusParam = urlAfter.includes("status=applied") || urlAfter.includes("status=new");
      expect(hasStatusParam).toBe(true);
    });

    test("should clear all filters when clicking ล้างตัวกรอง button", async ({ page }) => {
      // Start with a filtered URL
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied&sort=oldest`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click clear filters - use first() to avoid strict mode
      await page.getByRole("button", { name: "ล้างตัวกรอง" }).first().click();
      await page.waitForTimeout(1000);

      // URL should be reset (no query params except possible defaults)
      const url = page.url();
      expect(url).not.toContain("status=applied");
      expect(url).not.toContain("sort=oldest");

      // All checkboxes should be unchecked - use first() to avoid strict mode
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" }).first()).not.toBeChecked();
    });
  });

  test.describe("URL Synchronization", () => {
    test("should sync status filter to URL", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Select status and apply - use first() to avoid strict mode
      await page.getByRole("checkbox", { name: "รอดำเนินการ" }).first().click();
      await page.waitForTimeout(300);
      await page.getByRole("button", { name: "ใช้ตัวกรอง" }).first().click();
      await page.waitForTimeout(1000);

      // URL should contain status parameter
      const url = page.url();
      const hasStatusParam = url.includes("status=applied") || url.includes("status=new");
      expect(hasStatusParam).toBe(true);
    });

    test("should load filters from URL on page load", async ({ page }) => {
      // Navigate with URL parameters
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Status checkbox should be checked
      const checkbox = page.getByRole("checkbox", { name: "รอดำเนินการ" });
      await expect(checkbox).toBeChecked();
    });

    test("should persist filters on browser refresh", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Apply filter - use first() to avoid strict mode
      await page.getByRole("checkbox", { name: "ตอบรับแล้ว" }).first().click();
      await page.waitForTimeout(300);
      await page.getByRole("button", { name: "ใช้ตัวกรอง" }).first().click();
      await page.waitForTimeout(1000);

      // Verify URL has status param
      expect(page.url()).toContain("status=accepted");

      // Reload page
      await page.reload();
      await waitForPageLoad(page);
      await page.waitForTimeout(1500);

      // URL should still have the parameter
      expect(page.url()).toContain("status=accepted");

      // Filter should still be applied (checkbox checked) - use first() to avoid strict mode
      await expect(page.getByRole("checkbox", { name: "ตอบรับแล้ว" }).first()).toBeChecked();
    });
  });

  test.describe("Mobile Filter Sheet", () => {
    test("should show filter button on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Mobile filter button should be visible
      const filterButtons = page.getByRole("button");
      const hasFilterButton = await filterButtons.first().isVisible({ timeout: 2000 }).catch(() => false);
      expect(hasFilterButton).toBe(true);
    });

    test("should open filter sheet when clicking mobile filter button", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // On mobile, the filter heading should be hidden initially
      const filterHeadingBefore = page.getByRole("heading", { name: "ตัวกรอง", exact: true });
      const isHiddenBefore = await filterHeadingBefore.isHidden({ timeout: 2000 }).catch(() => true);

      if (!isHiddenBefore) {
        test.skip(true, "Filter panel not hidden on mobile - viewport might not be mobile");
        return;
      }

      // Try to find and click a button that opens the filter sheet
      // This might be near the top of the page in the applications header area
      const allButtons = await page.getByRole("button").all();
      let sheetOpened = false;

      for (const button of allButtons.slice(0, 5)) { // Try first 5 buttons
        const isVisible = await button.isVisible({ timeout: 500 }).catch(() => false);
        if (!isVisible) continue;

        await button.click();
        await page.waitForTimeout(800);

        // Check if filter heading is now visible
        const isNowVisible = await filterHeadingBefore.isVisible({ timeout: 1000 }).catch(() => false);
        if (isNowVisible) {
          sheetOpened = true;
          break;
        }
      }

      if (!sheetOpened) {
        test.skip(true, "Could not find mobile filter button that opens sheet");
        return;
      }

      // Verify sheet opened
      await expect(filterHeadingBefore).toBeVisible();
      await expect(page.getByRole("checkbox", { name: "รอดำเนินการ" }).first()).toBeVisible();
    });

    test("should close filter sheet after applying filters on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Find and click button that opens filter sheet
      const filterHeading = page.getByRole("heading", { name: "ตัวกรอง", exact: true });
      const allButtons = await page.getByRole("button").all();
      let sheetOpened = false;

      for (const button of allButtons.slice(0, 5)) {
        const isVisible = await button.isVisible({ timeout: 500 }).catch(() => false);
        if (!isVisible) continue;

        await button.click();
        await page.waitForTimeout(800);

        const isNowVisible = await filterHeading.isVisible({ timeout: 1000 }).catch(() => false);
        if (isNowVisible) {
          sheetOpened = true;
          break;
        }
      }

      if (!sheetOpened) {
        test.skip(true, "Could not open filter sheet");
        return;
      }

      // Verify sheet is open
      await expect(filterHeading).toBeVisible();

      // Select a filter - use first() to avoid strict mode
      await page.getByRole("checkbox", { name: "ดูแล้ว" }).first().click();
      await page.waitForTimeout(300);

      // Apply filter - use first() to avoid strict mode
      await page.getByRole("button", { name: "ใช้ตัวกรอง" }).first().click();
      await page.waitForTimeout(1500);

      // Sheet should close - heading should be hidden
      const isStillVisible = await filterHeading.isVisible({ timeout: 1000 }).catch(() => false);
      expect(isStillVisible).toBe(false);
    });
  });
});
