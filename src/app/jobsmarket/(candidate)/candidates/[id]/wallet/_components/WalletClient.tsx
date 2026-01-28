"use client";

/**
 * Wallet Client Component
 *
 * @specification WALLET-R01 §3
 * Main wallet page client component that combines all sections
 */

import { useState } from "react";
import { useCandidateAuth } from "@/hooks/jobsmarket/use-candidate-auth";
import { useWalletBalance } from "@/hooks/jobsmarket/wallet/use-wallet-balance";
import { useTransactionHistory } from "@/hooks/jobsmarket/wallet/use-transaction-history";
import { useRewardStatus } from "@/hooks/jobsmarket/wallet/use-reward-status";
import { BalanceCards } from "./BalanceCards";
import { TransactionList } from "./TransactionList";
import { WaysToEarn } from "./WaysToEarn";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Loader2 } from "lucide-react";

interface WalletClientProps {
  candidateId: string;
}

export function WalletClient({ candidateId }: WalletClientProps) {
  const [currency, setCurrency] = useState<"coin" | "star">("coin");
  // Wallet page doesn't need onboarding enforcement - dashboard handles that redirect
  const auth = useCandidateAuth(candidateId, false);

  // Fetch wallet data
  const {
    coinBalance,
    starBalance,
    isLoading: isLoadingBalance,
    error: balanceError,
  } = useWalletBalance(candidateId);

  const {
    transactions,
    hasMore,
    isLoading: isLoadingTransactions,
    isLoadingMore,
    loadMore,
  } = useTransactionHistory(candidateId, currency);

  const {
    allRewards,
    isLoading: isLoadingRewards,
  } = useRewardStatus(candidateId);

  // Auth loading state
  if (auth.state === "loading" || auth.isLoading) {
    return (
      <div data-testid="wallet-loading" className="flex justify-center py-12">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  // Balance error state
  if (balanceError) {
    return (
      <div data-testid="wallet-content" className="p-4">
        <h1 className="text-2xl font-semibold text-gray-800 mb-6">
          กระเป๋าเงิน
        </h1>
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-600">
          เกิดข้อผิดพลาดในการโหลดข้อมูลกระเป๋าเงิน
        </div>
      </div>
    );
  }

  return (
    <div data-testid="wallet-content" className="p-4 max-w-2xl mx-auto">
      {/* Page Title */}
      <h1 className="text-2xl font-semibold text-gray-800 mb-6">
        กระเป๋าเงิน
      </h1>

      {/* Balance Cards Section */}
      <BalanceCards
        coinBalance={coinBalance}
        starBalance={starBalance}
        isLoading={isLoadingBalance}
        error={balanceError}
      />

      {/* Ways to Earn Section */}
      <WaysToEarn rewards={allRewards} isLoading={isLoadingRewards} />

      {/* Currency Tabs */}
      <div className="mt-6">
        <Tabs
          value={currency}
          onValueChange={(value) => setCurrency(value as "coin" | "star")}
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="coin">เหรียญ</TabsTrigger>
            <TabsTrigger value="star">ดาว</TabsTrigger>
          </TabsList>

          <TabsContent value="coin">
            <TransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </TabsContent>

          <TabsContent value="star">
            <TransactionList
              transactions={transactions}
              isLoading={isLoadingTransactions}
              isLoadingMore={isLoadingMore}
              hasMore={hasMore}
              onLoadMore={loadMore}
            />
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
