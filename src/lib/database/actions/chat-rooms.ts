"use server";

import { Filter } from "firebase-admin/firestore";

import { getSessionUser } from "@/lib/firebase/admin-auth";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { chatRepository } from "@/lib/database/repositories/chat-repository";
import { messagesRepository } from "@/lib/database/repositories/messages-repository";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webCompanyInformationGetById } from "@/lib/database/actions/company-information";
import type {
  RoomListItem,
  ChatRoomsMetadataResponse,
  RoomData,
} from "@/types/chat.types";

/**
 * Fetch chat rooms metadata for the current user
 * Per BLS-06-01 listChatRooms
 *
 * @param params.navBar - The current navigation context ('candidate' or 'company')
 * @returns ChatRoomsMetadataResponse with rooms and current user info
 */
export async function fetchChatRoomsMetadata(params: {
  navBar: "candidate" | "company";
}): Promise<ChatRoomsMetadataResponse> {
  const { navBar } = params;

  // 1. Validate session
  const sessionUser = await getSessionUser();
  if (!sessionUser) {
    throw new Error("UNAUTHORIZED");
  }

  // 2. Validate role parameter
  if (navBar !== "candidate" && navBar !== "company") {
    throw new Error("INVALID_ROLE");
  }

  // 3. Determine query parameters based on role
  const isCandidate = navBar === "candidate";
  const userId = isCandidate ? sessionUser.candidateId : sessionUser.companyId;

  if (!userId) {
    // User doesn't have the required role context
    return {
      rooms: [],
      currentUser: {
        id: sessionUser.uid,
        role: navBar,
        candidateId: sessionUser.candidateId ?? undefined,
        companyId: sessionUser.companyId ?? undefined,
      },
    };
  }

  // 4. Query chat rooms
  // Note: Firestore uses snake_case field names, but we need to query with DocumentReference
  const candidateRef = getFirebaseAdminFirestore()
    .collection("candidate_information")
    .doc(userId);
  const companyRef = getFirebaseAdminFirestore()
    .collection("company_information")
    .doc(userId);
  const fieldPath = isCandidate ? "candidate_id" : "company_id";
  const queryRef = isCandidate ? candidateRef : companyRef;
  const filter = Filter.where(fieldPath, "==", queryRef);

  const chatRooms = await chatRepository.getByFilter(filter);

  if (!chatRooms || chatRooms.length === 0) {
    return {
      rooms: [],
      currentUser: {
        id: sessionUser.uid,
        role: navBar,
        candidateId: sessionUser.candidateId ?? undefined,
        companyId: sessionUser.companyId ?? undefined,
      },
    };
  }

  // 5. Transform to RoomListItem[]
  const roomListItems: RoomListItem[] = [];

  for (const room of chatRooms) {
    // Skip corrupted rooms where candidateId equals companyId
    if (room.candidateId === room.companyId) {
      console.warn(`Skipping corrupted room ${room.id}: candidateId === companyId`);
      continue;
    }

    // Get other party info based on role
    const otherPartyId = isCandidate ? room.companyId : room.candidateId;
    let otherPartyName = isCandidate ? room.companyName : room.candidateName;
    let otherPartyPhoto: string | null = null;

    // Fetch additional info for the other party
    try {
      if (isCandidate) {
        // Candidate viewing - get company info
        const companyInfo = await webCompanyInformationGetById(otherPartyId);
        if (companyInfo) {
          otherPartyName = companyInfo.companyName || otherPartyName;
          otherPartyPhoto = companyInfo.profilePhoto || null;
        }
      } else {
        // Company viewing - get candidate info
        const candidateInfo = await webCandidateInformationGetById(otherPartyId);
        if (candidateInfo) {
          otherPartyName = `${candidateInfo.firstnameTH || ""} ${candidateInfo.lastnameTH || ""}`.trim() || otherPartyName;
          otherPartyPhoto = candidateInfo.resumePhotoURL || null;
        }
      }
    } catch (error) {
      // Continue with cached room data if profile fetch fails
      console.warn(`Failed to fetch profile for ${otherPartyId}:`, error);
    }

    // Calculate unread count
    const unreadCount = await calculateUnreadCount(room.id, sessionUser.uid);

    // Check for pending appointments
    const hasPendingAppointment = await checkPendingAppointment(room.id);

    // Determine last message sender
    const lastMessageSender = determineLastMessageSender(room, isCandidate);

    roomListItems.push({
      uid: room.id,
      otherPartyId,
      otherPartyName,
      otherPartyPhoto,
      positionContext: null, // Could be enhanced with job title from applications
      lastMessageText: room.lastMessage ? truncateMessage(room.lastMessage, 50) : null,
      lastMessageTime: room.lastupdate || Date.now(),
      lastMessageSender,
      unreadCount,
      hasPendingAppointment,
    });
  }

  // 6. Sort by lastMessageTime descending (newest first)
  roomListItems.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  return {
    rooms: roomListItems,
    currentUser: {
      id: sessionUser.uid,
      role: navBar,
      candidateId: sessionUser.candidateId ?? undefined,
      companyId: sessionUser.companyId ?? undefined,
    },
  };
}

/**
 * Calculate unread message count for a room
 */
async function calculateUnreadCount(
  roomId: string,
  userId: string
): Promise<number> {
  try {
    // Query messages where user is in the unread array
    const filter = Filter.and(
      Filter.where("roomId", "==", roomId),
      Filter.where("unread", "array-contains", userId)
    );

    const unreadMessages = await messagesRepository.getByFilter(filter);
    return unreadMessages?.length || 0;
  } catch (error) {
    console.warn(`Failed to calculate unread count for room ${roomId}:`, error);
    return 0;
  }
}

/**
 * Check if room has pending appointment (interview)
 */
async function checkPendingAppointment(roomId: string): Promise<boolean> {
  try {
    // Query messages with type 'interview' and pending status
    const filter = Filter.and(
      Filter.where("roomId", "==", roomId),
      Filter.where("type", "==", "interview"),
      Filter.where("interviewStatus", "==", "pending")
    );

    const interviewMessages = await messagesRepository.getByFilter(filter);
    return (interviewMessages?.length || 0) > 0;
  } catch (error) {
    console.warn(`Failed to check pending appointments for room ${roomId}:`, error);
    return false;
  }
}

/**
 * Determine who sent the last message
 */
function determineLastMessageSender(
  room: RoomData,
  isCandidate: boolean
): "candidate" | "hr" {
  // This is a simplified implementation
  // In production, you'd query the actual last message
  // For now, default to 'hr' for company-initiated chats
  return isCandidate ? "hr" : "candidate";
}

/**
 * Truncate message to specified length
 */
function truncateMessage(message: string, maxLength: number): string {
  if (message.length <= maxLength) {
    return message;
  }
  return message.slice(0, maxLength - 3) + "...";
}
