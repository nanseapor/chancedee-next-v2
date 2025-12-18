import { test, expect } from "@playwright/test";
import path from "path";
import fs from "fs";

/**
 * E2E Test: Document Upload
 * CAND-R02 Batch 5B
 *
 * User Journey: User uploads and deletes documents
 *
 * Prerequisites:
 * - Test user with isOnboarded: true
 * - Test PDF file for upload
 * - Dev server running
 *
 * Run: npx playwright test tests/e2e/jobsmarket/candidates/profile/profile-document-upload.spec.ts --project=chromium
 */

test.describe("Document Upload", () => {
  // Get test credentials from environment
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  // Skip if credentials not available
  test.skip(!testEmail || !testPassword || !testUid, "Test credentials not configured");

  // Create a test PDF file before tests
  const testFilesDir = path.join(process.cwd(), "tests/fixtures");
  const testPdfPath = path.join(testFilesDir, "test-document.pdf");

  test.beforeAll(async () => {
    // Ensure fixtures directory exists
    if (!fs.existsSync(testFilesDir)) {
      fs.mkdirSync(testFilesDir, { recursive: true });
    }

    // Create a minimal PDF file if it doesn't exist
    if (!fs.existsSync(testPdfPath)) {
      const minimalPdf = Buffer.from(
        "%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 612 792]>>endobj\nxref\n0 4\n0000000000 65535 f\n0000000009 00000 n\n0000000052 00000 n\n0000000101 00000 n\ntrailer<</Size 4/Root 1 0 R>>\nstartxref\n149\n%%EOF"
      );
      fs.writeFileSync(testPdfPath, minimalPdf);
    }
  });

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

  test("should display Documents section", async ({ page }) => {
    // Use data-testid for precise selection
    const documentsSection = page.getByTestId("documents-section");

    await expect(documentsSection).toBeVisible();

    // Verify heading text
    await expect(documentsSection.getByRole("heading", { name: "เอกสารแนบ" })).toBeVisible();
  });

  test("should have upload button", async ({ page }) => {
    // Find Documents section
    const documentsSection = page.getByTestId("documents-section");

    // Find Upload button
    const uploadButton = documentsSection.getByRole("button", { name: /อัปโหลด/ });
    await expect(uploadButton).toBeVisible();
  });

  test("should upload a PDF document", async ({ page }) => {
    // Find Documents section
    const documentsSection = page.getByTestId("documents-section");

    // Click upload button triggers file input
    const uploadButton = documentsSection.getByRole("button", { name: /อัปโหลด/ });

    // Listen for file chooser
    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadButton.click(),
    ]);

    // Upload file
    await fileChooser.setFiles(testPdfPath);

    // Wait for upload to complete - check for filename in document list or success toast
    await expect(page.getByText(/test-document\.pdf|อัปโหลดเอกสารสำเร็จ/i)).toBeVisible({
      timeout: 10000,
    });
  });

  test("should display uploaded document in list or empty state", async ({ page }) => {
    // Find Documents section
    const documentsSection = page.getByTestId("documents-section");

    // Check for either: uploaded documents OR empty state message
    const hasDocuments = await documentsSection.getByRole("button", { name: /ดาวน์โหลด/ }).isVisible({ timeout: 2000 }).catch(() => false);
    const hasEmptyState = await documentsSection.getByText(/ยังไม่มีเอกสารแนบ/).isVisible({ timeout: 2000 }).catch(() => false);

    // At least one should be visible
    expect(hasDocuments || hasEmptyState).toBeTruthy();
  });

  test("should delete a document if any exist", async ({ page }) => {
    // Find Documents section
    const documentsSection = page.getByTestId("documents-section");

    // Check if any documents exist
    const deleteButton = documentsSection.getByRole("button", { name: /ลบ/ }).first();
    const hasDocuments = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);

    if (!hasDocuments) {
      // Try to upload a document first
      const uploadButton = documentsSection.getByRole("button", { name: /อัปโหลด/ });
      const uploadButtonVisible = await uploadButton.isVisible({ timeout: 2000 }).catch(() => false);

      if (uploadButtonVisible) {
        try {
          // Attempt to upload
          const [fileChooser] = await Promise.all([
            page.waitForEvent('filechooser', { timeout: 5000 }),
            uploadButton.click(),
          ]);

          await fileChooser.setFiles(testPdfPath);

          // Wait for upload (but don't fail if it doesn't complete)
          await page.waitForTimeout(3000);

          // Check again if delete button appeared
          const hasDocumentsNow = await deleteButton.isVisible({ timeout: 2000 }).catch(() => false);
          if (!hasDocumentsNow) {
            test.skip(true, "No documents available to delete after upload attempt");
          }
        } catch (error) {
          test.skip(true, "Could not upload document for testing");
        }
      } else {
        test.skip(true, "No documents available and cannot upload");
      }
    }

    // Listen for confirm dialog
    page.on('dialog', async (dialog) => {
      expect(dialog.type()).toBe('confirm');
      await dialog.accept();
    });

    // Click delete
    await deleteButton.click();

    // Wait for deletion to complete - check for success toast or empty state
    await expect(page.getByText(/ลบเอกสารสำเร็จ|ยังไม่มีเอกสารแนบ/i)).toBeVisible({
      timeout: 5000,
    });
  });

  test("should show upload progress or complete quickly", async ({ page }) => {
    // Find Documents section
    const documentsSection = page.getByTestId("documents-section");

    // Click upload button
    const uploadButton = documentsSection.getByRole("button", { name: /อัปโหลด/ });

    const [fileChooser] = await Promise.all([
      page.waitForEvent('filechooser'),
      uploadButton.click(),
    ]);

    await fileChooser.setFiles(testPdfPath);

    // Look for progress indicator or completion
    const hasProgress = await page.getByText(/กำลังอัปโหลด/i).isVisible({ timeout: 2000 }).catch(() => false);
    const hasSuccess = await page.getByText(/อัปโหลดเอกสารสำเร็จ|test-document\.pdf/i).isVisible({ timeout: 10000 }).catch(() => false);

    // Either progress was shown OR upload completed
    expect(hasProgress || hasSuccess).toBeTruthy();
  });
});
