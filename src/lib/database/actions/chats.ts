"use server";
import { Filter, Query, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase-admin";
import { RoomData } from "@/types/chat.types";

import { FirebaseChatType } from "../schemas/chat.schema";

const webChatGetById = async (uid: string) => {
  try {
    const ChatRef = getFirebaseAdminFirestore().collection("chats").doc(uid);
    const ChatSnap = await ChatRef.get();
    if (ChatSnap.exists) {
      const firebaseChat = ChatSnap.data() as FirebaseChatType;
      if (!firebaseChat.company_id || !firebaseChat.candidate_id || !firebaseChat.responsible_hr_id ) return null;
      const data: RoomData = {
        id: firebaseChat.uid,
        companyId: firebaseChat.company_id?.id,
        candidateId: firebaseChat.candidate_id?.id,
        hrId: firebaseChat.responsible_hr_id?.id,
        candidateName: firebaseChat.candidate_name || "",
        companyName: firebaseChat.company_name || "",
        hrName: firebaseChat.responsible_hr_name || "",
        lastMessage: firebaseChat.last_message_text || "",
        lastupdate: firebaseChat.last_message_time?.toMillis() || 0,
      };
      return data;
    } else {
      return null;
    }
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webChatGetByFilter = async (filter?: Filter) => {
  try {
    console.log("🔍 webChatGetByFilter: Starting query", {
      hasFilter: !!filter,
      filterString: filter?.toString(),
    });

    const ChatRef = getFirebaseAdminFirestore().collection("chats");
    let ChatQuery = ChatRef as Query;
    if (filter) ChatQuery = ChatRef.where(filter);
    
    console.log("🔍 webChatGetByFilter: Executing Firestore query");
    const ChatSnap = await ChatQuery.get();
    
    console.log("🔍 webChatGetByFilter: Query completed", {
      isEmpty: ChatSnap.empty,
      docCount: ChatSnap.size,
      hasResults: !ChatSnap.empty
    });

    if (!ChatSnap.empty) {
      const lists = ChatSnap.docs.map((doc) => {
        const firebaseChat = doc.data() as FirebaseChatType;
        if (!firebaseChat.company_id || !firebaseChat.candidate_id || !firebaseChat.responsible_hr_id ) {
          throw new Error("Invalid chat data");
        };
        const data: RoomData = {
          id: firebaseChat.uid,
          companyId: firebaseChat.company_id?.id,
          candidateId: firebaseChat.candidate_id?.id,
          hrId: firebaseChat.responsible_hr_id?.id,
          candidateName: firebaseChat.candidate_name || "",
          companyName: firebaseChat.company_name || "",
          hrName: firebaseChat.responsible_hr_name || "",
          lastMessage: firebaseChat.last_message_text || "",
          lastupdate: firebaseChat.last_message_time?.toMillis() || 0,
        };
        
        return data;
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

const webChatCreate = async (
  payload: RoomData,
  actorId: string,
  uid?: string
) => {
  try {
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const ChatRef = uid
      ? getFirebaseAdminFirestore().collection("chats").doc(uid)
      : getFirebaseAdminFirestore().collection("chats").doc();
    const companyId = getFirebaseAdminFirestore().collection("company_information").doc(payload.companyId);
    const candidateId = getFirebaseAdminFirestore().collection("candidate_information").doc(payload.candidateId);
    const hrId = getFirebaseAdminFirestore().collection("user_accounts").doc(payload.hrId);
    const dataToWrite: FirebaseChatType = {
      uid: ChatRef.id,
      created_by: actorRef,
      created_at: Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      company_id: companyId,
      candidate_id: candidateId,
      responsible_hr_id: hrId,
      company_name: payload.companyName,
      candidate_name: payload.candidateName,
      responsible_hr_name: payload.hrName,
      last_message_text: payload.lastMessage,
      last_message_time: Timestamp.fromMillis(payload.lastupdate),
      last_message_sender: actorId,
      timestamp: Timestamp.now(),
    };
    await ChatRef.set(dataToWrite, { merge: true });
    return ChatRef.id;
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
    const actorRef = getFirebaseAdminFirestore().collection("user_accounts").doc(actorId);
    const ChatRef = getFirebaseAdminFirestore().collection("chats").doc(uid);
    const companyId = getFirebaseAdminFirestore().collection("company_information").doc(payload.companyId);
    const candidateId = getFirebaseAdminFirestore().collection("candidate_information").doc(payload.candidateId);
    const hrId = getFirebaseAdminFirestore().collection("user_accounts").doc(payload.hrId);
    const prevDataSnap = await ChatRef.get();
    const dataToWrite: FirebaseChatType = {
      uid: ChatRef.id,
      created_by: prevDataSnap.data()?.created_by || actorRef,
      created_at: prevDataSnap.createTime || Timestamp.now(),
      updated_by: actorRef,
      updated_at: Timestamp.now(),
      company_id: companyId,
      candidate_id: candidateId,
      responsible_hr_id: hrId,
      company_name: payload.companyName,
      candidate_name: payload.candidateName,
      responsible_hr_name: payload.hrName,
      last_message_text: payload.lastMessage,
      last_message_time: Timestamp.fromMillis(payload.lastupdate),
      last_message_sender: actorId,
      timestamp: Timestamp.now(),
    };
    await ChatRef.set(dataToWrite, { merge: true });
    return ChatRef.id;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

export { webChatCreate, webChatGetByFilter, webChatGetById, webChatUpdate };
