/**
 * Wallet Rewards Types
 * Extracted from wallet-rewards.ts for Next.js 15+ compatibility
 */

/**
 * Result type for reward actions
 */
export interface AwardRewardResult {
  success: boolean;
  alreadyAwarded?: boolean;
  transactionId?: string;
  error?: "INVALID_USER_ID" | "NETWORK_ERROR" | "USER_NOT_FOUND";
}
