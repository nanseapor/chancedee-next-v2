import { test, expect } from "@playwright/test";

/**
 * E2E Tests for AUTH-R04 Password Reset Page
 * Per AUTH-R04 Implementation Plan §4, §5
 *
 * Prerequisites:
 * - Dev server running at http://localhost:3000
 * - Playwright config set up (playwright.config.ts)
 *
 * Run: npx playwright test tests/e2e/jobsmarket/auth/reset.spec.ts
 */

test.describe("Password Reset Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jobsmarket/auth/reset");
  });

  test.describe("Initial Load (IDLE state)", () => {
    test("should display reset form on page load", async ({ page }) => {
      await expect(
        page.getByRole("heading", { name: "ลืมรหัสผ่าน" })
      ).toBeVisible();
    });

    test("should show description text", async ({ page }) => {
      await expect(page.getByText("กรอกอีเมลที่ใช้ลงทะเบียน")).toBeVisible();
      await expect(
        page.getByText("เราจะส่งลิงก์สำหรับตั้งรหัสผ่านใหม่ให้คุณ")
      ).toBeVisible();
    });

    test("should have lock icon", async ({ page }) => {
      // Lock icon should be visible in header
      const lockIcon = page.locator('svg').filter({ hasText: /lock/i }).first();
      await expect(lockIcon.or(page.locator('[class*="lucide-lock"]'))).toBeVisible();
    });

    test("should have email input with Thai label", async ({ page }) => {
      await expect(page.getByLabel("อีเมล")).toBeVisible();
    });

    test("should have submit button with Thai text", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" })
      ).toBeVisible();
    });

    test("should have back link with Thai text", async ({ page }) => {
      await expect(
        page.getByRole("button", { name: /กลับไปหน้าเข้าสู่ระบบ/ })
      ).toBeVisible();
    });
  });

  test.describe("Query Parameter Pre-fill", () => {
    test("should pre-fill email from ?email query param", async ({ page }) => {
      await page.goto("/jobsmarket/auth/reset?email=test@example.com");

      const emailInput = page.getByLabel("อีเมล");
      await expect(emailInput).toHaveValue("test@example.com");
    });

    test("should handle URL-encoded email in query param", async ({ page }) => {
      await page.goto(
        "/jobsmarket/auth/reset?email=user%2Btest%40example.com"
      );

      const emailInput = page.getByLabel("อีเมล");
      await expect(emailInput).toHaveValue("user+test@example.com");
    });

    test("should work without query param", async ({ page }) => {
      await page.goto("/jobsmarket/auth/reset");

      const emailInput = page.getByLabel("อีเมล");
      await expect(emailInput).toHaveValue("");
    });
  });

  test.describe("Form Validation", () => {
    test("should disable submit button when email is empty", async ({ page }) => {
      const submitButton = page.getByRole("button", {
        name: "ส่งลิงก์รีเซ็ต",
      });

      // Button should be disabled with empty email
      await expect(submitButton).toBeDisabled();
    });

    test("should show validation error for invalid email format", async ({
      page,
    }) => {
      await page.getByLabel("อีเมล").fill("not-an-email");
      await page.getByLabel("อีเมล").blur();

      // Wait for validation to run
      await page.waitForTimeout(300);

      // Zod should show format error
      await expect(page.getByText("รูปแบบอีเมลไม่ถูกต้อง")).toBeVisible();
    });

    test("should disable submit button when email is invalid", async ({
      page,
    }) => {
      const submitButton = page.getByRole("button", {
        name: "ส่งลิงก์รีเซ็ต",
      });

      // Initially disabled (empty form)
      await expect(submitButton).toBeDisabled();

      // Fill invalid email
      await page.getByLabel("อีเมล").fill("invalid");
      await expect(submitButton).toBeDisabled();

      // Fill valid email
      await page.getByLabel("อีเมล").fill("test@example.com");
      await expect(submitButton).toBeEnabled();
    });

    test("should enable submit button when email is valid", async ({
      page,
    }) => {
      await page.getByLabel("อีเมล").fill("valid@example.com");

      const submitButton = page.getByRole("button", {
        name: "ส่งลิงก์รีเซ็ต",
      });
      await expect(submitButton).toBeEnabled();
    });
  });

  test.describe("Navigation", () => {
    test("should navigate to login page when back button clicked", async ({
      page,
    }) => {
      await page
        .getByRole("button", { name: /กลับไปหน้าเข้าสู่ระบบ/ })
        .click();

      await expect(page).toHaveURL(/\/jobsmarket\/auth\/login/);
    });

    test.skip("should disable back button during submission", async () => {
      // This would require mocking Firebase - skip for now
      // Tested in component behavior
    });
  });

  test.describe("Submitting State", () => {
    test("should show loading state during submission", async ({ page }) => {
      // Fill valid email
      await page.getByLabel("อีเมล").fill("test@example.com");

      // Intercept Firebase request (mock)
      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        // Delay response to catch loading state
        setTimeout(() => route.fulfill({ status: 200, body: "{}" }), 1000);
      });

      // Click submit
      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      // Should show loading text
      await expect(page.getByText("กำลังส่ง...")).toBeVisible();

      // Form should be disabled
      await expect(page.getByLabel("อีเมล")).toBeDisabled();
    });
  });

  test.describe("Success State", () => {
    test("should show success message after successful submission", async ({
      page,
    }) => {
      // Fill valid email
      const testEmail = "success@example.com";
      await page.getByLabel("อีเมล").fill(testEmail);

      // Mock successful Firebase response
      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ email: testEmail }),
        });
      });

      // Submit
      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      // Wait for success state
      await expect(page.getByText("ส่งลิงก์แล้ว")).toBeVisible();
      // Email appears in multiple places - just check one is visible
      await expect(page.getByText(testEmail).first()).toBeVisible();
      await expect(
        page.getByText("กรุณาตรวจสอบอีเมลของคุณ")
      ).toBeVisible();
      await expect(
        page.getByText("(อาจอยู่ในโฟลเดอร์สแปม)")
      ).toBeVisible();
    });

    test("should show return to login button in success state", async ({
      page,
    }) => {
      // Trigger success state (simplified - assumes Firebase mock)
      await page.getByLabel("อีเมล").fill("test@example.com");

      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ email: "test@example.com" }),
        });
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      await expect(
        page.getByRole("button", { name: "กลับไปหน้าเข้าสู่ระบบ" })
      ).toBeVisible();
    });

    test("should show resend link in success state", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("test@example.com");

      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ email: "test@example.com" }),
        });
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      await expect(page.getByText("ไม่ได้รับอีเมล?")).toBeVisible();
      await expect(
        page.getByRole("button", { name: "ส่งอีกครั้ง" })
      ).toBeVisible();
    });
  });

  test.describe("Error Handling", () => {
    test("should show error message for network failure", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("test@example.com");

      // Mock network error
      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.abort("failed");
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      // Should show network error (may take time for Firebase to timeout)
      await expect(
        page.getByText(/เชื่อมต่อไม่สำเร็จ|เกิดข้อผิดพลาด/)
      ).toBeVisible({ timeout: 10000 });
    });

    test("should show error message for user not found", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("notfound@example.com");

      // Mock user-not-found error
      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: 400,
              message: "EMAIL_NOT_FOUND",
              errors: [
                {
                  message: "EMAIL_NOT_FOUND",
                  domain: "global",
                  reason: "invalid",
                },
              ],
            },
          }),
        });
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      // Should show user not found error with register link
      await expect(page.getByText("ไม่พบบัญชี")).toBeVisible();
      await expect(page.getByText("สร้างบัญชีใหม่")).toBeVisible();
    });

    test("should show register link when user not found", async ({ page }) => {
      const testEmail = "newuser@example.com";
      await page.getByLabel("อีเมล").fill(testEmail);

      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: { code: 400, message: "EMAIL_NOT_FOUND" },
          }),
        });
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      const registerLink = page.getByRole("link", { name: "สร้างบัญชีใหม่" });
      await expect(registerLink).toBeVisible();

      // Should include email in register link
      await expect(registerLink).toHaveAttribute(
        "href",
        `/jobsmarket/auth/register?email=${encodeURIComponent(testEmail)}`
      );
    });

    test("should show rate limit error message", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("test@example.com");

      // Mock rate limit error - Firebase returns 400 with TOO_MANY_ATTEMPTS_TRY_LATER
      await page.route("**/identitytoolkit.googleapis.com/**", (route) => {
        route.fulfill({
          status: 400,
          contentType: "application/json",
          body: JSON.stringify({
            error: {
              code: 400,
              message: "TOO_MANY_ATTEMPTS_TRY_LATER",
              errors: [
                {
                  message: "TOO_MANY_ATTEMPTS_TRY_LATER",
                  domain: "global",
                  reason: "invalid",
                },
              ],
            },
          }),
        });
      });

      await page.getByRole("button", { name: "ส่งลิงก์รีเซ็ต" }).click();

      // Should show rate limit or generic error message
      await expect(
        page.getByText(/กรุณารอ|มีการร้องขอมากเกินไป|เกิดข้อผิดพลาด/)
      ).toBeVisible();
    });
  });

  test.describe("Accessibility", () => {
    test("should have accessible form labels", async ({ page }) => {
      const emailInput = page.getByLabel("อีเมล");
      await expect(emailInput).toBeVisible();
      await expect(emailInput).toHaveAttribute("type", "email");
    });

    test("should have proper ARIA attributes", async ({ page }) => {
      // Fill invalid email to trigger error
      await page.getByLabel("อีเมล").fill("invalid");
      await page.getByLabel("อีเมล").blur();
      await page.waitForTimeout(300);

      const emailInput = page.getByLabel("อีเมล");

      // Should have aria-invalid when there's an error
      const ariaInvalid = await emailInput.getAttribute("aria-invalid");
      expect(ariaInvalid).toBe("true");
    });
  });
});
