/**
 * @fileoverview E2E Tests for Public Company Profile Page
 * @specification BLS-02 Discovery Stage - viewCompanyProfile, viewCompanyJobs
 * @section §3.6 & §3.7
 *
 * Test scenarios from BLS-02:
 * - DISC-032: Valid company - displays profile
 * - DISC-033: Not found - 404 page
 * - DISC-034: Pending company - 404 page
 * - DISC-035: Has open jobs - jobs section shown
 * - DISC-036: No open jobs - empty state
 * - DISC-037: Click job - navigate to job detail
 */

import { test, expect } from "@playwright/test";
import {
  setupTestCompany,
  cleanupTestCompany,
} from "../../helpers/factories/company-factory";

test.describe("Public Company Profile - BLS-02", () => {
  /**
   * DISC-032: Valid company - displays profile
   * "Company profile page should display for approved companies"
   */
  test("should display company profile for approved company", async ({
    page,
  }) => {
    // Create an approved company
    const { companyId, cleanup } = await setupTestCompany({
      status: "approved",
      isActive: true,
    });

    try {
      await page.goto(`/jobsmarket/companies/${companyId}`);

      // Wait for page to load
      await expect(page.getByTestId("company-header")).toBeVisible({
        timeout: 10000,
      });

      // Verify company information is displayed
      await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
      await expect(page.getByTestId("company-about")).toBeVisible();
      await expect(page.getByTestId("company-contact")).toBeVisible();
    } finally {
      await cleanup();
    }
  });

  /**
   * DISC-033: Not found - 404 page
   * "Should show 404 for non-existent company"
   */
  test("should show 404 for non-existent company", async ({ page }) => {
    await page.goto("/jobsmarket/companies/nonexistent-company-id-12345");

    // Should show 404 or not found message
    await expect(
      page.getByText(/ไม่พบบริษัท|Company not found|404/i)
    ).toBeVisible({ timeout: 10000 });
  });

  /**
   * DISC-034: Pending company - 404 page
   * "Should show 404 for pending company"
   */
  test("should show 404 for pending company", async ({ page }) => {
    // Create a pending company
    const { companyId, cleanup } = await setupTestCompany({
      status: "pending",
      isActive: true,
    });

    try {
      await page.goto(`/jobsmarket/companies/${companyId}`);

      // Should show 404 or not found
      await expect(
        page.getByText(/ไม่พบบริษัท|Company not found|404/i)
      ).toBeVisible({ timeout: 10000 });
    } finally {
      await cleanup();
    }
  });

  /**
   * DISC-035: Has open jobs - jobs section shown
   * "Should display open positions when company has jobs"
   */
  test("should display open positions for company with jobs", async ({
    page,
  }) => {
    // Create company with jobs
    const { companyId, cleanup } = await setupTestCompany({
      status: "approved",
      isActive: true,
      withJobs: true,
      jobCount: 3,
    });

    try {
      await page.goto(`/jobsmarket/companies/${companyId}`);

      // Wait for page and jobs to load
      await expect(page.getByTestId("company-open-positions")).toBeVisible({
        timeout: 10000,
      });

      // Verify jobs count is shown
      await expect(page.getByText(/3.*ตำแหน่ง/)).toBeVisible();

      // Verify job cards are displayed
      const jobCards = page.getByTestId("job-card");
      await expect(jobCards.first()).toBeVisible();
      expect(await jobCards.count()).toBe(3);
    } finally {
      await cleanup();
    }
  });

  /**
   * DISC-036: No open jobs - empty state
   * "Should show empty state when no open positions"
   */
  test("should show empty state when company has no jobs", async ({ page }) => {
    // Create company without jobs
    const { companyId, cleanup } = await setupTestCompany({
      status: "approved",
      isActive: true,
      withJobs: false,
    });

    try {
      await page.goto(`/jobsmarket/companies/${companyId}`);

      // Wait for page to load
      await expect(page.getByTestId("company-open-positions")).toBeVisible({
        timeout: 10000,
      });

      // Should show empty state message
      await expect(
        page.getByText(/ยังไม่มีตำแหน่งเปิดรับ|No open positions/i)
      ).toBeVisible();
    } finally {
      await cleanup();
    }
  });

  /**
   * DISC-037: Click job - navigate to job detail
   * "Should navigate to job detail when clicking job card"
   */
  test("should navigate to job detail when clicking job card", async ({
    page,
  }) => {
    // Create company with jobs
    const { companyId, jobIds, cleanup } = await setupTestCompany({
      status: "approved",
      isActive: true,
      withJobs: true,
      jobCount: 1,
    });

    try {
      await page.goto(`/jobsmarket/companies/${companyId}`);

      // Wait for job card to be visible
      const jobCard = page.getByTestId("job-card").first();
      await expect(jobCard).toBeVisible({ timeout: 10000 });

      // Click on job card
      await jobCard.click();

      // Should navigate to job detail page
      await expect(page).toHaveURL(/\/jobsmarket\/jobs\//);
    } finally {
      await cleanup();
    }
  });

  test.describe("Company Header", () => {
    test("should display company logo", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        hasLogo: true,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-header")).toBeVisible({
          timeout: 10000,
        });

        // Logo should be visible
        const logo = page.getByTestId("company-logo");
        await expect(logo).toBeVisible();
      } finally {
        await cleanup();
      }
    });

    test("should display verified badge for approved company", async ({
      page,
    }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-header")).toBeVisible({
          timeout: 10000,
        });

        // Verified badge should be visible
        await expect(page.getByTestId("verified-badge")).toBeVisible();
      } finally {
        await cleanup();
      }
    });

    test("should display company industry", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        industry: "เทคโนโลยี",
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-header")).toBeVisible({
          timeout: 10000,
        });

        await expect(page.getByText("เทคโนโลยี")).toBeVisible();
      } finally {
        await cleanup();
      }
    });
  });

  test.describe("Navigation from Job Detail", () => {
    test("should load company profile from job detail page link", async ({
      page,
    }) => {
      const { companyId, jobIds, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        withJobs: true,
        jobCount: 1,
      });

      try {
        // Go to job detail page first
        await page.goto(`/jobsmarket/jobs/${jobIds[0]}`);

        // Wait for job detail to load
        await expect(page.getByTestId("job-detail")).toBeVisible({
          timeout: 10000,
        });

        // Click on company name link
        const companyLink = page.getByRole("link", {
          name: /View company profile/i,
        });
        await companyLink.click();

        // Should navigate to company profile
        await expect(page).toHaveURL(`/jobsmarket/companies/${companyId}`);
        await expect(page.getByTestId("company-header")).toBeVisible();
      } finally {
        await cleanup();
      }
    });
  });

  test.describe("Contact Section", () => {
    test("should display website link", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        website: "https://example.com",
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-contact")).toBeVisible({
          timeout: 10000,
        });

        // Website link should be visible
        const websiteLink = page.getByRole("link", { name: /example\.com/i });
        await expect(websiteLink).toBeVisible();
        await expect(websiteLink).toHaveAttribute("target", "_blank");
      } finally {
        await cleanup();
      }
    });

    test("should display company location", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        address: {
          province: "กรุงเทพมหานคร",
          district: "วัฒนา",
        },
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-contact")).toBeVisible({
          timeout: 10000,
        });

        // Address should be visible
        await expect(page.getByText(/กรุงเทพมหานคร/)).toBeVisible();
      } finally {
        await cleanup();
      }
    });
  });

  test.describe("View All Jobs", () => {
    test("should show View All link when more than 6 jobs", async ({
      page,
    }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        withJobs: true,
        jobCount: 8,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-open-positions")).toBeVisible({
          timeout: 10000,
        });

        // View All link should be visible
        const viewAllLink = page.getByRole("link", {
          name: /ดูทั้งหมด|View All/i,
        });
        await expect(viewAllLink).toBeVisible();

        // Click View All
        await viewAllLink.click();

        // Should navigate to jobs page with company filter
        await expect(page).toHaveURL(
          new RegExp(`/jobsmarket/jobs.*company=${companyId}`)
        );
      } finally {
        await cleanup();
      }
    });

    test("should not show View All when 6 or fewer jobs", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: true,
        withJobs: true,
        jobCount: 5,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        await expect(page.getByTestId("company-open-positions")).toBeVisible({
          timeout: 10000,
        });

        // View All link should NOT be visible
        const viewAllLink = page.getByRole("link", {
          name: /ดูทั้งหมด|View All/i,
        });
        await expect(viewAllLink).not.toBeVisible();
      } finally {
        await cleanup();
      }
    });
  });

  test.describe("Error States", () => {
    test("should handle suspended company", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "suspended",
        isActive: true,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        // Should show 404 or not found
        await expect(
          page.getByText(/ไม่พบบริษัท|Company not found|404/i)
        ).toBeVisible({ timeout: 10000 });
      } finally {
        await cleanup();
      }
    });

    test("should handle inactive company", async ({ page }) => {
      const { companyId, cleanup } = await setupTestCompany({
        status: "approved",
        isActive: false,
      });

      try {
        await page.goto(`/jobsmarket/companies/${companyId}`);

        // Should show 404 or not found
        await expect(
          page.getByText(/ไม่พบบริษัท|Company not found|404/i)
        ).toBeVisible({ timeout: 10000 });
      } finally {
        await cleanup();
      }
    });
  });
});
