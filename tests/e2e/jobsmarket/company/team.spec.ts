/**
 * COMP-R02: Company Team Page E2E Tests
 *
 * Tests for team management:
 * - Admin can view team members
 * - Admin can accept/reject pending employees
 * - Admin can change member roles
 * - Admin can remove members
 * - Non-admin view restrictions
 * - Tab navigation
 *
 * Critical: Never use 'networkidle' wait strategy (Firebase keeps WebSocket open)
 * Use 'domcontentloaded' + visible element checks instead.
 */

import { test, expect, type Page } from "@playwright/test";
import {
  createTestCompany,
  type TestCompany,
} from "../../helpers/factories";
import { signInAsCompany } from "../../helpers/auth-helper";
import {
  testDb,
  generateTestId,
  generateTestEmail,
  now,
  testAuth,
} from "../../helpers/firebase-admin-test";

/**
 * Wait for page load using domcontentloaded + visible element check
 */
async function waitForPageLoad(page: Page) {
  await page.waitForLoadState("domcontentloaded");
  await expect(
    page.locator('nav, aside, [data-testid="company-sidebar"]').first()
  ).toBeVisible({ timeout: 10000 });
}

/**
 * Navigate to team page
 */
async function gotoTeamPage(page: Page, companyId: string) {
  await page.goto(`/jobsmarket/companies/${companyId}/dashboard/team`);
  await waitForPageLoad(page);
}

/**
 * Create a pending employee application for testing
 */
async function createPendingEmployee(companyId: string): Promise<string> {
  const email = generateTestEmail("pending");

  // Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password: "TestPassword123!",
    emailVerified: true,
    displayName: "Pending Employee",
  });

  // Set custom claims
  await testAuth.setCustomUserClaims(userRecord.uid, {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: "team-test-pending",
  });

  // Create user_accounts document with pending state
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  const companyRef = testDb.collection("company_information").doc(companyId);

  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: "พนักงาน",
    last_name_th: "รอตอบรับ",
    display_name: "Pending Employee",
    roles: ["candidate"], // Still candidate until accepted
    target_company: companyRef, // Pending for this company
    transfer_approved: false,
    request_timestamp: now(),
    is_active: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
  });

  return userRecord.uid;
}

/**
 * Create a member employee for testing
 */
async function createMemberEmployee(companyId: string): Promise<string> {
  const email = generateTestEmail("member");

  // Create Firebase Auth user
  const userRecord = await testAuth.createUser({
    email,
    password: "TestPassword123!",
    emailVerified: true,
    displayName: "Member Employee",
  });

  // Set custom claims
  await testAuth.setCustomUserClaims(userRecord.uid, {
    isTestAccount: true,
    testSuite: "e2e",
    createdAt: Date.now(),
    testName: "team-test-member",
    role: "company",
    companyId,
  });

  // Create user_accounts document as company member
  const userRef = testDb.collection("user_accounts").doc(userRecord.uid);
  const companyRef = testDb.collection("company_information").doc(companyId);

  await userRef.set({
    uid: userRecord.uid,
    email,
    first_name_th: "สมาชิก",
    last_name_th: "ทดสอบ",
    display_name: "Member Employee",
    roles: ["company"],
    company_id: companyRef,
    is_active: true,
    is_test_account: true,
    created_at: now(),
    updated_at: now(),
  });

  return userRecord.uid;
}

