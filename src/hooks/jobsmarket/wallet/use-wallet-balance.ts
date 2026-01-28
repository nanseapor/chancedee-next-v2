"use client";

/**
 * Hook for fetching and managing wallet balance
 *
 * @specification WALLET-R01
 * @section §3.2.1 Balance Display
 *
 * Features:
 * - Fetches both coin and star balances
 * - Provides formatted values with commas
 * - Handles loading and error states
 * - Provides refetch function
 */

import { useState, useEffect, useCallback } from "react";
import { webPocketsGetBothById } from "@/lib/database/actions/pockets-batch";

interface UseWalletBalanceReturn {
  coinBalance: number;
  starBalance: number;
  formattedCoinBalance: string;
  formattedStarBalance: string;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

/**
 * Format number with commas
 */
function formatWithCommas(num: number): string {
  return num.toLocaleString("en-US");
}

/**
 * Hook to fetch and display wallet balance
 *
 * @param userId - The user ID to fetch balance for, or null to skip fetching
 * @returns Balance data with loading/error states
 */
export function useWalletBalance(
  userId: string | null
): UseWalletBalanceReturn {
  const [coinBalance, setCoinBalance] = useState(0);
  const [starBalance, setStarBalance] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!userId) {
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const result = await webPocketsGetBothById(userId);
      setCoinBalance(result.coin?.balance ?? 0);
      setStarBalance(result.star?.balance ?? 0);
    } catch (e) {
      const err = e instanceof Error ? e : new Error("Failed to fetch balance");
      setError(err);
      setCoinBalance(0);
      setStarBalance(0);
    } finally {
      setIsLoading(false);
    }
  }, [userId]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    coinBalance,
    starBalance,
    formattedCoinBalance: formatWithCommas(coinBalance),
    formattedStarBalance: formatWithCommas(starBalance),
    isLoading,
    error,
    refetch: fetchBalance,
  };
}
