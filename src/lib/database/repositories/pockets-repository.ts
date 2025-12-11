import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { pocketType } from "@/types/wallet.types";

// Import from schema-first approach
import { FirebasePocketsType, FirebaseCurrencyType } from "../schemas/wallet-transactions.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebasePocketsType,
  createTime?: number,
  updateTime?: number
): pocketType {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    currency: firebaseModel.currency,
    balance: firebaseModel.balance,
    latest: [], // Note: The actual transformation would need wallet transaction data
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: pocketType,
  actorId: string,
  isUpdate = false
): FirebasePocketsType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    currency: appModel.currency as FirebaseCurrencyType,
    balance: appModel.balance,
    latest: [], // This would be filled with transaction IDs
  };
}

// Create and export the repository
export const pocketsRepository: IRepository<pocketType> = createRepository<pocketType, FirebasePocketsType>(
  'pockets',
  transformToAppModel,
  transformToFirebaseModel
);