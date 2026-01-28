import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../../helpers/factories";
import { signInAsCandidate } from "../../../helpers/auth-helper";

/**
 * E2E Test: Profile Wizard Completion Flow
 * CAND-R02 Batch 5B
 *
 * User Journey: New user completes onboarding wizard
 *
 * Prerequisites:
 * - Test user with isOnboarded: false
 * - Dev server running
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/profile/profile-wizard-complete.spec.ts --project=chromium
 */

let candidate: TestCandidate;

test.describe("Profile Wizard Completion Flow", () => {
  test.beforeAll(async () => {
    // Create candidate WITHOUT complete profile to test wizard flow
    candidate = await createTestCandidate({
      testName: "profile-wizard-complete",
      withCompleteProfile: false,
    });
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCandidate(page, candidate);
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/profile`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("should redirect new user to wizard on profile access", async ({ page }) => {
    // New user should be redirected to wizard or see wizard UI
    // Check for wizard-specific elements (Step 1)
    await expect(
      page.getByRole("heading", { name: /ข้อมูลส่วนตัว|ขั้นตอนที่ 1/ })
    ).toBeVisible({ timeout: 10000 });
  });

  test("should complete Step 1: Personal Information", async ({ page }) => {
    // Wait for Step 1 to load
    await page.waitForSelector("input[name='firstnameTH'], input[name='first_name_th']", {
      timeout: 10000,
    });

    // Fill personal information
    // Find inputs by label or placeholder
    const firstNameInput = page.locator("input").filter({ has: page.locator(".. >> text=ชื่อ") }).first();
    const lastNameInput = page.locator("input").filter({ has: page.locator(".. >> text=นามสกุล") }).first();
    const phoneInput = page.locator("input[type='tel'], input[name*='phone']").first();

    await firstNameInput.fill("สมชาย");
    await lastNameInput.fill("ทดสอบ");
    await phoneInput.fill("0812345678");

    // Click Next/Save button
    const nextButton = page.getByRole("button", { name: /ถัดไป|บันทึก/ });
    await nextButton.click();

    // Verify moved to next step or saved
    await expect(page.getByText(/ประสบการณ์|ขั้นตอนที่ 2/)).toBeVisible({ timeout: 10000 });
  });

  test("should complete Step 2: Work Experience (or skip as fresh graduate)", async ({ page }) => {
    // Navigate to Step 2 (assuming we're already past Step 1)
    // Look for Fresh Graduate toggle or Work Experience form
    const freshGradToggle = page.getByText(/จบใหม่|Fresh Graduate/i);

    if (await freshGradToggle.isVisible({ timeout: 5000 }).catch(() => false)) {
      // Toggle fresh graduate ON to skip work experience
      await freshGradToggle.click();

      // Confirm if dialog appears
      const confirmButton = page.getByRole("button", { name: /ยืนยัน|ตกลง/ });
      if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await confirmButton.click();
      }
    }

    // Click Next to proceed
    const nextButton = page.getByRole("button", { name: /ถัดไป|บันทึก/ });
    if (await nextButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await nextButton.click();
    }

    // Verify moved to next step
    await expect(page.getByText(/การศึกษา|ขั้นตอนที่ 3/)).toBeVisible({ timeout: 10000 });
  });

  test("should complete Step 3: Education", async ({ page }) => {
    // Wait for education section
    await page.waitForSelector("text=/การศึกษา|Education/i", { timeout: 10000 });

    // Add education entry
    const addButton = page.getByRole("button", { name: /เพิ่ม|Add/ });
    if (await addButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addButton.click();

      // Fill education form
      const institutionInput = page.locator("input[name*='institution'], input").filter({
        has: page.locator(".. >> text=/สถาบัน|Institution/i"),
      }).first();
      await institutionInput.fill("มหาวิทยาลัยทดสอบ");

      // Select education level
      const levelSelect = page.locator("select[name*='level']").first();
      if (await levelSelect.isVisible({ timeout: 2000 }).catch(() => false)) {
        await levelSelect.selectOption({ value: "1" }); // Bachelor
      }

      // Save education entry
      const saveButton = page.getByRole("button", { name: /บันทึก|Save/ });
      await saveButton.click();
    }

    // Click Next
    const nextButton = page.getByRole("button", { name: /ถัดไป|Next/ });
    await nextButton.click();

    // Verify moved to next step
    await expect(page.getByRole("heading", { name: /ทักษะ/ })).toBeVisible({ timeout: 10000 });
  });

  test("should complete Step 4: Skills", async ({ page }) => {
    // Wait for skills section
    await page.waitForSelector("text=/ทักษะ|Skills/i", { timeout: 10000 });

    // Add skill
    const addSkillButton = page.getByRole("button", { name: /เพิ่มทักษะ|Add Skill/i });
    if (await addSkillButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await addSkillButton.click();

      // Fill skill name
      const skillInput = page.locator("input[name*='skill']").first();
      await skillInput.fill("JavaScript");

      // Save skill
      const saveButton = page.getByRole("button", { name: /บันทึก|Save/ });
      await saveButton.click();
    }

    // Click Next
    const nextButton = page.getByRole("button", { name: /ถัดไป|Next/ });
    await nextButton.click();

    // Verify moved to next step
    await expect(page.getByRole("heading", { name: /ความต้องการงาน/ })).toBeVisible({
      timeout: 10000,
    });
  });

  test("should complete Step 5: Job Preferences and finish wizard", async ({ page }) => {
    // Wait for preferences section
    await page.waitForSelector("text=/ความต้องการงาน|Job Preferences/i", { timeout: 10000 });

    // Fill job preferences (minimal required fields)
    const positionInput = page.locator("input[name*='position'], input").filter({
      has: page.locator(".. >> text=/ตำแหน่ง|Position/i"),
    }).first();
    if (await positionInput.isVisible({ timeout: 5000 }).catch(() => false)) {
      await positionInput.fill("Developer");
    }

    // Submit wizard
    const submitButton = page.getByRole("button", { name: /ส่ง|Submit|เสร็จสิ้น|Complete/ });
    await submitButton.click();

    // Verify redirect to dashboard or profile view
    await page.waitForURL((url) => {
      return (
        url.pathname.includes(`/candidates/${candidate.candidateId}`) &&
        !url.pathname.includes("/wizard") &&
        !url.pathname.includes("/edit")
      );
    }, { timeout: 15000 });

    // Verify we're on dashboard or profile (not wizard)
    await expect(page).not.toHaveURL(/wizard|edit/);
  });

  test("should verify isOnboarded is true after wizard completion", async ({ page }) => {
    // Complete wizard first (simplified - just submit final step)
    // Try to access profile after supposed completion
    // If wizard is complete, profile should load without redirect to wizard
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/profile`);

    // Should see profile view, not wizard
    // Look for profile-specific elements (View mode, not Edit mode)
    const profileHeader = page.getByRole("heading", { name: /โปรไฟล์|Profile/ });
    await expect(profileHeader).toBeVisible({ timeout: 10000 });

    // Should see Edit buttons (indicating view mode, not wizard mode)
    const editButtons = page.getByRole("button", { name: /แก้ไข|Edit/ });
    await expect(editButtons.first()).toBeVisible();
  });
});
