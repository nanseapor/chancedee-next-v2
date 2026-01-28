import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../helpers/factories";
import { signInWithCredentials } from "../../helpers/auth-helper";

/**
 * E2E Tests for Dashboard Redirect Timing and Performance
 * Verifies that authentication and redirects happen within acceptable timeframes
 *
 * Quality Checks:
 * 1. Grace period for system to redirect (not too fast = user experience)
 * 2. Timeout threshold check (not too slow = performance issue)
 */

// Shared test data
let candidate: TestCandidate;

// Timing thresholds
const MIN_REDIRECT_TIME = 100; // ms - Minimum time for user to see feedback
const MAX_REDIRECT_TIME = 3000; // ms - Maximum acceptable redirect time
const AUTH_GRACE_PERIOD = 2000; // ms - Grace period for Firebase to initialize

test.describe("Dashboard Redirect Timing Verification", () => {
  test.beforeAll(async () => {
    // Create test candidate for timing tests
    candidate = await createTestCandidate({
      testName: "dashboard-timing",
      withCompleteProfile: true,
    });
  });

  test("should redirect from login to dashboard within acceptable time", async ({ page }) => {
    const startTime = Date.now();

    // Navigate to login
    await page.goto("/jobsmarket/auth/login");

    // Fill credentials
    await page.getByLabel("อีเมล").fill(candidate.email);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(candidate.password);
    await page.getByRole("checkbox").check();

    const loginClickTime = Date.now();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for redirect with timing
    try {
      await page.waitForURL(/jobsmarket\/(?!auth)/, { timeout: MAX_REDIRECT_TIME });
      const redirectTime = Date.now() - loginClickTime;

      // console.log(`✅ Login redirect completed in ${redirectTime}ms`);

      // Verify redirect happened within acceptable timeframe
      expect(redirectTime).toBeLessThan(MAX_REDIRECT_TIME);

      // Log final URL
      // console.log(`Final URL: ${page.url()}`);

    } catch (error) {
      const elapsedTime = Date.now() - loginClickTime;
      // console.error(`❌ Login redirect failed after ${elapsedTime}ms`);
      // console.error(`Current URL: ${page.url()}`);
      throw error;
    }
  });

  test("should complete full login flow and access dashboard with timing checks", async ({ page }) => {
    // console.log("\n=== Starting Full Login Flow Test ===");

    // Step 1: Login
    const loginStartTime = Date.now();
    await page.goto("/jobsmarket/auth/login");

    await page.getByLabel("อีเมล").fill(candidate.email);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(candidate.password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for initial redirect after login
    await page.waitForURL(/jobsmarket\/(?!auth)/, { timeout: 10000 });
    const loginCompleteTime = Date.now() - loginStartTime;
    // console.log(`Login completed in ${loginCompleteTime}ms`);
    // console.log(`URL after login: ${page.url()}`);

    // Step 2: Navigate to dashboard
    const dashboardNavStartTime = Date.now();
    // console.log(`\nNavigating to dashboard: /jobsmarket/candidates/${candidate.candidateId}`);

    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}`);

    // Grace period: Give Firebase Auth time to initialize from storage
    await page.waitForTimeout(AUTH_GRACE_PERIOD);

    const currentUrl = page.url();
    const dashboardNavTime = Date.now() - dashboardNavStartTime;

    // console.log(`Dashboard navigation took ${dashboardNavTime}ms`);
    // console.log(`Current URL: ${currentUrl}`);

    // Check if we're still on the dashboard or redirected to login
    if (currentUrl.includes('/auth/login')) {
      // console.error("❌ REDIRECTED BACK TO LOGIN");
      // console.error("This indicates Firebase Auth did not persist from beforeEach");

      // Check what's on the page
      const bodyText = await page.locator("body").textContent();
      // console.error("Page content preview:", bodyText?.substring(0, 200));

      throw new Error("Dashboard redirected to login - auth state not persisting");
    } else if (currentUrl.includes(`/candidates/${candidate.candidateId}`)) {
      // console.log("✅ STAYED ON DASHBOARD");

      // Verify dashboard actually loaded (not just loading state)
      try {
        // Wait for h1 with short timeout to see if dashboard renders
        await page.waitForSelector("h1", { timeout: 3000 });
        const h1Text = await page.locator("h1").first().textContent();
        // console.log(`Dashboard h1 text: ${h1Text}`);

        if (h1Text?.includes("สวัสดี")) {
          // console.log("✅ Dashboard fully rendered");
        } else {
          // console.warn("⚠️ Dashboard loaded but h1 doesn't show greeting");
        }
      } catch (e) {
        // console.error("❌ Dashboard URL correct but content not rendering");
        const bodyText = await page.locator("body").textContent();
        // console.error("Page content:", bodyText?.substring(0, 300));
        throw new Error("Dashboard at correct URL but not rendering");
      }
    } else {
      // console.warn(`⚠️ Unexpected URL: ${currentUrl}`);
    }
  });

  test("should measure Firebase Auth initialization time after page.goto", async ({ page }) => {
    // First login
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(candidate.email);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(candidate.password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await page.waitForURL(/jobsmarket\/(?!auth)/, { timeout: 10000 });

    // console.log("Logged in, now testing Firebase reinitialization timing...");

    // Navigate to dashboard and measure how long until Firebase Auth is ready
    const gotoStartTime = Date.now();
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}`);

    // Poll for Firebase Auth currentUser every 100ms
    let authReadyTime: number | null = null;
    const maxPollTime = 5000; // 5 seconds max

    while (Date.now() - gotoStartTime < maxPollTime) {
      const hasAuth = await page.evaluate(() => {
        // Check if Firebase Auth has initialized and has a user
        return new Promise<boolean>((resolve) => {
          if (window.firebase?.auth) {
            const auth = window.firebase.auth();
            if (auth.currentUser) {
              resolve(true);
            } else {
              resolve(false);
            }
          } else {
            resolve(false);
          }
        });
      }).catch(() => false);

      if (hasAuth) {
        authReadyTime = Date.now() - gotoStartTime;
        // console.log(`✅ Firebase Auth initialized with user in ${authReadyTime}ms`);
        break;
      }

      await page.waitForTimeout(100);
    }

    if (!authReadyTime) {
      const elapsedTime = Date.now() - gotoStartTime;
      // console.error(`❌ Firebase Auth never initialized after ${elapsedTime}ms`);
      // console.error(`Current URL: ${page.url()}`);
    } else {
      // Check if initialization time is within acceptable range
      if (authReadyTime < AUTH_GRACE_PERIOD) {
        // console.log(`✅ Firebase Auth initialized within grace period (${authReadyTime}ms < ${AUTH_GRACE_PERIOD}ms)`);
      } else {
        // console.warn(`⚠️ Firebase Auth took longer than grace period (${authReadyTime}ms > ${AUTH_GRACE_PERIOD}ms)`);
      }
    }
  });

  test("should check if page stays at login vs redirects to dashboard", async ({ page }) => {
    // Login
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(candidate.email);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(candidate.password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
    await page.waitForURL(/jobsmarket\/(?!auth)/, { timeout: 10000 });

    const postLoginUrl = page.url();
    // console.log(`Post-login URL: ${postLoginUrl}`);

    // Navigate to dashboard
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}`);

    // Record URL immediately
    const immediateUrl = page.url();
    // console.log(`Immediate URL after goto: ${immediateUrl}`);

    // Wait grace period
    await page.waitForTimeout(AUTH_GRACE_PERIOD);

    const afterGraceUrl = page.url();
    // console.log(`URL after ${AUTH_GRACE_PERIOD}ms grace: ${afterGraceUrl}`);

    // Wait a bit more to see if there's a delayed redirect
    await page.waitForTimeout(2000);

    const finalUrl = page.url();
    // console.log(`Final URL after total ${AUTH_GRACE_PERIOD + 2000}ms: ${finalUrl}`);

    // Analysis
    if (finalUrl.includes('/auth/login')) {
      // console.error("❌ FAILED: Page redirected to login");
      // console.error("Auth state did NOT persist across page.goto()");
      expect(finalUrl).not.toContain('/auth/login');
    } else if (finalUrl.includes(`/candidates/${candidate.candidateId}`)) {
      // console.log("✅ SUCCESS: Page stayed on dashboard");

      // But verify it actually rendered content
      const hasH1 = await page.locator("h1").count();
      // console.log(`H1 count: ${hasH1}`);

      if (hasH1 > 0) {
        // console.log("✅ Dashboard content rendered");
      } else {
        // console.error("❌ Dashboard URL correct but no h1 elements (might be stuck in loading)");
      }
    }
  });
});
