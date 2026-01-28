import { test, expect } from "@playwright/test";

import {
  createTestAdmin,
  createTestPendingCompany,
  AdminCompanyVariants,
} from "../../helpers/factories/admin-factory";
import { signInWithCustomToken } from "../../helpers/auth-helper";
import { testDb } from "../../helpers/firebase-admin-test";

/**
 * E2E tests for Admin Company Detail Page
 * Per ADM-R02 Company Management RIS §3.2 Company Detail
 *
 * Tests the company detail page functionality including:
 * - Viewing company information
 * - Status badge display
 * - Action buttons based on status
 * - Navigation
 * - Access control
 *
 * Coverage: All user flows from RIS §3.2
 */

/**
 * Helper to wait for Firestore index consistency
 */
async function waitForFirestoreConsistency(ms: number = 5000): Promise<void> {
  await new Promise((resolve) => setTimeout(resolve, ms));
}

test.describe("Admin Company Detail - ADM-R02", () => {
  test.setTimeout(60000);

  test.describe("Access Control", () => {
    test("should redirect non-admin user to login", async ({ page }) => {
      // Navigate without authentication
      await page.goto("/platform/companies/any-company-id");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect user without chancedee role to 403", async ({
      page,
    }) => {
      // Create a regular company user (not admin)
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "detail-access-control",
      });

      // Login as company user
      await signInWithCustomToken(page, company.customToken);

      // Try to access admin page
      await page.goto(`/platform/companies/${company.companyId}`);

      // Should redirect to 403 or login
      await expect(page).toHaveURL(/\/(403|auth\/login)/);
    });

    test("should allow admin user to view company detail", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-access-admin",
      });
      const company = await createTestPendingCompany({
        testName: "detail-access-admin",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);

      await page.goto(`/platform/companies/${company.companyId}`);

      // Should see the company detail page
      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });
    });
  });

  test.describe("Company Information Display", () => {
    test("should display company name and email", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-info-display",
      });
      const company = await createTestPendingCompany({
        companyName: "บริษัทแสดงข้อมูล จำกัด",
        testName: "detail-info-display",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      // Should show company name
      await expect(page.getByText("บริษัทแสดงข้อมูล จำกัด")).toBeVisible({
        timeout: 15000,
      });

      // Should show email (appears in both header and overview, use first())
      await expect(page.getByText(company.email).first()).toBeVisible();
    });

    test("should display company address", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-address",
      });
      const company = await createTestPendingCompany({
        testName: "detail-address",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      // Should show address components
      await expect(page.getByText(/กรุงเทพมหานคร/)).toBeVisible({
        timeout: 15000,
      });
    });

    test("should display company industry", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-industry",
      });
      const company = await createTestPendingCompany({
        industry: "เทคโนโลยี",
        testName: "detail-industry",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(page.getByText("เทคโนโลยี")).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Status Badge", () => {
    test("should display pending status badge", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-status-pending",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "detail-status-pending",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      const statusBadge = page.getByTestId("company-status-badge");
      await expect(statusBadge).toBeVisible({ timeout: 15000 });
      await expect(statusBadge).toContainText(/pending|รอการอนุมัติ/i);
    });

    test("should display approved status badge", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-status-approved",
      });
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "detail-status-approved",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      const statusBadge = page.getByTestId("company-status-badge");
      await expect(statusBadge).toBeVisible({ timeout: 15000 });
      await expect(statusBadge).toContainText(/approved|อนุมัติ/i);
    });

    test("should display suspended status badge", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-status-suspended",
      });
      const company = await createTestPendingCompany({
        status: "suspended",
        testName: "detail-status-suspended",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      const statusBadge = page.getByTestId("company-status-badge");
      await expect(statusBadge).toBeVisible({ timeout: 15000 });
      await expect(statusBadge).toContainText(/suspended|ถูกระงับ/i);
    });
  });

  test.describe("Action Buttons", () => {
    test("should show Approve and Reject buttons for pending company", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "detail-actions-pending",
      });
      const company = await createTestPendingCompany({
        status: "pending",
        testName: "detail-actions-pending",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(
        page.getByRole("button", { name: /approve|อนุมัติ/i })
      ).toBeVisible({ timeout: 15000 });
      await expect(
        page.getByRole("button", { name: /reject|ปฏิเสธ/i })
      ).toBeVisible();
    });

    test("should show Suspend button for approved company", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "detail-actions-approved",
      });
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "detail-actions-approved",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(
        page.getByRole("button", { name: /suspend|ระงับ/i })
      ).toBeVisible({ timeout: 15000 });
    });

    test("should show Reactivate button for suspended company", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "detail-actions-suspended",
      });
      const company = await createTestPendingCompany({
        status: "suspended",
        testName: "detail-actions-suspended",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);
      await page.goto(`/platform/companies/${company.companyId}`);

      await expect(
        page.getByRole("button", { name: /reactivate|เปิดใช้งาน/i })
      ).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Navigation", () => {
    test("should navigate back to list on back button click", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "detail-nav-back",
      });
      const company = await createTestPendingCompany({
        testName: "detail-nav-back",
      });

      await waitForFirestoreConsistency();
      await signInWithCustomToken(page, admin.customToken);

      // First go to list
      await page.goto("/platform/companies");
      await expect(page.getByRole("heading", { name: /companies/i })).toBeVisible();

      // Then navigate to detail
      await page.goto(`/platform/companies/${company.companyId}`);
      await expect(page.getByText(company.companyName)).toBeVisible({
        timeout: 15000,
      });

      // Click back button
      await page.getByRole("button", { name: /back|กลับ/i }).click();

      // Should be back at list
      await expect(page).toHaveURL(/\/platform\/companies(?!\/)/, {
        timeout: 10000,
      });
    });
  });

  test.describe("404 Handling", () => {
    test("should show 404 for non-existent company", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-404",
      });

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies/nonexistent-company-id");

      // Should show not found message
      await expect(page.getByTestId("company-not-found")).toBeVisible({
        timeout: 15000,
      });
    });

    test("should provide link back to list on 404", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "detail-404-link",
      });

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies/nonexistent-company-id");

      // Should have link back to list
      const backLink = page.getByRole("link", { name: /back to list|กลับ/i });
      await expect(backLink).toBeVisible({ timeout: 15000 });
    });
  });
});
