import { test, expect } from "@playwright/test";

test.describe("Debug Drawer Click", () => {
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD;
  const testUid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID;

  test("debug drawer after click", async ({ page }) => {
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

    // Find Personal Info section
    const section = page.locator("div").filter({
      has: page.getByRole("heading", { name: "ข้อมูลส่วนตัว" }),
    }).first();

    // Click edit button
    console.log("Clicking edit button...");
    await section.getByRole("button", { name: /แก้ไข/ }).first().click();

    // Wait a bit for drawer to animate
    await page.waitForTimeout(1000);

    // Take screenshot
    await page.screenshot({ path: "debug-drawer-after-click.png", fullPage: true });

    // Check what's visible
    console.log("After click:");

    // Check for drawer title
    const drawerTitle = page.getByRole("heading", { name: "แก้ไขข้อมูลส่วนตัว" });
    const isTitleVisible = await drawerTitle.isVisible().catch(() => false);
    console.log("Drawer title visible:", isTitleVisible);

    // Check for ANY Sheet component
    const sheetElements = await page.locator('[class*="sheet"]').count();
    console.log("Elements with 'sheet' class:", sheetElements);

    // Check for overlay
    const overlays = await page.locator('[class*="overlay"], [class*="backdrop"]').count();
    console.log("Overlay/backdrop elements:", overlays);

    // Check for any form inputs (would be in drawer)
    const inputs = await page.locator("input").count();
    console.log("Total inputs on page:", inputs);

    // List all headings
    const h1s = await page.locator("h1").allTextContents();
    console.log("All H1 headings:", JSON.stringify(h1s));

    const h2s = await page.locator("h2").allTextContents();
    console.log("All H2 headings:", JSON.stringify(h2s));

    const h3s = await page.locator("h3").allTextContents();
    console.log("All H3 headings:", JSON.stringify(h3s));
  });
});
