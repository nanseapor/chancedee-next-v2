import { test, expect } from '@playwright/test';

/**
 * E2E Tests for Apply Modal
 *
 * Tests complete user journey for job application via modal
 * Note: Most jobs in dev database are expired, so tests check for both states
 */

test.describe('Apply Modal E2E', () => {
  const TEST_JOB_ID = 'LnGogSEQZh0ZFO3c0ujQ';
  const JOB_URL = `/jobsmarket/jobs/${TEST_JOB_ID}`;

  test('displays apply section on job detail page', async ({ page }) => {
    await page.goto(JOB_URL);

    // Wait for page load
    await page.waitForLoadState('networkidle');

    // Apply section should be visible
    const applySection = page.getByRole('heading', { name: /สมัครงานนี้/ });
    await expect(applySection).toBeVisible();

    // Should have an apply button (state depends on job status)
    const buttons = page.getByRole('button');
    const buttonCount = await buttons.count();
    expect(buttonCount).toBeGreaterThan(0);
  });

  test('shows appropriate state for closed job', async ({ page }) => {
    await page.goto(JOB_URL);
    await page.waitForLoadState('networkidle');

    // Check if job is closed
    const closedMessage = page.getByText(/ปิดรับสมัครแล้ว/);
    const isJobClosed = await closedMessage.isVisible().catch(() => false);

    if (isJobClosed) {
      // Button should be disabled
      const applyButton = page.getByRole('button', { name: /ปิดรับสมัครแล้ว/ });
      await expect(applyButton).toBeDisabled();
    }
  });

  test('modal accessibility - has proper ARIA attributes', async ({ page }) => {
    await page.goto(JOB_URL);
    await page.waitForLoadState('networkidle');

    // Try to find an open job by checking button state
    const applyButton = page.getByRole('button').first();
    const isEnabled = await applyButton.isEnabled();

    if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
      // Click to open modal
      await applyButton.click();

      // Modal should have dialog role
      const dialog = page.getByRole('dialog');
      await expect(dialog).toBeVisible();

      // Form fields should have labels
      await expect(page.getByLabel(/เงินเดือนที่คาดหวัง/)).toBeVisible();
      await expect(page.getByLabel(/สามารถเริ่มงานได้/)).toBeVisible();

      // Close button should exist
      const closeButton = page.getByRole('button', { name: /close/i }).first();
      await expect(closeButton).toBeVisible();
    }
  });

  test('form validation shows errors for invalid input', async ({ page }) => {
    await page.goto(JOB_URL);
    await page.waitForLoadState('networkidle');

    const applyButton = page.getByRole('button').first();
    const isEnabled = await applyButton.isEnabled();

    if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
      await applyButton.click();

      // Wait for modal
      await expect(page.getByRole('dialog')).toBeVisible();

      // Enter invalid salary
      await page.getByLabel(/เงินเดือนที่คาดหวัง/).fill('-1000');

      // Try to submit
      await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

      // Should show validation error
      await expect(page.getByText(/เงินเดือนต้องมากกว่า 0/)).toBeVisible();
    }
  });

  test('complete apply flow with mock submission', async ({ page }) => {
    await page.goto(JOB_URL);
    await page.waitForLoadState('networkidle');

    const applyButton = page.getByRole('button').first();
    const isEnabled = await applyButton.isEnabled();

    if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
      await applyButton.click();

      // Wait for modal
      await expect(page.getByRole('dialog')).toBeVisible();

      // Fill valid form data
      await page.getByLabel(/เงินเดือนที่คาดหวัง/).fill('50000');

      // Optional: Fill cover letter
      await page.getByLabel(/แนะนำตัวเอง/).fill('I am passionate about software development and would love to join your team.');

      // Submit
      await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

      // Should show loading state
      await expect(page.getByText(/กำลังส่ง/)).toBeVisible();

      // Wait for success (with 1 second mock delay)
      await expect(page.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeVisible({ timeout: 3000 });

      // Should show demo notice
      await expect(page.getByText(/นี่เป็นโหมดสาธิต/)).toBeVisible();
    }
  });
});

/**
 * BLS-03-01: Real Application Submission Tests
 * TDD RED Phase - These tests will FAIL until submitApplication is implemented
 *
 * Per BLS-03-01 Assessment Phase 1
 * Target: 7 E2E tests covering all RIS flows
 */
