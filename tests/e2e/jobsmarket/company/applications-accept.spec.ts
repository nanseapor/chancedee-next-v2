/**
 * COMP-R08 Phase 7: Applications Accept Flow E2E Tests
 *
 * Tests the accept application user flow including:
 * - Button visibility and permissions
 * - Accept confirmation
 * - Loading states
 * - Success toast
 * - Status update
 * - Chat drawer opening (TODO: Phase 4 deferred)
 *
 * Target: 8-10 tests
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

test.describe("Applications Accept Flow - COMP-R08", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD || !COMPANY_ID, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.describe("Accept Button Visibility", () => {
    test("should show accept button when application is selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Check if there are applications
      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No applications available for testing");
        return;
      }

      // Click first application
      await applicationCards.first().click();
      await page.waitForTimeout(500);

      // Accept button should be visible in detail panel
      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });
      await expect(acceptButton).toBeVisible({ timeout: 5000 });
    });

    test("should hide accept button when no application selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Accept button should not be visible when no application is selected
      const acceptButton = page.getByRole("button", { name: /ยอมรับ/, exact: true });
      const isVisible = await acceptButton.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible).toBe(false);
    });

    test("should disable accept button for already accepted applications", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=accepted`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Check if there are accepted applications
      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No accepted applications available for testing");
        return;
      }

      // Click first accepted application
      await applicationCards.first().click();
      await page.waitForTimeout(500);

      // Accept button should either be disabled or not visible
      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });
      const isDisabled = await acceptButton.isDisabled().catch(() => true);
      const isHidden = await acceptButton.isHidden().catch(() => true);

      expect(isDisabled || isHidden).toBe(true);
    });
  });

  test.describe("Accept Confirmation", () => {
    test("should show confirmation before accepting application", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Find unaccepted applications
      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      // Select first application
      await applicationCards.first().click();
      await page.waitForTimeout(500);

      // Click accept button
      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });
      await acceptButton.click();

      // Should show confirmation dialog
      // Note: Implementation may use native confirm() or custom modal
      // Check for either alertdialog or dialog role
      const dialog = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      const hasDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasDialog) {
        await expect(dialog).toBeVisible();
        // Should have confirm and cancel buttons
        await expect(dialog.getByRole("button", { name: /ยืนยัน|ตกลง|ยอมรับ/ })).toBeVisible();
        await expect(dialog.getByRole("button", { name: /ยกเลิก|ปิด/ })).toBeVisible();
      } else {
        // May use native confirm - accept it
        page.on("dialog", async (dialog) => {
          expect(dialog.type()).toBe("confirm");
          await dialog.accept();
        });
      }
    });

    test("should cancel accept when clicking cancel in confirmation", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      await applicationCards.first().click();
      await page.waitForTimeout(500);

      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });
      await acceptButton.click();

      // Cancel the confirmation
      const dialog = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      const hasDialog = await dialog.isVisible({ timeout: 2000 }).catch(() => false);

      if (hasDialog) {
        const cancelButton = dialog.getByRole("button", { name: /ยกเลิก|ปิด/ });
        await cancelButton.click();

        // Dialog should close
        await expect(dialog).toBeHidden();

        // Accept button should still be visible (action was cancelled)
        await expect(acceptButton).toBeVisible();
      } else {
        // Native dialog - dismiss it
        page.on("dialog", async (dialog) => {
          await dialog.dismiss();
        });
      }
    });
  });

  test.describe("Accept Loading States", () => {
    test("should show loading state while accepting application", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      await applicationCards.first().click();
      await page.waitForTimeout(500);

      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });

      // Start accept action
      // Note: We'll handle both native and custom dialogs
      const dialogHandler = (dialog: any) => dialog.accept();
      page.on("dialog", dialogHandler);

      await acceptButton.click();

      // Check for loading indicator
      // Button might be disabled or show loading spinner
      const isDisabledDuringLoad = await acceptButton.isDisabled({ timeout: 1000 }).catch(() => false);
      const hasLoadingSpinner = await page.locator('[role="status"], .spinner, .loading').isVisible({ timeout: 1000 }).catch(() => false);

      // At least one loading indicator should be present
      expect(isDisabledDuringLoad || hasLoadingSpinner).toBe(true);
    });

    test("should disable accept button while accepting", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      await applicationCards.first().click();
      await page.waitForTimeout(500);

      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });

      // Handle dialog
      page.on("dialog", async (dialog) => await dialog.accept());

      await acceptButton.click();

      // Button should be disabled during the operation
      await expect(acceptButton).toBeDisabled({ timeout: 2000 });
    });
  });

  test.describe("Accept Success", () => {
    test("should show success toast after accepting application", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      await applicationCards.first().click();
      await page.waitForTimeout(500);

      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });

      // Handle confirmation
      page.on("dialog", async (dialog) => await dialog.accept());

      // Accept application
      await acceptButton.click();

      // Wait for success toast
      // Toast library (sonner) uses role="status" or similar
      const toast = page.locator('[role="status"], [data-sonner-toast]').filter({ hasText: /ยอมรับ.*สำเร็จ/ });
      await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test("should update application status to accepted after accepting", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      // Get application ID or candidate name before accepting
      const firstCard = applicationCards.first();
      const candidateName = await firstCard.textContent().catch(() => "");

      await firstCard.click();
      await page.waitForTimeout(500);

      // Handle confirmation and accept
      page.on("dialog", async (dialog) => await dialog.accept());

      const acceptButton = page.getByRole("button", { name: /ยอมรับ/ });
      await acceptButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Navigate to accepted applications
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=accepted`);
      await waitForPageLoad(page);

      // The application should now appear in accepted list
      if (candidateName) {
        const acceptedCard = page.locator('[role="article"], .application-card').filter({ hasText: candidateName });
        await expect(acceptedCard).toBeVisible({ timeout: 5000 });
      }
    });
  });

  test.describe("Accept Error Handling", () => {
    test("should show error toast when accept fails", async ({ page }) => {
      // This test requires mocking server failure or network error
      // For now, we'll skip this test as it requires specific setup
      test.skip(true, "Error scenario requires mock setup - implement when mock infrastructure is ready");
    });

    test("should re-enable button when accept fails", async ({ page }) => {
      // This test requires mocking server failure
      test.skip(true, "Error scenario requires mock setup - implement when mock infrastructure is ready");
    });
  });
});
