import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { address } from "@/types/database.types";

import { FirebaseAddressType } from "../schemas/address.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseAddressType,
  createTime?: number,
  updateTime?: number
): address {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    addressLine1: firebaseModel.address_line_1,
    addressLine2: firebaseModel.address_line_2,
    district: firebaseModel.district,
    subDistrict: firebaseModel.sub_district,
    postCode: firebaseModel.post_code,
    province: firebaseModel.province,
    createdBy: firebaseModel.created_by?.id,
    updatedBy: firebaseModel.updated_by?.id,
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: address,
  actorId: string,
  isUpdate = false
): FirebaseAddressType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    address_line_1: appModel.addressLine1,
    address_line_2: appModel.addressLine2,
    district: appModel.district,
    sub_district: appModel.subDistrict,
    post_code: appModel.postCode,
    province: appModel.province,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.now(),
    updated_at: Timestamp.now(),
  };
}

// Create and export the repository
export const addressRepository: IRepository<address> = createRepository<address, FirebaseAddressType>(
  'address',
  transformToAppModel,
  transformToFirebaseModel
);