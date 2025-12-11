import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { candidateReferral } from "@/types/candidate.types";

import { FirebaseCandidateReferralType } from "../schemas/candidate-referral.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseCandidateReferralType,
  createTime?: number,
  updateTime?: number
): candidateReferral {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    referCode: firebaseModel.refer_code,
    referLink: firebaseModel.refer_link,
    referBy: firebaseModel.refer_by,
    referDate: extractTimestamp(firebaseModel.refer_date),
    referredList: firebaseModel.referred_list,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: candidateReferral,
  actorId: string,
  isUpdate = false
): FirebaseCandidateReferralType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    refer_code: appModel.referCode,
    refer_link: appModel.referLink,
    refer_by: appModel.referBy,
    refer_date: appModel.referDate ? Timestamp.fromMillis(appModel.referDate) : undefined,
    referred_list: appModel.referredList,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const candidateReferralRepository: IRepository<candidateReferral> = createRepository<candidateReferral, FirebaseCandidateReferralType>(
  'candidate_referral',
  transformToAppModel,
  transformToFirebaseModel
);