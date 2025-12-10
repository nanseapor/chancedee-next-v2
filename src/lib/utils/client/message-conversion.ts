import type { FirebaseMessagesType } from "@/lib/database/schemas/messages.schema";
import type { ChatMessage, MessageType } from "@/types/chat.types";

export const FirebaseMessageToMessage = (
  doc: FirebaseFirestore.DocumentData,
): ChatMessage => {
  const firebaseMessages = doc as FirebaseMessagesType;
  const data: ChatMessage = {
    timestamp: firebaseMessages.timestamp.toMillis(),
    roomId: firebaseMessages.room_id?.id || "",
    messageId: firebaseMessages.uid,
    senderId: firebaseMessages.sender_id?.id || "",
    type: firebaseMessages.type as MessageType,
    avatar: firebaseMessages.sender_avatar,
    name: firebaseMessages.sender_name || "",
    message: firebaseMessages.message || "",
    unread: firebaseMessages.unread,
    actionLink: firebaseMessages.action_link || "",
    attachments: firebaseMessages.file_url,
    interviewId: firebaseMessages.interview_id,
    interviewDate: firebaseMessages.schedule_date,
    interviewTimeFrom: firebaseMessages.schedule_time_from,
    interviewTimeTo: firebaseMessages.schedule_time_to,
    interviewChannel: firebaseMessages.channel,
    interviewLocation: firebaseMessages.location,
    interviewStatus: firebaseMessages.status,
    jobTitle: firebaseMessages.job_title,
    candidateName: firebaseMessages.candidate_name,
    applicationId: firebaseMessages.application_id?.id || "",
    candidateId: firebaseMessages.candidate_id?.id || "",
    companyId: firebaseMessages.company_id?.id || "",
    jobId: firebaseMessages.job_id?.id || "",
    note: firebaseMessages.note,
    oldInterviewDate: firebaseMessages.reschedule_old_date,
    oldInterviewTimeFrom: firebaseMessages.reschedule_time_from,
    oldInterviewTimeTo: firebaseMessages.reschedule_time_to,
  };
  return data;
};
