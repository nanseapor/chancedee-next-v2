"use server";

import { Filter, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/firebase-admin";
import { ChatMessage, MessageWithId } from "@/types/chat.types";

import { messagesRepository } from "../repositories/messages-repository";

/**
 * Get messages by room ID
 */
export const webMessagesGetByRoomId = async (roomId: string) => {
  try {
    const roomRef = getFirebaseAdminFirestore().collection("chats").doc(roomId);
    const filter = Filter.where("room_id", "==", roomRef);
    return await messagesRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Get messages by filter
 */
export const webMessagesGetByFilter = async (filter?: Filter) => {
  try {
    return await messagesRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Create a new message
 */
export const webMessagesCreate = async (
  payload: ChatMessage,
  actorId: string,
  uid?: string
) => {
  try {
    const messageId = uid || messagesRepository.generateId();
    const messageWithId: MessageWithId = {
      ...payload,
      uid: messageId,
      messageId: messageId,
      createdBy: actorId,
      updatedBy: actorId,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };
    await messagesRepository.create(messageWithId, actorId, messageId);
    return messageId;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Update an existing message
 */
export const webMessagesUpdate = async (
  payload: Omit<ChatMessage, "uid" | "createdBy" | "updatedBy" | "messageId">,
  actorId: string,
  uid: string
) => {
  try {
    const existingMessage = await messagesRepository.getById(uid);

    const messageWithId: MessageWithId = {
      ...payload,
      uid: uid,
      messageId: uid,
      createdBy: existingMessage?.createdBy || actorId,
      updatedBy: actorId,
      createdAt: existingMessage?.createdAt || Date.now(),
      updatedAt: Date.now(),
    };

    await messagesRepository.update(uid, messageWithId, actorId);
    return uid;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Batch update messages
 */
export const webMessagesBatchUpdate = async (
  payload: Omit<ChatMessage, "createdBy" | "updatedBy">[],
  actorId: string
) => {
  try {
    if (payload.length === 0) return;

    const messageIds = payload.map((item) => item.messageId);

    const existingMessages = await Promise.all(
      messageIds.map(id => messagesRepository.getById(id))
    );

    const existingDataMap = new Map(
      existingMessages.map((msg, index) => [
        messageIds[index],
        msg ? { createdBy: msg.createdBy, createdAt: msg.createdAt } : null
      ])
    );

    const batch = getFirebaseAdminFirestore().batch();
    const messagesRef = getFirebaseAdminFirestore().collection("messages");

    for (const item of payload) {
      const docRef = messagesRef.doc(item.messageId);
      const existingData = existingDataMap.get(item.messageId);

      const messageWithId: MessageWithId = {
        ...item,
        uid: item.messageId,
        messageId: item.messageId,
        createdBy: existingData?.createdBy || actorId,
        updatedBy: actorId,
        createdAt: existingData?.createdAt || Date.now(),
        updatedAt: Date.now(),
      };

      // Use repository's transform function through a helper
      // For now, we'll keep direct batch update for performance
      batch.update(docRef, {
        ...item,
        updated_by: getFirebaseAdminFirestore().collection("user_accounts").doc(actorId),
        updated_at: Timestamp.now(),
      });
    }

    await batch.commit();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * Delete a message
 */
export const webMessagesDelete = async (uid: string) => {
  try {
    return await messagesRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};
