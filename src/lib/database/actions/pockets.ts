"use server";
import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { currency, pocketType } from "@/types/wallet.types";

import { FirebasePocketsType } from "../schemas/pockets.schema";

import {
    webWalletTransactionGetByFilter,
    webWalletTransactionGetById,
} from "./wallet-transactions";

/**
 *
 * @param walletId
 * @param currency
 * @returns
 */
const webPocketsGetById = async (walletId: string, currency: currency) => {
  try {
    const PocketsRef = getFirebaseAdminFirestore()
      .collection(currency)
      .doc(walletId);
    const PocketsSnap = await PocketsRef.get();
    if (PocketsSnap.exists) {
      const firebasePockets = PocketsSnap.data() as FirebasePocketsType;
      const latest = await Promise.all(
        firebasePockets.latest.map(async (item) =>
          webWalletTransactionGetById(item)
        )
      );
      const data: pocketType = {
        uid: firebasePockets.uid,
        currency: firebasePockets.currency,
        balance: firebasePockets.balance,
        latest: latest.filter((item) => item !== null) as pocketType["latest"],
      };
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
/**
 *
 * @param walletId
 * @param filter
 * @returns
 */

/**
 *
 * @param payload
 * @param walletId
 * @param currency
 * @returns
 */

/**
 * Updates a wallet pocket with new balance and transaction data
 * @param payload - Pocket data to update
 * @param actorUid - UID of the user performing the update (for audit trail)
 * @param walletId - Wallet ID to update
 * @param currency - Currency type of the pocket
 * @returns The document ID of the updated pocket
 */
const webPocketsUpdate = async (
  payload: pocketType,
  actorUid: string,
  walletId: string,
  currency: currency
) => {
  try {
    const PocketsRef = getFirebaseAdminFirestore()
      .collection(currency)
      .doc(walletId);

    const latestTransaction = await webWalletTransactionGetByFilter(
      walletId,
      currency
    );
    const latest = latestTransaction
      ? latestTransaction
        .sort((a, b) => b.transactionTime - a.transactionTime)
        .slice(0, 10)
        .map((item) => item.transactionId)
      : [];
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorUid);
    const prevDataSnap = await PocketsRef.get();
    const dataToWrite: FirebasePocketsType = {
      uid: PocketsRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.data()?.created_at || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      currency: payload.currency as currency,
      balance: payload.balance,
      latest,
    };
    await PocketsRef.set(dataToWrite, { merge: true });
    return PocketsRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
    webPocketsGetById,
    webPocketsUpdate
};

