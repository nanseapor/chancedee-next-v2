import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { userTransferProps } from "@/types/auth.types";

import { FirebaseUserTransferType } from "../schemas/user-transfer.schema";
import { extractTimestamp } from "../utils/firebase-utils";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseUserTransferType,
  createTime?: number,
  updateTime?: number
): userTransferProps {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    targetCompany: firebaseModel.target_company || "",
    requestTimestamp: extractTimestamp(firebaseModel.request_timestamp),
    transferApproved: firebaseModel.transfer_approved || false,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: userTransferProps,
  actorId: string,
  isUpdate = false
): FirebaseUserTransferType {
  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: actorId,
    created_at: Timestamp.now(),
    updated_by: actorId,
    updated_at: Timestamp.now(),
    target_company: appModel.targetCompany,
    request_timestamp: Timestamp.fromMillis(appModel.requestTimestamp),
    transfer_approved: appModel.transferApproved,
  };
}

// Create and export the repository
export const userTransferRepository: IRepository<userTransferProps> = createRepository<userTransferProps, FirebaseUserTransferType>(
  'user_accounts',
  transformToAppModel,
  transformToFirebaseModel
);