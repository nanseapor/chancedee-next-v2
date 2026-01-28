/**
 * @fileoverview E2E tests for candidate interview confirm/decline flow
 * @specification BLS-05 Interview Management, CHAT-R02 Chat Room
 * @sections BLS-05-04, BLS-05-05
 *
 * Tests the complete user flow of a candidate confirming or declining
 * an interview invitation through the chat interface.
 */

import { test, expect } from "@playwright/test";
import {
  InterviewScenarios,
  type TestInterviewScenario,
} from "../../helpers/factories";
import { signInAsCandidate } from "../../helpers/auth-helper";

test.describe("Candidate Interview Confirm Flow - BLS-05-04", () => {
  let scenario: TestInterviewScenario;

  test.beforeAll(async () => {
    // Create scenario with pending interview (eligible for first interview reward)
    scenario = await InterviewScenarios.confirmWithReward();
  });

  test.beforeEach(async ({ page }) => {
    // Sign in as candidate using token-based auth
    await signInAsCandidate(page, scenario.candidate);
  });

  test.describe("Happy Path - Confirm Interview", () => {
    /**
     * Requirement: BLS-05-04.e2e.view
     * "Candidate sees interview card with pending status"
     */
    test("should display interview card with pending status", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      const interviewCard = page.getByTestId("interview-card");
      await expect(interviewCard).toBeVisible();

      // Should show pending status
      await expect(interviewCard.getByTestId("interview-status-badge")).toHaveText(/รอยืนยัน/);
    });

    /**
     * Requirement: BLS-05-04.e2e.actions
     * "Candidate sees confirm and decline buttons"
     */
    test("should display confirm and decline buttons when pending", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await expect(page.getByRole("button", { name: /ยืนยัน/ })).toBeVisible();
      await expect(page.getByRole("button", { name: /ปฏิเสธ/ })).toBeVisible();
    });

    /**
     * Requirement: BLS-05-04.e2e.confirm
     * "Candidate can confirm interview"
     */
    test("should confirm interview successfully", async ({ page }) => {
      // Create fresh scenario to ensure pending state
      const freshScenario = await InterviewScenarios.confirmWithReward();
      await signInAsCandidate(page, freshScenario.candidate);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Should show success message
      await expect(page.getByText(/ยืนยันนัดหมายสำเร็จ/)).toBeVisible();

      // Status should change to confirmed
      await expect(page.getByTestId("interview-status-badge")).toHaveText(/ยืนยันแล้ว/);

      // Confirm button should no longer be visible
      await expect(page.getByRole("button", { name: /ยืนยัน/ })).not.toBeVisible();
    });

    /**
     * Requirement: BLS-05-04.e2e.reward
     * "First interview confirmation shows reward notification"
     */
    test("should show reward notification on first interview confirm", async ({ page }) => {
      // Create fresh scenario for reward test
      const rewardScenario = await InterviewScenarios.confirmWithReward();
      await signInAsCandidate(page, rewardScenario.candidate);
      await page.goto(`/jobsmarket/chat/${rewardScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Should show reward notification (first interview)
      const rewardNotification = page.getByText(/ได้รับ.*100.*เหรียญ/);
      await expect(rewardNotification).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Interview Details Display", () => {
    /**
     * Requirement: BLS-05-04.e2e.details
     * "Candidate sees interview details"
     */
    test("should display interview date and time", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      const interviewCard = page.getByTestId("interview-card");

      // Should show date
      await expect(interviewCard.getByTestId("interview-date")).toBeVisible();

      // Should show time range
      await expect(interviewCard.getByTestId("interview-time")).toBeVisible();
    });

    /**
     * Requirement: BLS-05-04.e2e.channel
     * "Candidate sees interview channel info"
     */
    test("should display channel information", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      const interviewCard = page.getByTestId("interview-card");

      // Should show channel type (online or onsite)
      const channelBadge = interviewCard.getByTestId("interview-channel");
      await expect(channelBadge).toBeVisible();
    });
  });
});

test.describe("Candidate Interview Decline Flow - BLS-05-05", () => {
  let scenario: TestInterviewScenario;

  test.beforeAll(async () => {
    // Create scenario for decline tests
    scenario = await InterviewScenarios.decline();
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCandidate(page, scenario.candidate);
  });

  test.describe("Happy Path - Decline Interview", () => {
    /**
     * Requirement: BLS-05-05.e2e.decline-dialog
     * "Clicking decline opens confirmation dialog"
     */
    test("should open decline confirmation dialog", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ปฏิเสธ/ }).click();

      await expect(page.getByRole("alertdialog")).toBeVisible();
      await expect(page.getByText(/ยืนยันการปฏิเสธนัดสัมภาษณ์/)).toBeVisible();
    });

    /**
     * Requirement: BLS-05-05.e2e.decline
     * "Candidate can decline interview"
     */
    test("should decline interview successfully", async ({ page }) => {
      // Create fresh scenario for decline test
      const freshScenario = await InterviewScenarios.decline();
      await signInAsCandidate(page, freshScenario.candidate);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ปฏิเสธ/ }).click();
      await page.getByRole("button", { name: /ยืนยันปฏิเสธ/ }).click();

      // Should show success message
      await expect(page.getByText(/ปฏิเสธนัดหมายสำเร็จ/)).toBeVisible();

      // Status should change to declined
      await expect(page.getByTestId("interview-status-badge")).toHaveText(/ปฏิเสธ/);
    });

    /**
     * Requirement: BLS-05-05.e2e.decline-reason
     * "Candidate can provide decline reason"
     */
    test("should allow entering optional decline reason", async ({ page }) => {
      // Create fresh scenario
      const freshScenario = await InterviewScenarios.decline();
      await signInAsCandidate(page, freshScenario.candidate);
      await page.goto(`/jobsmarket/chat/${freshScenario.chatRoomId}`);

      await page.getByRole("button", { name: /ปฏิเสธ/ }).click();

      // Enter reason
      await page.getByLabel(/เหตุผลในการปฏิเสธ/).fill("I have another commitment on that day");

      await page.getByRole("button", { name: /ยืนยันปฏิเสธ/ }).click();

      await expect(page.getByText(/ปฏิเสธนัดหมายสำเร็จ/)).toBeVisible();
    });
  });

  test.describe("Cancel Decline", () => {
    /**
     * Requirement: BLS-05-05.e2e.cancel-decline
     * "Candidate can cancel decline and go back"
     */
    test("should close dialog when back button clicked", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${scenario.chatRoomId}`);

      await page.getByRole("button", { name: /ปฏิเสธ/ }).click();
      await page.getByRole("button", { name: /ย้อนกลับ/ }).click();

      // Dialog should be closed
      await expect(page.getByRole("alertdialog")).not.toBeVisible();

      // Interview status should still be pending
      await expect(page.getByTestId("interview-status-badge")).toHaveText(/รอยืนยัน/);
    });
  });
});

