import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentId, extractDocumentIdOptional, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { MessageWithId, MessageType } from "@/types/chat.types";

import { FirebaseMessagesType } from "../schemas/messages.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

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

// Create the base repository
const baseRepository: IRepository<MessageWithId> = createRepository<MessageWithId, FirebaseMessagesType>(
  'messages',
  transformToAppModel,
  transformToFirebaseModel
);

// Extended repository with message-specific methods
export interface MessagesRepository extends IRepository<MessageWithId> {
  getByRoomIdPaginated(
    roomId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ messages: MessageWithId[]; hasMore: boolean; cursor: string | null }>;
  batchUpdate(
    messages: Omit<MessageWithId, "createdBy" | "updatedBy">[],
    actorId: string
  ): Promise<void>;
}

export const messagesRepository: MessagesRepository = {
  ...baseRepository,

  /**
   * Get messages for a room with cursor-based pagination
   */
  async getByRoomIdPaginated(
    roomId: string,
    options?: { limit?: number; cursor?: string }
  ): Promise<{ messages: MessageWithId[]; hasMore: boolean; cursor: string | null }> {
    const limit = options?.limit || 50;
    const db = getFirebaseAdminFirestore();

    let query = db
      .collection("messages")
      .where("room_id", "==", db.collection("chats").doc(roomId))
      .orderBy("timestamp", "desc")
      .limit(limit + 1); // +1 to check hasMore

    if (options?.cursor) {
      const cursorTimestamp = parseInt(options.cursor, 10);
      query = query.startAfter(Timestamp.fromMillis(cursorTimestamp));
    }

    const snapshot = await query.get();
    const hasMore = snapshot.docs.length > limit;
    const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

    const messages = docs.map((doc) => {
      const data = doc.data() as FirebaseMessagesType;
      return transformToAppModel(
        { ...data, uid: doc.id },
        doc.createTime?.toMillis(),
        doc.updateTime?.toMillis()
      );
    });

    // Messages are fetched in desc order, reverse for chronological display
    const lastMessage = messages[messages.length - 1];
    const cursor = hasMore && lastMessage
      ? lastMessage.timestamp.toString()
      : null;

    return {
      messages: messages.reverse(), // Return in chronological order
      hasMore,
      cursor,
    };
  },

  /**
   * Batch update multiple messages
   */
  async batchUpdate(
    messages: Omit<MessageWithId, "createdBy" | "updatedBy">[],
    actorId: string
  ): Promise<void> {
    if (messages.length === 0) return;

    const db = getFirebaseAdminFirestore();
    const batch = db.batch();
    const updatorRef = db.collection("user_accounts").doc(actorId);

    for (const msg of messages) {
      const ref = db.collection("messages").doc(msg.uid);
      batch.update(ref, {
        unread: msg.unread,
        updated_by: updatorRef,
        updated_at: Timestamp.now(),
      });
    }

    await batch.commit();
  },
};