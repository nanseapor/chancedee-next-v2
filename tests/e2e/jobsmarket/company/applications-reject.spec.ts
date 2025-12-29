/**
 * COMP-R08 Phase 7: Applications Reject Flow E2E Tests
 *
 * Tests the reject application user flow including:
 * - Button visibility and permissions
 * - Reject modal/dialog
 * - Feedback entry (optional)
 * - Loading states
 * - Success toast
 * - Status update
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

test.describe("Applications Reject Flow - COMP-R08", () => {
  test.skip(!TEST_EMAIL || !TEST_PASSWORD || !COMPANY_ID, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    await loginAsCompanyAdmin(page);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.describe("Reject Button Visibility", () => {
    test("should show reject button when application is selected", async ({ page }) => {
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

      // Reject button should be visible in detail panel
      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await expect(rejectButton).toBeVisible({ timeout: 5000 });
    });

    test("should hide reject button when no application selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications`);
      await waitForPageLoad(page);

      // Reject button should not be visible when no application is selected
      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/, exact: true });
      const isVisible = await rejectButton.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible).toBe(false);
    });

    test("should disable reject button for already rejected applications", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=rejected`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Check if there are rejected applications
      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No rejected applications available for testing");
        return;
      }

      // Click first rejected application
      await applicationCards.first().click();
      await page.waitForTimeout(500);

      // Reject button should either be disabled or not visible
      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      const isDisabled = await rejectButton.isDisabled().catch(() => true);
      const isHidden = await rejectButton.isHidden().catch(() => true);

      expect(isDisabled || isHidden).toBe(true);
    });
  });

  test.describe("Reject Modal/Dialog", () => {
    test("should open reject modal when clicking reject button", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      // Select first application
      await applicationCards.first().click();
      await page.waitForTimeout(500);

      // Click reject button
      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Modal should open
      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test("should show feedback textarea in reject modal", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Modal should have a feedback textarea
      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Look for textarea or textbox for feedback
      const feedbackInput = modal.getByRole("textbox").or(modal.locator("textarea"));
      await expect(feedbackInput).toBeVisible({ timeout: 2000 });
    });

    test("should have confirm and cancel buttons in reject modal", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Should have confirm button
      await expect(modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ })).toBeVisible();

      // Should have cancel button
      await expect(modal.getByRole("button", { name: /ยกเลิก|ปิด/ })).toBeVisible();
    });

    test("should close reject modal when clicking cancel", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Click cancel button
      const cancelButton = modal.getByRole("button", { name: /ยกเลิก|ปิด/ });
      await cancelButton.click();

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 2000 });
    });
  });

  test.describe("Reject with Feedback", () => {
    test("should allow entering feedback before rejecting", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Enter feedback
      const feedbackInput = modal.getByRole("textbox").or(modal.locator("textarea"));
      const testFeedback = "ขอบคุณสำหรับการสมัครงาน แต่เราตัดสินใจเลือกผู้สมัครท่านอื่น";
      await feedbackInput.fill(testFeedback);

      // Verify feedback was entered
      const value = await feedbackInput.inputValue();
      expect(value).toBe(testFeedback);
    });

    test("should allow rejecting without feedback (optional)", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Don't enter feedback - confirm button should still be enabled
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await expect(confirmButton).toBeEnabled();
    });
  });

  test.describe("Reject Loading States", () => {
    test("should show loading state while rejecting application", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Click confirm
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Check for loading indicator
      const isDisabledDuringLoad = await confirmButton.isDisabled({ timeout: 1000 }).catch(() => false);
      const hasLoadingSpinner = await page.locator('[role="status"], .spinner, .loading').isVisible({ timeout: 1000 }).catch(() => false);

      // At least one loading indicator should be present
      expect(isDisabledDuringLoad || hasLoadingSpinner).toBe(true);
    });

    test("should disable confirm button while rejecting", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Button should be disabled during the operation
      await expect(confirmButton).toBeDisabled({ timeout: 2000 });
    });
  });

  test.describe("Reject Success", () => {
    test("should show success toast after rejecting application", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Confirm rejection
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Wait for success toast
      const toast = page.locator('[role="status"], [data-sonner-toast]').filter({ hasText: /ปฏิเสธ.*สำเร็จ/ });
      await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test("should update application status to rejected after rejecting", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      const applicationCards = page.locator('[role="article"], .application-card, [data-testid="application-card"]');
      const count = await applicationCards.count().catch(() => 0);

      if (count === 0) {
        test.skip(true, "No pending applications available for testing");
        return;
      }

      // Get application ID or candidate name before rejecting
      const firstCard = applicationCards.first();
      const candidateName = await firstCard.textContent().catch(() => "");

      await firstCard.click();
      await page.waitForTimeout(500);

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Navigate to rejected applications
      await page.goto(`/jobsmarket/companies/${COMPANY_ID}/dashboard/applications?status=rejected`);
      await waitForPageLoad(page);

      // The application should now appear in rejected list
      if (candidateName) {
        const rejectedCard = page.locator('[role="article"], .application-card').filter({ hasText: candidateName });
        await expect(rejectedCard).toBeVisible({ timeout: 5000 });
      }
    });

    test("should close modal after successful rejection", async ({ page }) => {
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

      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Modal should close after success
      await expect(modal).toBeHidden({ timeout: 5000 });
    });
  });
});
