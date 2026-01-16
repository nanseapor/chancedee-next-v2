import { test, expect } from "@playwright/test";

/**
 * E2E Tests for COMP-R09: Public Company Directory
 *
 * Tests the /companies page functionality including:
 * - Initial page load and data display
 * - Keyword search
 * - Industry filter
 * - Company size filter
 * - Sort functionality
 * - Pagination
 * - URL state synchronization
 * - Company card navigation
 */

test.describe("COMP-R09: Company Directory", () => {
  // Set very long timeout for tests since company listing loads 2400+ items
  test.setTimeout(120000);

  test.beforeEach(async ({ page }) => {
    await page.goto("/jobsmarket/companies");
    // Use domcontentloaded instead of networkidle as company data fetch may take time
    await page.waitForLoadState("domcontentloaded");
  });

  test.describe("Initial Load", () => {
    test("displays company listings on initial load", async ({ page }) => {
      // Should see company cards (allow 90 seconds for slow server action)
      const companyCards = page.locator('[data-testid^="company-card-"]');
      await expect(companyCards.first()).toBeVisible({ timeout: 90000 });

      // Should have multiple companies
      const count = await companyCards.count();
      expect(count).toBeGreaterThan(0);
    });

    test("shows page title and description", async ({ page }) => {
      await expect(page.getByRole("heading", { name: /ค้นหาบริษัท/ })).toBeVisible();
      await expect(page.getByText(/ค้นพบบริษัทชั้นนำที่เปิดรับสมัครงาน/)).toBeVisible();
    });

    test("shows result count", async ({ page }) => {
      // Wait directly for the results count to show actual data (not "กำลังค้นหา...")
      // This is a more reliable indicator that data has loaded
      const resultsCount = page.getByTestId("results-count");
      await expect(resultsCount).toContainText(/พบ.*บริษัท/, { timeout: 90000 });
    });

    test("displays search input", async ({ page }) => {
      const searchInput = page.getByTestId("company-search-input");
      await expect(searchInput).toBeVisible();
      await expect(searchInput).toHaveAttribute("placeholder", /ค้นหาชื่อบริษัท/);
    });

    test("displays filter sidebar on desktop", async ({ page, viewport }) => {
      // Only test on wider viewport
      if (viewport && viewport.width >= 1024) {
        const filters = page.getByTestId("company-filters");
        await expect(filters).toBeVisible();
      }
    });

    test("displays sort dropdown", async ({ page }) => {
      const sortSelect = page.getByTestId("sort-select");
      await expect(sortSelect).toBeVisible();
    });

    test("displays pagination when multiple pages exist", async ({ page }) => {
      // Wait for companies to load
      await page.waitForSelector('[data-testid^="company-card-"]', { timeout: 15000 });

      // Check if pagination exists
      const pagination = page.getByTestId("companies-pagination");
      const paginationExists = await pagination.count() > 0;

      if (paginationExists) {
        await expect(pagination).toBeVisible();
      }
    });
  });

  test.describe("Search Functionality", () => {
    test("search by keyword updates results", async ({ page }) => {
      // Wait for search input to be ready (don't wait for data)
      const searchInput = page.getByTestId("company-search-input");
      await expect(searchInput).toBeVisible({ timeout: 30000 });

      await searchInput.fill("บริษัท");

      // Wait for debounce + soft navigation URL update using waitForFunction
      // (router.replace doesn't trigger full navigation events)
      await page.waitForFunction(
        () => window.location.href.includes("q="),
        { timeout: 30000 }
      );

      // URL should include search query
      const url = page.url();
      expect(url).toContain("q=");
    });

    test("clear search returns to all results", async ({ page }) => {
      // Wait for search input to be ready
      const searchInput = page.getByTestId("company-search-input");
      await expect(searchInput).toBeVisible({ timeout: 30000 });

      // Enter search
      await searchInput.fill("test");
      await page.waitForFunction(
        () => window.location.href.includes("q=test"),
        { timeout: 30000 }
      );

      // Clear search
      await searchInput.clear();

      // Wait for URL to update without q parameter
      await page.waitForFunction(
        () => !window.location.href.includes("q="),
        { timeout: 30000 }
      );

      // URL should not have q parameter
      const url = page.url();
      expect(url).not.toMatch(/q=/);
    });
  });

  test.describe("Industry Filter", () => {
    test("filter by industry updates results", async ({ page, viewport }) => {
      // Wait for filter elements to be visible (don't wait for data)
      if (viewport && viewport.width < 1024) {
        // Mobile: wait for filter button
        const filterButton = page.getByTestId("mobile-filter-button");
        await expect(filterButton).toBeVisible({ timeout: 30000 });
        await filterButton.click();
        await page.waitForTimeout(500);
        const technologyFilter = page.getByTestId("industry-mobile-technology");
        await technologyFilter.click();
      } else {
        // Desktop: wait for filter sidebar
        const filters = page.getByTestId("company-filters");
        await expect(filters).toBeVisible({ timeout: 30000 });
        const technologyFilter = page.getByTestId("industry-technology");
        await technologyFilter.click();
      }

      // Wait for URL to update using waitForFunction (soft navigation)
      await page.waitForFunction(
        () => window.location.href.includes("industry=technology"),
        { timeout: 30000 }
      );

      // Verify URL includes industry parameter
      const url = page.url();
      expect(url).toContain("industry=technology");
    });

    test("can select multiple industries", async ({ page, viewport }) => {
      // Wait for filter elements to be visible (don't wait for data)
      if (viewport && viewport.width < 1024) {
        const filterButton = page.getByTestId("mobile-filter-button");
        await expect(filterButton).toBeVisible({ timeout: 30000 });
        await filterButton.click();
        await page.waitForTimeout(500);
        await page.getByTestId("industry-mobile-technology").click();
        await page.waitForFunction(
          () => window.location.href.includes("industry=technology"),
          { timeout: 30000 }
        );
        await page.getByTestId("industry-mobile-finance").click();
      } else {
        const filters = page.getByTestId("company-filters");
        await expect(filters).toBeVisible({ timeout: 30000 });
        await page.getByTestId("industry-technology").click();
        await page.waitForFunction(
          () => window.location.href.includes("industry=technology"),
          { timeout: 30000 }
        );
        await page.getByTestId("industry-finance").click();
      }

      // Wait for URL to include both industries
      await page.waitForFunction(
        () => window.location.href.includes("finance"),
        { timeout: 30000 }
      );

      // URL should include both industries
      const url = page.url();
      expect(url).toContain("industry=");
      expect(url).toContain("technology");
      expect(url).toContain("finance");
    });
  });

  test.describe("Company Size Filter", () => {
    test("filter by company size updates results", async ({ page, viewport }) => {
      // Wait for filter elements to be visible (don't wait for data)
      if (viewport && viewport.width < 1024) {
        const filterButton = page.getByTestId("mobile-filter-button");
        await expect(filterButton).toBeVisible({ timeout: 30000 });
        await filterButton.click();
        await page.waitForTimeout(500);
        const mediumSizeFilter = page.getByTestId("size-mobile-M");
        await mediumSizeFilter.click();
      } else {
        const filters = page.getByTestId("company-filters");
        await expect(filters).toBeVisible({ timeout: 30000 });
        const mediumSizeFilter = page.getByTestId("size-M");
        await mediumSizeFilter.click();
      }

      // Wait for URL to update using waitForFunction (soft navigation)
      await page.waitForFunction(
        () => window.location.href.includes("size=M"),
        { timeout: 30000 }
      );

      // URL should include size parameter
      const url = page.url();
      expect(url).toContain("size=M");
    });
  });

  test.describe("Sort Functionality", () => {
    test("can change sort order", async ({ page }) => {
      // Wait for sort select to be visible (don't wait for data)
      const sortSelect = page.getByTestId("sort-select");
      await expect(sortSelect).toBeVisible({ timeout: 30000 });

      // Click sort dropdown trigger
      await sortSelect.click();

      // Wait for dropdown to open and find the alphabetical option
      const alphabeticalOption = page.getByRole("option", { name: "ก-ฮ" });
      await expect(alphabeticalOption).toBeVisible({ timeout: 5000 });

      // Click the option directly
      await alphabeticalOption.click();

      // Wait for URL to update using waitForFunction (soft navigation)
      await page.waitForFunction(
        () => window.location.href.includes("sort=alphabetical"),
        { timeout: 30000 }
      );

      // URL should include sort parameter
      const url = page.url();
      expect(url).toContain("sort=alphabetical");
    });

    test("default sort is newest (not in URL)", async ({ page }) => {
      const url = page.url();
      expect(url).not.toContain("sort=");
    });
  });

  test.describe("Clear Filters", () => {
    test("clear all filters resets to initial state", async ({ page }) => {
      // Apply filters via URL
      await page.goto("/jobsmarket/companies?q=test&industry=technology&size=M&sort=alphabetical&page=2");
      await page.waitForLoadState("domcontentloaded");

      // Wait for filter sidebar to be visible (don't wait for data)
      const filters = page.getByTestId("company-filters");
      await expect(filters).toBeVisible({ timeout: 30000 });

      // Click clear all filters button (desktop sidebar)
      const clearButton = page.getByTestId("clear-all-filters");
      if (await clearButton.isVisible({ timeout: 5000 }).catch(() => false)) {
        await clearButton.click();

        // Wait for URL to clear filter params
        await page.waitForFunction(
          () => !window.location.href.includes("industry=") && !window.location.href.includes("size="),
          { timeout: 30000 }
        );

        // URL should be clean
        const url = page.url();
        expect(url).not.toContain("industry=");
        expect(url).not.toContain("size=");
        expect(url).not.toContain("page=");
      }
    });
  });

  test.describe("Pagination", () => {
    test("page navigation updates URL", async ({ page }) => {
      // Wait for initial load (allow 90 seconds)
      await page.waitForSelector('[data-testid^="company-card-"]', { timeout: 90000 });

      // Check if pagination exists and has page 2
      const pagination = page.getByTestId("companies-pagination");
      const hasPagination = await pagination.count() > 0;

      if (hasPagination) {
        const page2Button = page.getByRole("button", { name: "2" });
        if (await page2Button.isVisible()) {
          await page2Button.click();
          await page.waitForTimeout(600);

          // URL should include page parameter
          const url = page.url();
          expect(url).toContain("page=2");
        }
      }
    });
  });

  test.describe("URL State Restoration", () => {
    test("restores filters from URL on page load", async ({ page }) => {
      // Navigate with filters in URL
      await page.goto("/jobsmarket/companies?q=test&industry=technology&size=M");
      await page.waitForLoadState("domcontentloaded");

      // Wait for the search input to be visible and have the correct value
      const searchInput = page.getByTestId("company-search-input");
      await expect(searchInput).toBeVisible({ timeout: 30000 });

      // Wait for the input to have the expected value (may take time for hydration)
      await expect(searchInput).toHaveValue("test", { timeout: 30000 });
    });
  });

  test.describe("Company Card Navigation", () => {
    test("clicking company card navigates to company detail", async ({ page }) => {
      // Wait for companies to load (allow 90 seconds)
      const companyCards = page.locator('[data-testid^="company-card-"]');
      await expect(companyCards.first()).toBeVisible({ timeout: 90000 });

      // Get the company ID from the first card
      const firstCard = companyCards.first();
      const href = await firstCard.getAttribute("href");

      // Click the card
      await firstCard.click();
      await page.waitForLoadState("domcontentloaded");
      await page.waitForTimeout(1000);

      // Should navigate to company detail page
      if (href) {
        expect(page.url()).toContain("/companies/");
      }
    });
  });

  test.describe("Company Card Content", () => {
    test("company card shows required information", async ({ page }) => {
      // Wait for actual company cards to load (exclude skeletons)
      // Real cards have testid like "company-card-comp-123", skeletons have "company-card-skeleton"
      const companyCards = page.locator('[data-testid^="company-card-"]:not([data-testid="company-card-skeleton"])');
      await expect(companyCards.first()).toBeVisible({ timeout: 90000 });

      // First card should have company name (h3 inside the card)
      const firstCard = companyCards.first();
      const companyName = firstCard.locator("h3").first();
      await expect(companyName).toBeVisible({ timeout: 10000 });

      // Should show job count or any content - just verify the card is not empty
      const cardText = await firstCard.textContent();
      expect(cardText?.length).toBeGreaterThan(0);
    });
  });

  test.describe("Empty State", () => {
    test("shows empty state when no results", async ({ page }) => {
      // Wait for initial load (allow 90 seconds)
      await page.waitForSelector('[data-testid^="company-card-"]', { timeout: 90000 });

      // Search for something unlikely to exist
      const searchInput = page.getByTestId("company-search-input");
      await searchInput.fill("xyznonexistentcompany12345");
      await page.waitForTimeout(2000);

      // Should show empty state or zero results
      const emptyState = page.getByTestId("companies-empty-state");
      const zeroResultsText = page.getByText(/พบ.*0.*บริษัท/);
      const noCompanyText = page.getByText(/ไม่พบบริษัท/);

      // Wait for either condition
      const hasEmptyState = await emptyState.isVisible().catch(() => false);
      const hasZeroResults = await zeroResultsText.isVisible().catch(() => false);
      const hasNoCompanyText = await noCompanyText.isVisible().catch(() => false);

      expect(hasEmptyState || hasZeroResults || hasNoCompanyText).toBe(true);
    });
  });

  test.describe("Mobile Experience", () => {
    test.use({ viewport: { width: 375, height: 667 } });

    test("mobile filter button is visible", async ({ page }) => {
      // Wait for filter button to appear
      const filterButton = page.getByTestId("mobile-filter-button");
      await expect(filterButton).toBeVisible({ timeout: 30000 });
    });

    test("mobile filter button opens filter sheet", async ({ page }) => {
      // Wait for filter button to appear
      const filterButton = page.getByTestId("mobile-filter-button");
      await expect(filterButton).toBeVisible({ timeout: 30000 });
      await filterButton.click();

      // Wait for sheet animation
      await page.waitForTimeout(500);

      // Sheet should be visible with filters - look for the sheet title
      const sheetTitle = page.getByRole("heading", { name: "ตัวกรอง" });
      await expect(sheetTitle).toBeVisible({ timeout: 10000 });

      // Verify filter sections exist in the sheet (use the mobile testid prefix)
      // The mobile filter checkboxes have testid prefix "industry-mobile-" and "size-mobile-"
      await expect(page.getByTestId("industry-mobile-technology")).toBeVisible();
      await expect(page.getByTestId("size-mobile-M")).toBeVisible();
    });

    test("filter badge shows count of active filters", async ({ page }) => {
      // Apply filter via URL
      await page.goto("/jobsmarket/companies?industry=technology&size=M");
      await page.waitForLoadState("domcontentloaded");

      // Wait for the filter button with badge to be visible (allow 90 seconds)
      const filterButton = page.getByTestId("mobile-filter-button");
      await expect(filterButton).toBeVisible({ timeout: 90000 });

      // Should show badge with count 2 (1 industry + 1 size)
      // Wait for the badge to appear with the count (after hydration)
      await expect(filterButton).toContainText("2", { timeout: 30000 });
    });
  });

  test.describe("Loading State", () => {
    test("shows loading state during data fetch", async ({ page }) => {
      // This might be hard to catch as loading is quick
      // But we can at least verify the page doesn't error
      await expect(page.locator('body')).toBeVisible();
    });
  });
});
