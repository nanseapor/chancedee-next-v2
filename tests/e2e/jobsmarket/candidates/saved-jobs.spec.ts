import { test, expect } from '@playwright/test';
import { seedSavedJob, cleanupSavedJob, cleanupMultipleSavedJobs } from './saved-jobs-helpers';
import {
  createTestCandidate,
  type TestCandidate,
} from "../../helpers/factories";
import { signInAsCandidate } from "../../helpers/auth-helper";

/**
 * CAND-R05 Phase A: Saved Jobs - E2E Tests
 * Route: /candidates/[id]/saved
 */

// Shared test data
let candidate: TestCandidate;

test.describe('CAND-R05: Saved Jobs Page', () => {
  test.beforeAll(async () => {
    // Create test candidate with complete profile
    candidate = await createTestCandidate({
      testName: "saved-jobs",
      withCompleteProfile: true,
    });
  });

  test.describe('Authentication & Access', () => {
    test('redirects to login when not authenticated', async ({ page, context }) => {
      // Clear cookies to simulate logged out state
      await context.clearCookies();

      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/saved`);

      await expect(page).toHaveURL(/\/auth\/login/);
    });
  });

  test.describe('Page Structure', () => {
    test.beforeEach(async ({ page }) => {
      await signInAsCandidate(page, candidate);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/saved`);
      await page.waitForLoadState('domcontentloaded');
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
      await signInAsCandidate(page, candidate);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/saved`);
      await page.waitForLoadState('domcontentloaded');
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
      const activeJob = await seedSavedJob(candidate.candidateId, {
        title: 'Active Test Job',
        companyName: 'Active Company',
        isActive: true,
        jobStatus: 'published',
      });
      seededJobIds.push(activeJob.jobId);

      const closedJob = await seedSavedJob(candidate.candidateId, {
        title: 'Closed Test Job',
        companyName: 'Closed Company',
        isActive: false,
        jobStatus: 'closed',
      });
      seededJobIds.push(closedJob.jobId);

      // Login and navigate
      await signInAsCandidate(page, candidate);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/saved`);
      await page.waitForLoadState('domcontentloaded');
    });

    test.afterEach(async () => {
      // Cleanup seeded jobs
      await cleanupMultipleSavedJobs(seededJobIds, candidate.candidateId);
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
      await signInAsCandidate(page, candidate);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/saved`);
      await page.waitForLoadState('domcontentloaded');
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
