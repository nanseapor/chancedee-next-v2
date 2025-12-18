import { test } from "@playwright/test";

test.describe("Debug Profile Edit", () => {
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  test("debug profile page", async ({ page }) => {
    // Login
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(testEmail!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword!);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    // Wait for redirect
    await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 15000 });

    console.log("After login URL:", page.url());

    // Navigate to profile
    await page.goto(`/jobsmarket/candidates/${testUid}/profile`);
    await page.waitForLoadState("networkidle");

    console.log("Profile URL:", page.url());

    // Take screenshot
    await page.screenshot({ path: "debug-profile-edit.png", fullPage: true });

    // Get page title
    const title = await page.title();
    console.log("Page title:", title);

    // Check for specific headings
    const h2 = await page.locator("h2").allTextContents();
    console.log("H2 headings:", JSON.stringify(h2));

    // Check for edit buttons
    const editButtons = await page.getByRole("button", { name: /แก้ไข/ }).count();
    console.log("Edit buttons found:", editButtons);

    // Check for specific section
    const personalInfoHeading = await page.getByRole("heading", { name: /ข้อมูลส่วนตัว/ }).isVisible();
    console.log("Personal Info heading visible:", personalInfoHeading);

    // Check for profile text in sidebar
    const hasSidebarProfile = await page.locator("text=โปรไฟล์").count();
    console.log("'โปรไฟล์' text count:", hasSidebarProfile);
  });
});
