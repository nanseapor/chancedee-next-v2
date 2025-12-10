"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { FirebaseMessageToMessage } from "@/lib/utils/client/message-conversion";
import { ChatMessage, MessageWithId } from "@/types/chat.types";

import { FirebaseMessagesType } from "../schemas/messages.schema";

const ChatMessageToFirebaseMessage = (chatMessage: MessageWithId) => {
  const creatorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(chatMessage.createdBy);
  const updatorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(chatMessage.updatedBy);
  const senderId = getFirebaseAdminFirestore().collection("user_accounts").doc(chatMessage.senderId);
  const roomId = chatMessage.roomId ? getFirebaseAdminFirestore().collection("chats").doc(chatMessage.roomId) : undefined;
  const companyId = chatMessage.companyId ? getFirebaseAdminFirestore().collection("company_information").doc(chatMessage.companyId) : undefined;
  const candidateId = chatMessage.candidateId ? getFirebaseAdminFirestore().collection("candidate_information").doc(chatMessage.candidateId) : undefined;
  const jobId = chatMessage.jobId ? getFirebaseAdminFirestore().collection("jobs").doc(chatMessage.jobId) : undefined;
  const applicationId = chatMessage.applicationId ? getFirebaseAdminFirestore().collection("job_applications").doc(chatMessage.applicationId) : undefined;
  const data: FirebaseMessagesType = {
    uid: chatMessage.uid,
    timestamp: Timestamp.fromMillis(chatMessage.timestamp),
    room_id: roomId,
    sender_id: senderId,
    type: chatMessage.type,
    action_link: chatMessage.actionLink,
    sender_avatar: chatMessage.avatar,
    sender_name: chatMessage.name,
    message: chatMessage.message,
    unread: chatMessage.unread,
    created_by: creatorRef,
    updated_by: updatorRef,
    created_at: Timestamp.fromMillis(chatMessage.createdAt),
    updated_at: Timestamp.fromMillis(chatMessage.updatedAt),
    file_url: chatMessage.attachments,
    interview_id: chatMessage.interviewId,
    schedule_date: chatMessage.interviewDate,
    schedule_time_from: chatMessage.interviewTimeFrom,
    schedule_time_to: chatMessage.interviewTimeTo,
    channel: chatMessage.interviewChannel,
    location: chatMessage.interviewLocation,
    status: chatMessage.interviewStatus,
    job_title: chatMessage.jobTitle,
    candidate_name: chatMessage.candidateName,
    application_id: applicationId,
    candidate_id: candidateId,
    company_id: companyId,
    job_id: jobId,
    note: chatMessage.note,
    reschedule_old_date: chatMessage.oldInterviewDate,
    reschedule_new_date: chatMessage.oldInterviewDate,
    reschedule_time_from: chatMessage.oldInterviewDate,
    reschedule_time_to: chatMessage.oldInterviewDate,
  };
  return data;
};


const webMessagesGetByRoomId = async (roomId: string) => {
  try {
    const RoomRef = getFirebaseAdminFirestore()
      .collection("chats").doc(roomId);
    const MessagesRef = getFirebaseAdminFirestore().collection("messages");
    const MessagesQuery = MessagesRef.where(
      Filter.where("room_id", "==", RoomRef)
    );
    const MessagesSnap = await MessagesQuery.get();
    if (!MessagesSnap.empty) {
      const lists = MessagesSnap.docs.map((doc) => {
        const firebaseMessages = doc.data();
        return FirebaseMessageToMessage(firebaseMessages);
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webMessagesGetByFilter = async (filter?: Filter) => {
  try {
    const MessagesRef = getFirebaseAdminFirestore().collection("messages");
    let MessagesQuery = MessagesRef as Query;
    if (filter) MessagesQuery = MessagesRef.where(filter);
    const MessagesSnap = await MessagesQuery.get();
    if (!MessagesSnap.empty) {
      const lists = MessagesSnap.docs.map((doc) => {
        const firebaseMessages = doc.data();
        return FirebaseMessageToMessage(firebaseMessages);
      });
      return lists;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webMessagesCreate = async (
  payload: ChatMessage,
  actorId: string,
  uid?: string
) => {
  try {
    const MessagesRef = uid
      ? getFirebaseAdminFirestore().collection("messages").doc(uid)
      : getFirebaseAdminFirestore().collection("messages").doc();

    const newPayload: MessageWithId = {
      ...payload,
      uid: MessagesRef.id,
      updatedBy: actorId,
      createdBy: actorId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
      messageId: MessagesRef.id,
    };

    const dataToWrite = ChatMessageToFirebaseMessage(newPayload);
    await MessagesRef.set(dataToWrite, { merge: true });
    return MessagesRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webMessagesUpdate = async (
  payload: Omit<ChatMessage, "uid" | "createdBy" | "updatedBy" | "messageId">,
  actorId: string,
  uid: string
) => {
  try {
    const MessagesRef = getFirebaseAdminFirestore()
      .collection("messages")
      .doc(uid);
    const prevData = await MessagesRef.get();
    const newPayload: MessageWithId = {
      ...payload,
      uid: MessagesRef.id,
      updatedBy: actorId,
      createdBy: prevData.data()?.created_by.id || actorId,
      createdAt: prevData.createTime?.toMillis() || Date.now(),
      updatedAt: Date.now(),
      messageId: MessagesRef.id,
    };
    const dataToWrite = ChatMessageToFirebaseMessage(newPayload);
    await MessagesRef.set(dataToWrite, { merge: true });
    return MessagesRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};


const webMessagesBatchUpdate = async (
  payload: Omit<ChatMessage, "createdBy" | "updatedBy">[],
  actorId: string,
) => {
  try {
    if (payload.length === 0) return;

    // Extract all message IDs
    const messageIds = payload.map((item) => item.messageId);

    // Batch read all existing messages at once (1 read instead of N reads)
    const messagesRef = getFirebaseAdminFirestore().collection("messages");
    const messageDocsPromises = messageIds.map((id) => messagesRef.doc(id).get());
    const messageDocs = await Promise.all(messageDocsPromises);

    // Create a map of existing message data for quick lookup
    const existingDataMap = new Map(
      messageDocs.map((doc, index) => [
        messageIds[index],
        {
          createdById: doc.data()?.created_by.id,
          createTime: doc.createTime?.toMillis(),
        },
      ])
    );

    // Prepare batch write
    const batch = getFirebaseAdminFirestore().batch();

    payload.forEach((item) => {
      const MessagesRef = messagesRef.doc(item.messageId);
      const existingData = existingDataMap.get(item.messageId);

      const newPayload: MessageWithId = {
        ...item,
        uid: MessagesRef.id,
        updatedBy: actorId,
        createdBy: existingData?.createdById || actorId,
        createdAt: existingData?.createTime || Date.now(),
        updatedAt: Date.now(),
        messageId: MessagesRef.id,
      };

      const dataToWrite = ChatMessageToFirebaseMessage(newPayload);
      batch.update(MessagesRef, dataToWrite);
    });

    await batch.commit();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
    webMessagesBatchUpdate,
    webMessagesCreate,
    webMessagesGetByFilter,
    webMessagesGetByRoomId,
    webMessagesUpdate
};

