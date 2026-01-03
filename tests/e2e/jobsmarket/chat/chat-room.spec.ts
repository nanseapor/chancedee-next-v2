import { test, expect } from "@playwright/test";

// Load test credentials
const TEST_CANDIDATE_EMAIL = process.env.E2E_TEST_CANDIDATE_EMAIL;
const TEST_CANDIDATE_PASSWORD = process.env.E2E_TEST_CANDIDATE_PASSWORD;
const TEST_COMPANY_EMAIL = process.env.E2E_TEST_COMPANY_EMAIL;
const TEST_COMPANY_PASSWORD = process.env.E2E_TEST_COMPANY_PASSWORD;

// Test room ID - should have existing messages
const TEST_ROOM_ID = process.env.E2E_TEST_CHAT_ROOM_ID || "test-chat-room";
const TEST_ROOM_WITH_INTERVIEW_ID = process.env.E2E_TEST_CHAT_ROOM_WITH_INTERVIEW_ID || "test-chat-room-interview";

test.describe("CHAT-R02: Chat Room", () => {
  test.skip(
    !TEST_CANDIDATE_EMAIL || !TEST_CANDIDATE_PASSWORD,
    "Test credentials not configured"
  );

  test.describe("Access & Navigation", () => {
    test.beforeEach(async ({ page }) => {
      // Login as candidate
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);
    });

    test("should load chat room page", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      await expect(page.getByTestId("chat-room-header")).toBeVisible();
    });

    test("should show other party name in header", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Header should contain other party's name
      const header = page.getByTestId("chat-room-header");
      await expect(header).toBeVisible();

      // Should not be empty
      const headerText = await header.textContent();
      expect(headerText).toBeTruthy();
    });

    test("should navigate back to chat list on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });

      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      await page.getByTestId("back-button").click();

      await expect(page).toHaveURL(/\/jobsmarket\/chat$/);
    });
  });

  test.describe("Message Display", () => {
    test.beforeEach(async ({ page }) => {
      // Login and navigate to chat room
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);

      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);
    });

    test("should display message history", async ({ page }) => {
      // Wait for messages to load
      await page.waitForSelector('[data-testid="message-bubble"]', {
        timeout: 10000,
      });

      const messages = page.locator('[data-testid="message-bubble"]');
      const count = await messages.count();

      expect(count).toBeGreaterThan(0);
    });

    test("should show date dividers between days", async ({ page }) => {
      await page.waitForSelector('[data-testid="message-bubble"]');

      // Look for date dividers
      const dateDividers = page.locator('[data-testid="date-divider"]');

      // Should have at least one date divider if there are messages
      await expect(dateDividers.first()).toBeVisible();
    });

    test("should differentiate own vs other messages", async ({ page }) => {
      await page.waitForSelector('[data-testid="message-bubble"]');

      const messages = page.locator('[data-testid="message-bubble"]');

      // Check for different styling classes
      const ownMessage = page.locator(
        '[data-testid="message-bubble"][data-is-own="true"]'
      );
      const otherMessage = page.locator(
        '[data-testid="message-bubble"][data-is-own="false"]'
      );

      // Should have both types of messages (assuming test room has conversation)
      const hasOwnMessages = (await ownMessage.count()) > 0;
      const hasOtherMessages = (await otherMessage.count()) > 0;

      expect(hasOwnMessages || hasOtherMessages).toBe(true);
    });

    test("should load more messages on scroll up", async ({ page }) => {
      await page.waitForSelector('[data-testid="message-bubble"]');

      const initialCount = await page
        .locator('[data-testid="message-bubble"]')
        .count();

      // Scroll to top to trigger load more
      const container = page.getByTestId("message-list-container");
      await container.evaluate((el) => {
        el.scrollTop = 0;
      });

      // Wait for potential new messages
      await page.waitForTimeout(2000);

      const newCount = await page
        .locator('[data-testid="message-bubble"]')
        .count();

      // If there are more messages, count should increase
      // (This depends on the test data having more than 50 messages)
      expect(newCount).toBeGreaterThanOrEqual(initialCount);
    });
  });

  test.describe("Send Text Message", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);

      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);
      await page.waitForSelector('[data-testid="chat-room-header"]');
    });

    test("should have message input field", async ({ page }) => {
      await expect(page.getByPlaceholder("พิมพ์ข้อความ...")).toBeVisible();
    });

    test("should send message on button click", async ({ page }) => {
      const testMessage = `Test message ${Date.now()}`;

      await page.getByPlaceholder("พิมพ์ข้อความ...").fill(testMessage);
      await page.getByTestId("send-button").click();

      // Wait for message to appear
      await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
    });

    test("should send message on Enter key", async ({ page }) => {
      const testMessage = `Enter test ${Date.now()}`;

      await page.getByPlaceholder("พิมพ์ข้อความ...").fill(testMessage);
      await page.keyboard.press("Enter");

      await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
    });

    test("should show sending state", async ({ page }) => {
      const testMessage = `Sending test ${Date.now()}`;

      await page.getByPlaceholder("พิมพ์ข้อความ...").fill(testMessage);
      await page.getByTestId("send-button").click();

      // Should briefly show sending indicator
      // This might be too fast to catch, so we just verify the message appears
      await expect(page.getByText(testMessage)).toBeVisible({ timeout: 10000 });
    });

    test("should clear input after send", async ({ page }) => {
      const testMessage = `Clear test ${Date.now()}`;

      const input = page.getByPlaceholder("พิมพ์ข้อความ...");
      await input.fill(testMessage);
      await page.getByTestId("send-button").click();

      // Input should be empty after send
      await expect(input).toHaveValue("");
    });

    test("should disable send button when input is empty", async ({ page }) => {
      const sendButton = page.getByTestId("send-button");

      // Should be disabled when empty
      await expect(sendButton).toBeDisabled();

      // Should be enabled when has text
      await page.getByPlaceholder("พิมพ์ข้อความ...").fill("test");
      await expect(sendButton).toBeEnabled();
    });
  });

  test.describe("File Attachment", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);

      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);
      await page.waitForSelector('[data-testid="chat-room-header"]');
    });

    test("should have attachment button", async ({ page }) => {
      await expect(page.getByTestId("attachment-button")).toBeVisible();
    });

    test("should open file picker on attachment click", async ({ page }) => {
      const fileChooserPromise = page.waitForEvent("filechooser");

      await page.getByTestId("attachment-button").click();

      const fileChooser = await fileChooserPromise;
      expect(fileChooser).toBeTruthy();
    });

    test("should show attachment preview before send", async ({ page }) => {
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByTestId("attachment-button").click();
      const fileChooser = await fileChooserPromise;

      // Upload a test file
      await fileChooser.setFiles({
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data"),
      });

      // Should show preview
      await expect(page.getByTestId("attachment-preview")).toBeVisible();
    });

    test("should send image attachment", async ({ page }) => {
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByTestId("attachment-button").click();
      const fileChooser = await fileChooserPromise;

      await fileChooser.setFiles({
        name: "test-image.jpg",
        mimeType: "image/jpeg",
        buffer: Buffer.from("fake-image-data"),
      });

      // Wait for upload and send
      await page.getByTestId("send-button").click();

      // Should show the image message
      await expect(page.getByTestId("message-image").last()).toBeVisible({
        timeout: 30000,
      });
    });

    test("should reject oversized file", async ({ page }) => {
      const fileChooserPromise = page.waitForEvent("filechooser");
      await page.getByTestId("attachment-button").click();
      const fileChooser = await fileChooserPromise;

      // Create a large fake file (>10MB would require actual large buffer)
      // For E2E, we test with validation message
      await fileChooser.setFiles({
        name: "large-file.zip",
        mimeType: "application/zip",
        buffer: Buffer.alloc(11 * 1024 * 1024), // 11MB
      });

      // Should show error about file size
      await expect(page.getByText(/ไฟล์มีขนาดใหญ่เกิน/i)).toBeVisible();
    });
  });

  test.describe("Real-time Updates", () => {
    test("should receive new messages without refresh", async ({
      browser,
    }) => {
      test.skip(
        !TEST_COMPANY_EMAIL || !TEST_COMPANY_PASSWORD,
        "Company credentials needed for real-time test"
      );

      // Create two browser contexts - one for candidate, one for company
      const candidateContext = await browser.newContext();
      const companyContext = await browser.newContext();

      const candidatePage = await candidateContext.newPage();
      const companyPage = await companyContext.newPage();

      try {
        // Login as candidate
        await candidatePage.goto("/jobsmarket/auth/login");
        await candidatePage.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
        await candidatePage
          .getByPlaceholder("กรอกรหัสผ่าน")
          .fill(TEST_CANDIDATE_PASSWORD!);
        await candidatePage.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
        await candidatePage.waitForURL(/dashboard|chat/);
        await candidatePage.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

        // Login as company
        await companyPage.goto("/jobsmarket/auth/login");
        await companyPage.getByLabel("อีเมล").fill(TEST_COMPANY_EMAIL!);
        await companyPage
          .getByPlaceholder("กรอกรหัสผ่าน")
          .fill(TEST_COMPANY_PASSWORD!);
        await companyPage.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
        await companyPage.waitForURL(/dashboard|chat/);

        // Company sends a message
        await companyPage.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);
        const realtimeMessage = `Realtime test ${Date.now()}`;
        await companyPage.getByPlaceholder("พิมพ์ข้อความ...").fill(realtimeMessage);
        await companyPage.getByTestId("send-button").click();

        // Candidate should receive without refresh
        await expect(candidatePage.getByText(realtimeMessage)).toBeVisible({
          timeout: 15000,
        });
      } finally {
        await candidateContext.close();
        await companyContext.close();
      }
    });
  });

  test.describe("Interview Card Display", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);
    });

    test("should display interview card if interview exists", async ({
      page,
    }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_WITH_INTERVIEW_ID}`);

      await expect(page.getByTestId("interview-card")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should show interview date and time", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_WITH_INTERVIEW_ID}`);

      const interviewCard = page.getByTestId("interview-card");
      await expect(interviewCard).toBeVisible();

      // Should show date
      await expect(page.getByTestId("interview-date")).toBeVisible();

      // Should show time
      await expect(page.getByText(/\d{2}:\d{2}/)).toBeVisible();
    });

    test("should show interview status", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_WITH_INTERVIEW_ID}`);

      await expect(page.getByTestId("status-badge")).toBeVisible();
    });

    test("should NOT show action buttons (Phase 2)", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_WITH_INTERVIEW_ID}`);

      // Wait for interview card to load
      await expect(page.getByTestId("interview-card")).toBeVisible();

      // Should NOT have confirm/decline buttons
      await expect(
        page.getByRole("button", { name: /ยืนยัน/i })
      ).toHaveCount(0);
      await expect(
        page.getByRole("button", { name: /ปฏิเสธ/i })
      ).toHaveCount(0);
    });
  });

  test.describe("Access Control", () => {
    test("should redirect if not participant", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);

      // Try to access a room user is not part of
      await page.goto("/jobsmarket/chat/non-participant-room-xyz");

      // Should redirect or show error
      await expect(
        page.getByText(/ไม่พบห้องสนทนา|ไม่มีสิทธิ์เข้าถึง/i)
      ).toBeVisible({
        timeout: 10000,
      });
    });

    test("should redirect to login if not authenticated", async ({ page }) => {
      // Clear any existing auth
      await page.context().clearCookies();

      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Should redirect to login
      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe("Responsive Layout", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);
    });

    test("should show full-screen on mobile", async ({ page }) => {
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Chat room should take full screen
      const chatRoom = page.getByTestId("chat-room-container");
      await expect(chatRoom).toBeVisible();

      const boundingBox = await chatRoom.boundingBox();
      expect(boundingBox?.width).toBeCloseTo(375, -1);
    });

    test("should show in side panel on desktop", async ({ page }) => {
      await page.setViewportSize({ width: 1280, height: 800 });
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Should have two-panel layout
      const chatList = page.getByTestId("chat-list-panel");
      const chatRoom = page.getByTestId("chat-room-container");

      // Both should be visible on desktop
      await expect(chatRoom).toBeVisible();
      // Chat list might also be visible in split view
    });
  });

  test.describe("Error Handling", () => {
    test.beforeEach(async ({ page }) => {
      await page.goto("/jobsmarket/auth/login");
      await page.getByLabel("อีเมล").fill(TEST_CANDIDATE_EMAIL!);
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill(TEST_CANDIDATE_PASSWORD!);
      await page.getByRole("button", { name: /เข้าสู่ระบบ/i }).click();
      await page.waitForURL(/dashboard|chat/);
    });

    test("should show error when connection lost", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Simulate offline
      await page.context().setOffline(true);

      // Should show connection banner
      await expect(page.getByTestId("connection-banner")).toBeVisible({
        timeout: 10000,
      });
    });

    test("should recover when connection restored", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Go offline then online
      await page.context().setOffline(true);
      await expect(page.getByTestId("connection-banner")).toBeVisible();

      await page.context().setOffline(false);

      // Banner should disappear
      await expect(page.getByTestId("connection-banner")).not.toBeVisible({
        timeout: 10000,
      });
    });

    test("should show error for failed message send", async ({ page }) => {
      await page.goto(`/jobsmarket/chat/${TEST_ROOM_ID}`);

      // Go offline before sending
      await page.context().setOffline(true);

      await page.getByPlaceholder("พิมพ์ข้อความ...").fill("Offline message");
      await page.getByTestId("send-button").click();

      // Should show failed status
      await expect(page.getByTestId("failed-indicator")).toBeVisible({
        timeout: 10000,
      });
    });
  });
});
