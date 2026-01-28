/**
 * @fileoverview Tests for TransactionList component
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.2 Transaction History
 *
 * Requirements tested:
 * - WALLET-R01.list.display: Display list of transactions
 * - WALLET-R01.list.empty: Show empty state
 * - WALLET-R01.list.loading: Show loading state
 * - WALLET-R01.list.pagination: Support load more
 * - WALLET-R01.list.header: Show section header
 */

import { describe, it, expect, vi } from "vitest";
import { render, screen, fireEvent } from "@testing-library/react";

// Import the component to test (will fail until implemented)
// import { TransactionList } from "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList";

describe("TransactionList", () => {
  const mockTransactions = [
    {
      transactionId: "tx-1",
      transactionOwner: "system",
      transactionOrigin: "first_interview_reward",
      transactionType: "deposit",
      transactionAmount: 100,
      transactionCurrency: "coin",
      transactionTime: 1704067200000,
      remark: "รางวัลสัมภาษณ์ครั้งแรก",
    },
    {
      transactionId: "tx-2",
      transactionOwner: "system",
      transactionOrigin: "signup_reward",
      transactionType: "deposit",
      transactionAmount: 100,
      transactionCurrency: "coin",
      transactionTime: 1703980800000,
      remark: "โบนัสสมัครสมาชิก",
    },
  ];

  const defaultProps = {
    transactions: mockTransactions,
    isLoading: false,
    isLoadingMore: false,
    hasMore: false,
    onLoadMore: vi.fn(),
  };

  describe("Rendering", () => {
    /**
     * Requirement: WALLET-R01.list.display
     * "Render transaction list"
     */
    it("should render transaction list", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} />);

      expect(screen.getByTestId("transaction-list")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.display
     * "Render all transactions"
     */
    it("should render all transactions", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} />);

      expect(screen.getByTestId("transaction-item-tx-1")).toBeInTheDocument();
      expect(screen.getByTestId("transaction-item-tx-2")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.header
     * "Show section header"
     */
    it("should show section header", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} />);

      expect(
        screen.getByText(/ประวัติธุรกรรม|Transaction History/i)
      ).toBeInTheDocument();
    });
  });

  describe("Empty State", () => {
    /**
     * Requirement: WALLET-R01.list.empty
     * "Show empty state when no transactions"
     */
    it("should show empty state when no transactions", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} transactions={[]} />);

      expect(screen.getByTestId("transaction-list-empty")).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.empty
     * "Show appropriate empty message"
     */
    it("should show empty message", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} transactions={[]} />);

      expect(
        screen.getByText(/ยังไม่มีธุรกรรม|No transactions/i)
      ).toBeInTheDocument();
    });
  });

  describe("Loading State", () => {
    /**
     * Requirement: WALLET-R01.list.loading
     * "Show loading skeleton on initial load"
     */
    it("should show skeleton when loading", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(
        <TransactionList {...defaultProps} transactions={[]} isLoading={true} />
      );

      expect(
        screen.getByTestId("transaction-list-skeleton")
      ).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.loading
     * "Show spinner when loading more"
     */
    it("should show spinner when loading more", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} isLoadingMore={true} />);

      expect(screen.getByTestId("loading-more-spinner")).toBeInTheDocument();
    });
  });

  describe("Pagination", () => {
    /**
     * Requirement: WALLET-R01.list.pagination
     * "Show load more button when hasMore"
     */
    it("should show load more button when hasMore", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} hasMore={true} />);

      expect(screen.getByRole("button", { name: /ดูเพิ่มเติม|Load More/i })).toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.pagination
     * "Hide load more button when no more"
     */
    it("should hide load more button when no more", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} hasMore={false} />);

      expect(
        screen.queryByRole("button", { name: /ดูเพิ่มเติม|Load More/i })
      ).not.toBeInTheDocument();
    });

    /**
     * Requirement: WALLET-R01.list.pagination
     * "Call onLoadMore when button clicked"
     */
    it("should call onLoadMore when button clicked", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      const mockLoadMore = vi.fn();
      render(
        <TransactionList
          {...defaultProps}
          hasMore={true}
          onLoadMore={mockLoadMore}
        />
      );

      fireEvent.click(screen.getByRole("button", { name: /ดูเพิ่มเติม|Load More/i }));

      expect(mockLoadMore).toHaveBeenCalled();
    });

    /**
     * Requirement: WALLET-R01.list.pagination
     * "Disable button while loading more"
     */
    it("should disable button while loading more", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(
        <TransactionList
          {...defaultProps}
          hasMore={true}
          isLoadingMore={true}
        />
      );

      const button = screen.getByRole("button", { name: /ดูเพิ่มเติม|Load More|กำลังโหลด/i });
      expect(button).toBeDisabled();
    });
  });

  describe("Currency Tab Integration", () => {
    /**
     * Requirement: WALLET-R01.list.tabs
     * "Receive current currency from parent"
     */
    it("should render transactions for current currency", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(
        <TransactionList
          {...defaultProps}
          transactions={mockTransactions.filter(
            (tx) => tx.transactionCurrency === "coin"
          )}
        />
      );

      expect(screen.getByTestId("transaction-item-tx-1")).toBeInTheDocument();
    });
  });

  describe("Accessibility", () => {
    /**
     * Requirement: WALLET-R01.a11y
     * "List should have proper ARIA attributes"
     */
    it("should have proper ARIA role", async () => {
      const { TransactionList } = await import(
        "@/app/jobsmarket/candidates/[id]/wallet/_components/TransactionList"
      );

      render(<TransactionList {...defaultProps} />);

      expect(screen.getByRole("list")).toBeInTheDocument();
    });
  });
});
