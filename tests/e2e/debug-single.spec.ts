import { test } from "@playwright/test";

test("DEBUG: Work Experience drawer", async ({ page }) => {
  const testEmail = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL!;
  const testPassword = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD!;
  const uid = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID!;

  // Login
  await page.goto("/jobsmarket/auth/login");
  await page.getByLabel("อีเมล").fill(testEmail);
  await page.getByPlaceholder("กรอกรหัสผ่าน").fill(testPassword);
  await page.getByRole("checkbox").check();
  await page.getByRole("button", { name: "เข้าสู่ระบบ", exact: true }).click();
  await page.waitForURL((url) => !url.pathname.includes("/auth/login"));

  // Navigate to profile
  await page.goto(`/jobsmarket/candidates/${uid}/profile`);
  await page.waitForLoadState("networkidle");

  // Log page state
  console.log("=== PAGE LOADED ===");
  console.log("Current URL:", page.url());

  // Find ALL headings
  const headings = await page.locator("h2").allTextContents();
  console.log("All H2 headings:", headings);

  // Check if Work Experience section exists
  const workExpHeading = page.getByRole("heading", { name: "ประสบการณ์ทำงาน" });
  const workExpVisible = await workExpHeading.isVisible();
  console.log("Work Experience heading visible:", workExpVisible);

  // Find edit buttons
  const editButtons = page.getByRole("button", { name: /แก้ไข/ });
  const editCount = await editButtons.count();
  console.log("Edit buttons found:", editCount);

  // Try to find Work Experience section with specific selector
  const sections = page.locator("div.bg-white.rounded-lg").filter({
    has: page.getByRole("heading", { name: "ประสบการณ์ทำงาน" }),
  });
  const sectionCount = await sections.count();
  console.log("Matching sections (specific):", sectionCount);

  // Get first section
  const section = sections.first();

  // Find edit button in section
  const editButton = section.getByRole("button", { name: /แก้ไข/ });
  const editButtonCount = await editButton.count();
  console.log("Edit buttons in Work Exp section:", editButtonCount);

  const editButtonVisible = await editButton.first().isVisible();
  console.log("Edit button in section visible:", editButtonVisible);

  // Click it
  console.log("=== CLICKING EDIT ===");
  await editButton.first().click();

  // Wait a moment
  await page.waitForTimeout(1000);

  // Check what opened
  const allHeadingsAfter = await page.locator("h2").allTextContents();
  console.log("All H2 after click:", allHeadingsAfter);

  // Look for drawer
  const drawerTitle = page.getByRole("heading", { name: "แก้ไขประสบการณ์ทำงาน" });
  const drawerVisible = await drawerTitle.isVisible();
  console.log("Drawer title visible:", drawerVisible);

  // Check inputs in drawer
  const allInputs = await page.locator("input").count();
  console.log("Total inputs after drawer open:", allInputs);

  const textInputs = await page.locator("input[type='text']").count();
  console.log("Text inputs:", textInputs);

  const visibleInputs = await page.locator("input:visible").count();
  console.log("Visible inputs:", visibleInputs);

  // Check for other form elements
  const selects = await page.locator("select").count();
  console.log("Select elements:", selects);

  const textareas = await page.locator("textarea").count();
  console.log("Textareas:", textareas);

  // Screenshot
  await page.screenshot({ path: "debug-work-exp.png", fullPage: true });

  console.log("=== SUCCESS: Work Exp drawer opened ===");
});
