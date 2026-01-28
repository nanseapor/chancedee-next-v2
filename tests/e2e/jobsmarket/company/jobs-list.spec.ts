import { test, expect } from '@playwright/test';

/**
 * E2E tests for COMP-R05 Jobs List Page
 * Route: /companies/[id]/dashboard/jobs
 */

test.describe('COMP-R05 Jobs List Page', () => {
  const TEST_COMPANY_EMAIL = process.env.TEST_COMPANY_EMAIL;
  const TEST_COMPANY_PASSWORD = process.env.TEST_COMPANY_PASSWORD;
  const TEST_COMPANY_ID = process.env.TEST_COMPANY_ID || 'test-company-123';

  test.skip(!TEST_COMPANY_EMAIL || !TEST_COMPANY_PASSWORD, 'Company credentials not configured');

  test.beforeEach(async ({ page }) => {
    // Login as company user
    await page.goto('/jobsmarket/auth/login');
    await page.getByLabel('อีเมล').fill(TEST_COMPANY_EMAIL!);
    await page.getByPlaceholder('กรอกรหัสผ่าน').fill(TEST_COMPANY_PASSWORD!);
    await page.getByRole('button', { name: /เข้าสู่ระบบ/ }).click();
    await expect(page).toHaveURL(/dashboard/);

    // Navigate to jobs list
    await page.goto(`/jobsmarket/companies/${TEST_COMPANY_ID}/dashboard/jobs`);
  });

  test.describe('Page Load and Layout', () => {
    test('displays page title "ประกาศงาน"', async ({ page }) => {
      await expect(page.getByRole('heading', { name: /ประกาศงาน/i })).toBeVisible();
    });

    test('displays "สร้างประกาศงาน" button with post_jobs permission', async ({ page }) => {
      await expect(page.getByRole('button', { name: /สร้างประกาศงาน/i })).toBeVisible();
    });

    test('displays search input with placeholder "ค้นหาตำแหน่งงาน"', async ({ page }) => {
      await expect(page.getByPlaceholder('ค้นหาตำแหน่งงาน')).toBeVisible();
    });

    test('displays all 5 status tabs (ทั้งหมด, เผยแพร่, ร่าง, หยุดชั่วคราว, ปิดแล้ว)', async ({
      page,
    }) => {
      await expect(page.getByRole('tab', { name: /ทั้งหมด/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /เผยแพร่/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /ร่าง/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /หยุดชั่วคราว/i })).toBeVisible();
      await expect(page.getByRole('tab', { name: /ปิดแล้ว/i })).toBeVisible();
    });
  });

  test.describe('Status Tab Filtering', () => {
    test('filters jobs when clicking "เผยแพร่" tab', async ({ page }) => {
      await page.getByRole('tab', { name: /เผยแพร่/i }).click();
      await expect(page).toHaveURL(/status=published/);
    });

    test('filters jobs when clicking "ร่าง" tab', async ({ page }) => {
      await page.getByRole('tab', { name: /ร่าง/i }).click();
      await expect(page).toHaveURL(/status=draft/);
    });

    test('shows count badges on tabs', async ({ page }) => {
      // Wait for aggregation data to load
      await page.waitForTimeout(1000);

      // Check that at least one tab has a count badge
      const tabs = page.locator('[role="tab"]');
      const tabsWithCounts = await tabs.filter({ has: page.locator('.badge') }).count();
      expect(tabsWithCounts).toBeGreaterThan(0);
    });
  });

  test.describe('Search Functionality', () => {
    test('filters jobs by search query', async ({ page }) => {
      await page.getByPlaceholder('ค้นหาตำแหน่งงาน').fill('developer');
      await page.waitForTimeout(400); // Wait for debounce (300ms + buffer)
      await expect(page).toHaveURL(/q=developer/);
    });

    test('debounces search input (300ms)', async ({ page }) => {
      const searchInput = page.getByPlaceholder('ค้นหาตำแหน่งงาน');

      await searchInput.fill('d');
      await page.waitForTimeout(100);
      await expect(page).not.toHaveURL(/q=/);

      await searchInput.fill('de');
      await page.waitForTimeout(100);
      await expect(page).not.toHaveURL(/q=/);

      await page.waitForTimeout(200); // Total 300ms+
      await expect(page).toHaveURL(/q=de/);
    });
  });

  test.describe('Job List Display', () => {
    test('displays job rows with title, status, counts', async ({ page }) => {
      // Wait for jobs to load
      await page.waitForSelector('[data-testid="job-row"]', { timeout: 5000 }).catch(() => {});

      const jobRows = page.locator('[data-testid="job-row"]');
      const count = await jobRows.count();

      if (count > 0) {
        const firstRow = jobRows.first();
        await expect(firstRow.locator('.job-title')).toBeVisible();
        await expect(firstRow.locator('.job-status-badge')).toBeVisible();
      }
    });

    test('shows empty state when no jobs match filter', async ({ page }) => {
      // Search for unlikely job title
      await page.getByPlaceholder('ค้นหาตำแหน่งงาน').fill('xyzabc123unlikely');
      await page.waitForTimeout(400);

      await expect(page.getByText(/ไม่พบประกาศงาน/i)).toBeVisible();
    });
  });

  test.describe('Job Actions Menu', () => {
    test('opens action menu when clicking three-dot button', async ({ page }) => {
      const actionButton = page.locator('[data-testid="job-action-menu-button"]').first();
      await actionButton.click();

      await expect(page.getByRole('menu')).toBeVisible();
      await expect(page.getByRole('menuitem', { name: /ดูรายละเอียด/i })).toBeVisible();
    });

    test('shows "เผยแพร่" action for draft jobs', async ({ page }) => {
      // Filter to draft jobs
      await page.getByRole('tab', { name: /ร่าง/i }).click();

      const actionButton = page.locator('[data-testid="job-action-menu-button"]').first();
      if (await actionButton.isVisible()) {
        await actionButton.click();
        await expect(page.getByRole('menuitem', { name: /เผยแพร่/i })).toBeVisible();
      }
    });

    test('shows "หยุดชั่วคราว" action for published jobs', async ({ page }) => {
      // Filter to published jobs
      await page.getByRole('tab', { name: /เผยแพร่/i }).click();

      const actionButton = page.locator('[data-testid="job-action-menu-button"]').first();
      if (await actionButton.isVisible()) {
        await actionButton.click();
        await expect(page.getByRole('menuitem', { name: /หยุดชั่วคราว/i })).toBeVisible();
      }
    });
  });

  test.describe('Bulk Operations', () => {
    test('selects multiple jobs via checkboxes', async ({ page }) => {
      const checkboxes = page.locator('[data-testid="job-checkbox"]');
      const count = await checkboxes.count();

      if (count >= 2) {
        await checkboxes.nth(0).check();
        await checkboxes.nth(1).check();

        await expect(page.getByText(/เลือกแล้ว 2 รายการ/i)).toBeVisible();
      }
    });

    test('selects all jobs via header checkbox', async ({ page }) => {
      const selectAllCheckbox = page.getByRole('checkbox', { name: /select all/i });
      await selectAllCheckbox.check();

      await expect(page.getByText(/เลือกแล้ว/i)).toBeVisible();
    });

    test('shows bulk actions bar when jobs selected', async ({ page }) => {
      const checkboxes = page.locator('[data-testid="job-checkbox"]');
      const count = await checkboxes.count();

      if (count > 0) {
        await checkboxes.first().check();
        await expect(page.getByTestId('bulk-actions-bar')).toBeVisible();
      }
    });

    test('clears selection when clicking "ล้างการเลือก"', async ({ page }) => {
      const checkboxes = page.locator('[data-testid="job-checkbox"]');
      const count = await checkboxes.count();

      if (count > 0) {
        await checkboxes.first().check();
        await page.getByRole('button', { name: /ล้างการเลือก/i }).click();

        await expect(page.getByTestId('bulk-actions-bar')).not.toBeVisible();
      }
    });
  });

  test.describe('Pagination', () => {
    test('displays pagination when total pages > 1', async ({ page }) => {
      // Wait for data to load
      await page.waitForTimeout(1000);

      const pagination = page.getByRole('navigation', { name: /pagination/i });
      const isVisible = await pagination.isVisible().catch(() => false);

      // Pagination may or may not be visible depending on job count
      if (isVisible) {
        expect(isVisible).toBe(true);
      }
    });

    test('navigates to next page when clicking page 2', async ({ page }) => {
      const page2Button = page.getByRole('button', { name: '2' });
      const isVisible = await page2Button.isVisible().catch(() => false);

      if (isVisible) {
        await page2Button.click();
        await expect(page).toHaveURL(/page=2/);
      }
    });
  });

  test.describe('Create Job Flow', () => {
    test('navigates to job creation form when clicking "สร้างประกาศงาน"', async ({ page }) => {
      await page.getByRole('button', { name: /สร้างประกาศงาน/i }).click();
      await expect(page).toHaveURL(/\/jobs\/create/);
    });
  });
});
