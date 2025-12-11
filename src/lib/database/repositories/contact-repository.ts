import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { contact } from "@/types/database.types";

import { FirebaseContactType } from "../schemas/contact.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseContactType,
  createTime?: number,
  updateTime?: number
): contact {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    phone: firebaseModel.phone,
    email: firebaseModel.email,
    facebook: firebaseModel.facebook,
    twitter: firebaseModel.twitter,
    instagram: firebaseModel.instagram,
    linkedin: firebaseModel.linkedin,
    line: firebaseModel.line,
    mobile: firebaseModel.mobile,
    website: firebaseModel.website,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: contact,
  actorId: string,
  isUpdate = false
): FirebaseContactType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    phone: appModel.phone,
    email: appModel.email,
    facebook: appModel.facebook,
    twitter: appModel.twitter,
    instagram: appModel.instagram,
    linkedin: appModel.linkedin,
    line: appModel.line,
    mobile: appModel.mobile,
    website: appModel.website,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const contactRepository: IRepository<contact> = createRepository<contact, FirebaseContactType>(
  'contact',
  transformToAppModel,
  transformToFirebaseModel
);