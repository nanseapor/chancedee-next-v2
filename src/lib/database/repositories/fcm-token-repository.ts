import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";

import { FirebaseFCMTokenType } from "../schemas/fcm-token.schema";

import { IRepository } from "./interfaces/repository.interface";
import { createRepository } from "./repository-factory";

// Define FCM Token app model type
export interface FCMToken {
  uid?: string;
  fcmToken: string;
  deviceType?: string;
  status?: string;
  createdBy?: string;
  updatedBy?: string;
  createdAt?: number;
  updatedAt?: number;
}

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseFCMTokenType,
  createTime?: number,
  updateTime?: number
): FCMToken {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    fcmToken: firebaseModel.fcm_token,
    deviceType: firebaseModel.device_type,
    status: firebaseModel.status,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FCMToken,
  actorId: string,
  isUpdate = false
): FirebaseFCMTokenType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    fcm_token: appModel.fcmToken,
    device_type: appModel.deviceType,
    status: appModel.status,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const fcmTokenRepository: IRepository<FCMToken> = createRepository<FCMToken, FirebaseFCMTokenType>(
  'fcm_tokens',
  transformToAppModel,
  transformToFirebaseModel
);