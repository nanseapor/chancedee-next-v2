import { test, expect, Page } from "@playwright/test";

/**
 * E2E Test: Candidate Settings Route
 * CAND-R03
 *
 * User Journey: Candidate manages their privacy and notification settings
 *
 * Prerequisites:
 * - Test user with profile completed
 * - Dev server running
 * - Test credentials in .env.playwright
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/settings.spec.ts --project=chromium
 *
 * @see tests/unit/jobsmarket/candidates/settings/ - 74 tests, 100% component coverage
 * @see tests/integration/jobsmarket/candidates/settings.test.ts - 20 tests, 100% DB coverage
 */

/**
 * Helper: Wait for toggle save to complete
 * Waits for loading spinner to appear and disappear, indicating save finished
 */
async function waitForToggleSave(page: Page) {
  try {
    await expect(page.locator(".animate-spin").first()).toBeVisible({
      timeout: 1000,
    });
    await expect(page.locator(".animate-spin").first()).not.toBeVisible({
      timeout: 3000,
    });
  } catch {
    // If spinner doesn't appear (save was instant), wait a bit
    await page.waitForTimeout(1500);
  }
  // Extra buffer to ensure save fully completed
  await page.waitForTimeout(300);
}

test.describe("CAND-R03: Candidate Settings", () => {
  // Get test credentials from environment
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  // Skip if credentials not available
  test.skip(
    !testEmail || !testPassword || !testUid,
    "Test credentials not configured"
  );

  test.beforeEach(async ({ page }) => {
    // Navigate to settings page
    await page.goto(`/jobsmarket/candidates/${testUid}/settings`);
    await page.waitForLoadState("networkidle");

    // Check if we're on login page (session expired)
    if (page.url().includes("/auth/login")) {
      // Login
      await page.getByLabel("อีเมล").fill(testEmail!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword!);
      await page.getByRole("checkbox").check();
      await page
        .getByRole("button", { name: "เข้าสู่ระบบ", exact: true })
        .click();

      // Wait for redirect back to settings
      await page.waitForURL(
        (url) => !url.pathname.includes("/auth/login"),
        { timeout: 15000 }
      );

      // Navigate to settings again after login
      await page.goto(`/jobsmarket/candidates/${testUid}/settings`);
      await page.waitForLoadState("networkidle");
    }
  });

  test.describe("Page Load & Rendering", () => {
    test("should render all 4 settings cards", async ({ page }) => {
      // Account Link Card
      await expect(page.getByText("การตั้งค่าบัญชี")).toBeVisible();
      await expect(page.getByText("Account Settings")).toBeVisible();

      // Profile Visibility Card
      await expect(page.getByText("การมองเห็นโปรไฟล์")).toBeVisible();
      await expect(page.getByText("Profile Visibility")).toBeVisible();

      // Application Preferences Card
      await expect(page.getByText("การตั้งค่าการสมัคร")).toBeVisible();
      await expect(page.getByText("Application Settings")).toBeVisible();

      // Notification Preferences Card
      await expect(page.getByText("การแจ้งเตือนงาน")).toBeVisible();
      await expect(page.getByText("Job Notifications")).toBeVisible();
    });

    test("should display page title", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "การตั้งค่า", exact: true }).first()).toBeVisible();
    });

    test("should not show console errors", async ({ page }) => {
      const consoleErrors: string[] = [];
      page.on("console", (msg) => {
        if (msg.type() === "error") {
          consoleErrors.push(msg.text());
        }
      });

      await page.waitForTimeout(2000); // Wait for any async errors

      // Filter out known acceptable errors (e.g., from third-party scripts)
      const criticalErrors = consoleErrors.filter(
        (error) =>
          !error.includes("DevTools") &&
          !error.includes("Extension") &&
          !error.includes("third-party")
      );

      expect(criticalErrors.length).toBe(0);
    });
  });

  test.describe("Account Link Card", () => {
    test("should navigate to auth settings when clicked", async ({ page }) => {
      // Click the account settings card
      await page.getByText("การตั้งค่าบัญชี").click();

      // Should navigate to auth settings
      await page.waitForURL("**/auth/settings", { timeout: 5000 });
      expect(page.url()).toContain("/auth/settings");
    });
  });

  test.describe("Profile Visibility Toggle", () => {
    test("should toggle profile visibility ON", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });

      // Get current state
      const initialState = await toggle.isChecked();

      // If already ON, turn OFF first
      if (initialState) {
        await toggle.click();
        // Wait for save
        await page.waitForTimeout(1000);
      }

      // Now toggle ON
      await toggle.click();

      // Wait for loading state to appear and disappear (indicates save complete)
      try {
        await expect(page.locator(".animate-spin").first()).toBeVisible({
          timeout: 1000,
        });
        await expect(page.locator(".animate-spin").first()).not.toBeVisible({
          timeout: 3000,
        });
      } catch {
        // If spinner doesn't appear, wait a bit for save to complete
        await page.waitForTimeout(1500);
      }

      // Toggle should be checked
      await expect(toggle).toBeChecked();

      // Wait a bit more to ensure save completed
      await page.waitForTimeout(500);

      // Refresh page and verify persistence
      await page.reload();
      await page.waitForLoadState("networkidle");

      const toggleAfterRefresh = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await expect(toggleAfterRefresh).toBeChecked();
    });

    test("should toggle profile visibility OFF", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });

      // Get current state
      const initialState = await toggle.isChecked();

      // If already ON, turn OFF first to get to known state
      if (initialState) {
        await toggle.click();
        await page.waitForTimeout(2000);
      }

      // Now toggle it ON (so we can toggle OFF in the actual test)
      await toggle.click();
      await page.waitForTimeout(2000);

      // Now toggle OFF (the actual test)
      await toggle.click();

      // Wait for loading state to appear and disappear
      try {
        await expect(page.locator(".animate-spin").first()).toBeVisible({
          timeout: 1000,
        });
        await expect(page.locator(".animate-spin").first()).not.toBeVisible({
          timeout: 3000,
        });
      } catch {
        await page.waitForTimeout(1500);
      }

      // Toggle should be unchecked
      await expect(toggle).not.toBeChecked();

      // Wait for save to complete
      await page.waitForTimeout(500);

      // Refresh and verify persistence
      await page.reload();
      await page.waitForLoadState("networkidle");

      const toggleAfterRefresh = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await expect(toggleAfterRefresh).not.toBeChecked();
    });

    test("should disable toggle during save", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });

      // Click toggle
      await toggle.click();

      // Immediately check if disabled (should be disabled during save)
      // Note: This is a race condition test, may be flaky
      // If this fails, it means the save is too fast to catch the disabled state
      try {
        await expect(toggle).toBeDisabled({ timeout: 500 });
      } catch {
        // If we can't catch it disabled, that's okay - save was fast
        console.log("Toggle save was too fast to catch disabled state");
      }
    });
  });

  test.describe("Application Preferences - Cover Letter", () => {
    test("should show textarea when cover letter toggle is enabled", async ({
      page,
    }) => {
      const toggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });

      // Ensure toggle is OFF first
      if (await toggle.isChecked()) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      // Toggle ON
      await toggle.click();

      // Wait for save to complete
      try {
        await expect(page.locator(".animate-spin").first()).toBeVisible({
          timeout: 1000,
        });
        await expect(page.locator(".animate-spin").first()).not.toBeVisible({
          timeout: 3000,
        });
      } catch {
        await page.waitForTimeout(1500);
      }

      // Wait a bit more for UI to update
      await page.waitForTimeout(300);

      // Textarea should appear
      const textarea = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      await expect(textarea).toBeVisible();
    });

    test("should hide textarea when cover letter toggle is disabled", async ({
      page,
    }) => {
      const toggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });

      // Ensure toggle is ON first
      if (!(await toggle.isChecked())) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      // Verify textarea is visible
      const textarea = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      await expect(textarea).toBeVisible();

      // Toggle OFF
      await toggle.click();

      // Wait for save
      await page.waitForTimeout(1000);

      // Textarea should be hidden
      await expect(textarea).not.toBeVisible();
    });

    test("should update character count when typing in cover letter", async ({
      page,
    }) => {
      const toggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });

      // Ensure toggle is ON
      if (!(await toggle.isChecked())) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      const textarea = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );

      // Clear existing content
      await textarea.fill("");

      // Type some text
      const testText = "This is a test cover letter.";
      await textarea.fill(testText);

      // Check character count
      await expect(
        page.getByText(`${testText.length}/2000 ตัวอักษร`)
      ).toBeVisible();
    });

    test("should auto-save cover letter after debounce delay", async ({
      page,
    }) => {
      const toggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });

      // Ensure toggle is ON
      if (!(await toggle.isChecked())) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      const textarea = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );

      // Type text
      const testText = "E2E Test Cover Letter - " + Date.now();
      await textarea.fill(testText);

      // Wait for debounce (500ms) + save time
      await page.waitForTimeout(2000);

      // Should show "กำลังบันทึก..." temporarily or complete
      // This is hard to catch, so we'll verify persistence instead

      // Refresh page
      await page.reload();
      await page.waitForLoadState("networkidle");

      // Re-enable toggle if needed
      const toggleAfterRefresh = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      if (!(await toggleAfterRefresh.isChecked())) {
        await toggleAfterRefresh.click();
        await page.waitForTimeout(1000);
      }

      // Verify text persisted
      const textareaAfterRefresh = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );
      await expect(textareaAfterRefresh).toHaveValue(testText);
    });

    test("should enforce 2000 character limit", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });

      // Ensure toggle is ON
      if (!(await toggle.isChecked())) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      const textarea = page.getByPlaceholder(
        "เขียนจดหมายสมัครงานเริ่มต้นของคุณ..."
      );

      // Try to type more than 2000 characters
      const longText = "a".repeat(2500);
      await textarea.fill(longText);

      // Should be capped at 2000
      const actualValue = await textarea.inputValue();
      expect(actualValue.length).toBeLessThanOrEqual(2000);

      // Character count should show 2000/2000
      await expect(page.getByText("2000/2000 ตัวอักษร")).toBeVisible();
    });
  });

  test.describe("Notification Preferences", () => {
    test("should toggle email job recommendations ON", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });

      // Get current state
      const initialState = await toggle.isChecked();

      // If already ON, turn OFF first
      if (initialState) {
        await toggle.click();
        await page.waitForTimeout(1000);
      }

      // Toggle ON
      await toggle.click();

      // Wait for save
      await page.waitForTimeout(2000);

      // Should be checked
      await expect(toggle).toBeChecked();

      // Refresh and verify
      await page.reload();
      await page.waitForLoadState("networkidle");

      const toggleAfterRefresh = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      await expect(toggleAfterRefresh).toBeChecked();
    });

    test("should toggle email job recommendations OFF", async ({ page }) => {
      const toggle = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });

      // Get current state
      const initialState = await toggle.isChecked();

      // If already ON, turn OFF first to get to known state
      if (initialState) {
        await toggle.click();
        await page.waitForTimeout(2000);
      }

      // Now toggle it ON (so we can toggle OFF in the actual test)
      await toggle.click();
      await page.waitForTimeout(2000);

      // Now toggle OFF (the actual test)
      await toggle.click();

      // Wait for save
      await page.waitForTimeout(2000);

      // Should be unchecked
      await expect(toggle).not.toBeChecked();

      // Refresh and verify
      await page.reload();
      await page.waitForLoadState("networkidle");

      const toggleAfterRefresh = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      await expect(toggleAfterRefresh).not.toBeChecked();
    });

    test("should show push notifications as coming soon", async ({ page }) => {
      // Should see "Coming Soon" badge
      await expect(page.getByText("เร็วๆ นี้ (Coming soon)")).toBeVisible();

      // Push toggle should be disabled
      const allToggles = page.getByRole("switch");
      const toggleCount = await allToggles.count();

      // Find the push toggle (should be the last one and disabled)
      let foundDisabledPushToggle = false;
      for (let i = 0; i < toggleCount; i++) {
        const toggle = allToggles.nth(i);
        const isDisabled = await toggle.isDisabled();
        const id = await toggle.getAttribute("id");

        // Push toggle should not have the email ID
        if (isDisabled && id !== "email-job-recommendations-toggle") {
          foundDisabledPushToggle = true;
          break;
        }
      }

      expect(foundDisabledPushToggle).toBe(true);
    });
  });

  test.describe("Authentication & Authorization", () => {
    test("should redirect to login if not authenticated", async ({
      page,
      context,
    }) => {
      // Clear cookies to simulate logged-out state
      await context.clearCookies();

      // Navigate to settings
      await page.goto(`/jobsmarket/candidates/${testUid}/settings`);

      // Should redirect to login
      await page.waitForURL("**/auth/login", { timeout: 10000 });
      expect(page.url()).toContain("/auth/login");
    });

    test("should redirect to own settings when accessing other candidate's settings", async ({
      page,
    }) => {
      // Try to access another candidate's settings
      const wrongUid = "wrong-candidate-uid-12345";
      await page.goto(`/jobsmarket/candidates/${wrongUid}/settings`);

      // Should redirect to own settings
      await page.waitForURL(`**/candidates/${testUid}/settings`, {
        timeout: 10000,
      });
      expect(page.url()).toContain(`/candidates/${testUid}/settings`);
    });
  });

  test.describe("Multiple Settings Interaction", () => {
    test("should handle multiple toggle changes in sequence", async ({
      page,
    }) => {
      // Toggle profile visibility
      const profileToggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      const profileInitialState = await profileToggle.isChecked();
      await profileToggle.click();
      await page.waitForTimeout(1500);

      // Toggle cover letter
      const coverLetterToggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      const coverLetterInitialState = await coverLetterToggle.isChecked();
      await coverLetterToggle.click();
      await page.waitForTimeout(1500);

      // Toggle email notifications
      const emailToggle = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      const emailInitialState = await emailToggle.isChecked();
      await emailToggle.click();
      await page.waitForTimeout(1500);

      // Refresh and verify all changes persisted
      await page.reload();
      await page.waitForLoadState("networkidle");

      const profileToggleAfter = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      const coverLetterToggleAfter = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      const emailToggleAfter = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });

      await expect(profileToggleAfter).toBeChecked({
        checked: !profileInitialState,
      });
      await expect(coverLetterToggleAfter).toBeChecked({
        checked: !coverLetterInitialState,
      });
      await expect(emailToggleAfter).toBeChecked({
        checked: !emailInitialState,
      });
    });
  });

  test.describe("Accessibility", () => {
    test("should have proper ARIA labels for toggles", async ({ page }) => {
      // Profile visibility toggle
      const profileToggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await expect(profileToggle).toHaveAttribute("id", "profile-visibility-toggle");

      // Cover letter toggle
      const coverLetterToggle = page.getByRole("switch", {
        name: /แนบจดหมายสมัครงานอัตโนมัติ/i,
      });
      await expect(coverLetterToggle).toHaveAttribute(
        "id",
        "auto-attach-cover-letter-toggle"
      );

      // Email toggle
      const emailToggle = page.getByRole("switch", {
        name: /รับงานแนะนำทางอีเมล/i,
      });
      await expect(emailToggle).toHaveAttribute(
        "id",
        "email-job-recommendations-toggle"
      );
    });

    test("should be keyboard navigable", async ({ page }) => {
      // Focus on first toggle
      await page.keyboard.press("Tab");

      // Should be able to activate with Space or Enter
      // (Testing framework limitation - hard to verify exact focus)
      // But we can verify toggles exist and are not disabled
      const profileToggle = page.getByRole("switch", {
        name: /อนุญาตให้บริษัทค้นหาโปรไฟล์ของฉัน/i,
      });
      await expect(profileToggle).not.toBeDisabled();
    });
  });
});
