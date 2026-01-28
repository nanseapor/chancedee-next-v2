"use client";

/**
 * Transaction Item Component
 *
 * @specification WALLET-R01 §3.2.2
 * Displays a single transaction in the transaction history
 */

import { Coins, Star } from "lucide-react";
import { cn } from "@/lib/utils";

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

interface TransactionItemProps {
  transaction: Transaction;
}

// Transaction origin label mapping
const ORIGIN_LABELS: Record<string, string> = {
  first_interview_reward: "รางวัลสัมภาษณ์ครั้งแรก",
  signup_reward: "โบนัสสมัครสมาชิก",
  first_application_reward: "รางวัลสมัครงานครั้งแรก",
  referral_received: "รางวัลแนะนำเพื่อน",
  admin_withdraw: "การหักเหรียญ",
  admin_deposit: "เหรียญจากผู้ดูแล",
};

function formatWithCommas(num: number): string {
  return num.toLocaleString("en-US");
}

function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;

  const minutes = Math.floor(diff / 60000);
  const hours = Math.floor(diff / 3600000);
  const days = Math.floor(diff / 86400000);

  if (minutes < 60) {
    return `${minutes} นาทีที่แล้ว`;
  } else if (hours < 24) {
    return `${hours} ชั่วโมงที่แล้ว`;
  } else if (days < 7) {
    return `${days} วันที่แล้ว`;
  } else {
    // Format as Thai date
    return new Date(timestamp).toLocaleDateString("th-TH", {
      year: "numeric",
      month: "short",
      day: "numeric",
    });
  }
}

export function TransactionItem({ transaction }: TransactionItemProps) {
  const {
    transactionId,
    transactionOrigin,
    transactionType,
    transactionAmount,
    transactionCurrency,
    transactionTime,
    remark,
  } = transaction;

  const isDeposit = transactionType === "deposit";
  const sign = isDeposit ? "+" : "-";
  const formattedAmount = `${sign}${formatWithCommas(transactionAmount)}`;
  const originLabel = ORIGIN_LABELS[transactionOrigin] || transactionOrigin;
  const formattedDate = formatRelativeTime(transactionTime);

  const CurrencyIcon = transactionCurrency === "coin" ? Coins : Star;

  return (
    <div
      data-testid={`transaction-item-${transactionId}`}
      className="flex items-center justify-between py-3 border-b border-gray-100 last:border-b-0"
    >
      <div className="flex items-center gap-3">
        {/* Currency Icon */}
        <div
          data-testid="transaction-currency-icon"
          data-currency={transactionCurrency}
          className={cn(
            "flex h-10 w-10 items-center justify-center rounded-full",
            transactionCurrency === "coin"
              ? "bg-amber-100 text-amber-600"
              : "bg-purple-100 text-purple-600"
          )}
        >
          <CurrencyIcon className="h-5 w-5" />
        </div>

        {/* Transaction Details */}
        <div>
          <p className="font-medium text-gray-800">{originLabel}</p>
          {remark && (
            <p className="text-sm text-gray-500">{remark}</p>
          )}
          <p
            data-testid="transaction-date"
            className="text-xs text-gray-400"
          >
            {formattedDate}
          </p>
        </div>
      </div>

      {/* Amount */}
      <div
        data-testid="transaction-amount"
        className={cn(
          "text-lg font-semibold",
          isDeposit ? "text-green-600" : "text-red-600"
        )}
      >
        {formattedAmount}
      </div>
    </div>
  );
}