test.describe("Team Page - COMP-R02", () => {
  // Use serial mode since tests may share state via database
  test.describe.configure({ mode: "serial" });

  // Shared test data for read-only tests
  let adminCompany: TestCompany;
  let memberEmployeeId: string;

  test.beforeAll(async () => {
    // Create test company as admin
    adminCompany = await createTestCompany({
      testName: "team-page",
      status: "approved",
    });

    // Create member employee for member list tests
    memberEmployeeId = await createMemberEmployee(adminCompany.companyId);
  });

  test.beforeEach(async ({ page }) => {
    await signInAsCompany(page, adminCompany);
  });

  test.describe("Page Load", () => {
    test("should load team page successfully", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Verify page loaded
      await expect(page).toHaveURL(new RegExp(`/companies/${adminCompany.companyId}/dashboard/team`));
    });

    test("should display team navigation in sidebar", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Team nav should be active
      await expect(page.getByRole("link", { name: "ทีมงาน" })).toBeVisible();
    });

    test("should default to members tab", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Use data-testid for more specific selection
      const membersTab = page.getByTestId("tab-members");
      await expect(membersTab).toHaveAttribute("data-state", "active");
    });
  });

  test.describe("Admin View - Member List", () => {
    test("should display team members", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Should show admin (self) in member list
      await expect(page.getByText("ผู้จัดการ ทดสอบ")).toBeVisible({ timeout: 15000 });
    });

    test("should display member roles", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Should show role badge
      await expect(page.getByText(/ผู้ดูแลระบบ/)).toBeVisible({ timeout: 15000 });
    });

    test("should show action menu for other members", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Find member row (not self)
      const memberRow = page.getByTestId(`member-row-${memberEmployeeId}`);
      await expect(memberRow).toBeVisible({ timeout: 15000 });

      // Action menu should be visible
      const actionMenu = memberRow.getByTestId("member-action-menu");
      await expect(actionMenu).toBeVisible();
    });

    test("should NOT show action menu for self", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Find admin row (self)
      const selfRow = page.getByTestId(`member-row-${adminCompany.uid}`);
      await expect(selfRow).toBeVisible({ timeout: 15000 });

      // Action menu should NOT be visible
      const actionMenu = selfRow.getByTestId("member-action-menu");
      await expect(actionMenu).not.toBeVisible();
    });
  });

  test.describe("Admin View - Pending Applications", () => {
    let pendingEmployeeId: string;

    test.beforeAll(async () => {
      // Create fresh pending employee for this describe block
      pendingEmployeeId = await createPendingEmployee(adminCompany.companyId);
    });

    test("should display pending applications section", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Should show pending section
      await expect(page.getByText(/คำขอที่รอการตอบรับ/)).toBeVisible({ timeout: 15000 });
    });

    test("should display pending applicant info", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Should show pending user name
      await expect(page.getByText("Pending Employee")).toBeVisible({ timeout: 15000 });
    });

    test("should show accept and reject buttons", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Should show accept and reject buttons
      await expect(page.getByRole("button", { name: /ตอบรับ/ })).toBeVisible({ timeout: 15000 });
      await expect(page.getByRole("button", { name: /ปฏิเสธ/ })).toBeVisible();
    });
  });

  test.describe("Admin Actions - Accept Employee", () => {
    test("should accept pending employee", async ({ page }) => {
      // Create fresh pending employee for this test
      const testPendingId = await createPendingEmployee(adminCompany.companyId);

      await gotoTeamPage(page, adminCompany.companyId);

      // Find and click accept button for pending user
      const pendingRow = page.getByTestId(`pending-row-${testPendingId}`);
      await expect(pendingRow).toBeVisible({ timeout: 15000 });

      const acceptButton = pendingRow.getByRole("button", { name: /ตอบรับ/ });
      await acceptButton.click();

      // Should show success toast
      await expect(page.getByText(/ตอบรับสำเร็จ/)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Admin Actions - Reject Employee", () => {
    test("should open reject confirmation modal", async ({ page }) => {
      // Create fresh pending employee for this test
      const testPendingId = await createPendingEmployee(adminCompany.companyId);

      await gotoTeamPage(page, adminCompany.companyId);

      // Find and click reject button
      const pendingRow = page.getByTestId(`pending-row-${testPendingId}`);
      await expect(pendingRow).toBeVisible({ timeout: 15000 });

      const rejectButton = pendingRow.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Should show confirmation modal
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("heading", { name: /ปฏิเสธคำขอ/ })).toBeVisible();
    });

    test("should reject pending employee after confirmation", async ({ page }) => {
      // Create fresh pending employee for this test
      const testPendingId = await createPendingEmployee(adminCompany.companyId);

      await gotoTeamPage(page, adminCompany.companyId);

      // Click reject button
      const pendingRow = page.getByTestId(`pending-row-${testPendingId}`);
      await expect(pendingRow).toBeVisible({ timeout: 15000 });

      const rejectButton = pendingRow.getByRole("button", { name: /ปฏิเสธ/ });
      await rejectButton.click();

      // Confirm rejection
      const confirmButton = page.getByRole("button", { name: /ยืนยัน/ });
      await confirmButton.click();

      // Should show success toast
      await expect(page.getByText(/ปฏิเสธสำเร็จ/)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Admin Actions - Change Role", () => {
    test("should open role picker modal", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Find member row and action menu
      const memberRow = page.getByTestId(`member-row-${memberEmployeeId}`);
      await expect(memberRow).toBeVisible({ timeout: 15000 });

      const actionMenu = memberRow.getByTestId("member-action-menu");
      await actionMenu.click();

      // Click change role option
      await page.getByText(/เปลี่ยนบทบาท/).click();

      // Should show role picker modal
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByText(/เลือกบทบาทใหม่/)).toBeVisible();
    });

    test("should change member role", async ({ page }) => {
      // Create fresh member for this test to avoid affecting other tests
      const testMemberId = await createMemberEmployee(adminCompany.companyId);

      await gotoTeamPage(page, adminCompany.companyId);

      // Open role picker for member
      const memberRow = page.getByTestId(`member-row-${testMemberId}`);
      await expect(memberRow).toBeVisible({ timeout: 15000 });

      const actionMenu = memberRow.getByTestId("member-action-menu");
      await actionMenu.click();
      await page.getByText(/เปลี่ยนบทบาท/).click();

      // Select recruiter role (not admin to avoid last-admin issues)
      await page.getByTestId("role-option-recruiter").click();
      await page.getByRole("button", { name: /บันทึก/ }).click();

      // Should show success toast
      await expect(page.getByText(/เปลี่ยนบทบาทสำเร็จ/)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Admin Actions - Remove Member", () => {
    test("should open remove confirmation modal", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Find member row and action menu
      const memberRow = page.getByTestId(`member-row-${memberEmployeeId}`);
      await expect(memberRow).toBeVisible({ timeout: 15000 });

      const actionMenu = memberRow.getByTestId("member-action-menu");
      await actionMenu.click();

      // Click remove option
      await page.getByText(/ลบออก/).click();

      // Should show remove confirmation modal
      await expect(page.getByRole("dialog")).toBeVisible();
      await expect(page.getByRole("heading", { name: /ลบสมาชิก/ })).toBeVisible();

      // Cancel to avoid removing the member
      await page.getByRole("button", { name: /ยกเลิก/ }).click();
    });

    test("should remove member after confirmation", async ({ page }) => {
      // Create fresh member for this test
      const testMemberId = await createMemberEmployee(adminCompany.companyId);

      await gotoTeamPage(page, adminCompany.companyId);

      // Open remove confirmation for member
      const memberRow = page.getByTestId(`member-row-${testMemberId}`);
      await expect(memberRow).toBeVisible({ timeout: 15000 });

      const actionMenu = memberRow.getByTestId("member-action-menu");
      await actionMenu.click();
      await page.getByText(/ลบออก/).click();

      // Confirm removal
      await page.getByRole("button", { name: /ยืนยัน/ }).click();

      // Should show success toast
      await expect(page.getByText(/ลบสมาชิกสำเร็จ/)).toBeVisible({ timeout: 10000 });
    });
  });

  test.describe("Last Admin Protection", () => {
    test("should show error when trying to remove last admin", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // This test needs a scenario where there's only one admin
      // Should show error preventing removal
      // The UI should disable the remove option or show an error
      await expect(page.getByText(/ต้องมี Admin อย่างน้อย 1 คน/)).toBeVisible({ timeout: 15000 });
    });
  });

  test.describe("Tab Navigation", () => {
    test("should show invite tab for admin", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Use data-testid for invite tab
      const inviteTab = page.getByTestId("tab-invite");
      await expect(inviteTab).toBeVisible();
    });

    test("should switch to invite tab when clicked", async ({ page }) => {
      await gotoTeamPage(page, adminCompany.companyId);

      // Click invite tab using data-testid
      const inviteTab = page.getByTestId("tab-invite");
      await inviteTab.click();

      // Should update URL with tab parameter
      await expect(page).toHaveURL(/tab=invite/);

      // Invite tab should be active
      await expect(inviteTab).toHaveAttribute("data-state", "active");
    });

    test("should persist tab state in URL", async ({ page }) => {
      // Navigate directly to invite tab
      await page.goto(`/jobsmarket/companies/${adminCompany.companyId}/dashboard/team?tab=invite`);
      await waitForPageLoad(page);

      // Invite tab should be active
      const inviteTab = page.getByTestId("tab-invite");
      await expect(inviteTab).toHaveAttribute("data-state", "active");
    });
  });

  test.describe("Non-Admin View", () => {
    // Note: These tests would need a separate non-admin user login
    // Skipped - can be implemented with proper factory for non-admin user

    test.skip("should not show invite tab for non-admin", async ({ page }) => {
      // TODO: Sign in as non-admin member
      await gotoTeamPage(page, adminCompany.companyId);

      // Invite tab should NOT be visible
      await expect(page.getByTestId("tab-invite")).not.toBeVisible();
    });

    test.skip("should not show action menus for non-admin", async ({ page }) => {
      // TODO: Sign in as non-admin member
      await gotoTeamPage(page, adminCompany.companyId);

      // Action menus should NOT be visible
      await expect(page.getByTestId("member-action-menu")).not.toBeVisible();
    });

    test.skip("should not show accept/reject buttons for non-admin", async ({ page }) => {
      // TODO: Sign in as non-admin member
      await gotoTeamPage(page, adminCompany.companyId);

      // Accept/reject buttons should NOT be visible
      await expect(page.getByRole("button", { name: /ตอบรับ/ })).not.toBeVisible();
      await expect(page.getByRole("button", { name: /ปฏิเสธ/ })).not.toBeVisible();
    });
  });
});
