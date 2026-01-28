/**
 * Notification Types for NOTIF-R01
 * Per RIS NOTIF-R01 and NOTIF-R00 specifications
 *
 * Key Architecture:
 * - Notifications are NOT a separate collection - they are message types in web_messages
 * - Bell badge counts notification-type messages (interview, offer, system, etc.)
 * - FAB badge counts chat-type messages (text, file, image, emoji, reply)
 */

import type { MessageType } from "./chat.types";

// ============================================
// Message Type Categories (NOTIF-R00 §2.1)
// ============================================

/**
 * Message types that appear in the bell notification center
 * These are "notification-type" messages
 */
export const NOTIFICATION_MESSAGE_TYPES = [
  "interview",
  "interview-reschedule",
  "offer",
  "system",
] as const;

export type NotificationMessageType = (typeof NOTIFICATION_MESSAGE_TYPES)[number];

/**
 * Message types that appear only in the chat FAB
 * These are "chat-type" messages
 */
export const CHAT_MESSAGE_TYPES = [
  "text",
  "file",
  "image",
  "emoji",
  "reply",
] as const;

export type ChatOnlyMessageType = (typeof CHAT_MESSAGE_TYPES)[number];

// ============================================
// Filter Categories (NOTIF-R00 §2.2)
// ============================================

/**
 * Filter tab categories for the notification center
 * - "all": All notification-type messages
 * - "applications": offer messages
 * - "messages": chat messages grouped by room (special case)
 * - "appointments": interview and interview-reschedule messages
 * - "system": system messages
 */
export type NotificationFilterCategory =
  | "all"
  | "applications"
  | "messages"
  | "appointments"
  | "system";

/**
 * Filter tab configuration for display
 */
export interface NotificationFilterTab {
  id: NotificationFilterCategory;
  label: string;
  icon?: string;
}

/**
 * Map filter categories to message types
 */
export const FILTER_TO_MESSAGE_TYPES: Record<NotificationFilterCategory, MessageType[]> = {
  all: ["interview", "interview-reschedule", "offer", "system"],
  applications: ["offer"],
  messages: ["text", "file", "image", "emoji", "reply"], // Special: grouped by room
  appointments: ["interview", "interview-reschedule"],
  system: ["system"],
};

// ============================================
// Notification Items (NOTIF-R01 §3.2)
// ============================================

/**
 * A single notification item from web_messages
 * Used for displaying notification-type messages
 */
export interface NotificationItem {
  /** Message UID from web_messages */
  uid: string;
  /** Room ID for navigation */
  roomId: string;
  /** Message type */
  type: NotificationMessageType;
  /** Message content/title */
  message: string;
  /** Timestamp for display and sorting */
  timestamp: number;
  /** Whether current user has read this */
  isRead: boolean;
  /** Sender information */
  sender: {
    id: string;
    name: string;
    avatar: string | null;
  };
  /** Job context if applicable */
  jobTitle?: string;
  jobId?: string;
  /** Interview-specific fields */
  interviewDate?: string;
  interviewTimeFrom?: string;
  interviewTimeTo?: string;
  interviewChannel?: "online" | "onsite";
  interviewStatus?: string;
  /** Application ID for navigation */
  applicationId?: string;
  /** Action link for direct navigation */
  actionLink?: string;
}

/**
 * Chat messages grouped by room for "Messages" filter
 * Per NOTIF-R01 §3.2.2
 */
export interface GroupedRoomItem {
  /** Room UID */
  roomId: string;
  /** Other party name */
  otherPartyName: string;
  /** Other party avatar */
  otherPartyPhoto: string | null;
  /** Position/job context */
  positionContext: string | null;
  /** Total unread count for this room */
  unreadCount: number;
  /** Preview of last message */
  lastMessagePreview: string;
  /** Timestamp of last message */
  lastMessageTime: number;
  /** Who sent the last message */
  lastMessageSender: "me" | "other";
}

