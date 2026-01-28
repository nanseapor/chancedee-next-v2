"use server";

/**
 * Notification Server Actions - BLS-11
 *
 * Notifications are NOT a separate collection - they are message types in web_messages.
 * Bell badge counts notification-type messages (interview, interview-reschedule, offer, system)
 * FAB badge counts chat-type messages (text, file, image, emoji, reply)
 */

import { Filter, Timestamp } from "firebase-admin/firestore";

import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { getSessionUser } from "@/lib/firebase/admin-auth";
import type {
  NotificationItem,
  GroupedRoomItem,
  NotificationFilterCategory,
  BellBadgeCount,
  FABBadgeCount,
  FetchBellNotificationsResponse,
  FilteredNotificationsResponse,
  MarkNotificationReadInput,
  MarkNotificationReadResponse,
  FetchBellNotificationsInput,
  NOTIFICATION_MESSAGE_TYPES,
  CHAT_MESSAGE_TYPES,
  FILTER_TO_MESSAGE_TYPES,
} from "@/types/notification.types";
import type { MessageWithId } from "@/types/chat.types";

// Constants for notification types
const NOTIFICATION_TYPES = ["interview", "interview-reschedule", "offer", "system"] as const;
const CHAT_TYPES = ["text", "file", "image", "emoji", "reply"] as const;

// Filter to message type mapping
const FILTER_MESSAGE_MAP: Record<NotificationFilterCategory, readonly string[]> = {
  all: NOTIFICATION_TYPES,
  applications: ["offer"],
  messages: CHAT_TYPES,
  appointments: ["interview", "interview-reschedule"],
  system: ["system"],
};

/**
 * BLS-11-01: Fetch bell notifications with pagination
 */
export async function fetchBellNotifications(
  input: FetchBellNotificationsInput = {}
): Promise<FetchBellNotificationsResponse> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const { filter = "all", cursor, limit = 20 } = input;
  const db = getFirebaseAdminFirestore();

  // Get user ID for checking unread array
  const userId = session.candidateId || session.companyId;
  if (!userId) {
    throw new Error("USER_NOT_FOUND");
  }

  // Build query for notification types
  const messageTypes = FILTER_MESSAGE_MAP[filter] || NOTIFICATION_TYPES;

  let query = db
    .collection("messages")
    .where("type", "in", messageTypes)
    .where("unread", "array-contains", userId)
    .orderBy("timestamp", "desc")
    .limit(limit + 1);

  // Also include read notifications for the "all" view
  // For simplicity, we query unread first, then merge with recent read
  // In a production app, you might use a composite index

  if (cursor) {
    const cursorTimestamp = parseInt(cursor, 10);
    query = query.startAfter(Timestamp.fromMillis(cursorTimestamp));
  }

  const snapshot = await query.get();
  const hasMore = snapshot.docs.length > limit;
  const docs = hasMore ? snapshot.docs.slice(0, limit) : snapshot.docs;

  const notifications: NotificationItem[] = await Promise.all(
    docs.map(async (doc) => {
      const data = doc.data();
      return transformToNotificationItem(data, doc.id, userId);
    })
  );

  const lastNotif = notifications[notifications.length - 1];
  const nextCursor = hasMore && lastNotif ? lastNotif.timestamp.toString() : null;

  return {
    notifications,
    hasMore,
    cursor: nextCursor,
  };
}

/**
 * BLS-11-02: Mark a single notification as read
 */
export async function markNotificationRead(
  input: MarkNotificationReadInput
): Promise<MarkNotificationReadResponse> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = session.candidateId || session.companyId;
  if (!userId) {
    throw new Error("USER_NOT_FOUND");
  }

  const db = getFirebaseAdminFirestore();
  const messageRef = db.collection("messages").doc(input.messageId);

  const doc = await messageRef.get();
  if (!doc.exists) {
    throw new Error("MESSAGE_NOT_FOUND");
  }

  const data = doc.data();
  const currentUnread: string[] = data?.unread || [];

  // Remove user from unread array
  const newUnread = currentUnread.filter((id) => id !== userId);

  await messageRef.update({
    unread: newUnread,
    updated_at: Timestamp.now(),
  });

  // Get new unread count
  const countResult = await getBellUnreadCount();

  return {
    success: true,
    newUnreadCount: countResult.total,
  };
}

/**
 * BLS-11-03: Mark all notifications as read
 */
