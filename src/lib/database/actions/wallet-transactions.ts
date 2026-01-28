"use server";

import { Filter, Query } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/firebase/admin-auth";
import { transactionType } from "@/types/wallet.types";
import { walletTransactionsRepository } from "../repositories/wallet-transactions-repository";
import { FirebaseCurrencyType, FirebaseWalletTransactionType } from "../schemas/wallet-transactions.schema";
import type {
  GetTransactionHistoryInput,
  TransactionWithCurrency,
  GetTransactionHistoryResult,
} from "./wallet-transactions.types";

// Re-export types for consumers
export type {
  GetTransactionHistoryInput,
  TransactionWithCurrency,
  GetTransactionHistoryResult,
} from "./wallet-transactions.types";

const webWalletTransactionGetById = async (uid: string) => {
  try {
    return await walletTransactionsRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * CUSTOM PAGINATION LOGIC - Kept separate from repository
 *
 * This function has custom pagination with lastVisible cursor
 * and wallet-specific filtering that doesn't fit standard repository pattern.
 *
 * Uses direct Firestore access for custom query logic.
 */
const webWalletTransactionGetByFilter = async (
  walletId: string,
  currency: FirebaseCurrencyType,
  filter?: Filter,
  lastVisible?: string,
  limit?: number
) => {
  try {
    let WalletTransactionQuery = getFirebaseAdminFirestore()
      .collection("wallet_transactions")
      .where("transaction_receiver", "==", walletId) as Query;

    if (filter) {
      WalletTransactionQuery = WalletTransactionQuery.where(filter);
    }

    if (currency) {
      WalletTransactionQuery = WalletTransactionQuery.where(
        "transaction_currency",
        "==",
        currency
      );
    }

    if (limit) {
      WalletTransactionQuery = WalletTransactionQuery.limit(limit);
    }

    if (lastVisible) {
      const lastDoc = await getFirebaseAdminFirestore()
        .collection("wallet_transactions")
        .doc(lastVisible)
        .get();
      WalletTransactionQuery = WalletTransactionQuery.startAfter(lastDoc);
    }

    const WalletTransactionSnap = await WalletTransactionQuery.get();

    if (!WalletTransactionSnap.empty) {
      const lists = WalletTransactionSnap.docs.map((doc) => {
        const firebaseWalletTransaction = doc.data() as FirebaseWalletTransactionType;
        const data: transactionType = {
          transactionId: doc.id,
          transactionOwner: firebaseWalletTransaction.transaction_owner,
          transactionOrigin: firebaseWalletTransaction.transaction_origin,
          transactionType: firebaseWalletTransaction.transaction_type,
          transactionAmount: firebaseWalletTransaction.transaction_amount,
          transactionTime: firebaseWalletTransaction.transaction_time.toMillis(),
          remark: firebaseWalletTransaction.remark
        };
        return data;
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Create wallet transaction with custom parameters
 *
 * This function has wallet-specific parameters (walletId, currency)
 * that need special handling beyond standard repository pattern.
 *
 * Kept as custom implementation to preserve the specific API.
 */
const webWalletTransactionCreate = async (
  payload: transactionType,
  walletId: string,
  currency: FirebaseCurrencyType,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(walletId);
    const WalletTransactionRef = uid
      ? getFirebaseAdminFirestore().collection("wallet_transactions").doc(uid)
      : getFirebaseAdminFirestore().collection("wallet_transactions").doc();

    const dataToWrite: FirebaseWalletTransactionType = {
      transaction_owner: payload.transactionOwner,
      transaction_receiver: walletId,
      transaction_origin: payload.transactionOrigin,
      transaction_type: payload.transactionType,
      transaction_amount: payload.transactionAmount,
      transaction_currency: currency,
      transaction_time: new Date(payload.transactionTime) as any,
      remark: payload.remark || "",
      uid: WalletTransactionRef.id,
      created_by: actorRef,
      created_at: new Date() as any,
      updated_by: actorRef,
      updated_at: new Date() as any
    };

    await WalletTransactionRef.set(dataToWrite, { merge: true });
    return WalletTransactionRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Get paginated transaction history for a user's wallet
 *
 * @specification BLS-10-02
 * - User must be authenticated
 * - User must be wallet owner
 * - Returns transactions ordered by time DESC
 * - Supports cursor-based pagination
 */
const getTransactionHistoryPaginated = async (
  input: GetTransactionHistoryInput
): Promise<GetTransactionHistoryResult> => {
  const { userId, currency, limit: inputLimit, startAfter } = input;

  // Default limit is 20, max is 100
  const DEFAULT_LIMIT = 20;
  const MAX_LIMIT = 100;

  // Validate currency
  if (currency !== "coin" && currency !== "star") {
    throw new Error("INVALID_CURRENCY");
  }

  // Validate and cap limit
  let limit = inputLimit ?? DEFAULT_LIMIT;
  if (limit < 0) {
    throw new Error("INVALID_LIMIT");
  }
  if (limit > MAX_LIMIT) {
    limit = MAX_LIMIT;
  }

  // Check authentication
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  // Check ownership - user must own the wallet they're querying
  if (session.candidateId !== userId) {
    throw new Error("FORBIDDEN");
  }

  // Build query
  const db = getFirebaseAdminFirestore();
  let query: Query = db
    .collection("wallet_transactions")
    .where("transaction_receiver", "==", userId)
    .where("transaction_currency", "==", currency)
    .orderBy("transaction_time", "desc")
    .limit(limit + 1); // Fetch one extra to determine hasMore

  // Apply cursor if provided
  if (startAfter) {
    const cursorDoc = await db.collection("wallet_transactions").doc(startAfter).get();
    if (cursorDoc.exists) {
      query = query.startAfter(cursorDoc);
    }
  }

  // Execute query
  const snapshot = await query.get();

  // Map documents to response format
  const allDocs = snapshot.docs.map((doc) => {
    const data = doc.data() as FirebaseWalletTransactionType;
    return {
      transactionId: doc.id,
      transactionOwner: data.transaction_owner,
      transactionOrigin: data.transaction_origin,
      transactionType: data.transaction_type,
      transactionAmount: data.transaction_amount,
      transactionTime: data.transaction_time?.toMillis?.() ?? 0,
      transactionCurrency: data.transaction_currency,
      remark: data.remark,
    };
  });

  // Determine if there are more results
  const hasMore = allDocs.length > limit;
  const transactions = hasMore ? allDocs.slice(0, limit) : allDocs;
  const lastTransaction = transactions[transactions.length - 1];
  const lastVisible = lastTransaction ? lastTransaction.transactionId : null;

  return {
    transactions,
    hasMore,
    lastVisible,
  };
};

export {
  webWalletTransactionCreate,
  webWalletTransactionGetByFilter,
  webWalletTransactionGetById,
  getTransactionHistoryPaginated
};