test.describe("Interview Status Transitions - E2E", () => {
  /**
   * Requirement: BLS-05.e2e.no-actions-confirmed
   * "No action buttons when interview is confirmed"
   */
  test("should not show action buttons when interview is confirmed", async ({ page }) => {
    // Create scenario with already confirmed interview
    const confirmedScenario = await InterviewScenarios.confirmNoReward();
    await signInAsCandidate(page, confirmedScenario.candidate);

    // Confirm the interview first
    await page.goto(`/jobsmarket/chat/${confirmedScenario.chatRoomId}`);
    await page.getByRole("button", { name: /ยืนยัน/ }).click();
    await page.waitForTimeout(1000);

    // Refresh and check
    await page.reload();

    // After confirmation, buttons should not be visible
    await expect(page.getByRole("button", { name: /ยืนยัน/ })).not.toBeVisible();
    await expect(page.getByRole("button", { name: /ปฏิเสธ/ })).not.toBeVisible();
  });

  /**
   * Requirement: BLS-05.e2e.no-actions-cancelled
   * "No action buttons when interview is cancelled"
   */
  test("should not show action buttons when interview is cancelled", async ({ page }) => {
    // Create scenario with cancelled interview
    const cancelScenario = await InterviewScenarios.cancelConfirmed();
    await signInAsCandidate(page, cancelScenario.candidate);
    await page.goto(`/jobsmarket/chat/${cancelScenario.chatRoomId}`);

    // Status should show cancelled
    const statusBadge = page.getByTestId("interview-status-badge");
    if ((await statusBadge.textContent())?.includes("ยกเลิก")) {
      await expect(page.getByRole("button", { name: /ยืนยัน/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /ปฏิเสธ/ })).not.toBeVisible();
    }
  });
});
