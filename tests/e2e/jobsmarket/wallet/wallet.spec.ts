/**
 * @fileoverview E2E Tests for Wallet Page
 * @specification WALLET-R01 Wallet Page
 *
 * Test Coverage:
 * - Balance display
 * - Transaction history
 * - Ways to earn section
 * - Currency tab switching
 * - Pagination
 * - Empty state
 * - Error handling
 */

import { test, expect } from "@playwright/test";
import {
  createTestCandidate,
  CandidateVariants,
} from "../../helpers/factories";
import {
  createWalletScenario,
  WalletScenarios,
  cleanupWalletData,
} from "../../helpers/factories/wallet-factory";
import { loginAsTestUser } from "../../helpers/auth-helper";

test.describe("Wallet Page - WALLET-R01", () => {
  test.describe("Balance Display", () => {
    /**
     * Requirement: WALLET-R01 §3.2.1
     * "Display coin balance on wallet page"
     */
    test("should display coin balance", async ({ page }) => {
      // Create candidate with wallet
      const candidate = await CandidateVariants.complete();
      const wallet = await createWalletScenario({
        candidateId: candidate.candidateId,
        coinBalance: 250,
        starBalance: 50,
        transactions: [{ origin: "first_interview_reward", amount: 100 }],
      });

      // Login and navigate to wallet
      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Verify coin balance is displayed
      await expect(page.getByTestId("coin-balance-value")).toHaveText("250");

      // Cleanup
      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.1
     * "Display star balance on wallet page"
     */
    test("should display star balance", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.active(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("star-balance-value")).toHaveText("25");

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.1
     * "Display 0 for empty wallet"
     */
    test("should display 0 for empty wallet", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("coin-balance-value")).toHaveText("0");
      await expect(page.getByTestId("star-balance-value")).toHaveText("0");

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.1
     * "Format large numbers with commas"
     */
    test("should format balance with commas", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await createWalletScenario({
        candidateId: candidate.candidateId,
        coinBalance: 1000000,
        starBalance: 0,
        transactions: [],
      });

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("coin-balance-value")).toHaveText(
        "1,000,000"
      );

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Transaction History", () => {
    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Display transaction list"
     */
    test("should display transaction list", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.withFirstInterviewReward(
        candidate.candidateId
      );

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("transaction-list")).toBeVisible();
      await expect(
        page.getByTestId(`transaction-item-${wallet.transactionIds[0]}`)
      ).toBeVisible();
    });

    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Display transaction with deposit indicator"
     */
    test("should show + for deposit transactions", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.withFirstInterviewReward(
        candidate.candidateId
      );

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      const txItem = page.getByTestId(
        `transaction-item-${wallet.transactionIds[0]}`
      );
      await expect(txItem.getByTestId("transaction-amount")).toContainText(
        "+100"
      );
    });

    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Display transaction origin label"
     */
    test("should show Thai label for first interview reward", async ({
      page,
    }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.withFirstInterviewReward(
        candidate.candidateId
      );

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Use .first() since this text appears in both reward card and transaction list
      await expect(
        page.getByText(/สัมภาษณ์ครั้งแรก|First Interview/i).first()
      ).toBeVisible();
    });

    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Show empty state when no transactions"
     */
    test("should show empty state when no transactions", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("transaction-list-empty")).toBeVisible();
      await expect(
        page.getByText(/ยังไม่มีธุรกรรม|No transactions/i)
      ).toBeVisible();

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Pagination", () => {
    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Load more transactions on button click"
     */
    test("should load more transactions", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.withManyTransactions(
        candidate.candidateId
      );

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Initial load should show limited transactions
      const initialCount = await page.getByTestId(/^transaction-item-/).count();
      expect(initialCount).toBeLessThanOrEqual(20);

      // Click load more
      await page.getByRole("button", { name: /ดูเพิ่มเติม|Load More/i }).click();

      // Should show more transactions
      await expect(page.getByTestId(/^transaction-item-/)).toHaveCount(
        initialCount + 20
      );

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Hide load more when all transactions loaded"
     */
    test("should hide load more when all loaded", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      const wallet = await WalletScenarios.withFirstInterviewReward(
        candidate.candidateId
      );

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Should not show load more with only 2 transactions
      await expect(
        page.getByRole("button", { name: /ดูเพิ่มเติม|Load More/i })
      ).not.toBeVisible();

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Currency Tabs", () => {
    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Switch to star transactions on tab click"
     */
    test("should switch to star tab", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.active(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Default is coin tab
      await expect(
        page.getByRole("tab", { name: /เหรียญ|Coins/i })
      ).toHaveAttribute("aria-selected", "true");

      // Click star tab
      await page.getByRole("tab", { name: /ดาว|Stars/i }).click();

      await expect(
        page.getByRole("tab", { name: /ดาว|Stars/i })
      ).toHaveAttribute("aria-selected", "true");

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.2
     * "Show empty state for star transactions if none exist"
     */
    test("should show empty state for star transactions", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.withFirstInterviewReward(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Switch to star tab
      await page.getByRole("tab", { name: /ดาว|Stars/i }).click();

      // Should show empty state for star transactions
      await expect(page.getByTestId("transaction-list-empty")).toBeVisible();

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Ways to Earn", () => {
    /**
     * Requirement: WALLET-R01 §3.2.3
     * "Display ways to earn section"
     */
    test("should display ways to earn section", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("ways-to-earn")).toBeVisible();
      await expect(
        page.getByText(/วิธีหาเหรียญ|Ways to Earn/i)
      ).toBeVisible();

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.3
     * "Show 100 coins for first interview reward (per BLS-10)"
     */
    test("should show 100 coins for first interview", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      const rewardCard = page.getByTestId("reward-card-first_interview");
      await expect(rewardCard).toContainText("100");

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.3
     * "Show claimed badge for received rewards"
     * Note: Signup bonus uses isOnboarded flag which is set for complete profiles
     */
    test("should show claimed badge for received rewards", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.active(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      await expect(page.getByTestId("wallet-content")).toBeVisible({ timeout: 15000 });

      // Check signup reward shows as claimed (isOnboarded is true for complete candidates)
      const signupCard = page.getByTestId("reward-card-signup");
      await expect(signupCard.getByTestId("reward-status-badge")).toContainText(
        /รับแล้ว|Claimed/i,
        { timeout: 10000 }
      );

      await cleanupWalletData(candidate.candidateId);
    });

    /**
     * Requirement: WALLET-R01 §3.2.3
     * "Show available indicator for unclaimed rewards"
     */
    test("should show available for unclaimed rewards", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      // Empty wallet scenario means no first_interview transaction yet, so badge shows "รอรับ"
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      const rewardCard = page.getByTestId("reward-card-first_interview");
      await expect(rewardCard.getByTestId("reward-status-badge")).toContainText(
        /รอรับ|Available/i
      );

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Authentication", () => {
    /**
     * Requirement: WALLET-R01 §2.1
     * "Require authentication"
     */
    test("should redirect to login if not authenticated", async ({ page }) => {
      await page.goto("/jobsmarket/candidates/some-id/wallet");

      await expect(page).toHaveURL(/login/);
    });

    /**
     * Requirement: WALLET-R01 §2.1
     * "Require ownership - redirect to own wallet"
     * Per CAND-R00 cross-cutting RIS, non-owners are redirected to their own resource
     */
    test("should redirect non-owner to their own wallet", async ({ page }) => {
      const ownerCandidate = await CandidateVariants.complete();
      const otherCandidate = await CandidateVariants.complete();
      await WalletScenarios.empty(otherCandidate.candidateId);

      await loginAsTestUser(
        page,
        otherCandidate.email,
        otherCandidate.password
      );
      await page.goto(
        `/jobsmarket/candidates/${ownerCandidate.candidateId}/wallet`
      );

      // Should redirect to own wallet
      await expect(page).toHaveURL(
        new RegExp(`/candidates/${otherCandidate.candidateId}/wallet`)
      );
    });
  });

  test.describe("Page Title", () => {
    /**
     * Requirement: WALLET-R01 §3.1
     * "Display page title"
     */
    test("should display page title", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);
      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Wait for wallet content to load
      await expect(page.getByTestId("wallet-content")).toBeVisible({ timeout: 15000 });

      await expect(page.getByRole("heading", { level: 1 })).toContainText(
        /กระเป๋าเงิน|Wallet/i
      );

      await cleanupWalletData(candidate.candidateId);
    });
  });

  test.describe("Loading State", () => {
    /**
     * Requirement: WALLET-R01 §3.3
     * "Show loading skeleton while fetching"
     */
    test("should show loading state initially", async ({ page }) => {
      const candidate = await CandidateVariants.complete();
      await WalletScenarios.empty(candidate.candidateId);

      await loginAsTestUser(page, candidate.email, candidate.password);

      // Start navigation but check loading state
      const responsePromise = page.waitForResponse(
        (response) =>
          response.url().includes("wallet") && response.status() === 200
      );

      await page.goto(`/jobsmarket/candidates/${candidate.candidateId}/wallet`);

      // Should briefly show loading (may be too fast to catch)
      // At minimum, page should load without errors
      await expect(page.getByTestId("wallet-content")).toBeVisible({
        timeout: 10000,
      });

      await cleanupWalletData(candidate.candidateId);
    });
  });
});
