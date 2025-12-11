import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentId, extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { FirebaseJobInterviewData } from "@/types/interview.types";
import { MasterJobApplicationStatuses } from "@/constants/application";

import { FirebaseJobInterviewType } from "../schemas/job-interviews.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseJobInterviewType,
  createTime?: number,
  updateTime?: number
): FirebaseJobInterviewData {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    jobId: extractDocumentId(firebaseModel.job_id),
    applicationId: extractDocumentId(firebaseModel.application_id),
    candidateId: extractDocumentId(firebaseModel.candidate_id),
    companyId: extractDocumentId(firebaseModel.company_id),
    candidateName: firebaseModel.candidate_name,
    companyName: firebaseModel.company_name,
    channel: firebaseModel.channel,
    status: firebaseModel.status as MasterJobApplicationStatuses,
    appointment: extractTimestamp(firebaseModel.appointment),
    from: firebaseModel.from,
    to: firebaseModel.to,
    location: firebaseModel.location,
    room: firebaseModel.room,
    note: firebaseModel.note,
    isCancel: firebaseModel.is_cancel,
    cancelReason: firebaseModel.cancel_reason,
    isAccepted: firebaseModel.is_accepted || false,
    rejectFeedback: firebaseModel.reject_feedback,
    createdBy: extractDocumentIdOptional(firebaseModel.created_by),
    updatedBy: extractDocumentIdOptional(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: FirebaseJobInterviewData,
  actorId: string,
  isUpdate = false
): FirebaseJobInterviewType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const jobRef = getFirebaseAdminFirestore()
    .collection("jobs")
    .doc(appModel.jobId);
  const applicationRef = getFirebaseAdminFirestore()
    .collection("job_applications")
    .doc(appModel.applicationId);
  const candidateRef = getFirebaseAdminFirestore()
    .collection("candidate_information")
    .doc(appModel.candidateId);
  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(appModel.companyId);

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    job_id: jobRef,
    application_id: applicationRef,
    candidate_id: candidateRef,
    company_id: companyRef,
    candidate_name: appModel.candidateName,
    company_name: appModel.companyName,
    channel: appModel.channel,
    status: appModel.status,
    appointment: Timestamp.fromMillis(appModel.appointment),
    from: appModel.from,
    to: appModel.to,
    location: appModel.location,
    room: appModel.room,
    note: appModel.note,
    is_cancel: appModel.isCancel,
    cancel_reason: appModel.cancelReason,
    is_accepted: appModel.isAccepted,
    reject_feedback: appModel.rejectFeedback,
  };
}

// Create and export the repository
export const jobInterviewsRepository: IRepository<FirebaseJobInterviewData> = createRepository<FirebaseJobInterviewData, FirebaseJobInterviewType>(
  'job_interviews',
  transformToAppModel,
  transformToFirebaseModel
);