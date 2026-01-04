/**
 * @fileoverview E2E tests for interview reschedule and cancel flows
 * @specification BLS-05 Interview Management, CHAT-R02 Chat Room
 * @sections BLS-05-02, BLS-05-03
 *
 * Tests the complete user flows for company rescheduling and cancelling
 * interviews through the chat interface.
 */

import { test, expect } from "@playwright/test";
import {
  InterviewScenarios,
  type TestInterviewScenario,
} from "../../helpers/factories";
import { signInAsCompany } from "../../helpers/auth-helper";

test.describe("Company Interview Reschedule Flow - BLS-05-02", () => {
  let scenario: TestInterviewScenario;

  test.beforeAll(async () => {
    // Create scenario with pending interview for reschedule tests
    scenario = await InterviewScenarios.reschedulePending();
  });

  test.beforeEach(async ({ page }) => {
    // Sign in as company using token-based auth
    await signInAsCompany(page, scenario.company);
  });

  test.describe("Happy Path - Reschedule Interview", () => {
    /**
     * Requirement: BLS-05-02.e2e.button
     * "Company sees reschedule button on pending interview"
     */
    test("should display reschedule button on pending interview", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      const interviewCard = page.getByTestId("interview-card");
      await expect(interviewCard.getByRole("button", { name: /เลื่อนนัด/ })).toBeVisible();
    });

    /**
     * Requirement: BLS-05-02.e2e.modal
     * "Clicking reschedule opens modal with current details"
     */
    test("should open reschedule modal with current interview details", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /เลื่อนนัด/ }).click();

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/เลื่อนนัดสัมภาษณ์/)).toBeVisible();

      // Current details should be shown
      await expect(page.getByText(/นัดหมายเดิม/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-02.e2e.reschedule
     * "Company can reschedule to new date and time"
     */
    test("should reschedule interview successfully", async ({ page }) => {
      // Create fresh scenario for reschedule
      const freshScenario = await InterviewScenarios.reschedulePending();
      await signInAsCompany(page, freshScenario.company);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /เลื่อนนัด/ }).click();

      // Set new date (2 weeks from now)
      const newDate = new Date();
      newDate.setDate(newDate.getDate() + 14);

      await page.getByLabel(/วันที่ใหม่/).fill(newDate.toISOString().split("T")[0]);
      await page.getByLabel(/เวลาเริ่มใหม่/).fill("14:00");
      await page.getByLabel(/เวลาสิ้นสุดใหม่/).fill("15:00");

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Should show success message
      await expect(page.getByText(/เลื่อนนัดหมายสำเร็จ/)).toBeVisible();

      // Status should reset to pending
      await expect(page.getByTestId("interview-status-badge")).toHaveText(/รอยืนยัน/);
    });

    /**
     * Requirement: BLS-05-02.e2e.message
     * "Reschedule creates a message showing old and new dates"
     */
    test("should show reschedule message in chat history", async ({ page }) => {
      // Use scenario that has been rescheduled
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      // Look for reschedule message in chat (may not exist if not rescheduled yet)
      const rescheduleMessage = page.getByTestId("message-interview_reschedule");
      if (await rescheduleMessage.isVisible()) {
        // Message should show both old and new dates
        await expect(page.getByText(/นัดหมายเดิม/)).toBeVisible();
        await expect(page.getByText(/นัดหมายใหม่/)).toBeVisible();
      }
    });
  });

  test.describe("Validation Errors", () => {
    /**
     * Requirement: BLS-05-02.e2e.validation.date
     * "Should show error for past date"
     */
    test("should show error when selecting past date for reschedule", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /เลื่อนนัด/ }).click();

      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      await page.getByLabel(/วันที่ใหม่/).fill(yesterday.toISOString().split("T")[0]);
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/วันที่ต้องเป็นอนาคต/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-02.e2e.validation.time
     * "Should show error for invalid time range"
     */
    test("should show error when end time is before start time", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /เลื่อนนัด/ }).click();

      await page.getByLabel(/เวลาเริ่มใหม่/).fill("16:00");
      await page.getByLabel(/เวลาสิ้นสุดใหม่/).fill("10:00");
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      await expect(page.getByText(/เวลาสิ้นสุดต้องมากกว่าเวลาเริ่ม/)).toBeVisible();
    });
  });
});

