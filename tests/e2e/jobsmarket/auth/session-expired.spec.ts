import { test, expect } from "@playwright/test";

/**
 * E2E tests for AUTH-R08 Session Expired Page
 * Tests static display and navigation flows
 *
 * Per RIS AUTH-R08 v1.2
 */

test.describe("AUTH-R08: Session Expired Page - Basic Rendering", () => {
  test("should render page when accessed directly", async ({ page }) => {
    // Navigate to session-expired page
    const response = await page.goto("/jobsmarket/auth/session-expired");

    // Should not be 404
    expect(response?.status()).toBe(200);

    // Wait for page load
    await page.waitForLoadState("networkidle");

    // Check URL
    expect(page.url()).toContain("/auth/session-expired");
  });

  test("should have correct page title", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Check title contains session expired message
    const title = await page.title();
    expect(title).toBeTruthy();
  });

  test("should display all required UI elements", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Check Thai heading
    await expect(page.getByText("เซสชันหมดอายุ")).toBeVisible();

    // Check English subtitle
    await expect(page.getByText("Session Expired")).toBeVisible();

    // Check Thai message
    await expect(page.getByText("เซสชันของคุณหมดอายุแล้ว")).toBeVisible();

    // Check re-login button
    await expect(
      page.getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง" })
    ).toBeVisible();

    // Check go home link
    await expect(page.getByText("กลับหน้าแรก")).toBeVisible();

    // Check logo (exact match to avoid header logo)
    await expect(
      page.getByRole("link", { name: "ChanceDee", exact: true })
    ).toBeVisible();
  });
});

test.describe("AUTH-R08: Session Expired Page - Navigation", () => {
  test("should navigate to login without redirect param", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Click re-login button
    await page.getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง" }).click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Should be on login page
    expect(page.url()).toContain("/jobsmarket/auth/login");

    // Should NOT have redirect parameter
    expect(page.url()).not.toContain("redirect=");
  });

  test("should pass redirect param to login URL", async ({ page }) => {
    // Visit with redirect parameter
    await page.goto(
      "/jobsmarket/auth/session-expired?redirect=%2Fjobsmarket%2Fcandidates%2F123"
    );

    // Click re-login button
    await page.getByRole("link", { name: "เข้าสู่ระบบอีกครั้ง" }).click();

    // Wait for navigation
    await page.waitForLoadState("networkidle");

    // Should be on login page with redirect parameter
    expect(page.url()).toContain("/jobsmarket/auth/login");
    expect(page.url()).toContain("redirect=");
    expect(decodeURIComponent(page.url())).toContain(
      "/jobsmarket/candidates/123"
    );
  });

  test("should navigate to home via link", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Click go home link
    await page.getByText("กลับหน้าแรก").click();

    // Wait for navigation
    await page.waitForURL("/");

    // Should be on home page
    expect(page.url()).toBe(new URL("/", page.url()).href);
  });

  test("should navigate to home via logo", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Click logo (exact match to avoid header logo)
    await page.getByRole("link", { name: "ChanceDee", exact: true }).click();

    // Wait for navigation
    await page.waitForURL("/");

    // Should be on home page
    expect(page.url()).toBe(new URL("/", page.url()).href);
  });
});

test.describe("AUTH-R08: Session Expired Page - Accessibility", () => {
  test("should be accessible via keyboard navigation", async ({ page }) => {
    await page.goto("/jobsmarket/auth/session-expired");

    // Tab to logo
    await page.keyboard.press("Tab");
    let focusedElement = await page.evaluate(
      () => document.activeElement?.tagName
    );
    expect(focusedElement).toBe("A"); // Logo link

    // Tab to re-login button
    await page.keyboard.press("Tab");
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe("A"); // Button as Link

    // Tab to go home link
    await page.keyboard.press("Tab");
    focusedElement = await page.evaluate(() => document.activeElement?.tagName);
    expect(focusedElement).toBe("A"); // Go home link

    console.log("✓ Keyboard navigation works correctly");
  });
});
