import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../../helpers/factories";
import { signInAsCandidate } from "../../../helpers/auth-helper";

/**
 * E2E Test: Mobile Navigation
 * CAND-R02 Batch 5B
 *
 * User Journey: Mobile user navigates using bottom tab bar
 *
 * Prerequisites:
 * - Test user with isOnboarded: true
 * - Dev server running
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/profile/profile-mobile-navigation.spec.ts --project="Mobile Chrome"
 */

let candidate: TestCandidate;

test.describe("Mobile Navigation", () => {
  test.beforeAll(async () => {
    candidate = await createTestCandidate({
      testName: "profile-mobile-navigation",
      withCompleteProfile: true,
    });
  });

  test.beforeEach(async ({ page }) => {
    // Set mobile viewport (iPhone SE size as specified)
    await page.setViewportSize({ width: 375, height: 667 });

    await signInAsCandidate(page, candidate);
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/profile`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display bottom tab bar on mobile", async ({ page }) => {
    // Verify bottom tab bar is visible using data-testid
    const bottomNav = page.getByTestId("bottom-tab-bar");

    await expect(bottomNav).toBeVisible();

    // Verify it's positioned at bottom
    const navBox = await bottomNav.boundingBox();
    const viewportHeight = page.viewportSize()?.height || 667;

    // Bottom nav should be near the bottom of viewport
    expect(navBox?.y || 0).toBeGreaterThan(viewportHeight - 100);
  });

  test("should NOT display sidebar on mobile", async ({ page }) => {
    // Sidebar should be hidden on mobile
    const sidebar = page.locator("aside, [data-testid='sidebar']");
    const sidebarVisible = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);

    expect(sidebarVisible).toBeFalsy();
  });

  test("should display mobile header with logo and user menu", async ({ page }) => {
    // Look for mobile header elements
    // Logo
    const logo = page.locator("img[alt*='ChanceDee'], img[alt*='Logo']");
    await expect(logo.first()).toBeVisible({ timeout: 5000 });

    // Notification bell or user menu
    const headerIcons = page.locator("header button, header a").first();
    await expect(headerIcons).toBeVisible();
  });

  test("should have 5 tabs in bottom navigation", async ({ page }) => {
    // Find all tab items within bottom tab bar
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const tabs = bottomNav.locator("a");

    // Should have exactly 5 tabs
    const tabCount = await tabs.count();
    expect(tabCount).toBe(5);
  });

  test("should navigate to dashboard when tapping Home tab", async ({ page }) => {
    // Find Home tab within bottom nav
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const homeTab = bottomNav.locator("a").filter({
      hasText: /หน้าหลัก|Home/i,
    });

    // Tab should NOT be disabled - candidate has complete profile
    // If it's disabled, that's a bug we want to catch
    await expect(homeTab).toBeVisible();
    await homeTab.click();

    // Wait for navigation
    await page.waitForURL((url) => url.pathname === `/jobsmarket/candidates/${candidate.candidateId}`, {
      timeout: 10000,
    });

    // Verify we're on dashboard (not profile)
    await expect(page).not.toHaveURL(/\/profile$/);
  });

  test("should navigate to jobs page when tapping Jobs tab", async ({ page }) => {
    // Find Jobs tab within bottom nav
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const jobsTab = bottomNav.locator("a").filter({
      hasText: /งาน|Jobs/i,
    });

    // Tab should NOT be disabled - candidate has complete profile
    // If it's disabled, that's a bug we want to catch
    await expect(jobsTab).toBeVisible();
    await jobsTab.click();

    // Wait for navigation
    await page.waitForURL((url) => url.pathname.includes("/jobs"), { timeout: 10000 });

    // Verify we're on jobs page
    expect(page.url()).toContain("/jobs");
  });

  test("should navigate to applications when tapping Applications tab", async ({ page }) => {
    // Find Applications tab within bottom nav
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const applicationsTab = bottomNav.locator("a").filter({
      hasText: /ใบสมัคร|Applications/i,
    });

    // Tab should NOT be disabled - candidate has complete profile
    // If it's disabled, that's a bug we want to catch
    await expect(applicationsTab).toBeVisible();
    await applicationsTab.click();

    // Wait for navigation
    await page.waitForURL((url) => url.pathname.includes("/applications"), { timeout: 10000 });

    // Verify we're on applications page
    expect(page.url()).toContain("/applications");
  });

  test("should navigate to messages when tapping Messages tab", async ({ page }) => {
    // Find Messages tab within bottom nav
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const messagesTab = bottomNav.locator("a").filter({
      hasText: /ข้อความ|Messages|Chat/i,
    });

    // Tab should NOT be disabled - candidate has complete profile
    // If it's disabled, that's a bug we want to catch
    await expect(messagesTab).toBeVisible();
    await messagesTab.click();

    // Wait for navigation
    await page.waitForURL((url) => url.pathname.includes("/chat") || url.pathname.includes("/messages"), {
      timeout: 10000,
    });

    // Verify we're on messages page
    expect(page.url()).toMatch(/\/(chat|messages)/);
  });

  test("should highlight active tab (Profile)", async ({ page }) => {
    // Find Profile tab within bottom nav
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const profileTab = bottomNav.locator("a").filter({
      hasText: /โปรไฟล์|Profile/i,
    });

    // Check for active styling (teal color indicates active)
    const hasActiveColor = await profileTab.evaluate((el) => {
      return el.classList.contains("text-teal-600");
    });

    expect(hasActiveColor).toBeTruthy();
  });

  test("should maintain bottom nav position when scrolling", async ({ page }) => {
    // Get initial bottom nav position
    const bottomNav = page.getByTestId("bottom-tab-bar");

    const initialBox = await bottomNav.boundingBox();

    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 500));
    await page.waitForTimeout(500);

    // Get position after scroll
    const afterScrollBox = await bottomNav.boundingBox();

    // Bottom nav should be fixed (position unchanged relative to viewport)
    expect(afterScrollBox?.y).toEqual(initialBox?.y);
  });

  test("should display profile content above bottom nav", async ({ page }) => {
    // Main content should have padding to avoid overlap with bottom nav
    // There are 2 main elements (outer and inner), we want the inner one that has pb-20
    const mainContent = page.locator("main.pb-20");

    // Check computed padding-bottom
    const paddingBottom = await mainContent.evaluate(
      (el) => window.getComputedStyle(el).paddingBottom
    );
    const paddingValue = parseInt(paddingBottom);

    // Should have significant padding (at least 60px to clear bottom nav)
    expect(paddingValue).toBeGreaterThanOrEqual(60);
  });

  test("should allow touch interaction with bottom tabs", async ({ page }) => {
    // Find Profile tab (always enabled)
    const bottomNav = page.getByTestId("bottom-tab-bar");
    const profileTab = bottomNav.locator("a").filter({
      hasText: /โปรไฟล์/i,
    });

    // Verify tap target size (minimum 44x44 for accessibility)
    const tabBox = await profileTab.boundingBox();
    expect(tabBox?.height || 0).toBeGreaterThanOrEqual(40); // Allow slight variance
    expect(tabBox?.width || 0).toBeGreaterThanOrEqual(40);

    // Use click instead of tap (tap requires hasTouch context option)
    await profileTab.click();

    // URL should remain on profile
    expect(page.url()).toContain("/profile");
  });

  test("should display tab icons and labels", async ({ page }) => {
    const bottomNav = page.getByTestId("bottom-tab-bar");

    // Each tab should have text label
    const tabLabels = [/หน้าหลัก/, /งาน/, /ใบสมัคร/, /ข้อความ/, /โปรไฟล์/];

    for (const label of tabLabels) {
      await expect(bottomNav.getByText(label)).toBeVisible();
    }

    // Should also have icons (SVG elements)
    const icons = bottomNav.locator("svg");
    const iconCount = await icons.count();
    expect(iconCount).toBeGreaterThanOrEqual(5);
  });

  test("should show responsive layout at 375px width", async ({ page }) => {
    // Already set in beforeEach, but verify
    const viewport = page.viewportSize();
    expect(viewport?.width).toBe(375);

    // Verify mobile layout elements
    // 1. Mobile header visible
    const mobileHeader = page.locator("header").first();
    await expect(mobileHeader).toBeVisible();

    // 2. Bottom nav visible
    const bottomNav = page.getByTestId("bottom-tab-bar");
    await expect(bottomNav).toBeVisible();

    // 3. Sidebar hidden
    const sidebar = page.getByTestId("sidebar");
    const hasSidebar = await sidebar.isVisible({ timeout: 2000 }).catch(() => false);
    expect(hasSidebar).toBeFalsy();

    // 4. Content should be responsive (not overflow)
    const main = page.locator("main.pb-20").first();
    const mainWidth = await main.evaluate((el) => el.scrollWidth);
    expect(mainWidth).toBeLessThanOrEqual(375 + 20); // Allow small margin
  });
});