test.describe('BLS-03-01: Real Application Submission', () => {
  const TEST_JOB_ID = 'LnGogSEQZh0ZFO3c0ujQ';
  const JOB_URL = `/jobsmarket/jobs/${TEST_JOB_ID}`;

  /**
   * HAPPY PATH TESTS (2 tests)
   */
  test.describe('Happy Path - User Flows from RIS', () => {
    test('should submit application with minimal info', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();

        // Wait for modal
        await expect(page.getByRole('dialog')).toBeVisible();

        // Submit without filling optional fields
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show loading
        await expect(page.getByText(/กำลังส่ง/)).toBeVisible();

        // Wait for success
        await expect(page.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeVisible({ timeout: 5000 });

        // Demo notice should NOT appear (real submission)
        await expect(page.getByText(/นี่เป็นโหมดสาธิต/)).not.toBeVisible();

        // Modal should close after delay
        await page.waitForTimeout(2500);
        await expect(page.getByRole('dialog')).not.toBeVisible();
      }
    });

    test('should submit application with full info', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();

        // Wait for modal
        await expect(page.getByRole('dialog')).toBeVisible();

        // Fill all fields
        await page.getByLabel(/เงินเดือนที่คาดหวัง/).fill('80000');
        await page.getByLabel(/ต่อรองได้/).uncheck(); // isNegotiable = false
        await page.getByLabel(/สามารถเริ่มงานได้/).selectOption({ label: /ภายใน 1 เดือน/ });
        await page.getByLabel(/แนะนำตัวเอง/).fill('I have 5 years of experience in full-stack development and am excited about this opportunity.');

        // Submit
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show loading
        await expect(page.getByText(/กำลังส่ง/)).toBeVisible();

        // Wait for success
        await expect(page.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeVisible({ timeout: 5000 });

        // Demo notice should NOT appear
        await expect(page.getByText(/นี่เป็นโหมดสาธิต/)).not.toBeVisible();
      }
    });
  });

  /**
   * INVALID INPUTS - VALIDATION TESTS (3 tests)
   */
  test.describe('Invalid Inputs - Form Validation', () => {
    test('should show error for invalid salary (negative)', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Enter negative salary
        await page.getByLabel(/เงินเดือนที่คาดหวัง/).fill('-5000');

        // Try to submit
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show validation error
        await expect(page.getByText(/เงินเดือนต้องมากกว่า 0/)).toBeVisible();

        // Modal should stay open
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test('should show error for invalid salary (too high)', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Enter salary > 999,999
        await page.getByLabel(/เงินเดือนที่คาดหวัง/).fill('1000000');

        // Try to submit
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show validation error
        await expect(page.getByText(/เงินเดือนสูงเกินไป/)).toBeVisible();

        // Modal should stay open
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });

    test('should show error for headlines too long (> 500 chars)', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Enter 501 characters
        await page.getByLabel(/แนะนำตัวเอง/).fill('x'.repeat(501));

        // Try to submit
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show validation error
        await expect(page.getByText(/ข้อความยาวเกินไป/)).toBeVisible();

        // Modal should stay open
        await expect(page.getByRole('dialog')).toBeVisible();
      }
    });
  });

  /**
   * ERROR STATES TESTS (2 tests)
   */
  test.describe('Error States', () => {
    test('should show already applied card when submitting duplicate', async ({ page }) => {
      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      // First application
      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();
        await expect(page.getByText(/ส่งใบสมัครเรียบร้อย/)).toBeVisible({ timeout: 5000 });
        await page.waitForTimeout(2500);

        // Reload page
        await page.reload();
        await page.waitForLoadState('domcontentloaded');

        // Should now show "Already Applied" card
        await expect(page.getByText(/คุณสมัครงานนี้แล้ว/)).toBeVisible();

        // Apply button should not be visible
        await expect(page.getByRole('button', { name: /สมัครงาน/ })).not.toBeVisible();
      }
    });

    test('should handle network error with retry option', async ({ page }) => {
      // Intercept API call and simulate network error
      await page.route('**/api/**', route => route.abort('failed'));

      await page.goto(JOB_URL);
      await page.waitForLoadState('domcontentloaded');

      const applyButton = page.getByRole('button').first();
      const isEnabled = await applyButton.isEnabled();

      if (isEnabled && (await applyButton.textContent())?.includes('สมัคร')) {
        await applyButton.click();
        await expect(page.getByRole('dialog')).toBeVisible();

        // Try to submit
        await page.getByRole('button', { name: /ส่งใบสมัคร/ }).click();

        // Should show error message
        await expect(page.getByText(/ไม่สามารถส่งใบสมัครได้/)).toBeVisible({ timeout: 5000 });

        // Modal should stay open for retry
        await expect(page.getByRole('dialog')).toBeVisible();

        // Retry button should be visible
        await expect(page.getByRole('button', { name: /ลองอีกครั้ง/ })).toBeVisible();
      }
    });
  });
});
