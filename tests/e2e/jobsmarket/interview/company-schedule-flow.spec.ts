/**
 * @fileoverview E2E tests for company interview scheduling flow
 * @specification BLS-05 Interview Management, CHAT-R02 Chat Room
 * @section BLS-05-01
 *
 * Tests the complete user flow of a company HR scheduling an interview
 * with a candidate through the chat interface.
 */

import { test, expect } from "@playwright/test";
import {
  createTestCompany,
  createTestCandidate,
  createTestJob,
  type TestCompany,
  type TestCandidate,
  type TestJob,
} from "../../helpers/factories";
import { signInAsCompany } from "../../helpers/auth-helper";
import { testDb, docRef, now, toTimestamp } from "../../helpers/factories";

// Shared test data
let company: TestCompany;
let candidate: TestCandidate;
let job: TestJob;
let chatRoomId: string;
let applicationId: string;

test.describe("Company Interview Schedule Flow - BLS-05-01", () => {
  test.beforeAll(async () => {
    // Create test company with a published job
    company = await createTestCompany({
      testName: "schedule-flow",
      withPublishedJob: true,
    });

    // Create test candidate
    candidate = await createTestCandidate({
      testName: "schedule-flow",
      withCompleteProfile: true,
    });

    // Get the job (created by company factory)
    const jobDocs = await testDb
      .collection("jobs")
      .where("companyId", "==", docRef("company_information", company.companyId))
      .limit(1)
      .get();

    if (jobDocs.empty) {
      throw new Error("No job found for company");
    }

    job = {
      jobId: jobDocs.docs[0].id,
      ...jobDocs.docs[0].data(),
    } as TestJob;

    // Create application
    applicationId = `app-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const candidateRef = docRef("candidate_information", candidate.candidateId);
    const companyRef = docRef("company_information", company.companyId);
    const jobRef = docRef("jobs", job.jobId);

    await testDb.collection("job_applications").doc(applicationId).set({
      candidateId: candidateRef,
      companyId: companyRef,
      jobId: jobRef,
      status: "reviewing",
      appliedAt: now(),
      isTestAccount: true,
    });

    // Create chat room
    chatRoomId = `chat-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    await testDb.collection("chats").doc(chatRoomId).set({
      candidateId: candidateRef,
      companyId: companyRef,
      jobId: jobRef,
      applicationId: docRef("job_applications", applicationId),
      createdAt: now(),
      updatedAt: now(),
      isTestAccount: true,
    });
  });

  test.beforeEach(async ({ page }) => {
    // Sign in as company using token-based auth
    await signInAsCompany(page, company);
  });

  test.describe("Happy Path - Schedule Interview", () => {
    /**
     * Requirement: BLS-05-01.e2e.navigate
     * "Company can navigate to chat room from applications"
     */
    test("should navigate to chat room from applications list", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications`);

      // Click on an application with 'reviewing' status
      await page.getByRole("row").filter({ hasText: /กำลังพิจารณา/ }).first().click();

      await expect(page).toHaveURL(/\/jobsmarket\/chat\//);
    });

    /**
     * Requirement: BLS-05-01.e2e.open-modal
     * "Company can open schedule interview modal"
     */
    test("should open schedule interview modal from chat room", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);

      // Click schedule interview button
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/นัดหมายสัมภาษณ์/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-01.e2e.schedule
     * "Company can schedule an online interview"
     */
    test("should schedule an online interview successfully", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);

      // Open schedule modal
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      // Fill form
      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);
      const dateString = tomorrow.toISOString().split("T")[0];

      await page.getByLabel(/วันที่/).fill(dateString);
      await page.getByLabel(/เวลาเริ่ม/).fill("10:00");
      await page.getByLabel(/เวลาสิ้นสุด/).fill("11:00");
      await page.getByRole("radio", { name: /ออนไลน์/ }).click();
      await page.getByLabel(/ลิงก์ประชุม/).fill("https://meet.google.com/test");

      // Submit
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Verify success
      await expect(page.getByText(/นัดหมายสำเร็จ/)).toBeVisible();

      // Verify interview card appears in chat
      await expect(page.getByTestId("interview-card")).toBeVisible();
    });

    /**
     * Requirement: BLS-05-01.e2e.schedule-onsite
     * "Company can schedule an onsite interview"
     */
    test("should schedule an onsite interview with location", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);

      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      const tomorrow = new Date();
      tomorrow.setDate(tomorrow.getDate() + 1);

      await page.getByLabel(/วันที่/).fill(tomorrow.toISOString().split("T")[0]);
      await page.getByLabel(/เวลาเริ่ม/).fill("14:00");
      await page.getByLabel(/เวลาสิ้นสุด/).fill("15:00");
      await page.getByRole("radio", { name: /ออนไซต์/ }).click();
      await page.getByLabel(/สถานที่/).fill("123 Main St, Bangkok 10110");

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/นัดหมายสำเร็จ/)).toBeVisible();
      await expect(page.getByText(/ออนไซต์/)).toBeVisible();
      await expect(page.getByText(/123 Main St/)).toBeVisible();
    });
  });

  test.describe("Validation Errors", () => {
    /**
     * Requirement: BLS-05-01.e2e.validation.date
     * "Should show error for past date"
     */
    test("should show error when selecting past date", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await page.getByLabel(/วันที่/).fill(yesterday.toISOString().split("T")[0]);
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/วันที่ต้องเป็นอนาคต/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-01.e2e.validation.time
     * "Should show error for invalid time range"
     */
    test("should show error when end time is before start time", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      await page.getByLabel(/เวลาเริ่ม/).fill("16:00");
      await page.getByLabel(/เวลาสิ้นสุด/).fill("10:00");
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-01.e2e.validation.location
     * "Should show error when onsite but no location"
     */
    test("should show error when onsite selected but no location", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      await page.getByRole("radio", { name: /ออนไซต์/ }).click();
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/กรุณากรอกสถานที่/)).toBeVisible();
    });
  });

  test.describe("Cancel Scheduling", () => {
    /**
     * Requirement: BLS-05-01.e2e.cancel
     * "Company can cancel scheduling without saving"
     */
    test("should close modal without saving when cancel clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${chatRoomId}`);
      await page.getByRole("button", { name: /นัดสัมภาษณ์/ }).click();

      // Fill some data
      await page.getByLabel(/หมายเหตุ/).fill("Some note");

      // Cancel
      await page.getByRole("button", { name: /ยกเลิก/ }).click();

      // Modal should be closed
      await expect(page.getByRole("dialog")).not.toBeVisible();

      // No interview card should appear
      await expect(page.getByTestId("interview-card")).not.toBeVisible();
    });
  });
});
