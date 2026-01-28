"use client";

/**
 * Hook for fetching and managing transaction history with pagination
 *
 * @specification WALLET-R01
 * @section §3.2.2 Transaction History
 *
 * Features:
 * - Fetches transaction history with cursor-based pagination
 * - Supports currency filtering (coin/star)
 * - Handles loading and error states
 * - Provides loadMore function for infinite scroll
 */

import { useState, useEffect, useCallback, useRef } from "react";
import {
  getTransactionHistoryPaginated,
  TransactionWithCurrency,
} from "@/lib/database/actions/wallet-transactions";

interface UseTransactionHistoryReturn {
  transactions: TransactionWithCurrency[];
  hasMore: boolean;
  isLoading: boolean;
  isLoadingMore: boolean;
  isEmpty: boolean;
  error: Error | null;
  loadMore: () => Promise<void>;
}

const PAGE_SIZE = 20;

/**
 * Hook to fetch and paginate transaction history
 *
 * @param userId - The user ID to fetch transactions for, or null to skip
 * @param currency - The currency type to filter by ("coin" or "star")
 * @returns Transaction data with pagination controls
 */
export function useTransactionHistory(
  userId: string | null,
  currency: "coin" | "star"
): UseTransactionHistoryReturn {
  const [transactions, setTransactions] = useState<TransactionWithCurrency[]>(
    []
  );
  const [hasMore, setHasMore] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const lastVisibleRef = useRef<string | null>(null);

  // Reset state when currency changes
  useEffect(() => {
    setTransactions([]);
    setHasMore(false);
    lastVisibleRef.current = null;
    setError(null);
  }, [currency]);

  // Initial fetch
  const fetchInitial = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await getTransactionHistoryPaginated({
        userId,
        currency,
        limit: PAGE_SIZE,
        startAfter: undefined,
      });

      setTransactions(result.transactions);
      setHasMore(result.hasMore);
      lastVisibleRef.current = result.lastVisible;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Failed to fetch history");
      setError(err);
      setTransactions([]);
      setHasMore(false);
    } finally {
      setIsLoading(false);
    }
  }, [userId, currency]);

  useEffect(() => {
    fetchInitial();
  }, [fetchInitial]);

  // Load more function
  const loadMore = useCallback(async () => {
    if (!userId || isLoadingMore || !hasMore) return;

    setIsLoadingMore(true);

    try {
      const result = await getTransactionHistoryPaginated({
        userId,
        currency,
        limit: PAGE_SIZE,
        startAfter: lastVisibleRef.current ?? undefined,
      });

      setTransactions((prev) => [...prev, ...result.transactions]);
      setHasMore(result.hasMore);
      lastVisibleRef.current = result.lastVisible;
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Failed to load more");
      setError(err);
    } finally {
      setIsLoadingMore(false);
    }
  }, [userId, currency, isLoadingMore, hasMore]);

  return {
    transactions,
    hasMore,
    isLoading,
    isLoadingMore,
    isEmpty: !isLoading && transactions.length === 0,
    error,
    loadMore,
  };
}
