import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { DeleteAccountProps } from "@/types/auth.types";

import { FirebaseDeleteRequestType } from "../schemas/delete.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseDeleteRequestType,
  createTime?: number,
  updateTime?: number
): DeleteAccountProps {
  return {
    documentCode: firebaseModel.document_code,
    firstNameTH: firebaseModel.first_name_th,
    lastNameTH: firebaseModel.last_name_th,
    phoneNumber: firebaseModel.phone_number,
    email: firebaseModel.email,
    status: firebaseModel.status,
    attachedFiles: firebaseModel.attached_files,
    createAt: createTime || 0,
    updateAt: updateTime || 0,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: DeleteAccountProps,
  actorId: string,
  isUpdate = false
): FirebaseDeleteRequestType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: "",
    document_code: appModel.documentCode,
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    first_name_th: appModel.firstNameTH,
    last_name_th: appModel.lastNameTH,
    phone_number: appModel.phoneNumber,
    email: appModel.email,
    status: appModel.status,
    attached_files: appModel.attachedFiles,
  };
}

// Create and export the repository
export const deleteRepository: IRepository<DeleteAccountProps> = createRepository<DeleteAccountProps, FirebaseDeleteRequestType>(
  'delete',
  transformToAppModel,
  transformToFirebaseModel
);