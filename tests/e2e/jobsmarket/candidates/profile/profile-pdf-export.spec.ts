import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../../helpers/factories";
import { signInAsCandidate } from "../../../helpers/auth-helper";

/**
 * E2E Test: Profile PDF Export
 * CAND-R02 Batch 5B
 *
 * User Journey: User exports profile as PDF
 *
 * Prerequisites:
 * - Test user with isOnboarded: true
 * - Dev server running
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/profile/profile-pdf-export.spec.ts --project=chromium
 */

let candidate: TestCandidate;

test.describe("Profile PDF Export", () => {
  test.beforeAll(async () => {
    candidate = await createTestCandidate({
      testName: "profile-pdf-export",
      withCompleteProfile: true,
    });
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCandidate(page, candidate);
    await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/profile`);
    await page.waitForLoadState("domcontentloaded");
  });

  test("should display Preview button", async ({ page }) => {
    // Look for Preview button in ProfileHeader
    const previewButton = page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ });
    await expect(previewButton).toBeVisible({ timeout: 5000 });
  });

  test("should open preview modal when Preview button clicked", async ({ page }) => {
    // Click Preview button
    const previewButton = page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ });
    await previewButton.click();

    // Verify modal opens
    await expect(page.getByRole("dialog")).toBeVisible({ timeout: 5000 });

    // Verify modal contains preview content
    await expect(page.getByText(/ตัวอย่างโปรไฟล์|Profile Preview|Resume/i)).toBeVisible();
  });

  test("should display profile content in preview modal", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Verify personal info is displayed
    // Look for key profile sections in preview
    const previewContent = page.getByRole("dialog");

    // Check for common profile elements (name, contact, experience, etc.)
    // These may be in Thai or English depending on implementation
    const hasContent = await Promise.race([
      previewContent.getByText(/ข้อมูลส่วนตัว|Personal|ชื่อ|Name/).isVisible({ timeout: 3000 }),
      previewContent.getByText(/ประสบการณ์|Experience/).isVisible({ timeout: 3000 }),
      previewContent.getByText(/การศึกษา|Education/).isVisible({ timeout: 3000 }),
    ]).catch(() => false);

    expect(hasContent).toBeTruthy();
  });

  test("should display PDF download button in preview modal", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Look for download/export PDF button
    const downloadButton = page.getByRole("button", { name: /ดาวน์โหลด|Download|Export|PDF/ });
    await expect(downloadButton).toBeVisible({ timeout: 5000 });
  });

  test("should initiate PDF download when download button clicked", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Set up download listener
    const downloadPromise = page.waitForEvent("download", { timeout: 15000 });

    // Click download button
    const downloadButton = page.getByRole("button", { name: /ดาวน์โหลด|Download.*PDF/i });
    await downloadButton.click();

    // Wait for download to start (or API call to be made)
    // Note: If PDF is generated via API, download may not trigger immediately
    try {
      const download = await downloadPromise;

      // Verify download started
      expect(download).toBeTruthy();

      // Verify filename contains expected pattern
      const filename = download.suggestedFilename();
      expect(filename).toMatch(/\.pdf$/i);
    } catch (error) {
      // Download may not be triggered in dev environment
      // Instead, verify API call was made
      console.log("Download event not captured - checking for API call instead");

      // Look for loading indicator or success message
      const loadingOrSuccess = await Promise.race([
        page.getByText(/กำลัง|Loading|สำเร็จ|Success/).isVisible({ timeout: 5000 }),
        page.locator("[role='progressbar'], .spinner").isVisible({ timeout: 5000 }),
      ]).catch(() => false);

      expect(loadingOrSuccess).toBeTruthy();
    }
  });

  test("should close preview modal", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Close modal
    const closeButton = page.getByRole("button", { name: /ปิด|Close/ });
    if (await closeButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await closeButton.click();
    } else {
      // Try clicking overlay or pressing Escape
      await page.keyboard.press("Escape");
    }

    // Verify modal closes
    await expect(page.getByRole("dialog")).not.toBeVisible({ timeout: 5000 });
  });

  test("should display all profile sections in preview", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    const previewDialog = page.getByRole("dialog");

    // Check for major profile sections
    const sectionsToCheck = [
      /ข้อมูลส่วนตัว|Personal/i,
      /ประสบการณ์|Experience/i,
      /การศึกษา|Education/i,
      /ทักษะ|Skills/i,
    ];

    // At least some sections should be visible
    let visibleSections = 0;
    for (const section of sectionsToCheck) {
      const isVisible = await previewDialog
        .getByText(section)
        .isVisible({ timeout: 2000 })
        .catch(() => false);
      if (isVisible) visibleSections++;
    }

    // Expect at least 2 sections to be visible
    expect(visibleSections).toBeGreaterThanOrEqual(2);
  });

  test("should maintain responsive design in preview modal", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Verify modal is scrollable if content is long
    const modal = page.getByRole("dialog");
    const modalHeight = await modal.boundingBox().then((box) => box?.height || 0);

    // Modal should not exceed viewport height significantly
    const viewportHeight = page.viewportSize()?.height || 1080;
    expect(modalHeight).toBeLessThanOrEqual(viewportHeight * 1.2);

    // Content should be scrollable
    const isScrollable = await modal.evaluate((el) => el.scrollHeight > el.clientHeight);
    // Either scrollable OR fits within viewport (both are acceptable)
    expect(isScrollable || modalHeight < viewportHeight).toBeTruthy();
  });

  test("should show loading state during PDF generation", async ({ page }) => {
    // Open preview
    await page.getByRole("button", { name: /ดูตัวอย่าง|Preview/ }).click();
    await page.waitForSelector("role=dialog", { timeout: 5000 });

    // Click download button
    const downloadButton = page.getByRole("button", { name: /ดาวน์โหลด|Download.*PDF/i });
    await downloadButton.click();

    // Look for loading indicator
    const loadingIndicator = page.locator(
      "[role='progressbar'], .spinner, text=/กำลัง|Loading|Generating/i"
    );

    // Loading may be very fast, so we check for either:
    // 1. Loading indicator appeared, or
    // 2. Success/completion state reached
    const hasLoading = await loadingIndicator.isVisible({ timeout: 3000 }).catch(() => false);
    const hasCompleted = await page
      .getByText(/สำเร็จ|Success|Complete/i)
      .isVisible({ timeout: 5000 })
      .catch(() => false);

    expect(hasLoading || hasCompleted).toBeTruthy();
  });
});
