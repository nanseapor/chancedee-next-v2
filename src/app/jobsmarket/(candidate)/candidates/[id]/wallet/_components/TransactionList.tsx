"use client";

/**
 * Transaction List Component
 *
 * @specification WALLET-R01 §3.2.2
 * Displays a paginated list of transactions
 */

import { Loader2 } from "lucide-react";
import { TransactionItem } from "./TransactionItem";
import { Button } from "@/components/ui/button";

interface Transaction {
  transactionId: string;
  transactionOwner: string;
  transactionOrigin: string;
  transactionType: string;
  transactionAmount: number;
  transactionCurrency: string;
  transactionTime: number;
  remark?: string;
}

interface TransactionListProps {
  transactions: Transaction[];
  isLoading: boolean;
  isLoadingMore: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
}

export function TransactionList({
  transactions,
  isLoading,
  isLoadingMore,
  hasMore,
  onLoadMore,
}: TransactionListProps) {
  // Loading skeleton
  if (isLoading && transactions.length === 0) {
    return (
      <div data-testid="transaction-history-section" className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ประวัติธุรกรรม
        </h2>
        <div
          data-testid="transaction-list-skeleton"
          className="space-y-3"
        >
          {[1, 2, 3].map((i) => (
            <div key={i} className="flex items-center gap-3 animate-pulse">
              <div className="h-10 w-10 rounded-full bg-gray-200" />
              <div className="flex-1 space-y-2">
                <div className="h-4 w-1/2 rounded bg-gray-200" />
                <div className="h-3 w-1/3 rounded bg-gray-200" />
              </div>
              <div className="h-6 w-16 rounded bg-gray-200" />
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Empty state
  if (!isLoading && transactions.length === 0) {
    return (
      <div data-testid="transaction-history-section" className="mt-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-4">
          ประวัติธุรกรรม
        </h2>
        <div
          data-testid="transaction-list-empty"
          className="text-center py-8 text-gray-500"
        >
          <p>ยังไม่มีธุรกรรม</p>
        </div>
      </div>
    );
  }

  return (
    <div data-testid="transaction-history-section" className="mt-6">
      <h2 className="text-lg font-semibold text-gray-800 mb-4">
        ประวัติธุรกรรม
      </h2>
      <div
        data-testid="transaction-list"
        role="list"
        className="rounded-lg border border-gray-200 bg-white p-4"
      >
        {transactions.map((tx) => (
          <TransactionItem key={tx.transactionId} transaction={tx} />
        ))}

        {/* Loading more spinner */}
        {isLoadingMore && (
          <div
            data-testid="loading-more-spinner"
            className="flex justify-center py-4"
          >
            <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
          </div>
        )}

        {/* Load more button */}
        {hasMore && (
          <div className="mt-4 text-center">
            <Button
              variant="outline"
              onClick={onLoadMore}
              disabled={isLoadingMore}
            >
              {isLoadingMore ? "กำลังโหลด..." : "ดูเพิ่มเติม"}
            </Button>
          </div>
        )}
      </div>
    </div>
  );
}
