import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { FirebaseAdminInvitation } from "@/types/admin.types";

import { FirebaseAdminInvitationType } from "../schemas/admin-invitation.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseAdminInvitationType,
  createTime?: number,
  updateTime?: number
): FirebaseAdminInvitation {
  return {
    code: firebaseModel.code,
    isUsed: firebaseModel.is_used,
    timestamp: extractTimestamp(firebaseModel.timestamp),
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseAdminInvitation,
  actorId: string,
  isUpdate = false
): FirebaseAdminInvitationType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    code: appModel.code,
    is_used: appModel.isUsed,
    timestamp: Timestamp.fromMillis(appModel.timestamp),
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const adminInviteRepository: IRepository<FirebaseAdminInvitation> = createRepository<FirebaseAdminInvitation, FirebaseAdminInvitationType>(
  'admin_invitation',
  transformToAppModel,
  transformToFirebaseModel
);