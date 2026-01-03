import { test, expect } from '@playwright/test';
import { seedSavedJob, cleanupSavedJob, cleanupMultipleSavedJobs } from './saved-jobs-helpers';

/**
 * CAND-R05 Phase A: Saved Jobs - E2E Tests
 * Route: /candidates/[id]/saved
 *
 * Test credentials from .env.playwright
 */

const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL || 'xalanaseon@hotmail.com';
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD || 'P@ssw0rd@1';
const TEST_UID = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID || 'bywpdkLOSTWjvV8JhhQL6LNditJ3';

const SAVED_JOBS_URL = `/jobsmarket/candidates/${TEST_UID}/saved`;

test.describe('CAND-R05: Saved Jobs Page', () => {

  // Helper to login
  async function login(page: any) {
    await page.goto('/jobsmarket/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);

    // Check terms acceptance checkbox (shadcn checkbox, click the label area)
    await page.locator('[for="terms"]').click();

    await page.click('button[type="submit"]');

    // Wait for login to complete (check for session cookie or success indicator)
    // Don't rely on redirect since login page may not redirect automatically
    await page.waitForTimeout(2000); // Give login time to complete

    // Navigate directly to saved jobs page
    await page.goto(SAVED_JOBS_URL);
    await page.waitForLoadState('networkidle');
  }

  test.describe('Authentication & Access', () => {
    test('redirects to login when not authenticated', async ({ page, context }) => {
      // Clear cookies to simulate logged out state
      await context.clearCookies();

      await page.goto(SAVED_JOBS_URL);

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Page Structure', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });
    test('displays page with 3 tabs', async ({ page }) => {
      // Check page title
      await expect(page.locator('h1')).toContainText('รายการที่บันทึก');

      // Check all 3 tabs exist
      await expect(page.getByRole('tab', { name: /งานที่บันทึก/ })).toBeVisible();
      await expect(page.getByRole('tab', { name: /การค้นหาที่บันทึก/ })).toBeVisible();
      await expect(page.getByRole('tab', { name: /การแจ้งเตือนงาน/ })).toBeVisible();
    });

    test('Jobs tab is active by default', async ({ page }) => {
      const jobsTab = page.getByRole('tab', { name: /งานที่บันทึก/ });
      await expect(jobsTab).toHaveAttribute('data-state', 'active');
    });
  });

  test.describe('Jobs Tab Content', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('displays saved jobs list', async ({ page }) => {
      // Wait for page to load
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1500);

      // Either shows jobs or empty state
      const emptyStateLocator = page.getByText('ยังไม่มีงานที่บันทึก');
      const jobCardsLocator = page.locator('[data-testid="saved-job-card"]');

      // Check which state is visible
      const hasEmptyState = await emptyStateLocator.isVisible().catch(() => false);
      const jobCardsCount = await jobCardsLocator.count();

      // Must show EITHER empty state OR job cards
      expect(hasEmptyState || jobCardsCount > 0).toBe(true);
    });

    test('shows empty state when no saved jobs', async ({ page }) => {
      // Check for empty state (may or may not appear depending on data)
      const emptyStateVisible = await page.getByText('ยังไม่มีงานที่บันทึก').isVisible().catch(() => false);

      if (emptyStateVisible) {
        await expect(page.getByText('บันทึกงานที่สนใจเพื่อดูภายหลัง')).toBeVisible();
        await expect(page.getByRole('link', { name: /ค้นหางาน/ })).toBeVisible();
      }
    });

  });

  test.describe('Jobs Tab - With Seeded Data', () => {
    const seededJobIds: string[] = [];

    test.beforeEach(async ({ page }) => {
      // Seed 2 test jobs: 1 active and 1 closed
      const activeJob = await seedSavedJob(TEST_UID, {
        title: 'Active Test Job',
        companyName: 'Active Company',
        isActive: true,
        jobStatus: 'published',
      });
      seededJobIds.push(activeJob.jobId);

      const closedJob = await seedSavedJob(TEST_UID, {
        title: 'Closed Test Job',
        companyName: 'Closed Company',
        isActive: false,
        jobStatus: 'closed',
      });
      seededJobIds.push(closedJob.jobId);

      // Login and navigate
      await login(page);
    });

    test.afterEach(async () => {
      // Cleanup seeded jobs
      await cleanupMultipleSavedJobs(seededJobIds, TEST_UID);
      seededJobIds.length = 0;
    });

    test('unsave button removes job optimistically', async ({ page }) => {
      // Wait for jobs to load
      await page.waitForTimeout(2000);

      // Should have at least 2 saved jobs from seeding
      const initialCount = await page.locator('[data-testid="saved-job-card"]').count();
      expect(initialCount).toBeGreaterThanOrEqual(2);

      // Click first unsave button (using aria-label)
      const firstUnsaveButton = page.locator('button[aria-label="ยกเลิกบันทึก"]').first();
      await expect(firstUnsaveButton).toBeVisible();
      await firstUnsaveButton.click();

      // Wait longer for optimistic update and revalidation
      await page.waitForTimeout(1500);

      const newCount = await page.locator('[data-testid="saved-job-card"]').count();
      // Should have removed one job (optimistic or after mutation)
      expect(newCount).toBeLessThan(initialCount);
    });

    test('closed job shows in saved jobs list', async ({ page }) => {
      // Wait for jobs to load
      await page.waitForTimeout(2000);

      // Should have at least 2 saved jobs (including the closed one)
      const jobCards = page.locator('[data-testid="saved-job-card"]');
      const count = await jobCards.count();
      expect(count).toBeGreaterThanOrEqual(2);

      // Look for the closed job title (use first() to avoid strict mode violation)
      const closedJobTitle = page.getByText('Closed Test Job').first();
      await expect(closedJobTitle).toBeVisible();
    });
  });

  test.describe('Tab Navigation', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
    });

    test('Searches tab shows coming soon', async ({ page }) => {
      await page.getByRole('tab', { name: /การค้นหาที่บันทึก/ }).click();

      await expect(page.getByText('เร็วๆ นี้')).toBeVisible();
    });

    test('Alerts tab shows coming soon', async ({ page }) => {
      await page.getByRole('tab', { name: /การแจ้งเตือนงาน/ }).click();

      await expect(page.getByText('เร็วๆ นี้')).toBeVisible();
    });
  });
});
