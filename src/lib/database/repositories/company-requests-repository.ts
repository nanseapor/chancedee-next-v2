import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { FirebaseCompanyAccountRequests } from "@/types/admin.types";

import { FirebaseCompanyRequestsType } from "../schemas/company-requests.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseCompanyRequestsType,
  createTime?: number,
  updateTime?: number
): FirebaseCompanyAccountRequests {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    companyName: firebaseModel.company_name,
    firstNameTH: firebaseModel.first_name_th || "",
    lastNameTH: firebaseModel.last_name_th || "",
    email: firebaseModel.email,
    status: firebaseModel.status,
    id: firebaseModel.created_by?.id || "", // Creator's user ID
    companyLogo: firebaseModel.company_logo || "",
    country: firebaseModel.country || "",
    companySize: firebaseModel.company_size || "",
    attachedFiles: firebaseModel.attached_files,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseCompanyAccountRequests,
  actorId: string,
  isUpdate = false
): FirebaseCompanyRequestsType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    company_name: appModel.companyName,
    first_name_th: appModel.firstNameTH,
    last_name_th: appModel.lastNameTH,
    email: appModel.email,
    status: appModel.status,
    company_logo: appModel.companyLogo,
    country: appModel.country,
    company_size: appModel.companySize,
    attached_files: appModel.attachedFiles,
  };
}

// Create and export the repository
export const companyRequestsRepository: IRepository<FirebaseCompanyAccountRequests> = createRepository<FirebaseCompanyAccountRequests, FirebaseCompanyRequestsType>(
  'company_information',
  transformToAppModel,
  transformToFirebaseModel
);