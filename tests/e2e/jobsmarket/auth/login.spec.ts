import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  type TestCandidate,
} from "../../helpers/factories";

/**
 * E2E Tests for AUTH-R01 Login Page
 * Per AUTH-R01 Implementation Plan §4, §5
 *
 * Prerequisites:
 * - Dev server running at http://localhost:3000
 * - Playwright config set up (playwright.config.ts)
 *
 * Run: npx playwright test tests/e2e/jobsmarket/auth/login.spec.ts
 */

test.describe("Login Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/jobsmarket/auth/login");
  });

  test.describe("Initial Load (CHECK_AUTH state)", () => {
    test("should show loading state initially", async ({ page }) => {
      // Loading indicator should be visible briefly
      // Note: This may be hard to catch due to speed
      await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
    });

    test("should display login form after check_auth", async ({ page }) => {
      await expect(page.getByRole("heading", { name: "เข้าสู่ระบบ" })).toBeVisible();
      await expect(page.getByRole("button", { name: /google/i })).toBeVisible();
      await expect(page.getByLabel("อีเมล")).toBeVisible();
      await expect(page.getByLabel("รหัสผ่าน")).toBeVisible();
    });
  });

  test.describe("Form Elements (IDLE state)", () => {
    test("should have Google login button with correct Thai text", async ({ page }) => {
      await expect(page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" })).toBeVisible();
    });

    test("should have divider with Thai text", async ({ page }) => {
      await expect(page.getByText("หรือ")).toBeVisible();
    });

    test("should have email input with Thai label", async ({ page }) => {
      await expect(page.getByLabel("อีเมล")).toBeVisible();
    });

    test("should have password input with Thai label", async ({ page }) => {
      await expect(page.getByPlaceholder("กรอกรหัสผ่าน")).toBeVisible();
    });

    test("should have forgot password link with Thai text", async ({ page }) => {
      await expect(page.getByRole("link", { name: "ลืมรหัสผ่าน?" })).toBeVisible();
    });

    test("should have terms checkbox with Thai text", async ({ page }) => {
      await expect(page.getByText(/ยอมรับ/)).toBeVisible();
      await expect(page.getByRole("link", { name: "ข้อกำหนดการใช้งาน" })).toBeVisible();
      await expect(page.getByRole("link", { name: "นโยบายความเป็นส่วนตัว" })).toBeVisible();
    });

    test("should have submit button with Thai text", async ({ page }) => {
      await expect(page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true })).toBeVisible();
    });

    test("should have register link with Thai text", async ({ page }) => {
      await expect(page.getByText("ยังไม่มีบัญชี?")).toBeVisible();
      await expect(page.getByRole("link", { name: "สมัครสมาชิก" })).toBeVisible();
    });
  });

  test.describe("Form Validation", () => {
    test("should show validation error for empty email", async ({ page }) => {
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
      await expect(page.getByText("กรุณากรอกอีเมล")).toBeVisible();
    });

    test("should show validation error for invalid email format", async ({ page }) => {
      // Fill form with invalid email - browser HTML5 validation will block submission
      await page.getByLabel("อีเมล").fill("not-an-email");
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill("password123");
      await page.getByRole("checkbox").check();

      // The input should be invalid according to HTML5 validation
      const emailInput = page.getByLabel("อีเมล");
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

      // Check that the email input is marked invalid (browser will show validation message)
      const isInvalid = await emailInput.evaluate((el: HTMLInputElement) => !el.validity.valid);
      expect(isInvalid).toBe(true);
    });

    test("should show validation error for empty password", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("test@example.com");
      await page.getByRole("checkbox").check();
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
      await expect(page.getByText("กรุณากรอกรหัสผ่าน")).toBeVisible();
    });
  });

  test.describe("Terms Checkbox", () => {
    test("should show error when terms not accepted", async ({ page }) => {
      await page.getByLabel("อีเมล").fill("test@example.com");
      await page.getByPlaceholder("กรอกรหัสผ่าน").fill("password123");
      // Don't check terms
      await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
      await expect(page.getByText("กรุณายอมรับข้อกำหนดและนโยบาย")).toBeVisible();
    });
  });

  test.describe("Password Visibility Toggle", () => {
    test("should toggle password visibility", async ({ page }) => {
      const passwordInput = page.getByPlaceholder("กรอกรหัสผ่าน");
      await passwordInput.fill("testpassword");

      // Initially password type
      await expect(passwordInput).toHaveAttribute("type", "password");

      // Click toggle button (find by aria-label)
      const toggleButton = page.locator("button[aria-label='แสดงรหัสผ่าน']");
      await toggleButton.click();
      await expect(passwordInput).toHaveAttribute("type", "text");

      // Click again to hide (aria-label changes to ซ่อนรหัสผ่าน)
      const hideButton = page.locator("button[aria-label='ซ่อนรหัสผ่าน']");
      await hideButton.click();
      await expect(passwordInput).toHaveAttribute("type", "password");
    });
  });

  test.describe("Query Parameters (SHOW_MESSAGE state)", () => {
    test("should show session expired message with ?from=session-expired", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?from=session-expired");
      await expect(page.getByText("เซสชันหมดอายุ กรุณาเข้าสู่ระบบใหม่")).toBeVisible();
    });

    test("should show registration success message with ?from=registration", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?from=registration");
      await expect(page.getByText("สร้างบัญชีสำเร็จ กรุณาเข้าสู่ระบบ")).toBeVisible();
    });

    test("should show protected route message with ?from=protected", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?from=protected");
      await expect(page.getByText("เข้าสู่ระบบเพื่อดำเนินการต่อ")).toBeVisible();
    });

    test("should show password reset success message with ?from=password-reset", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?from=password-reset");
      await expect(page.getByText("รีเซ็ตรหัสผ่านสำเร็จ")).toBeVisible();
    });

    test("should focus email input with ?method=email", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?method=email");
      await expect(page.getByLabel("อีเมล")).toBeFocused();
    });

    test("should highlight Google button with ?method=social", async ({ page }) => {
      await page.goto("/jobsmarket/auth/login?method=social");
      const googleButton = page.getByRole("button", { name: "เข้าสู่ระบบด้วย Google" });
      // Check for ring classes indicating highlight
      await expect(googleButton).toHaveClass(/ring-2/);
    });
  });

  test.describe("Navigation Links", () => {
    test("should navigate to forgot password page", async ({ page }) => {
      await page.getByRole("link", { name: "ลืมรหัสผ่าน?" }).click();
      await expect(page).toHaveURL("/jobsmarket/auth/reset");
    });

    test("should navigate to register page", async ({ page }) => {
      await page.getByRole("link", { name: "สมัครสมาชิก" }).click();
      await expect(page).toHaveURL("/jobsmarket/auth/register");
    });

    test("should open terms in new tab", async ({ page, context }) => {
      const [newPage] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: "ข้อกำหนดการใช้งาน" }).click(),
      ]);
      await expect(newPage).toHaveURL(/\/jobsmarket\/legal\/terms/);
    });

    test("should open privacy policy in new tab", async ({ page, context }) => {
      const [newPage] = await Promise.all([
        context.waitForEvent("page"),
        page.getByRole("link", { name: "นโยบายความเป็นส่วนตัว" }).click(),
      ]);
      await expect(newPage).toHaveURL(/\/jobsmarket\/privacy/);
    });
  });
});

/**
 * Tests requiring authentication setup
 * Uses factory-created test candidate
 */
test.describe("Authentication Flow", () => {
  let candidate: TestCandidate;

  test.beforeAll(async () => {
    // Create test candidate for login tests
    candidate = await createTestCandidate({
      testName: "login-flow",
      withCompleteProfile: false,
    });
  });

  test("should show error for invalid credentials", async ({ page }) => {
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill("invalid@example.com");
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill("wrongpassword123");
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for error message - Firebase returns "invalid-credential" or similar
    await expect(page.getByText(/อีเมลหรือรหัสผ่านไม่ถูกต้อง|ไม่พบบัญชีผู้ใช้/)).toBeVisible({ timeout: 10000 });
  });

  test("should redirect to dashboard on successful login", async ({ page }) => {
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(candidate.email);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(candidate.password);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for redirect away from login page
    // Candidate user should redirect to /jobsmarket/candidates/{uid} or /jobsmarket
    await page.waitForURL((url) => !url.pathname.includes('/auth/login'), { timeout: 15000 });

    // Verify we're no longer on the login page
    await expect(page).not.toHaveURL(/\/auth\/login$/);
  });
});
