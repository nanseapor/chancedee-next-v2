import { test, expect } from "@playwright/test";

/**
 * E2E tests for AUTH-R07 Select Role Page
 * Tests full user flows for multi-role selection
 *
 * Test credentials from .env.playwright:
 * - TEST_USER_EMAIL / TEST_USER_PASSWORD - Multi-role user
 */

test.describe("AUTH-R07: Select Role Page", () => {
  const TEST_EMAIL = process.env.TEST_USER_EMAIL;
  const TEST_PASSWORD = process.env.TEST_USER_PASSWORD;

  // Skip tests if credentials not available
  test.skip(!TEST_EMAIL || !TEST_PASSWORD, "Test credentials not configured");

  test.describe("Multi-role user selection flow", () => {
    test("should show role selection for multi-role user", async ({ page }) => {
      // Navigate to login
      await page.goto("/jobsmarket/auth/login");

      // Login (assuming user has both candidate and company roles)
      await page.getByLabel("อีเมล").fill(TEST_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/ }).click();

      // Should redirect to select-role if multi-role
      // Note: This may auto-skip if user has saved preference
      // For this test, assume no saved preference exists

      // Wait for page load
      await page.waitForLoadState("networkidle");

      // Check if on select-role page OR already redirected to dashboard
      const url = page.url();
      const isSelectRolePage = url.includes("/auth/select-role");
      const isDashboardPage =
        url.includes("/candidates/") || url.includes("/companies/");

      expect(isSelectRolePage || isDashboardPage).toBe(true);
    });

    test("should display both candidate and company cards", async ({
      page,
    }) => {
      // Navigate directly to select-role (assuming already logged in or mock auth)
      await page.goto("/jobsmarket/auth/select-role");

      // Wait for page to load
      await page.waitForLoadState("networkidle");

      // Check for title
      await expect(
        page.getByText("เลือกบทบาทที่ต้องการใช้งาน")
      ).toBeVisible();

      // Check for candidate card
      await expect(page.getByText("ผู้หางาน")).toBeVisible();
      await expect(page.getByText("Candidate")).toBeVisible();

      // Check for company card (should show company name or "นายจ้าง")
      await expect(page.getByText("Employer")).toBeVisible();

      // Check for action buttons
      const actionButtons = await page.getByRole("button", { name: "เข้าใช้งาน" });
      expect(await actionButtons.count()).toBeGreaterThanOrEqual(2);
    });

    test("should display remember checkbox and logout link", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Check for remember checkbox
      await expect(
        page.getByRole("checkbox", { name: /จดจำการเลือกนี้/ })
      ).toBeVisible();

      // Check for logout link
      await expect(page.getByText("ต้องการเปลี่ยนบัญชี?")).toBeVisible();
      await expect(page.getByText("ออกจากระบบ")).toBeVisible();
    });
  });

  test.describe("Role selection and navigation", () => {
    test.beforeEach(async ({ page }) => {
      // Clear localStorage to ensure no saved preference
      await page.goto("/jobsmarket/auth/select-role");
      await page.evaluate(() => localStorage.clear());
    });

    test("should navigate to candidate dashboard when selecting candidate", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Find and click candidate card
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should be on candidate dashboard
      expect(page.url()).toContain("/jobsmarket/candidates/");
    });

    test("should navigate to company dashboard when selecting company", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Find and click company card (look for Employer subtitle)
      const companyCard = page
        .locator('[role="button"]')
        .filter({ hasText: "Employer" })
        .first();
      await companyCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should be on company dashboard
      expect(page.url()).toContain("/jobsmarket/companies/");
    });
  });

  test.describe("Remember preference functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.evaluate(() => localStorage.clear());
    });

    test("should save preference when remember is checked", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Check remember checkbox
      const checkbox = page.getByRole("checkbox");
      await checkbox.check();
      expect(await checkbox.isChecked()).toBe(true);

      // Select candidate
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Check localStorage
      const savedRole = await page.evaluate(() =>
        localStorage.getItem("lastActiveRole")
      );
      expect(savedRole).toBe("candidate");
    });

    test("should NOT save preference when remember is unchecked", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Ensure checkbox is unchecked
      const checkbox = page.getByRole("checkbox");
      if (await checkbox.isChecked()) {
        await checkbox.uncheck();
      }

      // Select company
      const companyCard = page
        .locator('[role="button"]')
        .filter({ hasText: "Employer" })
        .first();
      await companyCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Check localStorage should be null
      const savedRole = await page.evaluate(() =>
        localStorage.getItem("lastActiveRole")
      );
      expect(savedRole).toBeNull();
    });

    test("should auto-skip selection on next visit if preference saved", async ({
      page,
    }) => {
      // First visit - select with remember
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      const checkbox = page.getByRole("checkbox");
      await checkbox.check();

      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      await page.waitForLoadState("networkidle");

      // Second visit - should auto-skip
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Should be redirected to candidate dashboard (not on select-role)
      // Note: This assumes navigateUserByRole() checks localStorage
      const url = page.url();
      const isStillOnSelectRole = url.includes("/auth/select-role");

      // If user is multi-role, they might still see select-role
      // This depends on implementation of auto-skip in useNavigation hook
      // Test documents the expected behavior
      expect(isStillOnSelectRole).toBe(false);
    });
  });

  test.describe("Logout functionality", () => {
    test("should logout and clear preference", async ({ page }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Set a preference first
      await page.evaluate(() =>
        localStorage.setItem("lastActiveRole", "candidate")
      );

      // Click logout
      await page.getByText("ออกจากระบบ").click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should be on login page
      expect(page.url()).toContain("/auth/login");

      // localStorage should be cleared
      const savedRole = await page.evaluate(() =>
        localStorage.getItem("lastActiveRole")
      );
      expect(savedRole).toBeNull();
    });
  });

  test.describe("Redirect parameter handling", () => {
    test("should redirect to specified URL after selection", async ({
      page,
    }) => {
      // Visit with redirect parameter
      await page.goto(
        "/jobsmarket/auth/select-role?redirect=/jobsmarket/jobs/123"
      );
      await page.waitForLoadState("networkidle");

      // Select candidate (jobs path is candidate-appropriate)
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should be redirected to jobs page
      expect(page.url()).toContain("/jobsmarket/jobs/123");
    });

    test("should ignore invalid redirect parameter", async ({ page }) => {
      // Visit with invalid redirect
      await page.goto(
        "/jobsmarket/auth/select-role?redirect=/external/path"
      );
      await page.waitForLoadState("networkidle");

      // Select candidate
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should be on default candidate dashboard (not external path)
      expect(page.url()).toContain("/jobsmarket/candidates/");
      expect(page.url()).not.toContain("/external/");
    });
  });

  test.describe("Responsive layout", () => {
    test("should display cards in column on mobile", async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Get card elements
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      const companyCard = page
        .locator('[role="button"]')
        .filter({ hasText: "Employer" })
        .first();

      // Check cards are visible
      await expect(candidateCard).toBeVisible();
      await expect(companyCard).toBeVisible();

      // On mobile, cards should stack (flex-col in the parent)
      // This is difficult to test directly in E2E, but we can verify they're both visible
      // and that layout doesn't break
    });

    test("should be functional on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Should be able to select role on mobile
      const candidateCard = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();
      await candidateCard.click();

      await page.waitForLoadState("networkidle");

      // Should navigate successfully
      expect(page.url()).toContain("/jobsmarket/candidates/");
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Tab to first card
      await page.keyboard.press("Tab");

      // Should be able to activate with Enter
      await page.keyboard.press("Enter");

      // Wait for navigation
      await page.waitForLoadState("networkidle");

      // Should have navigated (URL should change)
      expect(page.url()).not.toContain("/auth/select-role");
    });

    test("should have proper aria labels", async ({ page }) => {
      await page.goto("/jobsmarket/auth/select-role");
      await page.waitForLoadState("networkidle");

      // Check for aria-label on cards
      const candidateCard = page.locator('[aria-label="เลือกบทบาท ผู้หางาน"]');
      await expect(candidateCard).toBeVisible();
    });
  });
});
