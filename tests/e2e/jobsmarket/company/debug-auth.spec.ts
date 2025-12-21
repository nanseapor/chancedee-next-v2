import { test, expect } from "@playwright/test";

test.describe("Debug Authentication", () => {
  test("check environment variables are loaded", async ({ page }) => {
    // Log environment variables (will show in test output)
    console.log("=== Environment Variables ===");
    console.log("PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL:", process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL ? "SET" : "NOT SET");
    console.log("PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD:", process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD ? "SET" : "NOT SET");
    console.log("PLAYWRIGHT_TEST_COMPANY_ADMIN_COMPANY_ID:", process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_COMPANY_ID || "NOT SET");
    console.log("PLAYWRIGHT_TEST_TRANSITIONING_COMPANY_ID:", process.env.PLAYWRIGHT_TEST_TRANSITIONING_COMPANY_ID || "NOT SET");
    console.log("PLAYWRIGHT_TEST_TRANSITIONING_EMAIL:", process.env.PLAYWRIGHT_TEST_TRANSITIONING_EMAIL ? "SET" : "NOT SET");
    console.log("=============================");

    // Fail if credentials not set
    expect(process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL).toBeDefined();
    expect(process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD).toBeDefined();
  });

  test("navigate to login page and check structure", async ({ page }) => {
    await page.goto("/jobsmarket/auth/login");
    await page.waitForLoadState("networkidle");

    // Take screenshot
    await page.screenshot({ path: ".playwright-mcp/debug-login-page.png" });

    // Check page loaded
    console.log("Current URL:", page.url());
    console.log("Page title:", await page.title());

    // Check for login form elements with various selectors
    console.log("\n=== Checking form elements ===");

    // Email input
    const emailByLabel = page.getByLabel("อีเมล");
    const emailByPlaceholder = page.getByPlaceholder("you@example.com");
    const emailByType = page.locator('input[type="email"]');

    console.log("Email by label visible:", await emailByLabel.isVisible().catch(() => false));
    console.log("Email by placeholder visible:", await emailByPlaceholder.isVisible().catch(() => false));
    console.log("Email by type visible:", await emailByType.isVisible().catch(() => false));

    // Password input
    const passwordByLabel = page.getByLabel("รหัสผ่าน");
    const passwordByPlaceholder = page.getByPlaceholder("กรอกรหัสผ่าน");
    const passwordByType = page.locator('input[type="password"]');

    console.log("Password by label visible:", await passwordByLabel.isVisible().catch(() => false));
    console.log("Password by placeholder visible:", await passwordByPlaceholder.isVisible().catch(() => false));
    console.log("Password by type visible:", await passwordByType.isVisible().catch(() => false));

    // Submit button
    const submitByRole = page.getByRole("button", { name: /เข้าสู่ระบบ/ });
    const submitByText = page.locator('button:has-text("เข้าสู่ระบบ")');
    const submitByType = page.locator('button[type="submit"]');

    console.log("Submit by role visible:", await submitByRole.isVisible().catch(() => false));
    console.log("Submit by text visible:", await submitByText.isVisible().catch(() => false));
    console.log("Submit by type visible:", await submitByType.isVisible().catch(() => false));

    // Checkbox
    const checkboxByRole = page.getByRole("checkbox", { name: /ยอมรับ/ });
    const checkboxByType = page.locator('input[type="checkbox"]');

    console.log("Checkbox by role visible:", await checkboxByRole.isVisible().catch(() => false));
    console.log("Checkbox by type visible:", await checkboxByType.isVisible().catch(() => false));
  });

  test("attempt login with correct selectors", async ({ page }) => {
    const email = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_EMAIL;
    const password = process.env.PLAYWRIGHT_TEST_COMPANY_ADMIN_PASSWORD;

    test.skip(!email || !password, "Credentials not configured");

    console.log("Starting login attempt...");

    await page.goto("/jobsmarket/auth/login");
    await page.waitForLoadState("networkidle");

    // Take screenshot before login
    await page.screenshot({ path: ".playwright-mcp/debug-before-login.png" });

    // Fill email - try the selector that works
    console.log("Filling email...");
    await page.getByPlaceholder("you@example.com").fill(email!);

    // Fill password
    console.log("Filling password...");
    await page.locator('input[type="password"]').fill(password!);

    // Check checkbox - use force because there's a div intercepting clicks
    console.log("Checking terms checkbox...");
    await page.getByRole("checkbox", { name: /ยอมรับ/ }).check({ force: true });

    // Take screenshot after filling
    await page.screenshot({ path: ".playwright-mcp/debug-after-fill.png" });

    // Click submit - use exact to avoid matching "เข้าสู่ระบบด้วย Google"
    console.log("Clicking submit button...");
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait and observe what happens
    console.log("Waiting for response...");

    try {
      // Wait up to 10 seconds for navigation
      await page.waitForURL(/dashboard|select-role|companies/, { timeout: 10000 });
      console.log("SUCCESS: Navigation detected to:", page.url());
    } catch (e) {
      console.log("No navigation within 10s, current URL:", page.url());
    }

    // Take screenshot after attempt
    await page.screenshot({ path: ".playwright-mcp/debug-after-login-attempt.png" });

    // Check for error messages
    const errorMessages = page.locator('[role="alert"], .text-red-500, .text-destructive');
    const errorCount = await errorMessages.count();
    if (errorCount > 0) {
      console.log("Error messages found:");
      for (let i = 0; i < errorCount; i++) {
        const text = await errorMessages.nth(i).textContent();
        console.log(`  Error ${i}:`, text);
      }
    } else {
      console.log("No error messages found");
    }

    // Log final state
    console.log("Final URL:", page.url());
    console.log("Final title:", await page.title());
  });
});