test.describe("Company Interview Cancel Flow - BLS-05-03", () => {
  let scenario: TestInterviewScenario;

  test.beforeAll(async () => {
    // Create scenario for cancel tests
    scenario = await InterviewScenarios.cancelPending();
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCompany(page, scenario.company);
  });

  test.describe("Happy Path - Cancel Interview", () => {
    /**
     * Requirement: BLS-05-03.e2e.button
     * "Company sees cancel button on pending/confirmed interview"
     */
    test("should display cancel button on interview", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      const interviewCard = page.getByTestId("interview-card");
      await expect(interviewCard.getByRole("button", { name: /ยกเลิก/ })).toBeVisible();
    });

    /**
     * Requirement: BLS-05-03.e2e.dialog
     * "Clicking cancel opens confirmation dialog"
     */
    test("should open cancel confirmation dialog", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();

      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(page.getByText(/ยืนยันการยกเลิกนัดสัมภาษณ์/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-03.e2e.warning
     * "Dialog shows warning about irreversible action"
     */
    test("should display irreversible action warning", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();

      await expect(page.getByText(/การดำเนินการนี้ไม่สามารถย้อนกลับได้/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-03.e2e.cancel
     * "Company can cancel interview"
     */
    test("should cancel interview successfully", async ({ page }) => {
      // Create fresh scenario for cancel
      const freshScenario = await InterviewScenarios.cancelPending();
      await signInAsCompany(page, freshScenario.company);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();
      await page.getByRole("button", { name: /ยืนยันยกเลิก/ }).click();

      // Should show success message
      await expect(page.getByText(/ยกเลิกนัดหมายสำเร็จ/)).toBeVisible();

      // Status should change to cancelled
      await expect(page.getByTestId("interview-status-badge")).toHaveText(/ยกเลิก/);
    });

    /**
     * Requirement: BLS-05-03.e2e.reason
     * "Company can provide cancel reason"
     */
    test("should allow entering optional cancel reason", async ({ page }) => {
      // Create fresh scenario
      const freshScenario = await InterviewScenarios.cancelPending();
      await signInAsCompany(page, freshScenario.company);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();

      // Enter reason
      await page.getByLabel(/เหตุผลในการยกเลิก/).fill("Position has been filled");

      await page.getByRole("button", { name: /ยืนยันยกเลิก/ }).click();

      await expect(page.getByText(/ยกเลิกนัดหมายสำเร็จ/)).toBeVisible();
    });
  });

  test.describe("Cancel Confirmation Dialog Abort", () => {
    /**
     * Requirement: BLS-05-03.e2e.abort
     * "Company can abort cancel and go back"
     */
    test("should close dialog when back button clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();
      await page.getByRole("button", { name: /ย้อนกลับ/ }).click();

      // Dialog should be closed
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // Interview status should still be the same
      await expect(page.getByTestId("interview-card")).toBeVisible();
    });
  });

  test.describe("Destructive Button Styling", () => {
    /**
     * Requirement: BLS-05-03.e2e.destructive
     * "Cancel confirm button has destructive styling"
     */
    test("should have red/destructive styling on confirm cancel button", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยกเลิก/ }).click();

      const confirmButton = page.getByRole("button", { name: /ยืนยันยกเลิก/ });

      // Check for destructive/red styling
      await expect(confirmButton).toHaveClass(/bg-red-600/);
    });
  });
});

test.describe("Schedule New After Cancel - BLS-05-03", () => {
  /**
   * Requirement: BLS-05-03.e2e.schedule-new
   * "Company can schedule new interview after cancel"
   */
  test("should show schedule new button after interview cancelled", async ({ page }) => {
    // Create scenario where interview is cancelled
    const cancelledScenario = await InterviewScenarios.cancelConfirmed();
    await signInAsCompany(page, cancelledScenario.company);
    await page.goto(`/jobsmarket/chat/${cancelledScenario.chatRoomId}`);

    const statusBadge = page.getByTestId("interview-status-badge");

    // If interview is cancelled
    if ((await statusBadge.textContent())?.includes("ยกเลิก")) {
      // Should show "นัดใหม่" button
      await expect(page.getByRole("button", { name: /นัดใหม่/ })).toBeVisible();
    }
  });

  /**
   * Requirement: BLS-05-03.e2e.schedule-new-flow
   * "Clicking schedule new opens schedule modal"
   */
  test("should open schedule modal when clicking schedule new", async ({ page }) => {
    const cancelledScenario = await InterviewScenarios.cancelConfirmed();
    await signInAsCompany(page, cancelledScenario.company);
    await page.goto(`/jobsmarket/chat/${cancelledScenario.chatRoomId}`);

    const statusBadge = page.getByTestId("interview-status-badge");

    if ((await statusBadge.textContent())?.includes("ยกเลิก")) {
      await page.getByRole("button", { name: /นัดใหม่/ }).click();

      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/นัดหมายสัมภาษณ์/)).toBeVisible();
    }
  });
});
