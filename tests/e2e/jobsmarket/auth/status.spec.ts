import { test, expect } from "@playwright/test";

/**
 * E2E Tests for AUTH-R05 /auth/status page
 *
 * Note: These tests require specific user account states that may not exist in test environment.
 * Tests will be skipped if test credentials are not available.
 */

test.describe("AUTH-R05: Status Page", () => {
  test.describe("Rejected status view", () => {
    test("should display rejected view with query parameters", async ({
      page,
    }) => {
      // Navigate with rejected status and query params
      await page.goto(
        "/jobsmarket/auth/status?type=rejected&reason=ข้อมูลไม่ครบถ้วน&company=บริษัท ทดสอบ จำกัด"
      );

      // Should show rejected title
      await expect(page.getByText("คำขอถูกปฏิเสธ")).toBeVisible();
      await expect(page.getByText("Application Rejected")).toBeVisible();

      // Should show company name
      await expect(page.getByText("บริษัท ทดสอบ จำกัด")).toBeVisible();

      // Should show rejection reason
      await expect(page.getByText("เหตุผล:")).toBeVisible();
      await expect(page.getByText("ข้อมูลไม่ครบถ้วน")).toBeVisible();

      // Should have back to dashboard button
      const backButton = page.getByRole("button", {
        name: "กลับไปหน้าหลัก",
      });
      await expect(backButton).toBeVisible();

      // Should have support link
      const supportLink = page.getByRole("link", {
        name: "ติดต่อทีมสนับสนุน",
      });
      await expect(supportLink).toBeVisible();
      await expect(supportLink).toHaveAttribute(
        "href",
        "mailto:support@chancedee.com"
      );
    });

    test("should display rejected view without reason", async ({ page }) => {
      // Navigate with rejected status but no reason
      await page.goto("/jobsmarket/auth/status?type=rejected");

      await expect(page.getByText("คำขอถูกปฏิเสธ")).toBeVisible();

      // Should show generic message when no reason provided
      await expect(
        page.getByText("คำขอลงทะเบียนของคุณไม่ผ่านการอนุมัติ")
      ).toBeVisible();
    });
  });

  test.describe("Authentication required", () => {
    test("should redirect to login when not authenticated", async ({
      page,
    }) => {
      // Clear any existing session
      await page.context().clearCookies();

      await page.goto("/jobsmarket/auth/status");

      // Should redirect to login page
      await expect(page).toHaveURL(/\/jobsmarket\/auth\/login/);
    });
  });

  test.describe("UI Components", () => {
    test("should have proper page metadata", async ({ page }) => {
      await page.goto("/jobsmarket/auth/status?type=rejected");

      // Check page title
      await expect(page).toHaveTitle(/สถานะบัญชี.*ChanceDee Jobs/);
    });

    test("rejected view back button should work", async ({ page }) => {
      await page.goto("/jobsmarket/auth/status?type=rejected");

      const backButton = page.getByRole("button", {
        name: "กลับไปหน้าหลัก",
      });
      await backButton.click();

      // Should navigate to dashboard
      await expect(page).toHaveURL("/jobsmarket/dashboard");
    });
  });

  test.describe("Accessibility", () => {
    test("rejected view should have proper heading hierarchy", async ({
      page,
    }) => {
      await page.goto("/jobsmarket/auth/status?type=rejected");

      // Card title should be h3 (from shadcn/ui Card component)
      const title = page.locator(".text-2xl").filter({ hasText: "คำขอถูกปฏิเสธ" });
      await expect(title).toBeVisible();
    });

    test("should have accessible form controls", async ({ page }) => {
      await page.goto("/jobsmarket/auth/status?type=rejected");

      // Button should be keyboard accessible
      const backButton = page.getByRole("button", {
        name: "กลับไปหน้าหลัก",
      });
      await expect(backButton).toBeEnabled();
      await expect(backButton).toHaveAttribute("type", "button");
    });

    test("links should have proper href attributes", async ({ page }) => {
      await page.goto("/jobsmarket/auth/status?type=rejected");

      const supportLink = page.getByRole("link", {
        name: "ติดต่อทีมสนับสนุน",
      });
      await expect(supportLink).toHaveAttribute(
        "href",
        "mailto:support@chancedee.com"
      );
    });
  });

  /**
   * Tests for deleted, staff-pending, and company-pending views
   * require specific user account states in Firestore
   *
   * Skipped due to:
   * 1. No test accounts with 'deleted' status
   * 2. No test accounts with 'pending' + target_company
   * 3. Creating these states requires Firebase Admin access
   *
   * These views are tested via:
   * - Unit tests: status-detection.test.ts (26 tests)
   * - Integration tests: status-routing.test.tsx (mocked data)
   */
  // TODO: Requires test account with deleted status
  test.skip("deleted view - requires test account with deleted status", async () => {});

  // TODO: Requires test account with pending staff status
  test.skip("staff-pending view - requires test account with pending status", async () => {});

  // TODO: Requires test account with pending admin status
  test.skip("company-pending view - requires test account with pending admin", async () => {});
});
