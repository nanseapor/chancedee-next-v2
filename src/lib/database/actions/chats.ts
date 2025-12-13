"use server";

import { Filter } from "firebase-admin/firestore";
import { RoomData } from "@/types/chat.types";
import { chatRepository } from "../repositories/chat-repository";

const webChatGetById = async (uid: string) => {
  try {
    return await chatRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webChatGetByFilter = async (filter?: Filter) => {
  try {
    console.log("🔍 webChatGetByFilter: Starting query", {
      hasFilter: !!filter,
      filterString: filter?.toString()
    });

    const result = await chatRepository.getByFilter(filter);

    console.log("🔍 webChatGetByFilter: Query completed", {
      hasResults: !!result,
      resultCount: result?.length || 0
    });

    return result;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webChatCreate = async (
  payload: RoomData,
  actorId: string,
  uid?: string
) => {
  try {
    return await chatRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webChatUpdate = async (
  payload: RoomData,
  actorId: string,
  uid: string
) => {
  try {
    return await chatRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export {
  webChatCreate,
  webChatGetByFilter,
  webChatGetById,
  webChatUpdate
};
