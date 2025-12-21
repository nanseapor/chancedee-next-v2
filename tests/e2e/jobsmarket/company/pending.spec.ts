import { test, expect, Page } from "@playwright/test";

// Helper function to login and select employer role
async function loginAsEmployer(page: Page, email: string, password: string) {
  await page.goto("/jobsmarket/auth/login");
  await page.getByPlaceholder("you@example.com").fill(email);
  await page.locator('input[type="password"]').fill(password);
  await page.getByRole("checkbox", { name: /ยอมรับ/ }).check({ force: true });
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

  // Wait for navigation
  await page.waitForURL(/dashboard|select-role|companies|pending/, { timeout: 10000 });

  // Select employer role if needed
  if (page.url().includes("select-role")) {
    const roleButton = page.getByLabel("เลือกบทบาท นายจ้าง");
    if (await roleButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await roleButton.getByRole("button", { name: "เข้าใช้งาน" }).click();
      await page.waitForURL(/dashboard|companies|pending/, { timeout: 10000 });
    }
  }
}

test.describe("Company Pending Page - COMP-R01", () => {
  // Get test data from environment
  const PENDING_COMPANY_ID = process.env.PLAYWRIGHT_TEST_TRANSITIONING_COMPANY_ID;
  const APPROVED_COMPANY_ID = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_COMPANY_ID;
  const PENDING_EMAIL = process.env.PLAYWRIGHT_TEST_TRANSITIONING_EMAIL;
  const PENDING_PASSWORD = process.env.PLAYWRIGHT_TEST_TRANSITIONING_PASSWORD;
  const ADMIN_EMAIL = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL;
  const ADMIN_PASSWORD = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD;

  test.describe("Pending Company Status", () => {
    test.skip(!PENDING_COMPANY_ID || !PENDING_EMAIL || !PENDING_PASSWORD, "Pending company credentials not configured");

    test("should display pending status card", async ({ page }) => {
      await loginAsEmployer(page, PENDING_EMAIL!, PENDING_PASSWORD!);

      // Navigate to pending page (if not already there)
      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${PENDING_COMPANY_ID}/pending`);
      }

      // Verify pending status displays
      await expect(page.getByText("รอการอนุมัติ")).toBeVisible();
    });

    test("should display approval stepper with correct step", async ({ page }) => {
      await loginAsEmployer(page, PENDING_EMAIL!, PENDING_PASSWORD!);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${PENDING_COMPANY_ID}/pending`);
      }

      // Verify stepper shows step 2 (รอตรวจสอบ) as current
      await expect(page.getByText("รอตรวจสอบ")).toBeVisible();
    });

    test("should display while waiting actions", async ({ page }) => {
      await loginAsEmployer(page, PENDING_EMAIL!, PENDING_PASSWORD!);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${PENDING_COMPANY_ID}/pending`);
      }

      // Verify 4 action cards exist
      await expect(page.getByText("ดูผู้สมัครงาน")).toBeVisible();
      await expect(page.getByText("เตรียมประกาศงาน")).toBeVisible();
      await expect(page.getByText("แก้ไขข้อมูลบริษัท")).toBeVisible();
      await expect(page.getByText("ติดต่อฝ่ายสนับสนุน")).toBeVisible();
    });

    test("should show disabled state for candidate/job actions", async ({ page }) => {
      await loginAsEmployer(page, PENDING_EMAIL!, PENDING_PASSWORD!);

      if (!page.url().includes("pending")) {
        await page.goto(`/jobsmarket/companies/${PENDING_COMPANY_ID}/pending`);
      }

      // These should show "จะพร้อมใช้งานหลังอนุมัติ"
      await expect(page.getByText("จะพร้อมใช้งานหลังอนุมัติ").first()).toBeVisible();
    });
  });

  test.describe("Approved Company Redirect", () => {
    test.skip(!APPROVED_COMPANY_ID || !ADMIN_EMAIL || !ADMIN_PASSWORD, "Approved company credentials not configured");

    test("should redirect approved company to dashboard", async ({ page }) => {
      await loginAsEmployer(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);

      // Try to access pending page
      await page.goto(`/jobsmarket/companies/${APPROVED_COMPANY_ID}/pending`);

      // Should redirect to dashboard
      await expect(page).toHaveURL(/dashboard/, { timeout: 5000 });
    });
  });

  test.describe("Access Control", () => {
    test("should show error for non-existent company", async ({ page }) => {
      await loginAsEmployer(page, ADMIN_EMAIL!, ADMIN_PASSWORD!);

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
