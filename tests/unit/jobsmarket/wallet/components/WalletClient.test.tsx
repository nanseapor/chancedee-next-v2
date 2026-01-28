/**
 * @fileoverview Tests for WalletClient component
 * @specification WALLET-R01 Wallet Page
 * @section §3 Main Wallet View
 *
 * Requirements tested:
 * - WALLET-R01.client.auth: Require authentication
 * - WALLET-R01.client.layout: Display all sections
 * - WALLET-R01.client.tabs: Currency tab switching
 * - WALLET-R01.client.loading: Handle loading state
 * - WALLET-R01.client.error: Handle error state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { render, screen, fireEvent, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

// Mock dependencies
vi.mock("@/hooks/jobsmarket/use-candidate-auth", () => ({
  useCandidateAuth: vi.fn(),
}));

vi.mock("@/hooks/jobsmarket/wallet/use-wallet-balance", () => ({
  useWalletBalance: vi.fn(),
}));

vi.mock("@/hooks/jobsmarket/wallet/use-transaction-history", () => ({
  useTransactionHistory: vi.fn(),
}));

vi.mock("@/hooks/jobsmarket/wallet/use-reward-status", () => ({
  useRewardStatus: vi.fn(),
}));

// Import the component to test (will fail until implemented)
// import { WalletClient } from "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient";

describe("WalletClient", () => {
  const mockCandidateId = "candidate-123";

  const mockAuthReady = {
    state: "ready",
    isLoading: false,
    user: { uid: "user-123", candidateId: mockCandidateId },
  };

  const mockAuthLoading = {
    state: "loading",
    isLoading: true,
    user: null,
  };

  const mockBalance = {
    coinBalance: 250,
    starBalance: 50,
    formattedCoinBalance: "250",
    formattedStarBalance: "50",
    isLoading: false,
    error: null,
    refetch: vi.fn(),
  };

  const mockTransactions = {
    transactions: [
      {
        transactionId: "tx-1",
        transactionOrigin: "first_interview_reward",
        transactionType: "deposit",
        transactionAmount: 100,
        transactionCurrency: "coin",
        transactionTime: Date.now(),
        remark: "รางวัลสัมภาษณ์ครั้งแรก",
      },
    ],
    hasMore: false,
    isLoading: false,
    isLoadingMore: false,
    isEmpty: false,
    loadMore: vi.fn(),
  };

  const mockRewardStatus = {
    firstInterviewReward: { claimed: true, amount: 100 },
    firstApplicationReward: { claimed: false, amount: 100 },
    signupReward: { claimed: true, amount: 100 },
    referralReward: { claimed: false, available: true, amount: 100 },
    allRewards: [],
    isLoading: false,
    error: null,
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Authentication", () => {
    /**
     * Requirement: WALLET-R01.client.auth
     * "Show loading while authenticating"
     */
    it("should show loading while authenticating", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthLoading);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByTestId("wallet-loading")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.client.auth
     * "Show content when authenticated"
     */
    it("should show content when authenticated", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByTestId("wallet-content")).toBeInTheDocument();
    });
  });

  describe("Layout", () => {
    /**
     * Requirement: WALLET-R01.client.layout
     * "Display balance cards section"
     */
    it("should display balance cards", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByTestId("balance-cards-section")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.client.layout
     * "Display ways to earn section"
     */
    it("should display ways to earn section", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByTestId("ways-to-earn")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.client.layout
     * "Display transaction history section"
     */
    it("should display transaction history section", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByTestId("transaction-history-section")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.client.layout
     * "Display page title"
     */
    it("should display page title", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByText(/กระเป๋าเงิน|Wallet/i)).toBeInTheDocument();
    });
  });

  describe("Currency Tabs", () => {
    /**
     * Requirement: WALLET-R01.client.tabs
     * "Display currency tabs"
     */
    it("should display coin and star tabs", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByRole("tab", { name: /เหรียญ|Coins/i })).toBeInTheDocument();
      expect(screen.getByRole("tab", { name: /ดาว|Stars/i })).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.client.tabs
     * "Default to coin tab"
     */
    it("should default to coin tab", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      const coinTab = screen.getByRole("tab", { name: /เหรียญ|Coins/i });
      expect(coinTab).toHaveAttribute("aria-selected", "true");
    });

    /**
     * Requirement: WALLET-R01.client.tabs
     * "Switch to star tab on click"
     */
    it("should switch to star tab on click", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue(mockBalance);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      const user = userEvent.setup();
      render(<WalletClient candidateId={mockCandidateId} />);

      const starTab = screen.getByRole("tab", { name: /ดาว|Stars/i });
      await user.click(starTab);

      await waitFor(() => {
        expect(starTab).toHaveAttribute("aria-selected", "true");
      });
    });
  });

  describe("Error State", () => {
    /**
     * Requirement: WALLET-R01.client.error
     * "Show error when balance fetch fails"
     */
    it("should show error when balance fetch fails", async () => {
      const { useCandidateAuth } = await import(
        "@/hooks/jobsmarket/use-candidate-auth"
      );
      vi.mocked(useCandidateAuth).mockReturnValue(mockAuthReady);

      const { useWalletBalance } = await import(
        "@/hooks/jobsmarket/wallet/use-wallet-balance"
      );
      vi.mocked(useWalletBalance).mockReturnValue({
        ...mockBalance,
        error: new Error("Failed to load"),
      });

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );
      vi.mocked(useTransactionHistory).mockReturnValue(mockTransactions);

      const { useRewardStatus } = await import(
        "@/hooks/jobsmarket/wallet/use-reward-status"
      );
      vi.mocked(useRewardStatus).mockReturnValue(mockRewardStatus);

      const { WalletClient } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/WalletClient"
      );

      render(<WalletClient candidateId={mockCandidateId} />);

      expect(screen.getByText(/เกิดข้อผิดพลาด|Error/i)).toBeInTheDocument();
    });
  });
});
