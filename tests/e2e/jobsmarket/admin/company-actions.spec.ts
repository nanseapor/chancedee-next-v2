import { test, expect } from "@playwright/test";

import {
  createTestAdmin,
  createTestPendingCompany,
} from "../../helpers/factories/admin-factory";
import { signInWithCustomToken } from "../../helpers/auth-helper";

/**
 * E2E tests for Admin Company Actions
 * Per ADM-R02 Company Management RIS §3.3 Company Actions
 *
 * Tests the full user flow for approving, rejecting,
 * suspending, and reactivating companies.
 *
 * Coverage: All action flows from RIS §3.3
 */

/**
 * Helper to wait for Firestore index consistency
 */
async function waitForFirestoreConsistency(ms: number = 5000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe("Admin Company Actions - ADM-R02", () => {
  test.setTimeout(90000);

  test.describe("Approve Action", () => {
    test("should show approve confirmation modal", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-approve-modal",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-approve-modal",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      // Wait for page to load
      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click approve button
      await page.getByRole("button", { name: /อนุมัติ/i }).click();

      // Modal should appear
      await expect(page.getByRole("dialog")).toBeVisible();
      // Check for confirm button specifically (avoid matching both title and button)
      await expect(page.getByRole("button", { name: /ยืนยัน|confirm/i })).toBeVisible();
    });

    test("should approve pending company on confirm", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-approve-confirm",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-approve-confirm",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click approve and confirm
      await page.getByRole("button", { name: /อนุมัติ/i }).click();
      await page.getByRole("button", { name: /ยืนยัน|confirm/i }).click();

      // Wait for action to complete
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

      // Status should change to approved
      await expect(
        page.getByTestId("company-status-badge")
      ).toContainText(/approved|อนุมัติ/i, { timeout: 10000 });
    });

    test("should not change status when cancelled", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-approve-cancel",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-approve-cancel",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click approve then cancel
      await page.getByRole("button", { name: /อนุมัติ/i }).click();
      await page.getByRole("button", { name: /ยกเลิก|cancel/i }).click();

      // Modal should close
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // Status should still be pending
      await expect(
        page.getByTestId("company-status-badge")
      ).toContainText(/pending|รอการอนุมัติ/i);
    });
  });

  test.describe("Reject Action", () => {
    test("should show reject modal with reason input", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-reject-modal",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-reject-modal",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click reject button
      await page.getByRole("button", { name: /ปฏิเสธ/i }).click();

      // Modal should appear with reason input
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: /เหตุผล|reason/i })
      ).toBeVisible();
    });

    test("should reject pending company with reason", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-reject-confirm",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-reject-confirm",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click reject
      await page.getByRole("button", { name: /ปฏิเสธ/i }).click();

      // Enter reason
      await page
        .getByRole("textbox", { name: /เหตุผล|reason/i })
        .fill("ข้อมูลไม่ครบถ้วน");

      // Confirm
      await page.getByRole("button", { name: /ปฏิเสธ|ยืนยัน|confirm/i }).last().click();

      // Wait for action to complete
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

      // Status should change to rejected
      await expect(
        page.getByTestId("company-status-badge")
      ).toContainText(/rejected|ไม่อนุมัติ/i, { timeout: 10000 });
    });
  });

  test.describe("Suspend Action", () => {
    test("should show suspend modal for approved company", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-suspend-modal",
      });
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "action-suspend-modal",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click suspend button
      await page.getByRole("button", { name: /ระงับ/i }).click();

      // Modal should appear
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(
        page.getByRole("textbox", { name: /เหตุผล|reason/i })
      ).toBeVisible();
    });

    test("should suspend approved company with reason", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-suspend-confirm",
      });
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "action-suspend-confirm",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click suspend
      await page.getByRole("button", { name: /ระงับ/i }).click();

      // Enter reason
      await page
        .getByRole("textbox", { name: /เหตุผล|reason/i })
        .fill("ละเมิดข้อกำหนด");

      // Confirm
      await page.getByRole("button", { name: /ระงับ|ยืนยัน|confirm/i }).last().click();

      // Wait for action to complete
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

      // Status should change to suspended
      await expect(
        page.getByTestId("company-status-badge")
      ).toContainText(/suspended|ถูกระงับ/i, { timeout: 10000 });
    });
  });

  test.describe("Reactivate Action", () => {
    test("should show reactivate modal for suspended company", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "action-reactivate-modal",
      });
      const company = await createTestPendingCompany({
        status: "suspended",
        testName: "action-reactivate-modal",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click reactivate button
      await page.getByRole("button", { name: /เปิดใช้งาน/i }).click();

      // Modal should appear
      await expect(page.getByRole("dialog")).toBeVisible();
    });

    test("should reactivate suspended company", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-reactivate-confirm",
      });
      const company = await createTestPendingCompany({
        status: "suspended",
        testName: "action-reactivate-confirm",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click reactivate
      await page.getByRole("button", { name: /เปิดใช้งาน/i }).click();

      // Confirm
      await page.getByRole("button", { name: /เปิดใช้งาน|ยืนยัน|confirm/i }).last().click();

      // Wait for action to complete
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

      // Status should change to approved
      await expect(
        page.getByTestId("company-status-badge")
      ).toContainText(/approved|อนุมัติ/i, { timeout: 10000 });
    });
  });

  test.describe("List Integration", () => {
    test("should update company list after approval", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "action-list-approve",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "action-list-approve",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);

      // Helper function with retry logic for dev server compilation delays
      async function waitForCompanyRow(
        url: string,
        testId: string,
        maxRetries = 2
      ): Promise<void> {
        let lastError: Error | null = null;
        for (let attempt = 0; attempt <= maxRetries; attempt++) {
          try {
            await page.goto(url);
            await page.waitForLoadState("domcontentloaded");
            await expect(page.getByRole("table")).toBeVisible({ timeout: 30000 });
            // Wait for skeleton to disappear
            await expect(page.getByTestId("skeleton-row").first()).toBeHidden({ timeout: 20000 }).catch(() => {});
            await expect(page.getByTestId(testId)).toBeVisible({ timeout: 15000 });
            return;
          } catch (error) {
            lastError = error as Error;
            if (attempt < maxRetries) {
              // console.log(`[DEBUG] Attempt ${attempt + 1} failed for ${testId}, retrying...`);
              await page.waitForTimeout(2000);
            }
          }
        }
        throw lastError;
      }

      // Start on company list - pending tab with search for specific company
      await waitForCompanyRow(
        `/platform/companies?status=pending&search=${company.companyId}`,
        `company-row-${company.companyId}`
      );

      // Navigate to detail and approve
      await page.goto(`/platform/companies/${company.companyId}`);
      await expect(page.getByText(company.companyName).first()).toBeVisible({
        timeout: 15000,
      });

      await page.getByRole("button", { name: /อนุมัติ/i }).click();
      await page.getByRole("button", { name: /ยืนยัน|confirm/i }).click();

      // Wait for action
      await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 10000 });

      // Go back to list - approved tab with search for specific company
      await waitForCompanyRow(
        `/platform/companies?status=approved&search=${company.companyId}`,
        `company-row-${company.companyId}`
      );
    });
  });
});
