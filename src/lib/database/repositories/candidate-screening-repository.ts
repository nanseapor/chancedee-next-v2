import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FirebaseCandidateScreeningData } from "@/types/candidate-screening.types";

import { FirebaseCandidateScreeningType } from "../schemas/candidate-screening.schema";
import { toFirebaseTimestamp, toMillis } from "../utils/data-mapper";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseCandidateScreeningType,
  createTime?: number,
  updateTime?: number
): FirebaseCandidateScreeningData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    lastActive: toMillis(firebaseModel.last_active),
    profileStatus: firebaseModel.profile_status,
    flagCount: firebaseModel.flag_count,
    emailVerification: firebaseModel.email_verification,
    phoneVerification: firebaseModel.phone_verification,
    identityVerification: firebaseModel.identity_verification,
    riskScore: firebaseModel.risk_score,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseCandidateScreeningData,
  actorId: string,
  isUpdate = false
): FirebaseCandidateScreeningType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    last_active: appModel.lastActive ? toFirebaseTimestamp(appModel.lastActive) : undefined,
    profile_status: appModel.profileStatus,
    flag_count: appModel.flagCount,
    email_verification: appModel.emailVerification,
    phone_verification: appModel.phoneVerification,
    identity_verification: appModel.identityVerification,
    risk_score: appModel.riskScore,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const candidateScreeningRepository: IRepository<FirebaseCandidateScreeningData> = createRepository<FirebaseCandidateScreeningData, FirebaseCandidateScreeningType>(
  'candidate_screening',
  transformToAppModel,
  transformToFirebaseModel
);