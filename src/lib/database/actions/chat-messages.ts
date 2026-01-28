"use server";

import { Filter } from "firebase-admin/firestore";

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import { webJobInterviewGetByFilter } from "@/lib/database/actions/job-interviews";
import type {
  SendMessageInput,
  LoadHistoryInput,
  LoadHistoryResponse,
  RoomDetails,
  RoomInterview,
  MessageWithId,
  ChatMessage,
} from "@/types/chat.types";

/**
 * Send a text message to a chat room
 * Per BLS-06-02 sendMessage
 */
export async function sendMessageFirestore(
  input: SendMessageInput
): Promise<{ messageId: string }> {
  const { roomId, message } = input;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Validate message
  if (!message || message.trim() === "") {
    throw new Error("MESSAGE_EMPTY");
  }

  if (message.length > 2000) {
    throw new Error("MESSAGE_TOO_LONG");
  }

  // 3. Verify room exists and user is participant
  const room = await chatRepository.getById(roomId);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const isCandidate = sessionUser.candidateId === room.candidateId;
  const isCompany = sessionUser.companyId === room.companyId;

  if (!isCandidate && !isCompany) {
    throw new Error("NOT_PARTICIPANT");
  }

  // 4. Determine other party for unread array
  const otherPartyId = isCandidate ? room.companyId : room.candidateId;

  // 5. Get user display info
  let senderName = "";
  let senderAvatar = "";

  if (isCandidate && sessionUser.candidateId) {
    const candidateInfo = await webCandidateInformationGetById(sessionUser.candidateId);
    if (candidateInfo) {
      senderName = `${candidateInfo.firstnameTH || ""} ${candidateInfo.lastnameTH || ""}`.trim();
      senderAvatar = candidateInfo.resumePhotoURL || "";
    }
  } else if (sessionUser.companyId) {
    const companyInfo = await webCompanyInformationGetById(sessionUser.companyId);
    if (companyInfo) {
      senderName = companyInfo.companyName || "";
      senderAvatar = companyInfo.profilePhoto || "";
    }
  }

  // 6. Create message
  const timestamp = Date.now();
  const messageData: Omit<MessageWithId, "createdBy" | "updatedBy" | "createdAt" | "updatedAt"> = {
    uid: "",
    roomId,
    messageId: "", // Will be set by repository
    senderId: sessionUser.uid,
    timestamp,
    type: "text",
    name: senderName,
    avatar: senderAvatar,
    message: message.trim(),
    unread: [otherPartyId],
    candidateId: room.candidateId,
    companyId: room.companyId,
  };

  const messageId = await messagesRepository.create(messageData as MessageWithId, sessionUser.uid);

  // 7. Update room with last message info
  // Use type assertion since we only need to update specific fields
  await chatRepository.update(
    roomId,
    {
      ...room,
      lastMessage: message.trim().slice(0, 100),
      lastupdate: timestamp,
      lastMessageSender: isCandidate ? "candidate" : "hr",
    },
    sessionUser.uid
  );

  return { messageId };
}

/**
 * Send a file/image attachment
 * Per BLS-06-03 sendAttachment
 *
 * Note: Actual file upload happens client-side, this creates the message record
 */
