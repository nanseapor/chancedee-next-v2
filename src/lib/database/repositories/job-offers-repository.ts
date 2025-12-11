import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { IOfferReturnData } from "@/types/job.types";

import { FirebaseJobOfferType } from "../schemas/job-offers.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseJobOfferType,
  createTime?: number,
  updateTime?: number
): IOfferReturnData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    jobId: firebaseModel.job_id,
    candidateId: firebaseModel.candidate_id,
    offerCount: firebaseModel.offer_count,
    isApplied: firebaseModel.is_applied || false,
    isActive: firebaseModel.is_active,
    note: firebaseModel.note || "",
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: IOfferReturnData,
  actorId: string,
  isUpdate = false
): FirebaseJobOfferType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    job_id: appModel.jobId,
    candidate_id: appModel.candidateId,
    offer_count: appModel.offerCount,
    is_applied: appModel.isApplied,
    is_active: appModel.isActive,
    note: appModel.note,
  };
}

// Create and export the repository
export const jobOffersRepository: IRepository<IOfferReturnData> = createRepository<IOfferReturnData, FirebaseJobOfferType>(
  'job_offers',
  transformToAppModel,
  transformToFirebaseModel
);