import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { userInfoProps } from "@/types/auth.types";

import { FirebaseUserInfoType } from "../schemas/user-info.schema";
import { extractDocumentIdOptional } from "../utils/firebase-utils";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseUserInfoType,
  createTime?: number,
  updateTime?: number
): userInfoProps {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    roles: firebaseModel.roles || [],
    companyId: extractDocumentIdOptional(firebaseModel.company_id),
    currentStep: firebaseModel.current_step,
    currentStepName: firebaseModel.current_step_name,
    remark: firebaseModel.remark,
    isOnboarded: firebaseModel.is_onboarded,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: userInfoProps,
  actorId: string,
  isUpdate = false
): FirebaseUserInfoType {
  const companyRef = appModel.companyId 
    ? getFirebaseAdminFirestore().collection("company_information").doc(appModel.companyId) 
    : undefined;

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: actorId,
    created_at: Timestamp.now(),
    updated_by: actorId,
    updated_at: Timestamp.now(),
    roles: appModel.roles || [],
    company_id: companyRef,
    current_step: appModel.currentStep,
    current_step_name: appModel.currentStepName,
    remark: appModel.remark,
    is_onboarded: appModel.isOnboarded,
  };
}

// Create and export the repository
export const userInfoRepository: IRepository<userInfoProps> = createRepository<userInfoProps, FirebaseUserInfoType>(
  'user_accounts',
  transformToAppModel,
  transformToFirebaseModel
);