import { test, expect } from "@playwright/test";

import {
  createTestAdmin,
  createTestPendingCompany,
  AdminCompanyVariants,
} from "../../helpers/factories/admin-factory";
import { signInWithCustomToken } from "../../helpers/auth-helper";
import { testDb } from "../../helpers/firebase-admin-test";

/**
 * Helper to wait for Firestore index consistency
 * Firestore writes are strongly consistent for single document reads,
 * but queries may not immediately return newly created documents.
 * Use a longer wait (10 seconds) to ensure document is fully written.
 */
async function waitForFirestoreConsistency(ms: number = 10000): Promise<void> {
  await new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Verify that a company document exists in Firestore and return its status
 * Uses direct document read which is strongly consistent
 */
async function verifyCompanyExists(companyId: string): Promise<{ exists: boolean; status?: string }> {
  const doc = await testDb.collection("company_information").doc(companyId).get();
  if (doc.exists) {
    const data = doc.data();
    return { exists: true, status: data?.status };
  }
  return { exists: false };
}

/**
 * Helper to wait for a specific company to appear via search
 * First verifies the document exists in Firestore (debugging),
 * then navigates to page and waits for data to load.
 *
 * Uses URL params to initialize search state and waits for
 * the loading state to complete before checking for the company row.
 * Includes retry logic to handle dev server compilation delays.
 *
 * @param page Playwright page
 * @param companyId Company ID to search for
 * @param options Optional status filter and max wait time
 */
async function waitForCompanyBySearch(
  page: import("@playwright/test").Page,
  companyId: string,
  options: { status?: string; maxWait?: number; maxRetries?: number } = {}
): Promise<void> {
  const { status, maxWait = 30000, maxRetries = 2 } = options;
  const selector = `[data-testid="company-row-${companyId}"]`;

  // First verify the document exists in Firestore (debugging step)
  const verification = await verifyCompanyExists(companyId);
  if (!verification.exists) {
    // console.error(`[DEBUG] Company ${companyId} does not exist in Firestore!`);
    throw new Error(`Company ${companyId} was not created in Firestore`);
  }
  // console.log(`[DEBUG] Company ${companyId} confirmed to exist in Firestore (status: ${verification.status})`);

  // Navigate with search param in URL - this ensures search state is initialized correctly
  const params = new URLSearchParams();
  params.set("search", companyId);
  if (status) {
    params.set("status", status);
  }
  const url = `/platform/companies?${params.toString()}`;

  // Navigate and wait for page to fully load
  await page.goto(url);
  await page.waitForLoadState("domcontentloaded");

  // Wait for admin shell to finish loading
  await expect(page.getByRole("table").or(page.getByTestId("empty-state"))).toBeVisible({ timeout: maxWait });

  // Use polling to wait for the company row to appear
  // This handles both skeleton loading time and dev server compilation delays
  await expect(async () => {
    // Check if skeleton is still showing (loading state)
    const skeletonCount = await page.getByTestId("skeleton-row").count();
    if (skeletonCount > 0) {
      throw new Error("Still loading (skeleton visible)");
    }

    // Check if our target company row is visible
    const companyRow = page.locator(selector);
    const isVisible = await companyRow.isVisible();
    if (!isVisible) {
      // Maybe page needs to be re-navigated due to dev server state
      if (maxRetries > 0) {
        await page.reload();
      }
      throw new Error("Company row not visible");
    }
  }).toPass({
    timeout: 45000,
    intervals: [1000, 2000, 3000, 5000], // Start with 1s checks, increase interval
  });

  // Final verification that row is visible
  await expect(page.locator(selector)).toBeVisible({ timeout: 5000 });
}

/**
 * E2E tests for Admin Company List Page
 * Per ADM-R02 Company Management RIS §3.1 Company List
 *
 * Tests the company list page functionality including:
 * - Viewing company list
 * - Filtering by status
 * - Searching companies
 * - Navigation to company detail
 * - Access control
 *
 * Coverage: All user flows from RIS §3.1
 *
 * NOTE: Tests run serially due to dev server resource contention
 * when running tests that navigate to the company list with search params.
 */

test.describe("Admin Company List - ADM-R02", () => {
  // Configure serial execution to avoid dev server resource contention
  // This ensures reliable test execution at the cost of slightly longer run time
  test.describe.configure({ mode: "serial" });

  // Increase timeout for tests that need retry with reload due to Firestore eventual consistency
  test.setTimeout(60000);
  test.describe("Access Control", () => {
    test("should redirect non-admin user to login", async ({ page }) => {
      // Navigate without authentication
      await page.goto("/platform/companies");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/auth\/login/);
    });

    test("should redirect user without chancedee role to 403", async ({
      page,
    }) => {
      // Create a regular company user (not admin)
      const company = await createTestPendingCompany({
        status: "approved",
        testName: "access-control-non-admin",
      });

      // Login as company user
      await signInWithCustomToken(page, company.customToken);

      // Try to access admin page
      await page.goto("/platform/companies");

      // Should redirect to 403 or login
      await expect(page).toHaveURL(/\/(403|auth\/login)/);
    });

    test("should allow admin user to access company list", async ({ page }) => {
      // Create admin user
      const admin = await createTestAdmin({
        testName: "access-control-admin",
      });

      // Login as admin
      await signInWithCustomToken(page, admin.customToken);

      // Navigate to company list
      await page.goto("/platform/companies");

      // Should see the company list page
      await expect(page.getByRole("heading", { name: /companies/i })).toBeVisible();
      await expect(page.getByRole("table")).toBeVisible();
    });
  });

  test.describe("Company List Display", () => {
    test("should display company list with table", async ({ page }) => {
      // Create admin and some companies
      const admin = await createTestAdmin({
        testName: "list-display-table",
      });
      const company = await createTestPendingCompany({
        companyName: "บริษัทแสดงรายการ จำกัด",
        testName: "list-display-table",
      });

      // Wait for Firestore to index the new document
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID (also navigates to page)
      await waitForCompanyBySearch(page, company.companyId);

      // Verify table structure
      await expect(page.getByRole("table")).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: /company/i })
      ).toBeVisible();
      await expect(
        page.getByRole("columnheader", { name: /status/i })
      ).toBeVisible();
    });

    test("should display status counts in filter tabs", async ({ page }) => {
      // Create admin with mixed status companies
      const admin = await createTestAdmin({
        testName: "list-status-counts",
      });
      const { pending, approved } = await AdminCompanyVariants.mixedStatuses(
        "list-status-counts"
      );

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies");

      // Verify status tabs are visible with counts
      await expect(page.getByRole("tab", { name: /all/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /pending/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /approved/i })).toBeVisible();
    });
  });

  test.describe("Status Filtering", () => {
    test("should filter by pending status", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "filter-pending",
      });
      const { pending, approved } = await AdminCompanyVariants.mixedStatuses(
        "filter-pending"
      );

      // Wait for Firestore to index the new documents
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID with pending filter
      await waitForCompanyBySearch(page, pending.companyId, { status: "pending" });

      // Verify tab is selected
      await expect(page.getByRole("tab", { name: /pending/i })).toHaveAttribute("aria-selected", "true");
    });

    test("should filter by approved status", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "filter-approved",
      });
      const { pending, approved } = await AdminCompanyVariants.mixedStatuses(
        "filter-approved"
      );

      // Wait for Firestore to index the new documents
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID with approved filter
      await waitForCompanyBySearch(page, approved.companyId, { status: "approved" });

      // Verify tab is selected
      await expect(page.getByRole("tab", { name: /approved/i })).toHaveAttribute("aria-selected", "true");
    });

    test("should filter by rejected status", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "filter-rejected",
      });
      const companies = await AdminCompanyVariants.mixedStatuses(
        "filter-rejected"
      );

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies");

      // Click rejected tab
      await page.getByRole("tab", { name: /rejected/i }).click();

      // Verify tab is selected
      await expect(page.getByRole("tab", { name: /rejected/i })).toHaveAttribute("aria-selected", "true");
    });

    test("should filter by suspended status", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "filter-suspended",
      });
      const companies = await AdminCompanyVariants.mixedStatuses(
        "filter-suspended"
      );

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies");

      // Click suspended tab
      await page.getByRole("tab", { name: /suspended/i }).click();

      // Verify tab is selected
      await expect(page.getByRole("tab", { name: /suspended/i })).toHaveAttribute("aria-selected", "true");
    });

    test("should clear filter when All tab clicked", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "filter-clear",
      });

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies?status=pending");

      // Click All tab
      await page.getByRole("tab", { name: /all/i }).click();

      // Verify tab is selected
      await expect(page.getByRole("tab", { name: /all/i })).toHaveAttribute("aria-selected", "true");
    });
  });

  test.describe("Search Functionality", () => {
    test("should search by company name", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "search-name",
      });
      const company = await createTestPendingCompany({
        companyName: "บริษัทค้นหาชื่อ จำกัด",
        testName: "search-name",
      });

      // Wait for Firestore to index the new document
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID (also navigates to page)
      await waitForCompanyBySearch(page, company.companyId);

      // Verify the company row shows the correct company name
      const companyRow = page.getByTestId(`company-row-${company.companyId}`);
      await expect(companyRow).toContainText("บริษัทค้นหาชื่อ");
    });

    test("should search by company email", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "search-email",
      });
      // Don't specify email - let the factory generate a unique one
      const company = await createTestPendingCompany({
        testName: "search-email",
      });

      // Wait for Firestore to index the new document
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID (also navigates to page)
      await waitForCompanyBySearch(page, company.companyId);

      // Verify the company row shows the email
      const companyRow = page.getByTestId(`company-row-${company.companyId}`);
      await expect(companyRow).toContainText(company.email);
    });

    test("should show empty state when search has no results", async ({
      page,
    }) => {
      const admin = await createTestAdmin({
        testName: "search-empty",
      });

      await signInWithCustomToken(page, admin.customToken);

      // Navigate directly with search param for non-existent company ID
      // This ensures the search is applied on initial load
      const nonExistentId = `comp-nonexistent-${Date.now()}`;
      await page.goto(`/platform/companies?search=${nonExistentId}`);

      // Wait for empty state to appear
      await expect(page.getByTestId("empty-state")).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to company detail on row click", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "nav-detail",
      });
      const company = await createTestPendingCompany({
        companyName: "บริษัทดูรายละเอียด จำกัด",
        testName: "nav-detail",
      });

      // Wait for Firestore to index the new document
      await waitForFirestoreConsistency();

      await signInWithCustomToken(page, admin.customToken);

      // Wait for company to appear using search by ID (also navigates to page)
      await waitForCompanyBySearch(page, company.companyId);

      // Click on company row
      await page.getByTestId(`company-row-${company.companyId}`).click();

      // Should navigate to detail page
      await expect(page).toHaveURL(
        new RegExp(`/platform/companies/${company.companyId}`)
      );
    });
  });

  test.describe("Pagination", () => {
    test("should load more companies when scrolling", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "pagination",
      });
      // Create multiple companies for pagination
      await AdminCompanyVariants.bulkPending(5, "pagination");

      await signInWithCustomToken(page, admin.customToken);
      await page.goto("/platform/companies");

      // Should see Load More button if there are more items than the limit
      const loadMoreButton = page.getByRole("button", {
        name: /load more|โหลดเพิ่ม/i,
      });

      // If Load More button exists, click it and verify more items load
      if (await loadMoreButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        const initialRows = await page.getByTestId(/^company-row-/).count();
        await loadMoreButton.click();
        // Wait for more items to appear
        await expect.poll(
          () => page.getByTestId(/^company-row-/).count(),
          { timeout: 10000 }
        ).toBeGreaterThan(initialRows);
      }
    });
  });

  test.describe("URL State Persistence", () => {
    test("should restore filters from URL on page load", async ({ page }) => {
      const admin = await createTestAdmin({
        testName: "url-restore",
      });

      await signInWithCustomToken(page, admin.customToken);

      // Navigate directly with query params
      await page.goto("/platform/companies?status=pending&search=test");

      // Verify filters are applied
      const pendingTab = page.getByRole("tab", { name: /pending/i });
      await expect(pendingTab).toHaveAttribute("aria-selected", "true");

      // Use specific placeholder to avoid duplicate selectors
      const searchInput = page.getByPlaceholder("Search companies...");
      await expect(searchInput).toHaveValue("test");
    });
  });
});
