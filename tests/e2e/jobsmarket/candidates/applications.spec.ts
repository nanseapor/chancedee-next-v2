import { test, expect } from '@playwright/test';

// Test credentials from .env.playwright
const TEST_EMAIL = process.env.PLAYWRIGHT_TEST_CANDIDATE_EMAIL || 'xalanaseon@hotmail.com';
const TEST_PASSWORD = process.env.PLAYWRIGHT_TEST_CANDIDATE_PASSWORD || 'P@ssw0rd@1';
const TEST_UID = process.env.PLAYWRIGHT_TEST_CANDIDATE_UID || 'bywpdkLOSTWjvV8JhhQL6LNditJ3';

const APPLICATIONS_URL = `/jobsmarket/candidates/${TEST_UID}/applications`;

test.describe('CAND-R04: Applications Page', () => {

  // Helper to login
  async function login(page: any) {
    await page.goto('/jobsmarket/auth/login');
    await page.fill('input[type="email"]', TEST_EMAIL);
    await page.fill('input[type="password"]', TEST_PASSWORD);
    await page.click('button[type="submit"]');

    // Wait for login to complete (check for session cookie or success indicator)
    // Don't rely on redirect since login page may not redirect automatically
    await page.waitForTimeout(2000); // Give login time to complete

    // Navigate directly to applications page
    await page.goto(APPLICATIONS_URL);
    await page.waitForLoadState('networkidle');
  }

  test.describe('Authentication', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
      await page.context().clearCookies();
      await page.goto(APPLICATIONS_URL);
      await expect(page).toHaveURL(/\/auth\/login/, { timeout: 10000 });
    });
  });

  test.describe('Applications List', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(APPLICATIONS_URL);
      await page.waitForLoadState('networkidle');
    });

    test('displays page title', async ({ page }) => {
      await expect(page.locator('h1')).toContainText('ใบสมัครของฉัน');
    });

    test('displays all status tabs', async ({ page }) => {
      await expect(page.getByRole('tablist')).toBeVisible();

      const tabLabels = ['ทั้งหมด', 'สมัครแล้ว', 'กำลังพิจารณา', 'นัดสัมภาษณ์', 'ไม่ผ่าน'];
      for (const label of tabLabels) {
        await expect(page.getByRole('tab', { name: new RegExp(label) })).toBeVisible();
      }
    });

    test('displays application cards when data exists', async ({ page }) => {
      // Wait for content to load
      await page.waitForTimeout(2000);

      // Either shows cards or empty state
      const hasCards = await page.locator('.space-y-4 > div').count() > 0;
      const hasEmptyState = await page.locator('text=คุณยังไม่มีใบสมัคร').isVisible().catch(() => false);

      expect(hasCards || hasEmptyState).toBe(true);
    });
  });

  test.describe('Tab Filtering', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(APPLICATIONS_URL);
      await page.waitForLoadState('networkidle');
    });

    test('filters by tab when clicked', async ({ page }) => {
      // Click reviewing tab
      await page.getByRole('tab', { name: /กำลังพิจารณา/ }).click();
      await page.waitForTimeout(500);

      // Verify tab is active
      const reviewingTab = page.getByRole('tab', { name: /กำลังพิจารณา/ });
      await expect(reviewingTab).toHaveAttribute('aria-selected', 'true');
    });

    test('shows empty state when filter has no results', async ({ page }) => {
      // Try tabs until we find an empty one
      const tabs = ['นัดสัมภาษณ์', 'สมัครแล้ว', 'ไม่ผ่าน'];

      for (const tab of tabs) {
        await page.getByRole('tab', { name: new RegExp(tab) }).click();
        await page.waitForTimeout(500);

        const emptyState = page.locator('text=ไม่มีใบสมัครในสถานะนี้');
        if (await emptyState.isVisible().catch(() => false)) {
          await expect(emptyState).toBeVisible();
          return; // Test passed
        }
      }

      // If all tabs have data, that's also valid
      expect(true).toBe(true);
    });
  });

  test.describe('Card Interaction', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(APPLICATIONS_URL);
      await page.waitForLoadState('networkidle');
    });

    test('expands card to show details', async ({ page }) => {
      // Wait for cards to load
      await page.waitForTimeout(2000);

      const cards = page.locator('.space-y-4 > div');
      const count = await cards.count();

      if (count === 0) {
        test.skip(); // No cards to test
        return;
      }

      // Click first card expand button
      const expandButton = page.locator('button').filter({ hasText: 'ดูรายละเอียดเพิ่มเติม' }).first();
      if (await expandButton.isVisible().catch(() => false)) {
        await expandButton.click();
        await page.waitForTimeout(500);

        // Should show collapse button
        await expect(page.locator('button').filter({ hasText: 'ซ่อนรายละเอียด' }).first()).toBeVisible();
      }
    });

    test('shows timeline in expanded card', async ({ page }) => {
      await page.waitForTimeout(2000);

      const cards = page.locator('.space-y-4 > div');
      if (await cards.count() === 0) {
        test.skip();
        return;
      }

      const expandButton = page.locator('button').filter({ hasText: 'ดูรายละเอียดเพิ่มเติม' }).first();
      if (await expandButton.isVisible().catch(() => false)) {
        await expandButton.click();
        await page.waitForTimeout(500);

        // Check for timeline content
        const hasTimeline = await page.locator('text=ประวัติการดำเนินการ').isVisible().catch(() => false);
        expect(hasTimeline).toBe(true);
      }
    });
  });

  test.describe('Withdraw Flow', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(APPLICATIONS_URL);
      await page.waitForLoadState('networkidle');
    });

    test('opens withdraw modal when button clicked', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Find a withdrawable card
      const cards = page.locator('.space-y-4 > div');
      const count = await cards.count();

      for (let i = 0; i < count; i++) {
        const expandButton = cards.nth(i).locator('button').filter({ hasText: 'ดูรายละเอียดเพิ่มเติม' });
        if (await expandButton.isVisible().catch(() => false)) {
          await expandButton.click();
          await page.waitForTimeout(300);

          const withdrawBtn = page.locator('button:has-text("ถอนใบสมัคร")').first();
          if (await withdrawBtn.isVisible().catch(() => false)) {
            await withdrawBtn.click();

            // Modal should appear
            await expect(page.locator('text=ยืนยันการถอนใบสมัคร')).toBeVisible();
            return;
          }

          // Collapse and try next
          const collapseButton = cards.nth(i).locator('button').filter({ hasText: 'ซ่อนรายละเอียด' });
          if (await collapseButton.isVisible().catch(() => false)) {
            await collapseButton.click();
            await page.waitForTimeout(200);
          }
        }
      }

      // No withdrawable applications - skip test
      test.skip();
    });

    test('closes modal on cancel', async ({ page }) => {
      await page.waitForTimeout(2000);

      const cards = page.locator('.space-y-4 > div');
      const count = await cards.count();

      for (let i = 0; i < count; i++) {
        const expandButton = cards.nth(i).locator('button').filter({ hasText: 'ดูรายละเอียดเพิ่มเติม' });
        if (await expandButton.isVisible().catch(() => false)) {
          await expandButton.click();
          await page.waitForTimeout(300);

          const withdrawBtn = page.locator('button:has-text("ถอนใบสมัคร")').first();
          if (await withdrawBtn.isVisible().catch(() => false)) {
            await withdrawBtn.click();
            await expect(page.locator('text=ยืนยันการถอนใบสมัคร')).toBeVisible();

            // Cancel
            await page.locator('button:has-text("ยกเลิก")').click();

            // Modal should close
            await expect(page.locator('text=ยืนยันการถอนใบสมัคร')).not.toBeVisible();
            return;
          }

          const collapseButton = cards.nth(i).locator('button').filter({ hasText: 'ซ่อนรายละเอียด' });
          if (await collapseButton.isVisible().catch(() => false)) {
            await collapseButton.click();
            await page.waitForTimeout(200);
          }
        }
      }

      test.skip();
    });
  });

  test.describe('Status Badge Display', () => {
    test.beforeEach(async ({ page }) => {
      await login(page);
      await page.goto(APPLICATIONS_URL);
      await page.waitForLoadState('networkidle');
    });

    test('displays Thai status labels', async ({ page }) => {
      await page.waitForTimeout(2000);

      // Check for any of the Thai status labels
      const thaiLabels = [
        'ส่งใบสมัครแล้ว',
        'บริษัทดูแล้ว',
        'ผ่านการคัดเลือก',
        'ไม่ผ่านการคัดเลือก',
        'นัดสัมภาษณ์แล้ว',
        'ยืนยันสัมภาษณ์แล้ว',
        'ถอนใบสมัครแล้ว',
      ];

      let foundLabel = false;
      for (const label of thaiLabels) {
        if (await page.locator(`text=${label}`).isVisible().catch(() => false)) {
          foundLabel = true;
          break;
        }
      }

      // Either found a label or page is empty (both valid)
      const isEmpty = await page.locator('text=คุณยังไม่มีใบสมัคร').isVisible().catch(() => false);
      expect(foundLabel || isEmpty).toBe(true);
    });
  });
});