// ============================================
// Badge Counts (NOTIF-R00 §2.3, BLS-11)
// ============================================

/**
 * Bell badge count - only notification-type messages
 */
export interface BellBadgeCount {
  total: number;
  byCategory: {
    applications: number;
    appointments: number;
    system: number;
  };
}

/**
 * FAB badge count - only chat-type messages
 */
export interface FABBadgeCount {
  total: number;
}

// ============================================
// API Response Types (BLS-11)
// ============================================

/**
 * Response from fetchBellNotifications (BLS-11-01)
 */
export interface FetchBellNotificationsResponse {
  notifications: NotificationItem[];
  hasMore: boolean;
  cursor: string | null;
}

/**
 * Response from getFilteredNotifications (BLS-11-07)
 */
export interface FilteredNotificationsResponse {
  items: NotificationItem[] | GroupedRoomItem[];
  filter: NotificationFilterCategory;
  hasMore: boolean;
  cursor: string | null;
}

/**
 * Input for fetchBellNotifications
 */
export interface FetchBellNotificationsInput {
  filter?: NotificationFilterCategory;
  cursor?: string | null;
  limit?: number;
}

/**
 * Input for markNotificationRead (BLS-11-02)
 */
export interface MarkNotificationReadInput {
  messageId: string;
}

/**
 * Response from markNotificationRead
 */
export interface MarkNotificationReadResponse {
  success: boolean;
  newUnreadCount: number;
}

// ============================================
// UI Component Props (NOTIF-R01 §4)
// ============================================

/**
 * Props for NotificationPage
 */
export interface NotificationPageProps {
  initialNotifications?: NotificationItem[];
  initialFilter?: NotificationFilterCategory;
}

/**
 * Props for FilterTabs component
 */
export interface FilterTabsProps {
  activeFilter: NotificationFilterCategory;
  onFilterChange: (filter: NotificationFilterCategory) => void;
  counts?: BellBadgeCount["byCategory"];
  disabled?: boolean;
}

/**
 * Props for NotificationItemCard component
 */
export interface NotificationItemProps {
  notification: NotificationItem;
  onMarkAsRead: (id: string) => void;
  onClick: (notification: NotificationItem) => void;
}

/**
 * Props for GroupedRoomCard component
 */
export interface GroupedRoomItemProps {
  room: GroupedRoomItem;
  onClick: (roomId: string) => void;
}

/**
 * Props for NotificationList component
 */
export interface NotificationListProps {
  items: NotificationItem[] | GroupedRoomItem[];
  filter: NotificationFilterCategory;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onMarkAsRead: (id: string) => void;
  onItemClick: (item: NotificationItem | GroupedRoomItem) => void;
}

/**
 * Props for EmptyState component
 */
export interface NotificationEmptyStateProps {
  filter: NotificationFilterCategory;
}

// ============================================
// Hook Return Types
// ============================================

/**
 * Return type for useNotifications hook
 */
export interface UseNotificationsReturn {
  /** Current notifications or grouped rooms */
  items: NotificationItem[] | GroupedRoomItem[];
  /** Whether the list is currently loading */
  isLoading: boolean;
  /** Whether there are more items to load */
  hasMore: boolean;
  /** Current active filter */
  filter: NotificationFilterCategory;
  /** Bell badge count */
  bellCount: BellBadgeCount;
  /** Error state */
  error: Error | null;
  /** Change the active filter */
  setFilter: (filter: NotificationFilterCategory) => void;
  /** Load more items (pagination) */
  loadMore: () => void;
  /** Mark a notification as read */
  markAsRead: (messageId: string) => Promise<void>;
  /** Mark all notifications as read */
  markAllAsRead: () => Promise<void>;
  /** Refresh the notifications list */
  refresh: () => void;
}

/**
 * Return type for useBellBadge hook
 */
export interface UseBellBadgeReturn {
  count: number;
  isLoading: boolean;
  error: Error | null;
  refresh: () => void;
}
