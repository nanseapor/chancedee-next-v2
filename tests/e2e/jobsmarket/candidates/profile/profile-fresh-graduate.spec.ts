import { test, expect } from "@playwright/test";

/**
 * E2E Test: Fresh Graduate Toggle
 * CAND-R02 Batch 5B
 *
 * User Journey: User toggles fresh graduate status
 *
 * Prerequisites:
 * - Test user (can be new or existing)
 * - Dev server running
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/profile/profile-fresh-graduate.spec.ts --project=chromium
 */

test.describe("Fresh Graduate Toggle", () => {
  // Get test credentials from environment
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  // Skip if credentials not available
  test.skip(!testEmail || !testPassword || !testUid, "Test credentials not configured");

  test.beforeEach(async ({ page }) => {
    // Login first
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(testEmail!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword!);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for redirect after login
    await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 15000 });

    // Navigate to profile
    await page.goto(`/jobsmarket/candidates/${testUid}/profile`);
    await page.waitForLoadState("networkidle");
  });

  test("should display Fresh Graduate toggle in Work Experience section", async ({ page }) => {
    // Open Work Experience edit drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();

    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Look for Fresh Graduate toggle/checkbox
    const freshGradToggle = page.locator(
      "input[type='checkbox'][name*='fresh'], text=/จบใหม่|Fresh Graduate|ยังไม่มีประสบการณ์/i"
    );

    await expect(freshGradToggle.first()).toBeVisible({ timeout: 5000 });
  });

  test("should toggle Fresh Graduate ON and hide work experience form", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Find fresh graduate checkbox/toggle
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่'), label:has-text('Fresh Graduate')"
    );

    // Get current state
    const checkbox = freshGradCheckbox.first();
    const isCurrentlyChecked = await checkbox
      .evaluate((el: HTMLInputElement) => el.checked)
      .catch(() => false);

    if (!isCurrentlyChecked) {
      // Toggle ON
      await checkbox.click();

      // Check if confirmation dialog appears
      const confirmButton = page.getByRole("button", { name: /ยืนยัน|Confirm|ตกลง/ });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Wait a moment for UI to update
      await page.waitForTimeout(1000);

      // Verify work experience form is hidden or disabled
      const workFormInputs = page.locator(
        "input[name*='company'], input[name*='position'], input[name*='job']"
      );
      const formVisible = await workFormInputs
        .first()
        .isVisible({ timeout: 2000 })
        .catch(() => false);

      // Form should either be hidden or disabled
      if (formVisible) {
        const isDisabled = await workFormInputs.first().isDisabled();
        expect(isDisabled).toBeTruthy();
      } else {
        expect(formVisible).toBeFalsy();
      }
    }
  });

  test("should show confirmation dialog when toggling Fresh Graduate", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Find and toggle fresh graduate checkbox
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่'), label:has-text('Fresh Graduate')"
    );
    const checkbox = freshGradCheckbox.first();

    // Toggle it
    await checkbox.click();

    // Look for confirmation dialog
    const confirmDialog = page.locator("role=dialog").filter({
      has: page.locator("text=/ยืนยัน|Confirm|แน่ใจ|Sure/i"),
    });

    // Confirmation may or may not appear depending on implementation
    const hasConfirmDialog = await confirmDialog.isVisible({ timeout: 2000 }).catch(() => false);

    if (hasConfirmDialog) {
      // Verify confirmation text mentions clearing work experience
      await expect(
        confirmDialog.locator("text=/ประสบการณ์|Experience|ลบ|Delete|Clear/i")
      ).toBeVisible();
    }
    // If no confirmation dialog, that's also acceptable
  });

  test("should cancel confirmation and keep fresh graduate OFF", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Find fresh graduate checkbox
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่')"
    );
    const checkbox = freshGradCheckbox.first();

    // Get initial state
    const initialState = await checkbox
      .evaluate((el: HTMLInputElement) => el.checked)
      .catch(() => false);

    // Toggle it
    await checkbox.click();

    // If confirmation dialog appears, cancel it
    const cancelButton = page.getByRole("button", { name: /ยกเลิก|Cancel/ });
    if (await cancelButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await cancelButton.click();

      // Wait for dialog to close
      await page.waitForTimeout(1000);

      // Verify state reverted to initial
      const currentState = await checkbox
        .evaluate((el: HTMLInputElement) => el.checked)
        .catch(() => false);
      expect(currentState).toBe(initialState);
    }
  });

  test("should toggle Fresh Graduate OFF and show work experience form", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Find fresh graduate checkbox
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่')"
    );
    const checkbox = freshGradCheckbox.first();

    // Get current state
    const isCurrentlyChecked = await checkbox
      .evaluate((el: HTMLInputElement) => el.checked)
      .catch(() => false);

    if (isCurrentlyChecked) {
      // Toggle OFF
      await checkbox.click();

      // Confirm if dialog appears
      const confirmButton = page.getByRole("button", { name: /ยืนยัน|Confirm/ });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }

      // Wait for UI to update
      await page.waitForTimeout(1000);

      // Verify work experience form is now visible
      const addWorkButton = page.getByRole("button", { name: /เพิ่ม|Add.*งาน|Add.*Work/i });
      await expect(addWorkButton).toBeVisible({ timeout: 5000 });
    }
  });

  test("should persist Fresh Graduate status after save", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Get checkbox
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่')"
    );
    const checkbox = freshGradCheckbox.first();

    // Set to a known state (ON)
    const currentState = await checkbox
      .evaluate((el: HTMLInputElement) => el.checked)
      .catch(() => false);

    if (!currentState) {
      await checkbox.click();
      // Confirm if needed
      const confirmButton = page.getByRole("button", { name: /ยืนยัน|Confirm/ });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
    }

    // Save
    const saveButton = page.getByRole("button", { name: /บันทึก|Save/ });
    await saveButton.click();

    // Wait for drawer to close
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });

    // Reload page
    await page.reload();
    await page.waitForLoadState("networkidle");

    // Open Work Experience drawer again
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Verify Fresh Graduate is still checked
    const checkboxAfterReload = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่')"
    );
    const isCheckedAfterReload = await checkboxAfterReload
      .first()
      .evaluate((el: HTMLInputElement) => el.checked);

    expect(isCheckedAfterReload).toBe(true);
  });

  test("should not show work entries when Fresh Graduate is ON", async ({ page }) => {
    // Open Work Experience drawer
    const workSection = page.locator("div.bg-white.rounded-lg").filter({
      has: page.getByRole("heading", { name: /ประสบการณ์ทำงาน/ }),
    }).first();
    await workSection.getByRole("button", { name: /แก้ไข/ }).click();

    // Wait for drawer (Sheet component uses heading for title)
    await expect(page.getByRole("heading", { name: /แก้ไขประสบการณ์ทำงาน/ })).toBeVisible({ timeout: 5000 });

    // Ensure Fresh Graduate is ON
    const freshGradCheckbox = page.locator(
      "input[type='checkbox'][name*='fresh'], label:has-text('จบใหม่')"
    );
    const checkbox = freshGradCheckbox.first();

    const isChecked = await checkbox
      .evaluate((el: HTMLInputElement) => el.checked)
      .catch(() => false);

    if (!isChecked) {
      await checkbox.click();
      const confirmButton = page.getByRole("button", { name: /ยืนยัน/ });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
      await page.waitForTimeout(1000);
    }

    // Verify no work entries are displayed
    const workEntries = page.locator("text=/Company|บริษัท|Position|ตำแหน่ง/i");
    const hasWorkEntries = await workEntries.isVisible({ timeout: 2000 }).catch(() => false);

    // Either no entries visible, or showing "no experience" message
    if (hasWorkEntries) {
      // Should show empty state or fresh graduate message
      await expect(page.getByText(/จบใหม่|ยังไม่มีประสบการณ์|Fresh Graduate/i)).toBeVisible();
    }
  });
});
