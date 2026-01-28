"use client";

/**
 * Balance Cards Component
 *
 * @specification WALLET-R01 §3.2.1
 * Displays coin and star balance in separate cards
 */

import { Coins, Star } from "lucide-react";
import { cn } from "@/lib/utils";

interface BalanceCardsProps {
  coinBalance: number;
  starBalance: number;
  isLoading: boolean;
  error: Error | null;
}

function formatWithCommas(num: number): string {
  return num.toLocaleString("en-US");
}

export function BalanceCards({
  coinBalance,
  starBalance,
  isLoading,
  error,
}: BalanceCardsProps) {
  if (error) {
    return (
      <div
        data-testid="balance-cards-section"
        className="rounded-lg border border-red-200 bg-red-50 p-4"
      >
        <p className="text-red-600">ไม่สามารถโหลดยอดคงเหลือได้</p>
      </div>
    );
  }

  return (
    <div
      data-testid="balance-cards-section"
      className="grid grid-cols-2 gap-4"
    >
      {/* Coin Balance Card */}
      <div
        data-testid="coin-balance-card"
        aria-label={`ยอดเหรียญ ${formatWithCommas(coinBalance)}`}
        className="rounded-xl border border-amber-200 bg-gradient-to-br from-amber-50 to-amber-100 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-amber-700">
          <Coins className="h-5 w-5" />
          <span className="text-sm font-medium">เหรียญ</span>
        </div>
        {isLoading ? (
          <div
            data-testid="coin-balance-skeleton"
            className="mt-2 h-8 w-20 animate-pulse rounded bg-amber-200"
          />
        ) : (
          <p
            data-testid="coin-balance-value"
            className="mt-2 text-2xl font-semibold text-amber-800"
          >
            {formatWithCommas(coinBalance)}
          </p>
        )}
      </div>

      {/* Star Balance Card */}
      <div
        data-testid="star-balance-card"
        aria-label={`ยอดดาว ${formatWithCommas(starBalance)}`}
        className="rounded-xl border border-purple-200 bg-gradient-to-br from-purple-50 to-purple-100 p-4 shadow-sm"
      >
        <div className="flex items-center gap-2 text-purple-700">
          <Star className="h-5 w-5" />
          <span className="text-sm font-medium">ดาว</span>
        </div>
        {isLoading ? (
          <div
            data-testid="star-balance-skeleton"
            className="mt-2 h-8 w-20 animate-pulse rounded bg-purple-200"
          />
        ) : (
          <p
            data-testid="star-balance-value"
            className="mt-2 text-2xl font-semibold text-purple-800"
          >
            {formatWithCommas(starBalance)}
          </p>
        )}
      </div>
    </div>
  );
}
