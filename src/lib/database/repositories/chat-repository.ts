import "server-only";

import { Timestamp } from "firebase-admin/firestore";

import { extractDocumentId, extractTimestamp } from "@/lib/database/utils/firebase-utils";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { RoomData } from "@/types/chat.types";

import { FirebaseChatType } from "../schemas/chat.schema";

import { createRepository } from "./repository-factory";
import { IRepository } from "./interfaces/repository.interface";

// Transform Firebase model to App model
function transformToAppModel(
  firebaseModel: FirebaseChatType,
  createTime?: number,
  updateTime?: number
): RoomData {
  return {
    id: firebaseModel.uid,
    companyId: extractDocumentId(firebaseModel.company_id),
    candidateId: extractDocumentId(firebaseModel.candidate_id),
    hrId: extractDocumentId(firebaseModel.responsible_hr_id),
    applicationId: extractDocumentId(firebaseModel.application_id),
    jobId: extractDocumentId(firebaseModel.job_id),
    candidateName: firebaseModel.candidate_name || "",
    companyName: firebaseModel.company_name || "",
    hrName: firebaseModel.responsible_hr_name || "",
    lastMessage: firebaseModel.last_message_text || "",
    lastupdate: extractTimestamp(firebaseModel.last_message_time),
  };
}

// Transform App model to Firebase model
function transformToFirebaseModel(
  appModel: RoomData,
  actorId: string,
  isUpdate = false
): FirebaseChatType {
  const actorRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(actorId);
  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(appModel.companyId);
  const candidateRef = getFirebaseAdminFirestore()
    .collection("candidate_information")
    .doc(appModel.candidateId);
  const hrRef = getFirebaseAdminFirestore()
    .collection("user_accounts")
    .doc(appModel.hrId);

  return {
    uid: appModel.id,
    created_by: actorRef,
    created_at: Timestamp.now(),
    updated_by: actorRef,
    updated_at: Timestamp.now(),
    company_id: companyRef,
    candidate_id: candidateRef,
    responsible_hr_id: hrRef,
    company_name: appModel.companyName,
    candidate_name: appModel.candidateName,
    responsible_hr_name: appModel.hrName,
    last_message_text: appModel.lastMessage,
    last_message_time: Timestamp.fromMillis(appModel.lastupdate),
    last_message_sender: appModel.lastMessageSender || undefined,
    timestamp: Timestamp.now(),
  };
}

// Create and export the repository
export const chatRepository: IRepository<RoomData> = createRepository<RoomData, FirebaseChatType>(
  'chats',
  transformToAppModel,
  transformToFirebaseModel
);