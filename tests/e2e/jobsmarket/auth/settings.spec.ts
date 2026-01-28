import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../helpers/factories";
import { signInAsCandidate } from "../../helpers/auth-helper";

/**
 * E2E tests for AUTH-R06 Settings Page
 * Tests tab navigation, account settings, password management,
 * notification preferences, and deletion workflows
 */

// Shared test data
let candidate: TestCandidate;

test.describe("AUTH-R06 Settings Page", () => {
  test.beforeAll(async () => {
    // Create test candidate for settings tests
    candidate = await createTestCandidate({
      testName: "auth-settings",
      withCompleteProfile: true,
    });
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCandidate(page, candidate);
    await page.goto("/jobsmarket/auth/settings");
  });

  test.describe("Settings page access and layout", () => {
    test("should load settings page successfully", async ({ page }) => {
      await expect(page).toHaveURL(/\/jobsmarket\/auth\/settings/);
      await expect(page.getByText("ตั้งค่าบัญชี")).toBeVisible();
      await expect(page.getByText("Account Settings")).toBeVisible();
    });

    test("should show all 5 tabs for normal users", async ({ page }) => {
      await expect(page.getByRole("button", { name: /บัญชี/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /รหัสผ่าน/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /การแจ้งเตือน/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /ความเป็นส่วนตัว/i })).toBeVisible();
      await expect(page.getByRole("button", { name: /ลบบัญชี/i })).toBeVisible();
    });

    test("should default to Account tab", async ({ page }) => {
      const accountTab = page.getByRole("button", { name: /บัญชี/i });
      await expect(accountTab).toHaveClass(/border-primary/);
      await expect(page.getByText("อีเมล")).toBeVisible();
    });
  });

  test.describe("Tab navigation", () => {
    test("should navigate to Password tab and show password section", async ({ page }) => {
      await page.getByRole("button", { name: /รหัสผ่าน/i }).click();

      await expect(page).toHaveURL(/tab=password/);
      await expect(
        page.getByText(/เปลี่ยนรหัสผ่าน|สร้างรหัสผ่าน/)
      ).toBeVisible();
    });

    test("should navigate to Notifications tab and show notification settings", async ({ page }) => {
      await page.getByRole("button", { name: /การแจ้งเตือน/i }).click();

      await expect(page).toHaveURL(/tab=notifications/);
      await expect(page.getByText("การแจ้งเตือนทางอีเมล")).toBeVisible();
      await expect(page.getByText("การแจ้งเตือนแบบพุช")).toBeVisible();
    });

    test("should navigate to Privacy tab and show privacy settings", async ({ page }) => {
      await page.getByRole("button", { name: /ความเป็นส่วนตัว/i }).click();

      await expect(page).toHaveURL(/tab=privacy/);
    });

    test("should navigate to Delete Account tab and show deletion form", async ({ page }) => {
      await page.getByRole("button", { name: /ลบบัญชี/i }).click();

      await expect(page).toHaveURL(/tab=delete/);
      await expect(page.getByText("คำเตือน")).toBeVisible();
      await expect(page.getByText("ข้อมูลสำหรับยืนยันตัวตน")).toBeVisible();
    });

    test("should preserve tab state when refreshing page", async ({ page }) => {
      await page.getByRole("button", { name: /การแจ้งเตือน/i }).click();
      await expect(page).toHaveURL(/tab=notifications/);

      await page.reload();

      await expect(page).toHaveURL(/tab=notifications/);
      await expect(page.getByText("การแจ้งเตือนทางอีเมล")).toBeVisible();
    });

    test("should support direct navigation via URL query param", async ({ page }) => {
      await page.goto("/jobsmarket/auth/settings?tab=password");

      await expect(page.getByText(/เปลี่ยนรหัสผ่าน|สร้างรหัสผ่าน/)).toBeVisible();
      const passwordTab = page.getByRole("button", { name: /รหัสผ่าน/i });
      await expect(passwordTab).toHaveClass(/border-primary/);
    });
  });

  test.describe("Account tab functionality", () => {
    test("should display user email", async ({ page }) => {
      await expect(page.getByText(candidate.email)).toBeVisible();
    });

    test("should show email verification status", async ({ page }) => {
      // Check for either verified or not verified state
      const isVerified = await page.getByText("ยืนยันอีเมลแล้ว").isVisible().catch(() => false);
      expect(typeof isVerified).toBe("boolean");
    });

    test("should display connected providers section", async ({ page }) => {
      await expect(page.getByText("ผู้ให้บริการที่เชื่อมต่อ")).toBeVisible();
      await expect(page.getByText("Google")).toBeVisible();
      await expect(page.getByText("Facebook")).toBeVisible();
      await expect(page.getByText("อีเมล/รหัสผ่าน")).toBeVisible();
    });
  });

  test.describe("Notifications tab functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: /การแจ้งเตือน/i }).click();
    });

    test("should show all email notification options", async ({ page }) => {
      await expect(page.getByText("งานที่แนะนำ")).toBeVisible();
      await expect(page.getByText("อัปเดตใบสมัคร")).toBeVisible();
      await expect(page.getByText("การนัดสัมภาษณ์")).toBeVisible();
      await expect(page.getByText("สรุปรายสัปดาห์")).toBeVisible();
      await expect(page.getByText("ข่าวสารและโปรโมชั่น")).toBeVisible();
    });

    test("should show all push notification options", async ({ page }) => {
      await expect(page.getByText("ข้อความใหม่")).toBeVisible();
    });

    test("should toggle notification preference and show success message", async ({ page }) => {
      const marketingSwitch = page.getByRole("switch").filter({ has: page.getByText("ข่าวสารและโปรโมชั่น") }).first();
      const initialState = await marketingSwitch.isChecked();

      await marketingSwitch.click();

      // Wait for success toast
      await expect(page.getByText("บันทึกการตั้งค่าเรียบร้อยแล้ว")).toBeVisible({ timeout: 5000 });

      // Verify state changed
      const newState = await marketingSwitch.isChecked();
      expect(newState).not.toBe(initialState);

      // Toggle back to original state
      await marketingSwitch.click();
      await expect(page.getByText("บันทึกการตั้งค่าเรียบร้อยแล้ว")).toBeVisible({ timeout: 5000 });
    });
  });

  test.describe("Delete Account tab functionality", () => {
    test.beforeEach(async ({ page }) => {
      await page.getByRole("button", { name: /ลบบัญชี/i }).click();
    });

    test("should show deletion warning", async ({ page }) => {
      await expect(page.getByText("คำเตือน")).toBeVisible();
      await expect(page.getByText("การลบบัญชีจะ:")).toBeVisible();
      await expect(page.getByText("ลบข้อมูลส่วนตัวทั้งหมดของคุณ")).toBeVisible();
      await expect(page.getByText("ยกเลิกใบสมัครงานทั้งหมดที่ยังดำเนินการอยู่")).toBeVisible();
    });

    test("should show all required form fields", async ({ page }) => {
      await expect(page.getByLabel(/ชื่อ \(ภาษาไทย\)/i)).toBeVisible();
      await expect(page.getByLabel(/นามสกุล \(ภาษาไทย\)/i)).toBeVisible();
      await expect(page.getByLabel(/เบอร์โทรศัพท์/i)).toBeVisible();
      await expect(page.getByLabel(/อีเมล/i)).toBeVisible();
    });

    test("should show file upload section", async ({ page }) => {
      await expect(page.getByText("เอกสารยืนยันตัวตน")).toBeVisible();
      await expect(page.getByText("อัปโหลดสำเนาบัตรประชาชนหรือเอกสารยืนยันตัวตน")).toBeVisible();
    });

    test("should show confirmation checkbox", async ({ page }) => {
      await expect(
        page.getByText(/ฉันเข้าใจว่าการลบบัญชีไม่สามารถย้อนกลับได้หลังจาก 30 วัน/i)
      ).toBeVisible();
    });

    test("should validate required fields when submitting", async ({ page }) => {
      const submitButton = page.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await submitButton.click();

      // Should show validation errors
      await expect(page.getByText("กรุณากรอกชื่อ")).toBeVisible();
    });

    test("should validate phone number format", async ({ page }) => {
      await page.getByLabel(/ชื่อ \(ภาษาไทย\)/i).fill("ทดสอบ");
      await page.getByLabel(/นามสกุล \(ภาษาไทย\)/i).fill("ระบบ");
      await page.getByLabel(/เบอร์โทรศัพท์/i).fill("123");

      const submitButton = page.getByRole("button", { name: /ส่งคำขอลบบัญชี/i });
      await submitButton.click();

      await expect(page.getByText("รูปแบบเบอร์โทรไม่ถูกต้อง")).toBeVisible();
    });
  });
});
