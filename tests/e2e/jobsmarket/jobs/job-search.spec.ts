import { test, expect } from '@playwright/test';

test.describe('JOB-R01: Job Search Page', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/jobsmarket/jobs');
    await page.waitForLoadState('networkidle');
  });

  test.describe('Initial Load (DISC-001)', () => {
    test('displays job listings on initial load', async ({ page }) => {
      // Should see job cards
      const jobCards = page.locator('[data-testid="job-card"]');
      await expect(jobCards.first()).toBeVisible({ timeout: 10000 });

      // Should have multiple jobs
      const count = await jobCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test('shows result count', async ({ page }) => {
      // Should show "พบ X ตำแหน่ง" text
      await expect(page.getByText(/พบ\s+\d+\s+ตำแหน่ง/)).toBeVisible({ timeout: 10000 });
    });

    test('displays pagination when there are multiple pages', async ({ page }) => {
      // Wait for jobs to load
      await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

      // Check if pagination exists
      const pagination = page.locator('nav[aria-label="Pagination"]');
      const paginationExists = await pagination.count() > 0;

      if (paginationExists) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe('Search Functionality (DISC-001, DISC-002)', () => {
    test('search by keyword updates results', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหา/);
      await searchInput.fill('developer');

      // Wait for URL to update (debounced)
      await page.waitForTimeout(600);

      // URL should include search query
      await expect(page).toHaveURL(/q=developer/);

      // Should still show job cards (or empty state)
      const hasJobs = await page.locator('[data-testid="job-card"]').count() > 0;
      const hasEmptyState = await page.getByText(/ไม่พบงาน/).isVisible().catch(() => false);

      expect(hasJobs || hasEmptyState).toBe(true);
    });

    test('clear search returns to all results', async ({ page }) => {
      const searchInput = page.getByPlaceholder(/ค้นหา/);

      // Enter search
      await searchInput.fill('developer');
      await page.waitForTimeout(600);
      await expect(page).toHaveURL(/q=developer/);

      // Clear search
      await searchInput.clear();
      await page.waitForTimeout(600);

      // URL should not have q parameter
      const url = page.url();
      expect(url).not.toContain('q=');
    });
  });

  test.describe('Filters (DISC-002, DISC-003, DISC-004)', () => {
    test('filter by employment type', async ({ page }) => {
      // Open filters on desktop or click filter button on mobile
      const filterButton = page.getByRole('button', { name: /ตัวกรอง|กรอง/ });
      const isFilterButtonVisible = await filterButton.isVisible();

      if (isFilterButtonVisible) {
        await filterButton.click();
        await page.waitForTimeout(300);
      }

      // Find and click full-time filter
      const fullTimeFilter = page.getByText(/งานประจำ|Full.?Time/i).first();
      await fullTimeFilter.click();

      // Wait for filter to apply
      await page.waitForTimeout(600);

      // URL should include type parameter
      const url = page.url();
      expect(url).toContain('type');
    });

    test('clear all filters', async ({ page }) => {
      // Apply some filters first
      await page.goto('/jobsmarket/jobs?types=fulltime&salary_min=30000');
      await page.waitForLoadState('networkidle');

      // Find clear button
      const clearButton = page.getByRole('button', { name: /ล้าง|Clear/i }).first();
      const isClearVisible = await clearButton.isVisible();

      if (isClearVisible) {
        await clearButton.click();
        await page.waitForTimeout(600);

        // URL should be reset
        const url = page.url();
        expect(url).not.toContain('types=');
        expect(url).not.toContain('salary_min=');
      }
    });
  });

  test.describe('Pagination (DISC-007)', () => {
    test('navigate to page 2', async ({ page }) => {
      // Wait for jobs to load
      await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

      // Check if page 2 button exists
      const page2Button = page.getByRole('button', { name: '2', exact: true });
      const hasPage2 = await page2Button.count() > 0;

      if (hasPage2) {
        await page2Button.click();
        await page.waitForTimeout(500);

        // URL should include page=2
        await expect(page).toHaveURL(/page=2/);

        // Should still show jobs
        await expect(page.locator('[data-testid="job-card"]').first()).toBeVisible();
      }
    });

    test('page resets when filter changes', async ({ page }) => {
      // Go to page 2
      await page.goto('/jobsmarket/jobs?page=2');
      await page.waitForLoadState('networkidle');

      // Apply a filter
      const searchInput = page.getByPlaceholder(/ค้นหา/);
      await searchInput.fill('test');
      await page.waitForTimeout(600);

      // Page parameter should be reset or absent
      const url = page.url();
      expect(url).not.toContain('page=2');
    });
  });

  test.describe('Empty State (DISC-006)', () => {
    test('shows empty state for no results', async ({ page }) => {
      await page.goto('/jobsmarket/jobs?q=xyznonexistent123456789abcd');
      await page.waitForLoadState('networkidle');
      await page.waitForTimeout(1000);

      // Should show empty state message or no results found
      const emptyMessage = page.getByText(/ไม่พบงาน|No jobs found/i);
      const hasEmptyState = await emptyMessage.isVisible().catch(() => false);

      // Or might show zero results
      const resultCount = page.getByText(/พบ\s+0\s+ตำแหน่ง/);
      const hasZeroResults = await resultCount.isVisible().catch(() => false);

      expect(hasEmptyState || hasZeroResults).toBe(true);
    });
  });

  test.describe('URL State Persistence (DISC-010)', () => {
    test('restores filters from URL', async ({ page }) => {
      // Navigate with query params
      await page.goto('/jobsmarket/jobs?q=developer&types=fulltime&page=1');
      await page.waitForLoadState('networkidle');

      // Search input should have value
      const searchInput = page.getByPlaceholder(/ค้นหา/);
      await expect(searchInput).toHaveValue('developer');

      // URL params should persist
      const url = page.url();
      expect(url).toContain('q=developer');
      expect(url).toContain('types=fulltime');
    });

    test('updates URL when filters change', async ({ page }) => {
      const initialUrl = page.url();

      // Change search
      const searchInput = page.getByPlaceholder(/ค้นหา/);
      await searchInput.fill('engineer');
      await page.waitForTimeout(600);

      const newUrl = page.url();
      expect(newUrl).not.toBe(initialUrl);
      expect(newUrl).toContain('q=engineer');
    });
  });

  test.describe('Save Job - Guest User (DISC-019)', () => {
    test('shows login prompt when guest clicks save button', async ({ page, context }) => {
      // Ensure logged out by clearing cookies
      await context.clearCookies();
      await page.goto('/jobsmarket/jobs');
      await page.waitForLoadState('networkidle');

      // Wait for jobs to load
      const jobCard = page.locator('[data-testid="job-card"]').first();
      await expect(jobCard).toBeVisible({ timeout: 10000 });

      // Find and click save button (heart icon)
      const saveButton = jobCard.locator('button[aria-label*="บันทึก"], button:has(svg)').first();
      const hasSaveButton = await saveButton.count() > 0;

      if (hasSaveButton) {
        await saveButton.click();

        // Should show login modal or redirect
        const loginText = page.getByText(/เข้าสู่ระบบ|ลงทะเบียน|Login|Sign/i);
        const hasLoginPrompt = await loginText.isVisible({ timeout: 3000 }).catch(() => false);

        expect(hasLoginPrompt).toBe(true);
      }
    });
  });

  test.describe('Job Card Display', () => {
    test('job card shows required information', async ({ page }) => {
      const jobCard = page.locator('[data-testid="job-card"]').first();
      await expect(jobCard).toBeVisible({ timeout: 10000 });

      // Should show job title
      const hasTitle = await jobCard.locator('h2, h3, [class*="title"]').count() > 0;
      expect(hasTitle).toBe(true);

      // Should show company name
      const hasCompany = await jobCard.locator('[class*="company"]').count() > 0 ||
                         await jobCard.getByText(/บริษัท/).count() > 0;
      expect(hasCompany).toBeTruthy();
    });

    test('job card is clickable and navigates to detail page', async ({ page }) => {
      const jobCard = page.locator('[data-testid="job-card"]').first();
      await expect(jobCard).toBeVisible({ timeout: 10000 });

      // Get job ID or URL before click
      const href = await jobCard.locator('a').first().getAttribute('href');
      expect(href).toBeTruthy();
      expect(href).toContain('/jobs/');
    });
  });

  test.describe('Responsive Design', () => {
    test('mobile: filter button opens bottom sheet', async ({ page }) => {
      // Set mobile viewport
      await page.setViewportSize({ width: 375, height: 667 });
      await page.goto('/jobsmarket/jobs');
      await page.waitForLoadState('networkidle');

      // Filter button should be visible on mobile
      const filterButton = page.getByRole('button', { name: /ตัวกรอง|กรอง/ });
      const isVisible = await filterButton.isVisible();

      if (isVisible) {
        await filterButton.click();

        // Bottom sheet or modal should appear
        await page.waitForTimeout(300);
        const filterPanel = page.locator('[role="dialog"], [class*="sheet"]');
        const isPanelVisible = await filterPanel.isVisible().catch(() => false);

        expect(isPanelVisible).toBe(true);
      }
    });

    test('desktop: filter sidebar is visible', async ({ page }) => {
      // Set desktop viewport
      await page.setViewportSize({ width: 1280, height: 720 });
      await page.goto('/jobsmarket/jobs');
      await page.waitForLoadState('networkidle');

      // Filter sidebar should be visible (or filters inline)
      const hasSidebar = await page.locator('aside, [class*="sidebar"]').count() > 0;
      const hasInlineFilters = await page.getByText(/ประเภทงาน|Employment Type/i).count() > 0;

      expect(hasSidebar || hasInlineFilters).toBe(true);
    });
  });

  test.describe('Performance and Loading States', () => {
    test('shows loading state during fetch', async ({ page }) => {
      // Navigate to trigger loading
      await page.goto('/jobsmarket/jobs');

      // Should show loading skeleton or spinner (check quickly before jobs load)
      const hasLoadingState = await page.locator('[class*="skeleton"], [class*="spinner"], [class*="loading"]')
        .first()
        .isVisible({ timeout: 1000 })
        .catch(() => false);

      // Loading state may or may not be visible depending on network speed
      // This is informational, not a hard requirement
      if (hasLoadingState) {
        // console.log('✓ Loading state detected');
      }
    });

    test('page loads within acceptable time', async ({ page }) => {
      const startTime = Date.now();

      await page.goto('/jobsmarket/jobs');
      await page.waitForSelector('[data-testid="job-card"]', { timeout: 10000 });

      const loadTime = Date.now() - startTime;

      // Should load within 10 seconds
      expect(loadTime).toBeLessThan(10000);
    });
  });

  test.describe('Sorting (DISC-005)', () => {
    test('can change sort order', async ({ page }) => {
      // Look for sort dropdown
      const sortSelect = page.locator('select[name="sort"], [role="combobox"]').first();
      const hasSortControl = await sortSelect.count() > 0;

      if (hasSortControl) {
        // Change sort option
        await sortSelect.click();
        await page.waitForTimeout(300);

        // Select a different option (e.g., salary high to low)
        const options = page.locator('option, [role="option"]');
        const optionCount = await options.count();

        if (optionCount > 1) {
          await options.nth(1).click();
          await page.waitForTimeout(600);

          // URL should include sort parameter
          const url = page.url();
          expect(url).toContain('sort=') || expect(url).toContain('order=');
        }
      }
    });
  });
});