export async function sendAttachment(input: {
  roomId: string;
  fileUrl: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  type: "image" | "file";
}): Promise<{ messageId: string }> {
  const { roomId, fileUrl, fileName, fileType, fileSize, type } = input;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Verify room and participation
  const room = await chatRepository.getById(roomId);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const isCandidate = sessionUser.candidateId === room.candidateId;
  const isCompany = sessionUser.companyId === room.companyId;

  if (!isCandidate && !isCompany) {
    throw new Error("NOT_PARTICIPANT");
  }

  // 3. Determine other party
  const otherPartyId = isCandidate ? room.companyId : room.candidateId;

  // 4. Get user display info
  let senderName = "";
  let senderAvatar = "";

  if (isCandidate && sessionUser.candidateId) {
    const candidateInfo = await webCandidateInformationGetById(sessionUser.candidateId);
    if (candidateInfo) {
      senderName = `${candidateInfo.firstnameTH || ""} ${candidateInfo.lastnameTH || ""}`.trim();
      senderAvatar = candidateInfo.resumePhotoURL || "";
    }
  } else if (sessionUser.companyId) {
    const companyInfo = await webCompanyInformationGetById(sessionUser.companyId);
    if (companyInfo) {
      senderName = companyInfo.companyName || "";
      senderAvatar = companyInfo.profilePhoto || "";
    }
  }

  // 5. Create message with attachment
  const timestamp = Date.now();
  const messageData: Omit<MessageWithId, "createdBy" | "updatedBy" | "createdAt" | "updatedAt"> = {
    uid: "",
    roomId,
    messageId: "",
    senderId: sessionUser.uid,
    timestamp,
    type,
    name: senderName,
    avatar: senderAvatar,
    message: fileName,
    attachments: fileUrl,
    unread: [otherPartyId],
    candidateId: room.candidateId,
    companyId: room.companyId,
  };

  const messageId = await messagesRepository.create(messageData as MessageWithId, sessionUser.uid);

  // 6. Update room
  const lastMessageText = type === "image" ? "📷 รูปภาพ" : "📎 ไฟล์แนบ";
  await chatRepository.update(
    roomId,
    {
      ...room,
      lastMessage: lastMessageText,
      lastupdate: timestamp,
      lastMessageSender: isCandidate ? "candidate" : "hr",
    },
    sessionUser.uid
  );

  return { messageId };
}

/**
 * Mark messages as read for current user
 * Per BLS-06-05 markMessagesAsRead
 */
export async function markMessagesAsRead(input: {
  roomId: string;
}): Promise<void> {
  const { roomId } = input;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Verify room and participation
  const room = await chatRepository.getById(roomId);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const isCandidate = sessionUser.candidateId === room.candidateId;
  const isCompany = sessionUser.companyId === room.companyId;

  if (!isCandidate && !isCompany) {
    throw new Error("NOT_PARTICIPANT");
  }

  // 3. Find unread messages for this user
  const db = getFirebaseAdminFirestore();
  const roomRef = db.collection("chats").doc(roomId);

  const filter = Filter.and(
    Filter.where("room_id", "==", roomRef),
    Filter.where("unread", "array-contains", sessionUser.uid)
  );

  const unreadMessages = await messagesRepository.getByFilter(filter);

  if (!unreadMessages || unreadMessages.length === 0) {
    return; // Nothing to mark as read
  }

  // 4. Update each message to remove user from unread array
  const updatedMessages = unreadMessages.map((msg) => ({
    ...msg,
    unread: msg.unread.filter((id: string) => id !== sessionUser.uid),
  }));

  await messagesRepository.batchUpdate(updatedMessages, sessionUser.uid);
}

/**
 * Load message history with pagination
 * Per BLS-06-04 loadMessageHistory
 */
export async function loadMessageHistory(
  input: LoadHistoryInput
): Promise<LoadHistoryResponse> {
  const { roomId, cursor, limit = 50 } = input;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Verify room and participation
  const room = await chatRepository.getById(roomId);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  const isCandidate = sessionUser.candidateId === room.candidateId;
  const isCompany = sessionUser.companyId === room.companyId;

  if (!isCandidate && !isCompany) {
    throw new Error("NOT_PARTICIPANT");
  }

  // 3. Query messages with pagination
  const pageLimit = cursor ? 30 : limit; // 30 for pagination, 50 for initial
  const result = await messagesRepository.getByRoomIdPaginated(roomId, {
    limit: pageLimit,
    cursor: cursor || undefined,
  });

  return {
    messages: result.messages as MessageWithId[],
    hasMore: result.hasMore,
    cursor: result.cursor,
  };
}

/**
 * Get room details including other party info and interview
 * Per BLS-06-06 getRoomDetails
 */
