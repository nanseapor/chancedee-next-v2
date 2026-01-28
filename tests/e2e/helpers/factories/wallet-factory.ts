/**
 * Wallet Factory for E2E Tests
 *
 * Creates wallet transactions and pockets for testing wallet features.
 *
 * @example
 * // Create wallet with transactions
 * const wallet = await createWalletScenario({
 *   candidateId: 'candidate-123',
 *   coinBalance: 250,
 *   transactions: [
 *     { origin: 'first_interview_reward', amount: 100 },
 *     { origin: 'signup_reward', amount: 100 },
 *   ],
 * });
 */

import { generateTestId, testDb, now, toTimestamp, docRef, Timestamp } from "../firebase-admin-test";

export interface WalletTransaction {
  origin: string;
  type?: "deposit" | "withdraw";
  amount: number;
  currency?: "coin" | "star";
  remark?: string;
  createdAt?: number;
}

export interface CreateWalletScenarioOptions {
  candidateId: string;
  coinBalance?: number;
  starBalance?: number;
  transactions?: WalletTransaction[];
}

export interface WalletScenarioResult {
  candidateId: string;
  coinPocketId: string;
  starPocketId: string;
  coinBalance: number;
  starBalance: number;
  transactionIds: string[];
}

/**
 * Creates a complete wallet scenario with pockets and transactions
 */
export async function createWalletScenario(
  options: CreateWalletScenarioOptions
): Promise<WalletScenarioResult> {
  const {
    candidateId,
    coinBalance = 0,
    starBalance = 0,
    transactions = [],
  } = options;

  const transactionIds: string[] = [];
  const actorRef = testDb.collection("user_accounts").doc(candidateId);

  // Create coin pocket
  const coinPocketId = candidateId;
  await testDb.collection("coin").doc(coinPocketId).set({
    uid: coinPocketId,
    currency: "coin",
    balance: coinBalance,
    latest: [],
    created_by: actorRef,
    created_at: now(),
    updated_by: actorRef,
    updated_at: now(),
  });

  // Create star pocket
  const starPocketId = candidateId;
  await testDb.collection("star").doc(starPocketId).set({
    uid: starPocketId,
    currency: "star",
    balance: starBalance,
    latest: [],
    created_by: actorRef,
    created_at: now(),
    updated_by: actorRef,
    updated_at: now(),
  });

  // Create transactions
  for (const tx of transactions) {
    const txId = generateTestId("tx");
    // Calculate transaction time: use provided timestamp or current time minus offset
    const transactionTimeMs = tx.createdAt || Date.now() - transactionIds.length * 60000; // 1 minute apart
    const transactionTime = toTimestamp(new Date(transactionTimeMs));

    await testDb.collection("wallet_transactions").doc(txId).set({
      uid: txId,
      transaction_owner: "chancedee",
      transaction_receiver: candidateId,
      transaction_origin: tx.origin,
      transaction_type: tx.type || "deposit",
      transaction_amount: tx.amount,
      transaction_currency: tx.currency || "coin",
      transaction_time: transactionTime,
      remark: tx.remark || "",
      created_by: actorRef,
      created_at: now(),
      updated_by: actorRef,
      updated_at: now(),
    });

    transactionIds.push(txId);
  }

  // Update pocket with latest transaction IDs
  if (transactionIds.length > 0) {
    const latestTxIds = transactionIds.slice(0, 10);
    await testDb.collection("coin").doc(coinPocketId).update({
      latest: latestTxIds,
    });
  }

  // Update candidate_information with reward flags based on transactions
  const rewardFlags: Record<string, boolean> = {};
  for (const tx of transactions) {
    if (tx.origin === "first_interview_reward") {
      rewardFlags.isFirstInterviewerRewarded = true;
    }
    if (tx.origin === "first_application_reward") {
      rewardFlags.isFirstApplicantionRewarded = true;
    }
  }
  if (Object.keys(rewardFlags).length > 0) {
    // Use set with merge to ensure the flags are added even if document exists
    await testDb.collection("candidate_information").doc(candidateId).set(rewardFlags, { merge: true });
  }

  return {
    candidateId,
    coinPocketId,
    starPocketId,
    coinBalance,
    starBalance,
    transactionIds,
  };
}

/**
 * Pre-defined wallet scenarios
 */
export const WalletScenarios = {
  /**
   * New user with no transactions
   */
  empty: async (candidateId: string) =>
    createWalletScenario({
      candidateId,
      coinBalance: 0,
      starBalance: 0,
      transactions: [],
    }),

  /**
   * User who just signed up and confirmed first interview
   */
  withFirstInterviewReward: async (candidateId: string) =>
    createWalletScenario({
      candidateId,
      coinBalance: 200,
      starBalance: 0,
      transactions: [
        { origin: "first_interview_reward", amount: 100 },
        { origin: "signup_reward", amount: 100 },
      ],
    }),

  /**
   * Active user with multiple transactions
   */
  active: async (candidateId: string) =>
    createWalletScenario({
      candidateId,
      coinBalance: 350,
      starBalance: 25,
      transactions: [
        { origin: "first_interview_reward", amount: 100 },
        { origin: "signup_reward", amount: 100 },
        { origin: "first_application_reward", amount: 100 },
        { origin: "referral_received", amount: 50 },
      ],
    }),

  /**
   * User with many transactions for pagination testing
   */
  withManyTransactions: async (candidateId: string) => {
    const transactions: WalletTransaction[] = [];
    for (let i = 0; i < 30; i++) {
      transactions.push({
        origin: i % 2 === 0 ? "referral_received" : "first_application_reward",
        amount: 100,
        createdAt: Date.now() - i * 86400000, // 1 day apart
      });
    }
    return createWalletScenario({
      candidateId,
      coinBalance: 3000,
      starBalance: 0,
      transactions,
    });
  },
};

/**
 * Cleanup wallet data for a candidate
 */
export async function cleanupWalletData(candidateId: string): Promise<void> {
  // Delete pockets
  await testDb.collection("coin").doc(candidateId).delete().catch(() => {});
  await testDb.collection("star").doc(candidateId).delete().catch(() => {});

  // Delete transactions (search by receiver)
  const transactionsSnapshot = await testDb
    .collection("wallet_transactions")
    .where("transaction_receiver", "==", candidateId)
    .get();

  const batch = testDb.batch();
  transactionsSnapshot.docs.forEach((doc) => {
    batch.delete(doc.ref);
  });
  await batch.commit();
}
