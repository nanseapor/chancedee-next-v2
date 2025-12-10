import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentId, extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { MessageType, MessageWithId } from "@/types/chat.types";

import { FirebaseMessagesType } from "../schemas/messages.schema";

import { IRepository } from "./interfaces/repository.interface";
import { createRepository } from "./repository-factory";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseMessagesType,
  createTime?: number,
  updateTime?: number
): MessageWithId {
  return {
    uid: firebaseModel.uid || "", // Placeholder, should always have value from Firestore
    roomId: extractDocumentId(firebaseModel.room_id),
    messageId: firebaseModel.uid,
    senderId: extractDocumentId(firebaseModel.sender_id),
    timestamp: extractTimestamp(firebaseModel.timestamp),
    type: (firebaseModel.type || "text") as MessageType,
    actionLink: firebaseModel.action_link,
    avatar: firebaseModel.sender_avatar,
    name: firebaseModel.sender_name,
    message: firebaseModel.message || "",
    unread: firebaseModel.unread,
    attachments: firebaseModel.file_url,
    interviewId: firebaseModel.interview_id,
    interviewDate: firebaseModel.schedule_date,
    interviewTimeFrom: firebaseModel.schedule_time_from,
    interviewTimeTo: firebaseModel.schedule_time_to,
    interviewChannel: firebaseModel.channel,
    interviewLocation: firebaseModel.location,
    interviewStatus: firebaseModel.status,
    jobTitle: firebaseModel.job_title,
    candidateName: firebaseModel.candidate_name,
    applicationId: extractDocumentIdOptional(firebaseModel.application_id),
    candidateId: extractDocumentIdOptional(firebaseModel.candidate_id) || "",
    companyId: extractDocumentIdOptional(firebaseModel.company_id) || "",
    jobId: extractDocumentIdOptional(firebaseModel.job_id),
    note: firebaseModel.note,
    newInterviewDate: firebaseModel.reschedule_new_date,
    oldInterviewDate: firebaseModel.reschedule_old_date,
    oldInterviewTimeFrom: firebaseModel.reschedule_time_from,
    oldInterviewTimeTo: firebaseModel.reschedule_time_to,
    createdBy: extractDocumentId(firebaseModel.created_by),
    updatedBy: extractDocumentId(firebaseModel.updated_by),
    createdAt: createTime || 0,
    updatedAt: updateTime || 0,
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: MessageWithId,
  actorId: string,
  isUpdate = false
): FirebaseMessagesType {
  const creatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(isUpdate && appModel.createdBy ? appModel.createdBy : actorId);
  const updatorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const senderRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(appModel.senderId);
  const roomRef = appModel.roomId 
    ? getFirebaseAdminFirestore().collection("chats").doc(appModel.roomId) 
    : undefined;
  const companyRef = appModel.companyId 
    ? getFirebaseAdminFirestore().collection("company_information").doc(appModel.companyId) 
    : undefined;
  const candidateRef = appModel.candidateId 
    ? getFirebaseAdminFirestore().collection("candidate_information").doc(appModel.candidateId) 
    : undefined;
  const jobRef = appModel.jobId 
    ? getFirebaseAdminFirestore().collection("jobs").doc(appModel.jobId) 
    : undefined;
  const applicationRef = appModel.applicationId 
    ? getFirebaseAdminFirestore().collection("job_applications").doc(appModel.applicationId) 
    : undefined;

  return {
    uid: appModel.uid || "", // Will be overwritten by createDocument() with actual Firestore ID
    created_by: creatorRef,
    created_at: Timestamp.now(),
    updated_by: updatorRef,
    updated_at: Timestamp.now(),
    timestamp: Timestamp.fromMillis(appModel.timestamp),
    room_id: roomRef,
    sender_id: senderRef,
    type: appModel.type,
    action_link: appModel.actionLink,
    sender_avatar: appModel.avatar,
    sender_name: appModel.name,
    message: appModel.message,
    unread: appModel.unread,
    file_url: appModel.attachments,
    interview_id: appModel.interviewId,
    schedule_date: appModel.interviewDate,
    schedule_time_from: appModel.interviewTimeFrom,
    schedule_time_to: appModel.interviewTimeTo,
    channel: appModel.interviewChannel,
    location: appModel.interviewLocation,
    status: appModel.interviewStatus,
    job_title: appModel.jobTitle,
    candidate_name: appModel.candidateName,
    application_id: applicationRef,
    candidate_id: candidateRef,
    company_id: companyRef,
    job_id: jobRef,
    note: appModel.note,
    reschedule_new_date: appModel.newInterviewDate,
    reschedule_old_date: appModel.oldInterviewDate,
    reschedule_time_from: appModel.oldInterviewTimeFrom,
    reschedule_time_to: appModel.oldInterviewTimeTo,
  };
}

// Create and export the repository
export const messagesRepository: IRepository<MessageWithId> = createRepository<MessageWithId, FirebaseMessagesType>(
  'messages',
  transformToAppModel,
  transformToFirebaseModel
);