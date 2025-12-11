import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { transactionType } from "@/types/wallet.types";

// Import from schema-first approach
import { FirebaseWalletTransactionType } from "../schemas/wallet-transactions.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseWalletTransactionType,
  createTime?: number,
  updateTime?: number
): transactionType {
  return {
    transactionId: firebaseModel.uid,
    transactionOwner: firebaseModel.transaction_owner,
    transactionOrigin: firebaseModel.transaction_origin,
    transactionType: firebaseModel.transaction_type,
    transactionAmount: firebaseModel.transaction_amount,
    transactionTime: extractTimestamp(firebaseModel.transaction_time),
    remark: firebaseModel.remark,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: transactionType,
  actorId: string,
  isUpdate = false
): FirebaseWalletTransactionType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.transactionId,
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    transaction_owner: appModel.transactionOwner,
    transaction_receiver: appModel.transactionOwner, // Assuming owner is receiver
    transaction_origin: appModel.transactionOrigin,
    transaction_type: appModel.transactionType,
    transaction_amount: appModel.transactionAmount,
    transaction_currency: "coin", // Default currency, could be parameterized
    transaction_time: Timestamp.fromMillis(appModel.transactionTime),
    remark: appModel.remark,
  };
}

// Create and export the repository
export const walletTransactionsRepository: IRepository<transactionType> = createRepository<transactionType, FirebaseWalletTransactionType>(
  'wallet_transactions',
  transformToAppModel,
  transformToFirebaseModel
);