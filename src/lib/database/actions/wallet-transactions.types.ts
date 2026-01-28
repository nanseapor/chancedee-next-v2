/**
 * Wallet Transactions Types
 * Extracted from wallet-transactions.ts for Next.js 15+ compatibility
 */

/**
 * Input type for getTransactionHistoryPaginated
 */
export interface GetTransactionHistoryInput {
  userId: string;
  currency: "coin" | "star";
  limit?: number;
  startAfter?: string;
}

/**
 * Transaction type with currency field for pagination response
 */
export interface TransactionWithCurrency {
  transactionId: string;
  transactionOwner: string;
  transactionOrigin: string;
  transactionType: string;
  transactionAmount: number;
  transactionTime: number;
  transactionCurrency: string;
  remark?: string;
}

/**
 * Response type for getTransactionHistoryPaginated
 */
export interface GetTransactionHistoryResult {
  transactions: TransactionWithCurrency[];
  hasMore: boolean;
  lastVisible: string | null;
}
