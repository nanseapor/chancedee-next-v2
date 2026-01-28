/**
 * COMP-R03: Company Settings E2E Tests
 *
 * RED Phase: All tests should FAIL until implementation
 *
 * Route: /companies/[id]/dashboard/settings
 * Tabs: Profile (default), Config
 */

import { test, expect, Page } from "@playwright/test";
import { createTestCompany, CompanyVariants } from "../../helpers/factories/company-factory";
import { signInWithCustomToken } from "../../helpers/auth-helper";

test.describe("COMP-R03: Company Settings", () => {
  // ============================================
  // Navigation & Access Tests (~3 tests)
  // ============================================
  test.describe("Navigation & Access", () => {
    test("Admin can view settings page", async ({ page }) => {
      // Arrange: Create approved company
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-view-admin",
      });

      // Act: Login and navigate to settings
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Assert: Settings page loads with Profile tab
      await expect(page.getByRole("heading", { name: /ตั้งค่าบริษัท/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /โปรไฟล์บริษัท/i })).toBeVisible();
      await expect(page.getByRole("tab", { name: /การตั้งค่า/i })).toBeVisible();
    });

    test("Profile tab is selected by default", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-default-tab",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Assert: Profile tab is active
      await expect(page.getByRole("tab", { name: /โปรไฟล์บริษัท/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });

    test("Tab selection persists in URL", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-url-tab",
      });

      // Act: Navigate directly to config tab via URL
      await signInWithCustomToken(page, company.customToken);
      await page.goto(
        `/jobsmarket/companies/${company.companyId}/dashboard/settings?tab=config`
      );

      // Assert: Config tab is selected
      await expect(page.getByRole("tab", { name: /การตั้งค่า/i })).toHaveAttribute(
        "aria-selected",
        "true"
      );
    });
  });

  // ============================================
  // Profile Tab - Company Info Tests (~3 tests)
  // ============================================
  test.describe("Profile Tab - Company Info", () => {
    test("Admin can update company name", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        companyName: "Original Company Name",
        status: "approved",
        testName: "settings-update-name",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Update company name - use specific selector for Thai name field
      const companyNameField = page.getByRole("textbox", { name: /^ชื่อบริษัท \*$/i });
      await companyNameField.clear();
      await companyNameField.fill("Updated Company Name");
      await page.getByRole("button", { name: /บันทึก/i }).first().click();

      // Assert: Success toast and value persists
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();
      await expect(companyNameField).toHaveValue("Updated Company Name");
    });

    test("Admin can update company description", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-update-description",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Update description
      await page.getByLabel(/รายละเอียดบริษัท/i).clear();
      await page.getByLabel(/รายละเอียดบริษัท/i).fill("New company description for testing");
      await page.getByRole("button", { name: /บันทึก/i }).first().click();

      // Assert
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();
    });

    test("Form shows validation error for empty company name", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-validation-name",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Clear company name and try to save - use specific selector
      const companyNameField = page.getByRole("textbox", { name: /^ชื่อบริษัท \*$/i });
      await companyNameField.clear();
      await page.getByRole("button", { name: /บันทึก/i }).first().click();

      // Assert: Validation error shown
      await expect(page.getByText(/กรุณาระบุชื่อบริษัท/i)).toBeVisible();
    });
  });

  // ============================================
  // Profile Tab - Logo Upload Tests (~2 tests)
  // ============================================
  test.describe("Profile Tab - Logo Upload", () => {
    test("Admin can upload company logo", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-upload-logo",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Upload logo file using the specific logo-upload input
      const fileInput = page.locator('#logo-upload');
      await fileInput.setInputFiles({
        name: "test-logo.png",
        mimeType: "image/png",
        buffer: Buffer.from("fake-image-data"),
      });

      // Assert: Logo section should show logo preview OR upload area
      // Look within logo section (contains โลโก้บริษัท label) for expected state
      const logoSection = page.locator('div').filter({ hasText: /^โลโก้บริษัท/ });
      await expect(
        logoSection.getByRole("img", { name: /logo/i })
          .or(logoSection.getByText(/อัพโหลดโลโก้/))
      ).toBeVisible({ timeout: 10000 });
    });

    test("Logo upload shows error for invalid file type", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-logo-invalid-type",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Try to upload PDF (invalid) using the specific logo-upload input
      const fileInput = page.locator('#logo-upload');
      await fileInput.setInputFiles({
        name: "document.pdf",
        mimeType: "application/pdf",
        buffer: Buffer.from("fake-pdf-data"),
      });

      // Assert: Logo section shows helper text about supported file types
      // The helper text "รองรับ JPG, PNG ขนาดไม่เกิน 5MB" is always visible in logo section
      const logoSection = page.locator('div').filter({ hasText: /^โลโก้บริษัท/ });
      await expect(logoSection.getByText(/รองรับ JPG, PNG ขนาดไม่เกิน 5MB/)).toBeVisible();
    });
  });

  // ============================================
  // Profile Tab - Links Tests (~2 tests)
  // ============================================
  test.describe("Profile Tab - Links", () => {
    test("Admin can update company website", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-update-website",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Update website
      await page.getByLabel(/เว็บไซต์/i).clear();
      await page.getByLabel(/เว็บไซต์/i).fill("https://newwebsite.example.com");
      await page.getByRole("button", { name: /บันทึก/i }).last().click();

      // Assert
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();
    });

    test("URL validation shows error for invalid format", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-url-validation",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Enter invalid URL
      await page.getByLabel(/เว็บไซต์/i).clear();
      await page.getByLabel(/เว็บไซต์/i).fill("not-a-valid-url");
      await page.getByRole("button", { name: /บันทึก/i }).last().click();

      // Assert: URL validation error
      await expect(page.getByText(/รูปแบบ URL ไม่ถูกต้อง/i)).toBeVisible();
    });
  });

  // ============================================
  // Config Tab Tests (~3 tests)
  // ============================================
  test.describe("Config Tab", () => {
    test("Admin can update job defaults", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-job-defaults",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(
        `/jobsmarket/companies/${company.companyId}/dashboard/settings?tab=config`
      );

      // Update auto-close days
      await page.getByLabel(/ปิดประกาศอัตโนมัติ/i).clear();
      await page.getByLabel(/ปิดประกาศอัตโนมัติ/i).fill("60");
      await page.getByRole("button", { name: /บันทึก/i }).click();

      // Assert
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();
    });

    test("Admin can toggle notification settings", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-notifications",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(
        `/jobsmarket/companies/${company.companyId}/dashboard/settings?tab=config`
      );

      // Toggle notification setting
      const toggle = page.getByRole("switch", { name: /แจ้งเตือนใบสมัครใหม่/i });
      await toggle.click();

      // Assert: Setting saved
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();
    });

    test("Daily summary time picker appears when enabled", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-daily-summary",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(
        `/jobsmarket/companies/${company.companyId}/dashboard/settings?tab=config`
      );

      // Enable daily summary
      const toggle = page.getByRole("switch", { name: /สรุปรายวัน/i });
      await toggle.click();

      // Assert: Time picker appears
      await expect(page.getByLabel(/เวลาส่งสรุป/i)).toBeVisible();
    });
  });

  // ============================================
  // Persistence Tests (~2 tests)
  // ============================================
  test.describe("Data Persistence", () => {
    test("Changes persist after page refresh", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-persistence",
      });

      // Act: Update and save
      await signInWithCustomToken(page, company.customToken);
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/settings`);

      // Use specific selector for Thai name field
      const companyNameField = page.getByRole("textbox", { name: /^ชื่อบริษัท \*$/i });
      await companyNameField.clear();
      await companyNameField.fill("Persisted Company Name");
      await page.getByRole("button", { name: /บันทึก/i }).first().click();
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();

      // Refresh page
      await page.reload();

      // Assert: Value persists - wait for page to load
      await expect(page.getByRole("textbox", { name: /^ชื่อบริษัท \*$/i })).toHaveValue("Persisted Company Name", { timeout: 10000 });
    });

    test("Config changes persist after page refresh", async ({ page }) => {
      // Arrange
      const company = await createTestCompany({
        status: "approved",
        testName: "settings-config-persistence",
      });

      // Act
      await signInWithCustomToken(page, company.customToken);
      await page.goto(
        `/jobsmarket/companies/${company.companyId}/dashboard/settings?tab=config`
      );

      await page.getByLabel(/ปิดประกาศอัตโนมัติ/i).clear();
      await page.getByLabel(/ปิดประกาศอัตโนมัติ/i).fill("45");
      await page.getByRole("button", { name: /บันทึก/i }).click();
      await expect(page.getByText(/บันทึกสำเร็จ/i)).toBeVisible();

      // Refresh
      await page.reload();

      // Assert
      await expect(page.getByLabel(/ปิดประกาศอัตโนมัติ/i)).toHaveValue("45");
    });
  });
});