export async function markAllNotificationsRead(): Promise<{ success: boolean }> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = session.candidateId || session.companyId;
  if (!userId) {
    throw new Error("USER_NOT_FOUND");
  }

  const db = getFirebaseAdminFirestore();

  // Get all unread notification-type messages for this user
  const snapshot = await db
    .collection("messages")
    .where("type", "in", [...NOTIFICATION_TYPES])
    .where("unread", "array-contains", userId)
    .get();

  if (snapshot.empty) {
    return { success: true };
  }

  // Batch update to remove user from all unread arrays
  const batch = db.batch();

  for (const doc of snapshot.docs) {
    const data = doc.data();
    const currentUnread: string[] = data?.unread || [];
    const newUnread = currentUnread.filter((id) => id !== userId);

    batch.update(doc.ref, {
      unread: newUnread,
      updated_at: Timestamp.now(),
    });
  }

  await batch.commit();

  return { success: true };
}

/**
 * BLS-11-04: Get bell badge unread count
 */
export async function getBellUnreadCount(): Promise<BellBadgeCount> {
  const session = await getSessionUser();
  if (!session) {
    return { total: 0, byCategory: { applications: 0, appointments: 0, system: 0 } };
  }

  const userId = session.candidateId || session.companyId;
  if (!userId) {
    return { total: 0, byCategory: { applications: 0, appointments: 0, system: 0 } };
  }

  const db = getFirebaseAdminFirestore();

  // Count by category in parallel
  const [applicationsCount, appointmentsCount, systemCount] = await Promise.all([
    // Applications (offer)
    db
      .collection("messages")
      .where("type", "in", ["offer"])
      .where("unread", "array-contains", userId)
      .count()
      .get(),
    // Appointments (interview, interview-reschedule)
    db
      .collection("messages")
      .where("type", "in", ["interview", "interview-reschedule"])
      .where("unread", "array-contains", userId)
      .count()
      .get(),
    // System
    db
      .collection("messages")
      .where("type", "==", "system")
      .where("unread", "array-contains", userId)
      .count()
      .get(),
  ]);

  const applications = applicationsCount.data().count;
  const appointments = appointmentsCount.data().count;
  const system = systemCount.data().count;

  return {
    total: applications + appointments + system,
    byCategory: {
      applications,
      appointments,
      system,
    },
  };
}

/**
 * BLS-11-05: Get chat FAB unread count
 */
export async function getChatFABUnreadCount(): Promise<FABBadgeCount> {
  const session = await getSessionUser();
  if (!session) {
    return { total: 0 };
  }

  const userId = session.candidateId || session.companyId;
  if (!userId) {
    return { total: 0 };
  }

  const db = getFirebaseAdminFirestore();

  const countResult = await db
    .collection("messages")
    .where("type", "in", [...CHAT_TYPES])
    .where("unread", "array-contains", userId)
    .count()
    .get();

  return {
    total: countResult.data().count,
  };
}

/**
 * BLS-11-07: Get filtered notifications
 */
export async function getFilteredNotifications(
  input: FetchBellNotificationsInput = {}
): Promise<FilteredNotificationsResponse> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const { filter = "all", cursor, limit = 20 } = input;

  // Special handling for "messages" filter - returns grouped rooms
  if (filter === "messages") {
    const groupedRooms = await groupMessagesByRoom();
    return {
      items: groupedRooms,
      filter: "messages",
      hasMore: false, // Grouped rooms are not paginated for now
      cursor: null,
    };
  }

  // For other filters, return notification items
  const result = await fetchBellNotifications(input);

  return {
    items: result.notifications,
    filter,
    hasMore: result.hasMore,
    cursor: result.cursor,
  };
}

/**
 * BLS-11-08: Group chat messages by room for "Messages" filter
 */
