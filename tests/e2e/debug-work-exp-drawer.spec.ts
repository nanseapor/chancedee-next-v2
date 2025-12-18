import { test } from "@playwright/test";

test.describe("Debug Work Exp Drawer", () => {
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  test("debug work experience drawer", async ({ page }) => {
    // Login
    await page.goto("/jobsmarket/auth/login");
    await page.getByLabel("อีเมล").fill(testEmail!);
    await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword!);
    await page.getByRole("checkbox").check();
    await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();

    await page.waitForURL((url) => !url.pathname.includes("/auth/login"), { timeout: 15000 });

    // Navigate to profile
    await page.goto(`/jobsmarket/candidates/${testUid}/profile`);
    await page.waitForLoadState("networkidle");

    console.log("Profile URL:", page.url());

    // Find Work Experience section
    const section = page.locator("div").filter({
      has: page.getByRole("heading", { name: "ประสบการณ์ทำงาน" }),
    }).first();

    console.log("Clicking Work Experience edit button...");
    await section.getByRole("button", { name: /แก้ไข/ }).first().click();

    // Wait for drawer animation
    await page.waitForTimeout(2000);

    // Take screenshot
    await page.screenshot({ path: "debug-work-exp-drawer.png", fullPage: true });

    console.log("After click:");

    // Check for drawer title
    const drawerTitle = page.getByRole("heading", { name: "แก้ไขประสบการณ์ทำงาน" });
    const isTitleVisible = await drawerTitle.isVisible().catch(() => false);
    console.log("Work Exp drawer title visible:", isTitleVisible);

    // List all H2 headings
    const h2s = await page.locator("h2").allTextContents();
    console.log("All H2 headings:", JSON.stringify(h2s));

    // Check if Work Experience drawer component is mounted
    const workExpState = await page.evaluate(() => {
      // @ts-ignore
      return window.__REACT_DEVTOOLS_GLOBAL_HOOK__?.renderers?.size || 0;
    });
    console.log("React renderers:", workExpState);
  });
});
