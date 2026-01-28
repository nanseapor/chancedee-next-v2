/**
 * COMP-R08 Phase 7: Applications Reject Flow E2E Tests
 *
 * Tests the reject application user flow including:
 * - Button visibility and permissions
 * - Reject modal/dialog
 * - Feedback entry (optional)
 * - Loading states
 * - Success toast
 * - Status update
 *
 * Target: 8-10 tests
 *
 * Critical: Never use 'networkidle' wait strategy (Firebase keeps WebSocket open)
 */

import { test, expect, type Page } from "@playwright/test";
import {
  createTestCompany,
  createTestCandidate,
  type TestCompany,
  type TestCandidate,
} from "../../helpers/factories";
import { signInAsCompany } from "../../helpers/auth-helper";
import { testDb, docRef, now } from "../../helpers/factories";

// Shared test data
let company: TestCompany;
let candidateApplied: TestCandidate;
let candidateRejected: TestCandidate;
let applicationAppliedId: string;
let applicationRejectedId: string;

/**
 * Wait for page load using domcontentloaded + visible element check
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.locator('nav, aside, [data-testid="company-sidebar"]').first()
  ).toBeVisible({ timeout: 10000 });
}

test.describe("Applications Reject Flow - COMP-R08", () => {
  test.beforeAll(async () => {
    // Create test company with a published job
    company = await createTestCompany({
      testName: "reject-flow",
      withPublishedJobs: 1,
    });

    // Create candidate with applied status
    candidateApplied = await createTestCandidate({
      testName: "reject-applied",
      withCompleteProfile: true,
    });

    // Create candidate with rejected status
    candidateRejected = await createTestCandidate({
      testName: "reject-rejected",
      withCompleteProfile: true,
    });

    // Get the job
    const jobDocs = await testDb
      .collection("jobs")
      .where("company_id", "==", docRef("company_information", company.companyId))
      .limit(1)
      .get();

    if (jobDocs.empty) {
      throw new Error("No job found for company");
    }
    const jobId = jobDocs.docs[0].id;
    const jobRef = docRef("jobs", jobId);
    const companyRef = docRef("company_information", company.companyId);

    // Create application with "applied" status
    applicationAppliedId = `app-reject-applied-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const candidateAppliedRef = docRef("candidate_information", candidateApplied.candidateId);
    await testDb.collection("job_applications").doc(applicationAppliedId).set({
      uid: applicationAppliedId,
      candidate_id: candidateAppliedRef,
      company_id: companyRef,
      job_id: jobRef,
      status: "applied",
      candidate_name: "ผู้สมัครรอปฏิเสธ",
      company_name: company.companyName || "บริษัททดสอบ",
      job_title: "ตำแหน่งทดสอบ",
      applied_at: now(),
      is_test_account: true,
      is_active: true,
      created_at: now(),
      updated_at: now(),
      created_by: null,
      updated_by: null,
    });

    // Create application with "rejected" status
    applicationRejectedId = `app-reject-rejected-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
    const candidateRejectedRef = docRef("candidate_information", candidateRejected.candidateId);
    await testDb.collection("job_applications").doc(applicationRejectedId).set({
      uid: applicationRejectedId,
      candidate_id: candidateRejectedRef,
      company_id: companyRef,
      job_id: jobRef,
      status: "rejected",
      candidate_name: "ผู้สมัครที่ปฏิเสธแล้ว",
      company_name: company.companyName || "บริษัททดสอบ",
      job_title: "ตำแหน่งทดสอบ",
      applied_at: now(),
      is_test_account: true,
      is_active: true,
      created_at: now(),
      updated_at: now(),
      created_by: null,
      updated_by: null,
    });
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCompany(page, company);
    await page.setViewportSize({ width: 1280, height: 800 });
  });

  test.describe("Reject Button Visibility", () => {
    test("should show reject button when application is selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application we created - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      // Reject button should be visible in detail panel
      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await expect(rejectButton).toBeVisible({ timeout: 5000 });
    });

    test("should hide reject button when no application selected", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications`);
      await waitForPageLoad(page);

      // Reject button should not be visible when no application is selected
      const rejectButton = page.getByRole("button", { name: /ปฏิเสธ/, exact: true });
      const isVisible = await rejectButton.isVisible({ timeout: 2000 }).catch(() => false);
      expect(isVisible).toBe(false);
    });

    test("should disable reject button for already rejected applications", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=rejected`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific rejected application we created - use exact ID
      const card = page.getByTestId(`application-card-${applicationRejectedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      // Reject button should either be disabled or not visible
      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      const isDisabled = await rejectButton.isDisabled().catch(() => true);
      const isHidden = await rejectButton.isHidden().catch(() => true);

      expect(isDisabled || isHidden).toBe(true);
    });
  });

  test.describe("Reject Modal/Dialog", () => {
    test("should open reject modal when clicking reject button", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      // Click reject button
      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Modal should open
      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible({ timeout: 3000 });
    });

    test("should show feedback textarea in reject modal", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Modal should have a feedback textarea
      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Look for textarea or textbox for feedback
      const feedbackInput = modal.getByRole("textbox").or(modal.locator("textarea"));
      await expect(feedbackInput).toBeVisible({ timeout: 2000 });
    });

    test("should have confirm and cancel buttons in reject modal", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Should have confirm button
      await expect(modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ })).toBeVisible();

      // Should have cancel button
      await expect(modal.getByRole("button", { name: /ยกเลิก|ปิด/ })).toBeVisible();
    });

    test("should close reject modal when clicking cancel", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Click cancel button
      const cancelButton = modal.getByRole("button", { name: /ยกเลิก|ปิด/ });
      await cancelButton.click();

      // Modal should close
      await expect(modal).toBeHidden({ timeout: 2000 });
    });
  });

  test.describe("Reject with Feedback", () => {
    test("should allow entering feedback before rejecting", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Enter feedback
      const feedbackInput = modal.getByRole("textbox").or(modal.locator("textarea"));
      const testFeedback = "ขอบคุณสำหรับการสมัครงาน แต่เราตัดสินใจเลือกผู้สมัครท่านอื่น";
      await feedbackInput.fill(testFeedback);

      // Verify feedback was entered
      const value = await feedbackInput.inputValue();
      expect(value).toBe(testFeedback);
    });

    test("should allow rejecting without feedback (optional)", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Don't enter feedback - confirm button should still be enabled
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await expect(confirmButton).toBeEnabled();
    });
  });

  test.describe("Reject Loading States", () => {
    test("should show loading state while rejecting application", async ({ page }) => {
      // Create a fresh application for this mutation test
      const jobDocs = await testDb
        .collection("jobs")
        .where("company_id", "==", docRef("company_information", company.companyId))
        .limit(1)
        .get();
      const jobId = jobDocs.docs[0].id;
      const freshAppId = `app-loading-reject-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const candidateRef = docRef("candidate_information", candidateApplied.candidateId);
      const companyRef = docRef("company_information", company.companyId);
      const jobRef = docRef("jobs", jobId);

      await testDb.collection("job_applications").doc(freshAppId).set({
        uid: freshAppId,
        candidate_id: candidateRef,
        company_id: companyRef,
        job_id: jobRef,
        status: "applied",
        candidate_name: "ผู้สมัครทดสอบ Loading",
        company_name: company.companyName || "บริษัททดสอบ",
        job_title: "ตำแหน่งทดสอบ",
        applied_at: now(),
        is_test_account: true,
        is_active: true,
        created_at: now(),
        updated_at: now(),
        created_by: null,
        updated_by: null,
      });

      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific fresh application - use exact ID
      const card = page.getByTestId(`application-card-${freshAppId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Click confirm
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Check for loading indicator
      const isDisabledDuringLoad = await confirmButton.isDisabled({ timeout: 1000 }).catch(() => false);
      const hasLoadingSpinner = await page.locator('[role="status"], .spinner, .loading').isVisible({ timeout: 1000 }).catch(() => false);

      // At least one loading indicator should be present
      expect(isDisabledDuringLoad || hasLoadingSpinner).toBe(true);
    });

    test("should disable confirm button while rejecting", async ({ page }) => {
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific applied application - use exact ID
      const card = page.getByTestId(`application-card-${applicationAppliedId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Button should be disabled during the operation
      await expect(confirmButton).toBeDisabled({ timeout: 2000 });
    });
  });

  test.describe("Reject Success", () => {
    test("should show success toast after rejecting application", async ({ page }) => {
      // Create a fresh application for this mutation test
      const jobDocs = await testDb
        .collection("jobs")
        .where("company_id", "==", docRef("company_information", company.companyId))
        .limit(1)
        .get();
      const jobId = jobDocs.docs[0].id;
      const freshAppId = `app-success-toast-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const candidateRef = docRef("candidate_information", candidateApplied.candidateId);
      const companyRef = docRef("company_information", company.companyId);
      const jobRef = docRef("jobs", jobId);

      await testDb.collection("job_applications").doc(freshAppId).set({
        uid: freshAppId,
        candidate_id: candidateRef,
        company_id: companyRef,
        job_id: jobRef,
        status: "applied",
        candidate_name: "ผู้สมัครทดสอบ Toast",
        company_name: company.companyName || "บริษัททดสอบ",
        job_title: "ตำแหน่งทดสอบ",
        applied_at: now(),
        is_test_account: true,
        is_active: true,
        created_at: now(),
        updated_at: now(),
        created_by: null,
        updated_by: null,
      });

      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific fresh application - use exact ID
      const card = page.getByTestId(`application-card-${freshAppId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      // Confirm rejection
      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Wait for success toast
      const toast = page.locator('[role="status"], [data-sonner-toast]').filter({ hasText: /ปฏิเสธ.*สำเร็จ/ });
      await expect(toast).toBeVisible({ timeout: 5000 });
    });

    test("should update application status to rejected after rejecting", async ({ page }) => {
      // Create a fresh application for this mutation test
      const jobDocs = await testDb
        .collection("jobs")
        .where("company_id", "==", docRef("company_information", company.companyId))
        .limit(1)
        .get();
      const jobId = jobDocs.docs[0].id;
      const freshAppId = `app-status-update-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const candidateRef = docRef("candidate_information", candidateApplied.candidateId);
      const companyRef = docRef("company_information", company.companyId);
      const jobRef = docRef("jobs", jobId);

      await testDb.collection("job_applications").doc(freshAppId).set({
        uid: freshAppId,
        candidate_id: candidateRef,
        company_id: companyRef,
        job_id: jobRef,
        status: "applied",
        candidate_name: "ผู้สมัครทดสอบ Status",
        company_name: company.companyName || "บริษัททดสอบ",
        job_title: "ตำแหน่งทดสอบ",
        applied_at: now(),
        is_test_account: true,
        is_active: true,
        created_at: now(),
        updated_at: now(),
        created_by: null,
        updated_by: null,
      });

      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific fresh application - use exact ID
      const card = page.getByTestId(`application-card-${freshAppId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Wait for success
      await page.waitForTimeout(2000);

      // Navigate to rejected applications - the specific app should appear there
      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=rejected`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // The application should now appear in rejected list - use exact ID
      const rejectedCard = page.getByTestId(`application-card-${freshAppId}`);
      await expect(rejectedCard).toBeVisible({ timeout: 10000 });
    });

    test("should close modal after successful rejection", async ({ page }) => {
      // Create a fresh application for this mutation test
      const jobDocs = await testDb
        .collection("jobs")
        .where("company_id", "==", docRef("company_information", company.companyId))
        .limit(1)
        .get();
      const jobId = jobDocs.docs[0].id;
      const freshAppId = `app-modal-close-${Date.now()}-${Math.random().toString(36).substring(2, 8)}`;
      const candidateRef = docRef("candidate_information", candidateApplied.candidateId);
      const companyRef = docRef("company_information", company.companyId);
      const jobRef = docRef("jobs", jobId);

      await testDb.collection("job_applications").doc(freshAppId).set({
        uid: freshAppId,
        candidate_id: candidateRef,
        company_id: companyRef,
        job_id: jobRef,
        status: "applied",
        candidate_name: "ผู้สมัครทดสอบ Modal",
        company_name: company.companyName || "บริษัททดสอบ",
        job_title: "ตำแหน่งทดสอบ",
        applied_at: now(),
        is_test_account: true,
        is_active: true,
        created_at: now(),
        updated_at: now(),
        created_by: null,
        updated_by: null,
      });

      await page.goto(`/jobsmarket/companies/${company.companyId}/dashboard/applications?status=applied`);
      await waitForPageLoad(page);
      await page.waitForTimeout(1000);

      // Click the specific fresh application - use exact ID
      const card = page.getByTestId(`application-card-${freshAppId}`);
      await expect(card).toBeVisible({ timeout: 10000 });
      await card.click();
      await page.waitForTimeout(500);

      const detailPanel = page.getByTestId("detail-panel");
      const rejectButton = detailPanel.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      const modal = page.getByRole("alertdialog").or(page.getByRole("dialog"));
      await expect(modal).toBeVisible();

      const confirmButton = modal.getByRole("button", { name: /ยืนยัน|ปฏิเสธ|ตกลง/ });
      await confirmButton.click();

      // Modal should close after success
      await expect(modal).toBeHidden({ timeout: 5000 });
    });
  });
});
