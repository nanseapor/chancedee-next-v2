/**
 * @fileoverview Tests for useTransactionHistory hook
 * @specification WALLET-R01 Wallet Page
 * @section §3.2.2 Transaction History
 *
 * Requirements tested:
 * - WALLET-R01.history.fetch: Fetch transaction history
 * - WALLET-R01.history.pagination: Support infinite scroll pagination
 * - WALLET-R01.history.currency: Filter by currency
 * - WALLET-R01.history.loading: Handle loading states
 * - WALLET-R01.history.error: Handle error state
 */

import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { renderHook, waitFor, act } from "@testing-library/react";

// Mock dependencies
vi.mock("@/lib/database/actions/wallet-transactions", () => ({
  getTransactionHistoryPaginated: vi.fn(),
}));

// Import the hook to test (will fail until implemented)
// import { useTransactionHistory } from "@/hooks/jobsmarket/wallet/use-transaction-history";

describe("useTransactionHistory", () => {
  const mockUserId = "user-123";

  const mockTransactionsPage1 = {
    transactions: [
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
    ],
    hasMore: true,
    lastVisible: "tx-2",
  };

  const mockTransactionsPage2 = {
    transactions: [
      {
        transactionId: "tx-3",
        transactionOwner: "system",
        transactionOrigin: "first_application_reward",
        transactionType: "deposit",
        transactionAmount: 100,
        transactionCurrency: "coin",
        transactionTime: 1703894400000,
        remark: "รางวัลสมัครงานครั้งแรก",
      },
    ],
    hasMore: false,
    lastVisible: "tx-3",
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe("Initialization", () => {
    /**
     * Requirement: WALLET-R01.history.loading
     * "Show loading state on initial fetch"
     */
    it("should start in loading state", async () => {
      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      expect(result.current.isLoading).toBe(true);
    });

    /**
     * Requirement: WALLET-R01.history.fetch
     * "Fetch history on mount"
     */
    it("should fetch transaction history on mount", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      renderHook(() => useTransactionHistory(mockUserId, "coin"));

      await waitFor(() => {
        expect(getTransactionHistoryPaginated).toHaveBeenCalledWith({
          userId: mockUserId,
          currency: "coin",
          limit: 20,
          startAfter: undefined,
        });
      });
    });

    /**
     * Requirement: WALLET-R01.history.fetch
     * "Do not fetch if userId is null"
     */
    it("should not fetch if userId is null", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      renderHook(() => useTransactionHistory(null, "coin"));

      expect(getTransactionHistoryPaginated).not.toHaveBeenCalled();
    });
  });

  describe("Transaction Data", () => {
    /**
     * Requirement: WALLET-R01.history.fetch
     * "Return transactions array"
     */
    it("should return transactions after fetch", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
        expect(result.current.transactions[0].transactionId).toBe("tx-1");
      });
    });

    /**
     * Requirement: WALLET-R01.history.fetch
     * "Return hasMore flag"
     */
    it("should return hasMore flag", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });
    });
  });

  describe("Pagination", () => {
    /**
     * Requirement: WALLET-R01.history.pagination
     * "Provide loadMore function"
     */
    it("should provide loadMore function", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(typeof result.current.loadMore).toBe("function");
      });
    });

    /**
     * Requirement: WALLET-R01.history.pagination
     * "Load more transactions with cursor"
     */
    it("should append transactions on loadMore", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated)
        .mockResolvedValueOnce(mockTransactionsPage1)
        .mockResolvedValueOnce(mockTransactionsPage2);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(3);
        expect(result.current.transactions[2].transactionId).toBe("tx-3");
      });
    });

    /**
     * Requirement: WALLET-R01.history.pagination
     * "Use cursor for pagination"
     */
    it("should use lastVisible as cursor for loadMore", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated)
        .mockResolvedValueOnce(mockTransactionsPage1)
        .mockResolvedValueOnce(mockTransactionsPage2);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      expect(getTransactionHistoryPaginated).toHaveBeenLastCalledWith({
        userId: mockUserId,
        currency: "coin",
        limit: 20,
        startAfter: "tx-2",
      });
    });

    /**
     * Requirement: WALLET-R01.history.pagination
     * "Update hasMore after loading more"
     */
    it("should update hasMore to false when no more results", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated)
        .mockResolvedValueOnce(mockTransactionsPage1)
        .mockResolvedValueOnce(mockTransactionsPage2);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.hasMore).toBe(true);
      });

      await act(async () => {
        await result.current.loadMore();
      });

      await waitFor(() => {
        expect(result.current.hasMore).toBe(false);
      });
    });

    /**
     * Requirement: WALLET-R01.history.pagination
     * "isLoadingMore during loadMore"
     */
    it("should set isLoadingMore during loadMore", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );

      let resolveSecondCall: (value: typeof mockTransactionsPage2) => void;
      const secondCallPromise = new Promise<typeof mockTransactionsPage2>(
        (resolve) => {
          resolveSecondCall = resolve;
        }
      );

      vi.mocked(getTransactionHistoryPaginated)
        .mockResolvedValueOnce(mockTransactionsPage1)
        .mockReturnValueOnce(secondCallPromise);

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
      });

      act(() => {
        result.current.loadMore();
      });

      expect(result.current.isLoadingMore).toBe(true);

      await act(async () => {
        resolveSecondCall!(mockTransactionsPage2);
      });

      await waitFor(() => {
        expect(result.current.isLoadingMore).toBe(false);
      });
    });
  });

  describe("Currency Filter", () => {
    /**
     * Requirement: WALLET-R01.history.currency
     * "Filter by coin currency"
     */
    it("should filter by coin currency", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      renderHook(() => useTransactionHistory(mockUserId, "coin"));

      await waitFor(() => {
        expect(getTransactionHistoryPaginated).toHaveBeenCalledWith(
          expect.objectContaining({ currency: "coin" })
        );
      });
    });

    /**
     * Requirement: WALLET-R01.history.currency
     * "Filter by star currency"
     */
    it("should filter by star currency", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue({
        transactions: [],
        hasMore: false,
        lastVisible: null,
      });

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      renderHook(() => useTransactionHistory(mockUserId, "star"));

      await waitFor(() => {
        expect(getTransactionHistoryPaginated).toHaveBeenCalledWith(
          expect.objectContaining({ currency: "star" })
        );
      });
    });

    /**
     * Requirement: WALLET-R01.history.currency
     * "Reset on currency change"
     */
    it("should reset transactions when currency changes", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result, rerender } = renderHook(
        ({ currency }) => useTransactionHistory(mockUserId, currency),
        { initialProps: { currency: "coin" as const } }
      );

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(2);
      });

      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue({
        transactions: [],
        hasMore: false,
        lastVisible: null,
      });

      rerender({ currency: "star" });

      await waitFor(() => {
        expect(result.current.transactions).toHaveLength(0);
      });
    });
  });

  describe("Loading States", () => {
    /**
     * Requirement: WALLET-R01.history.loading
     * "isLoading becomes false after fetch"
     */
    it("should set isLoading to false after successful fetch", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue(
        mockTransactionsPage1
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.isLoading).toBe(false);
      });
    });
  });

  describe("Error Handling", () => {
    /**
     * Requirement: WALLET-R01.history.error
     * "Handle fetch error"
     */
    it("should set error on fetch failure", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockRejectedValue(
        new Error("Network error")
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.error).toBeTruthy();
      });
    });

    /**
     * Requirement: WALLET-R01.history.error
     * "Return empty array on error"
     */
    it("should return empty transactions on error", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockRejectedValue(
        new Error("Network error")
      );

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toEqual([]);
      });
    });
  });

  describe("Empty State", () => {
    /**
     * Requirement: WALLET-R01.history.fetch
     * "Handle empty history"
     */
    it("should handle empty transaction history", async () => {
      const { getTransactionHistoryPaginated } = await import(
        "@/lib/database/actions/wallet-transactions"
      );
      vi.mocked(getTransactionHistoryPaginated).mockResolvedValue({
        transactions: [],
        hasMore: false,
        lastVisible: null,
      });

      const { useTransactionHistory } = await import(
        "@/hooks/jobsmarket/wallet/use-transaction-history"
      );

      const { result } = renderHook(() =>
        useTransactionHistory(mockUserId, "coin")
      );

      await waitFor(() => {
        expect(result.current.transactions).toEqual([]);
        expect(result.current.hasMore).toBe(false);
        expect(result.current.isEmpty).toBe(true);
      });
    });
  });
});
