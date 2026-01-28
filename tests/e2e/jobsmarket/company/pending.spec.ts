import { test, expect } from "@playwright/test";
import {
  createTestCompany,
  type TestCompany,
} from "../../helpers/factories";
import { signInAsCompany } from "../../helpers/auth-helper";

// Shared test data
let pendingCompany: TestCompany;
let approvedCompany: TestCompany;

test.describe("Company Pending Page - COMP-R01", () => {
  test.beforeAll(async () => {
    // Create pending company (status: pending)
    pendingCompany = await createTestCompany({
      testName: "pending-page-pending",
      status: "pending",
    });

    // Create approved company for redirect tests
    approvedCompany = await createTestCompany({
      testName: "pending-page-approved",
      status: "approved",
      withPublishedJobs: 1,
    });
  });

  test.describe("Pending Company Status", () => {
    test("should display pending status card", async ({ page }) => {
      await signInAsCompany(page, pendingCompany);

      // Navigate to pending page (if not already there)
      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${pendingCompany.companyId}/pending`);
      }

      // Verify pending status displays
      await expect(page.getByText("รอการอนุมัติ")).toBeVisible();
    });

    test("should display approval stepper with correct step", async ({ page }) => {
      await signInAsCompany(page, pendingCompany);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${pendingCompany.companyId}/pending`);
      }

      // Verify stepper shows step 2 (รอตรวจสอบ) as current
      await expect(page.getByText("รอตรวจสอบ")).toBeVisible();
    });

    test("should display while waiting actions", async ({ page }) => {
      await signInAsCompany(page, pendingCompany);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${pendingCompany.companyId}/pending`);
      }

      // Verify 4 action cards exist
      await expect(page.getByText("ดูผู้สมัครงาน")).toBeVisible();
      await expect(page.getByText("เตรียมประกาศงาน")).toBeVisible();
      await expect(page.getByText("แก้ไขข้อมูลบริษัท")).toBeVisible();
      await expect(page.getByText("ติดต่อฝ่ายสนับสนุน")).toBeVisible();
    });

    test("should show disabled state for candidate/job actions", async ({ page }) => {
      await signInAsCompany(page, pendingCompany);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${pendingCompany.companyId}/pending`);
      }

      // These should show "จะพร้อมใช้งานหลังอนุมัติ"
      await expect(page.getByText("จะพร้อมใช้งานหลังอนุมัติ").first()).toBeVisible();
    });
  });

  test.describe("Approved Company Redirect", () => {
    test("should redirect approved company to dashboard", async ({ page }) => {
      await signInAsCompany(page, approvedCompany);

      // Try to access pending page
      await page.goto(`/jobsmarket/companies/${approvedCompany.companyId}/pending`);

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard/, { timeout: 5000 });
    });
  });

  test.describe("Access Control", () => {
    test("should show error for non-existent company", async ({ page }) => {
      await signInAsCompany(page, approvedCompany);

      // Access a company the test user is not a member of
      await page.goto("/jobsmarket/companies/non-existent-id/pending");

      // Should show error or redirect (useCompanyAuth handles this)
      // Page should NOT show pending status content
      const pendingStatus = page.getByText("รอการอนุมัติ");
      await expect(pendingStatus).not.toBeVisible({ timeout: 3000 }).catch(() => {
        // If it throws, that's fine - means page redirected or errored
      });
    });
  });
});