export async function getRoomDetails(input: {
  roomId: string;
}): Promise<RoomDetails> {
  const { roomId } = input;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Get room
  const room = await chatRepository.getById(roomId);
  if (!room) {
    throw new Error("ROOM_NOT_FOUND");
  }

  // 3. Verify participation
  const isCandidate = sessionUser.candidateId === room.candidateId;
  const isCompany = sessionUser.companyId === room.companyId;

  if (!isCandidate && !isCompany) {
    throw new Error("NOT_PARTICIPANT");
  }

  // 4. Get other party info
  let otherPartyName = "";
  let otherPartyPhoto: string | null = null;
  const otherPartyId = isCandidate ? room.companyId : room.candidateId;
  const otherPartyRole = isCandidate ? "company" : "candidate";

  try {
    if (isCandidate) {
      const companyInfo = await webCompanyInformationGetById(otherPartyId);
      if (companyInfo) {
        otherPartyName = companyInfo.companyName || room.companyName || "";
        otherPartyPhoto = companyInfo.profilePhoto || null;
      }
    } else {
      const candidateInfo = await webCandidateInformationGetById(otherPartyId);
      if (candidateInfo) {
        otherPartyName = `${candidateInfo.firstnameTH || ""} ${candidateInfo.lastnameTH || ""}`.trim() || room.candidateName || "";
        otherPartyPhoto = candidateInfo.resumePhotoURL || null;
      }
    }
  } catch {
    // Fallback to cached room data
    otherPartyName = isCandidate ? room.companyName : room.candidateName;
  }

  // 5. Get interview if exists
  let interview: RoomInterview | null = null;

  try {
    const db = getFirebaseAdminFirestore();
    const candidateRef = db.collection("candidate_information").doc(room.candidateId);
    const companyRef = db.collection("company_information").doc(room.companyId);

    // Query for pending interviews related to this room's participants
    const filter = Filter.and(
      Filter.where("candidate_id", "==", candidateRef),
      Filter.where("company_id", "==", companyRef),
      Filter.where("is_cancel", "==", false)
    );

    const interviews = await webJobInterviewGetByFilter(filter);

    if (interviews && interviews.length > 0) {
      // Get the most recent upcoming interview
      const upcomingInterview = interviews
        .filter((iv) => iv.appointment > Date.now())
        .sort((a, b) => a.appointment - b.appointment)[0];

      if (upcomingInterview) {
        interview = {
          uid: upcomingInterview.uid,
          appointment: upcomingInterview.appointment,
          channel: upcomingInterview.channel as "online" | "onsite",
          status: upcomingInterview.isAccepted
            ? "confirmed"
            : upcomingInterview.isCancel
              ? "cancelled"
              : "pending",
          isCancel: upcomingInterview.isCancel ?? false,
          isAccepted: upcomingInterview.isAccepted ?? false,
          from: upcomingInterview.from,
          to: upcomingInterview.to,
          location: upcomingInterview.location || null,
          meetingLink: upcomingInterview.room || null,
          candidateName: upcomingInterview.candidateName,
          companyName: upcomingInterview.companyName,
          jobId: upcomingInterview.jobId,
          applicationId: upcomingInterview.applicationId,
          candidateId: upcomingInterview.candidateId,
          companyId: upcomingInterview.companyId,
          note: upcomingInterview.note || null,
        };
      }
    }
  } catch (error) {
    console.warn("Failed to fetch interview:", error);
  }

  return {
    room: {
      id: roomId,
      candidateId: room.candidateId,
      companyId: room.companyId,
      applicationId: room.applicationId || null,
      jobId: room.jobId || null,
    },
    otherParty: {
      id: otherPartyId,
      name: otherPartyName,
      photo: otherPartyPhoto,
      role: otherPartyRole as "candidate" | "company",
    },
    currentUser: {
      id: sessionUser.uid,
      role: isCandidate ? "candidate" : "company",
    },
    interview,
    jobId: room.jobId || null,
  };
}
