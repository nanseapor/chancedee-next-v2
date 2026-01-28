import { test, expect } from "@playwright/test";

/**
 * E2E tests for COMP-R06: Job Creation Wizard
 * Tests all user flows from RIS specification
 */

const TEST_COMPANY_ID = process.env.TEST_COMPANY_ID || "test-company-123";
const WIZARD_URL = `/companies/${TEST_COMPANY_ID}/dashboard/jobs/new`;

test.describe("Job Creation Wizard - COMP-R06", () => {
  test.describe("Happy Path: Create and Publish Job", () => {
    test("should complete all wizard steps and publish immediately", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Step 1: Basic Information
      await expect(page.getByRole("heading", { name: /ข้อมูลพื้นฐาน/ })).toBeVisible();

      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Senior Frontend Developer");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("senior");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("2");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 2: Job Details
      await expect(page.getByRole("heading", { name: /รายละเอียดงาน/ })).toBeVisible();

      const description =
        "We are seeking an experienced frontend developer to join our team. " +
        "You will work with React, TypeScript, and modern web technologies.";

      await page.getByLabel(/รายละเอียดงาน/).fill(description);
      await page.getByLabel(/ทักษะที่ต้องการ/).fill("React");
      await page.keyboard.press("Enter");
      await page.getByLabel(/ทักษะที่ต้องการ/).fill("TypeScript");
      await page.keyboard.press("Enter");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 3: Work Location
      await expect(page.getByRole("heading", { name: /สถานที่ทำงาน/ })).toBeVisible();

      await page.getByLabel(/รูปแบบการทำงาน/).check({ force: true }); // Select "hybrid" or "onsite"
      await page.getByLabel(/จังหวัด/).selectOption("กรุงเทพมหานคร");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 4: Review & Publish
      await expect(page.getByRole("heading", { name: /ตรวจสอบและเผยแพร่/ })).toBeVisible();

      // Verify preview shows correct data
      await expect(page.getByText("Senior Frontend Developer")).toBeVisible();

      // Publish now
      await page.getByRole("button", { name: /เผยแพร่ทันที/ }).click();

      // Verify success and redirect
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.getByText(/เผยแพร่งานสำเร็จ/)).toBeVisible();
    });

    test("should schedule job for future publication", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Fill steps 1-3 (abbreviated)
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Backend Developer");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      const description = "a".repeat(60); // Minimum 50 chars
      await page.getByLabel(/รายละเอียดงาน/).fill(description);
      await page.getByLabel(/ทักษะที่ต้องการ/).fill("Node.js");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await page.getByLabel(/remote/i).check({ force: true });
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Schedule
      await page.getByRole("button", { name: /ตั้งเวลาเผยแพร่/ }).click();

      // Pick future date (7 days from now)
      const futureDate = new Date();
      futureDate.setDate(futureDate.getDate() + 7);

      await page.getByLabel(/วันที่เผยแพร่/).fill(
        futureDate.toISOString().split("T")[0]
      );

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Verify success
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.getByText(/ตั้งเวลาเผยแพร่สำเร็จ/)).toBeVisible();
    });

    test("should save job as draft", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Fill only step 1
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Draft Job");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("contract");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("entry");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");

      // Save as draft from step 1
      await page.getByRole("button", { name: /บันทึกเป็นร่าง/ }).click();

      // Verify redirect and success message
      await expect(page).toHaveURL(/\/jobs$/);
      await expect(page.getByText(/บันทึกร่างสำเร็จ/)).toBeVisible();

      // Verify draft appears in list
      await expect(page.getByText("Draft Job")).toBeVisible();
      await expect(page.getByText(/ร่าง/)).toBeVisible();
    });
  });

  test.describe("Happy Path: Resume and Duplicate", () => {
    // TODO: Implement when draft resume functionality is ready
    test.skip("should resume editing existing draft", async () => {});

    // TODO: Implement when job duplication feature is ready
    test.skip("should duplicate existing job", async () => {});
  });

  test.describe("Invalid Inputs: Validation Errors", () => {
    test("should show error for empty title in step 1", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Try to proceed without filling title
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(page.getByText(/กรุณากรอกชื่อตำแหน่งงาน/)).toBeVisible();
    });

    test("should show error for title shorter than 5 characters", async ({ page }) => {
      await page.goto(WIZARD_URL);

      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(
        page.getByText(/กรุณากรอกชื่อตำแหน่งงาน \(5-100 ตัวอักษร\)/)
      ).toBeVisible();
    });

    test("should show error for max salary less than min salary", async ({ page }) => {
      await page.goto(WIZARD_URL);

      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Valid Title");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");

      await page.getByLabel(/เงินเดือนต่ำสุด/).fill("50000");
      await page.getByLabel(/เงินเดือนสูงสุด/).fill("30000");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(page.getByText(/เงินเดือนสูงสุดต้องมากกว่าต่ำสุด/)).toBeVisible();
    });

    test("should show error for description shorter than 50 characters", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Complete step 1
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test Job");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 2: Short description
      await page.getByLabel(/รายละเอียดงาน/).fill("Too short");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(
        page.getByText(/กรุณากรอกรายละเอียดงาน \(อย่างน้อย 50 ตัวอักษร\)/)
      ).toBeVisible();
    });

    test("should show error for missing skills", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Complete step 1
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test Job");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 2: Fill description but no skills
      await page.getByLabel(/รายละเอียดงาน/).fill("a".repeat(60));

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(
        page.getByText(/กรุณาระบุทักษะที่ต้องการอย่างน้อย 1 รายการ/)
      ).toBeVisible();
    });

    test("should show error for missing province when work model is onsite", async ({
      page,
    }) => {
      await page.goto(WIZARD_URL);

      // Complete steps 1-2
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test Job");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await page.getByLabel(/รายละเอียดงาน/).fill("a".repeat(60));
      await page.getByLabel(/ทักษะที่ต้องการ/).fill("React");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Step 3: Select onsite but no province
      await page.getByLabel(/onsite/i).check({ force: true });

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await expect(page.getByText(/กรุณาเลือกจังหวัด/)).toBeVisible();
    });

    test("should show error for past date when scheduling", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Complete all steps
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test Job");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await page.getByLabel(/รายละเอียดงาน/).fill("a".repeat(60));
      await page.getByLabel(/ทักษะที่ต้องการ/).fill("React");
      await page.keyboard.press("Enter");
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      await page.getByLabel(/remote/i).check({ force: true });
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Try to schedule with past date
      await page.getByRole("button", { name: /ตั้งเวลาเผยแพร่/ }).click();

      const pastDate = new Date();
      pastDate.setDate(pastDate.getDate() - 1);

      await page.getByLabel(/วันที่เผยแพร่/).fill(pastDate.toISOString().split("T")[0]);

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/วันที่ต้องเป็นอนาคต/)).toBeVisible();
    });
  });

  test.describe("Error States and Edge Cases", () => {
    test("should show navigation guard when leaving with unsaved changes", async ({
      page,
    }) => {
      await page.goto(WIZARD_URL);

      // Fill some data
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Test Job");

      // Try to navigate away (click back button or navigate)
      await page.getByRole("button", { name: /ย้อนกลับ/ }).click();

      // Expect confirmation modal
      await expect(page.getByText(/มีการเปลี่ยนแปลงที่ยังไม่ได้บันทึก/)).toBeVisible();
    });

    test("should show auto-save indicator", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Fill data
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Auto-save Test");

      // Blur the field to trigger auto-save
      await page.getByLabel(/ประเภทการจ้างงาน/).focus();

      // Expect saving indicator
      await expect(page.getByText(/กำลังบันทึก/)).toBeVisible({ timeout: 500 });

      // Then saved indicator
      await expect(page.getByText(/บันทึกร่างแล้ว/)).toBeVisible({ timeout: 2000 });
    });

    test("should allow navigation back and forth between steps", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Fill step 1
      await page.getByLabel(/ชื่อตำแหน่งงาน/).fill("Navigation Test");
      await page.getByLabel(/ประเภทการจ้างงาน/).selectOption("fulltime");
      await page.getByLabel(/ระดับตำแหน่ง/).selectOption("mid");
      await page.getByLabel(/จำนวนตำแหน่งที่รับ/).fill("1");

      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Go back
      await page.getByRole("button", { name: /ย้อนกลับ/ }).click();

      // Verify still on step 1 with data preserved
      await expect(page.getByLabel(/ชื่อตำแหน่งงาน/)).toHaveValue("Navigation Test");

      // Go forward again
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      // Now on step 2
      await expect(page.getByRole("heading", { name: /รายละเอียดงาน/ })).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should be keyboard navigable", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Tab through form fields
      await page.keyboard.press("Tab");
      await expect(page.getByLabel(/ชื่อตำแหน่งงาน/)).toBeFocused();

      await page.keyboard.press("Tab");
      await expect(page.getByLabel(/แผนก\/ฝ่าย/)).toBeFocused();
    });

    test("should have proper ARIA labels", async ({ page }) => {
      await page.goto(WIZARD_URL);

      // Check for labeled inputs
      await expect(page.getByLabel(/ชื่อตำแหน่งงาน/)).toHaveAttribute("aria-label");

      // Check for error announcements
      await page.getByRole("button", { name: /ถัดไป/ }).click();

      const titleError = page.getByText(/กรุณากรอกชื่อตำแหน่งงาน/);
      await expect(titleError).toHaveAttribute("role", "alert");
    });
  });
});
