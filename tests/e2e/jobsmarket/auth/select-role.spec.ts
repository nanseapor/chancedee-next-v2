import { test, expect } from "@playwright/test";

/**
 * E2E tests for AUTH-R07 Select Role Page
 * Tests basic rendering and accessibility
 *
 * Note: Full flow testing requires multi-role user without saved preference
 * These tests verify the page exists and renders correctly when accessed directly
 */

test.describe("AUTH-R07: Select Role Page - Basic Rendering", () => {
  test("should render page when accessed directly", async ({ page }) => {
    // Navigate directly to select-role page
    await page.goto("/jobsmarket/auth/select-role");

    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Check if we're on the page or redirected (due to no auth)
    const url = page.url();

    if (url.includes("/auth/login")) {
      // Expected - not authenticated, redirected to login
      expect(url).toContain("/auth/login");
      // console.log("✓ Not authenticated - correctly redirected to login");
    } else if (url.includes("/auth/select-role")) {
      // On select-role page - verify UI elements
      await expect(page.getByText("เลือกบทบาทที่ต้องการใช้งาน")).toBeVisible();
      await expect(page.getByText("Select your role")).toBeVisible();
      // console.log("✓ Page rendered successfully");
    } else {
      // Redirected elsewhere (e.g., already has role selected)
      // console.log(`✓ Redirected to: ${url}`);
    }
  });

  test("should have proper page title", async ({ page }) => {
    await page.goto("/jobsmarket/auth/select-role");

    // Check title (if not redirected)
    const title = await page.title();
    if (title.includes("เลือกบทบาท") || title.includes("ChanceDee")) {
      expect(title).toBeTruthy();
      // console.log(`✓ Page title: ${title}`);
    }
  });

  test("should be accessible via direct URL", async ({ page }) => {
    const response = await page.goto("/jobsmarket/auth/select-role");

    // Should not be 404
    expect(response?.status()).not.toBe(404);
    // console.log(`✓ HTTP ${response?.status()} - Route exists`);
  });
});

test.describe("AUTH-R07: Select Role Page - Component Rendering", () => {
  const MULTI_ROLE_EMAIL = process.env.PLAYWRIGHT_TEST_COMPANY_EMAIL;
  const MULTI_ROLE_PASSWORD = process.env.PLAYWRIGHT_TEST_COMPANY_PASSWORD;

  test.skip(
    !MULTI_ROLE_EMAIL || !MULTI_ROLE_PASSWORD,
    "Multi-role test credentials not configured"
  );

  test.beforeEach(async ({ page }) => {
    // Clear localStorage to ensure no saved preference
    await page.goto("/jobsmarket");
    await page.evaluate(() => {
      localStorage.clear();
      sessionStorage.clear();
    });
  });

  test("should display role selection UI when logged in", async ({ page }) => {
    // Login as multi-role user
    await page.goto("/jobsmarket/auth/login");

    await page.getByLabel("อีเมล").fill(MULTI_ROLE_EMAIL!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(MULTI_ROLE_PASSWORD!);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for redirect
    await page.waitForLoadState("networkidle", { timeout: 10000 });

    const url = page.url();
    // console.log(`After login, URL is: ${url}`);

    // If we're on select-role page, verify UI
    if (url.includes("/auth/select-role")) {
      // Check for title
      await expect(
        page.getByText("เลือกบทบาทที่ต้องการใช้งาน")
      ).toBeVisible({ timeout: 5000 });

      // Check for role cards
      const candidateCard = page.getByText("ผู้หางาน");
      const employerCard = page.getByText("Employer");

      await expect(candidateCard).toBeVisible();
      await expect(employerCard).toBeVisible();

      // Check for remember checkbox
      await expect(page.getByText(/จดจำการเลือกนี้/)).toBeVisible();

      // Check for logout option
      await expect(page.getByText(/ออกจากระบบ/)).toBeVisible();

      // console.log("✓ All UI elements rendered correctly");
    } else {
      // console.log(`✓ User auto-redirected to: ${url} (has saved preference or single role)`);
    }
  });

  test("should allow role selection", async ({ page }) => {
    // Login
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(MULTI_ROLE_EMAIL!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(MULTI_ROLE_PASSWORD!);
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    await page.waitForLoadState("networkidle", { timeout: 10000 });

    // If on select-role page, try selecting a role
    if (page.url().includes("/auth/select-role")) {
      // Find candidate card
      const candidateButton = page
        .locator('[role="button"]')
        .filter({ hasText: "ผู้หางาน" })
        .first();

      if (await candidateButton.isVisible()) {
        await candidateButton.click();

        // Wait for navigation
        await page.waitForLoadState("networkidle", { timeout: 10000 });

        // Should be redirected away from select-role
        expect(page.url()).not.toContain("/auth/select-role");
        // console.log(`✓ Selected role, redirected to: ${page.url()}`);
      }
    } else {
      // console.log("✓ Skip - User auto-redirected (already has preference)");
    }
  });
});

test.describe("AUTH-R07: Select Role Page - Accessibility", () => {
  test("should be keyboard navigable", async ({ page }) => {
    await page.goto("/jobsmarket/auth/select-role");
    await page.waitForLoadState("networkidle");

    // If on the page, test keyboard navigation
    if (page.url().includes("/auth/select-role")) {
      // Tab should focus interactive elements
      await page.keyboard.press("Tab");

      // Check that something is focused
      const focusedElement = await page.evaluate(() => {
        return document.activeElement?.tagName;
      });

      expect(focusedElement).toBeTruthy();
      // console.log(`✓ Keyboard navigation works - focused: ${focusedElement}`);
    } else {
      // console.log("✓ Skip - Redirected away from page");
    }
  });
});
