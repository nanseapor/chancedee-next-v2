import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { FirebaseUserDataProps } from "@/types/auth.types";

// Import from schema-first approach
import { FirebaseUserAccountType } from "../schemas/user-accounts.schema";
import { extractDocumentId } from "../utils/firebase-utils";

import { IRepository } from "./interfaces/repository.interface";
import { createRepository } from "./repository-factory";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseUserAccountType,
  createTime?: number,
  updateTime?: number,
): FirebaseUserDataProps {
  if (!firebaseModel.uid) {
    throw new Error("User account UID is required in Firebase model");
  }

  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    email: firebaseModel.email,
    phone: firebaseModel.phone,
    firstnameTH: firebaseModel.first_name_th,
    lastnameTH: firebaseModel.last_name_th,
    nicknameTH: firebaseModel.nick_name_th,
    gender: firebaseModel.gender,
    isPolicyAccepted: firebaseModel.is_policy_accepted,
    isActive: firebaseModel.is_active,
    serviceTypes: firebaseModel.service_types,
    citizenId: firebaseModel.citizen_id,
    avatarURL: firebaseModel.avatar_url,
    jobTitle: firebaseModel.job_title,
    status: firebaseModel.status,
    createdBy: extractDocumentId(firebaseModel.created_by),
    updatedBy: extractDocumentId(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseUserDataProps,
  actorId: string,
  isUpdate = false,
): FirebaseUserAccountType {
  if (!appModel.uid) {
    throw new Error("User account UID is required in app model");
  }

  const candidateRef = getFirebaseAdminFirestore()
    .collection("candidate_information")
    .doc(appModel.uid);
  const referralRef = getFirebaseAdminFirestore()
    .collection("candidate_referral")
    .doc(appModel.uid);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: actorId,
    created_at: Timestamp.now(),
    updated_by: actorId,
    updated_at: Timestamp.now(),
    candidate_id: candidateRef,
    referral_id: referralRef,
    avatar_url: appModel.avatarURL,
    first_name_th: appModel.firstnameTH,
    last_name_th: appModel.lastnameTH,
    nick_name_th: appModel.nicknameTH,
    gender: appModel.gender,
    email: appModel.email,
    phone: appModel.phone,
    is_policy_accepted: appModel.isPolicyAccepted,
    is_active: appModel.isActive,
    service_types: appModel.serviceTypes,
    citizen_id: appModel.citizenId,
    job_title: appModel.jobTitle,
    status: appModel.status,
  };
}

// Create and export the repository
export const userAccountsRepository: IRepository<FirebaseUserDataProps> =
  createRepository<FirebaseUserDataProps, FirebaseUserAccountType>(
    "user_accounts",
    transformToAppModel,
    transformToFirebaseModel,
  );
