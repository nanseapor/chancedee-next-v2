"use server";

import { Filter, Query } from "firebase-admin/firestore";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { transactionType } from "@/types/wallet.types";
import { walletTransactionsRepository } from "../repositories/wallet-transactions-repository";
import { FirebaseCurrencyType, FirebaseWalletTransactionType } from "../schemas/wallet-transactions.schema";

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

export {
  webWalletTransactionCreate,
  webWalletTransactionGetByFilter,
  webWalletTransactionGetById
};