export async function groupMessagesByRoom(): Promise<GroupedRoomItem[]> {
  const session = await getSessionUser();
  if (!session) {
    throw new Error("UNAUTHORIZED");
  }

  const userId = session.candidateId || session.companyId;
  if (!userId) {
    throw new Error("USER_NOT_FOUND");
  }

  const userRole = session.candidateId ? "candidate" : "company";
  const db = getFirebaseAdminFirestore();

  // Get all chat rooms for this user
  const roomsSnapshot = await db
    .collection("chats")
    .where(
      userRole === "candidate" ? "candidate_id" : "company_id",
      "==",
      db.collection(userRole === "candidate" ? "candidate_information" : "company_information").doc(userId)
    )
    .orderBy("timestamp", "desc")
    .limit(50)
    .get();

  if (roomsSnapshot.empty) {
    return [];
  }

  const groupedRooms: GroupedRoomItem[] = [];

  for (const roomDoc of roomsSnapshot.docs) {
    const roomData = roomDoc.data();

    // Get unread count for this room (chat-type messages only)
    const roomRef = db.collection("chats").doc(roomDoc.id);
    const unreadSnapshot = await db
      .collection("messages")
      .where("room_id", "==", roomRef)
      .where("type", "in", [...CHAT_TYPES])
      .where("unread", "array-contains", userId)
      .count()
      .get();

    const unreadCount = unreadSnapshot.data().count;

    // Get last message
    const lastMessageSnapshot = await db
      .collection("messages")
      .where("room_id", "==", roomRef)
      .where("type", "in", [...CHAT_TYPES])
      .orderBy("timestamp", "desc")
      .limit(1)
      .get();

    let lastMessagePreview = "";
    let lastMessageTime = extractTimestampValue(roomData.timestamp);
    let lastMessageSender: "me" | "other" = "other";

    if (!lastMessageSnapshot.empty && lastMessageSnapshot.docs[0]) {
      const lastMsgData = lastMessageSnapshot.docs[0].data();
      lastMessagePreview = lastMsgData.message || "";
      lastMessageTime = extractTimestampValue(lastMsgData.timestamp);

      // Determine if sender is current user
      const senderId = extractDocIdFromRef(lastMsgData.sender_id);
      lastMessageSender = senderId === userId ? "me" : "other";
    }

    // Determine other party info based on user role
    const otherPartyName =
      userRole === "candidate" ? roomData.company_name : roomData.candidate_name;
    const otherPartyId =
      userRole === "candidate"
        ? extractDocIdFromRef(roomData.company_id)
        : extractDocIdFromRef(roomData.candidate_id);

    groupedRooms.push({
      roomId: roomDoc.id,
      otherPartyName: otherPartyName || "Unknown",
      otherPartyPhoto: null, // Would need to fetch from company/candidate info
      positionContext: roomData.job_title || null,
      unreadCount,
      lastMessagePreview,
      lastMessageTime,
      lastMessageSender,
    });
  }

  // Sort by last message time, descending
  groupedRooms.sort((a, b) => b.lastMessageTime - a.lastMessageTime);

  return groupedRooms;
}

// ============================================
// Helper Functions
// ============================================

/**
 * Transform Firestore document to NotificationItem
 */
async function transformToNotificationItem(
  data: FirebaseFirestore.DocumentData,
  docId: string,
  userId: string
): Promise<NotificationItem> {
  const unreadArray: string[] = data.unread || [];

  return {
    uid: docId,
    roomId: extractDocIdFromRef(data.room_id),
    type: data.type as NotificationItem["type"],
    message: data.message || "",
    timestamp: extractTimestampValue(data.timestamp),
    isRead: !unreadArray.includes(userId),
    sender: {
      id: extractDocIdFromRef(data.sender_id),
      name: data.sender_name || "",
      avatar: data.sender_avatar || null,
    },
    jobTitle: data.job_title,
    jobId: extractDocIdFromRef(data.job_id),
    interviewDate: data.schedule_date,
    interviewTimeFrom: data.schedule_time_from,
    interviewTimeTo: data.schedule_time_to,
    interviewChannel: data.channel as "online" | "onsite" | undefined,
    interviewStatus: data.status,
    applicationId: extractDocIdFromRef(data.application_id),
    actionLink: data.action_link,
  };
}

/**
 * Extract document ID from DocumentReference or string
 */
function extractDocIdFromRef(ref: unknown): string {
  if (!ref) return "";
  if (typeof ref === "string") return ref;
  if (typeof ref === "object" && "id" in ref) {
    return (ref as { id: string }).id;
  }
  return "";
}

/**
 * Extract timestamp value from Firestore Timestamp or number
 */
function extractTimestampValue(timestamp: unknown): number {
  if (!timestamp) return Date.now();
  if (typeof timestamp === "number") return timestamp;
  if (timestamp instanceof Timestamp) {
    return timestamp.toMillis();
  }
  if (typeof timestamp === "object" && "toMillis" in timestamp) {
    return (timestamp as { toMillis: () => number }).toMillis();
  }
  return Date.now();
}
