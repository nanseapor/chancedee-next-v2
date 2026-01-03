import type { MESSAGE_TYPES } from "@/constants/message";

export type UserData = {
  id: number;
  avatar: string;
  name: string;
  message?: string;
};

export type MessageType = (typeof MESSAGE_TYPES)[keyof typeof MESSAGE_TYPES];

export type MessageActions = "message" | "offer" | "interview" | "reply";

/**
 * Represents a chat message within a specific room.
 *
 * @param {string} roomId - The unique identifier for the chat room.
 * @param {string} messageId - The unique identifier for the message.
 * @param {string} senderId - The unique identifier for the sender of the message.
 * @param {number} timestamp - The timestamp when the message was sent.
 * @param {MessageType} type - The type of the message.
 * @param {MessageActions} action - The action associated with the message.
 * @param {string} avatar - The URL or path to the sender's avatar image.
 * @param {string} name - The name of the sender.
 * @param {string} message - The content of the message.
 * @param {string[]} [attachments] - Optional array of attachment URLs or paths.
 * @param {string[]} unread - Array of user IDs who have not read the message.
 * @param {string} [candidateName] - Optional name of the candidate associated with the message.
 */
export interface Message {
  roomId: string;
  messageId: string;
  senderId: string;
  timestamp: number;
  // id: number;
  type: MessageType;
  actionLink?: string;
  avatar: string;
  name: string;
  message: string;
  attachments?: string[];
  unread: string[];
  candidateName?: string;
}

export type ChatMessage = {
  // Existing ChatMessage fields
  roomId: string;
  messageId: string;
  senderId: string;
  timestamp: number;
  type: MessageType;
  actionLink?: string;
  name: string;
  avatar: string;
  message: string;
  unread: string[];
  attachments?: string;
  // Fields from both schemas
  interviewId?: string;
  interviewDate?: string;
  interviewTimeFrom?: string;
  interviewTimeTo?: string;
  interviewChannel?: string;
  interviewLocation?: string;
  interviewStatus?: string;
  rejectionReason?: string;
  applicationStatus?: string;
  jobTitle?: string;
  candidateName?: string;
  applicationId?: string;

  // Additional fields from MessageInterview
  candidateId: string;
  companyId: string;
  jobId?: string;
  note?: string;

  // Reschedule with old date ref
  newInterviewDate?: string;
  oldInterviewDate?: string;
  oldInterviewTimeFrom?: string;
  oldInterviewTimeTo?: string;
};

export interface MessageWithId extends ChatMessage {
  uid: string;
  createdBy: string;
  updatedBy: string;
  createdAt: number;
  updatedAt: number;
}

export interface User {
  uid: string;
  companyId?: string;
  isCompany: boolean;
  avatar: string;
  name: string;
}

/**
 * Represents the data structure for a chat room.
 *
 * @interface RoomData
 *
 * @param {string} id - The unique identifier for the chat room.
 * @param {string} companyId - The unique identifier for the company associated with the chat room.
 * @param {string} candidateId - The unique identifier for the candidate associated with the chat room.
 * @param {User[]} members - An array of users who are members of the chat room.
 * @param {string} name - The name of the chat room.
 * @param {string} company - The name of the company associated with the chat room.
 * @param {string} lastMessage - The content of the last message sent in the chat room.
 * @param {number} lastupdate - The timestamp of the last update in the chat room.
 */
export interface RoomData {
  id: string;
  companyId: string;
  candidateId: string;
  hrId: string;
  candidateName: string;
  companyName: string;
  hrName: string;
  lastMessage: string;
  lastupdate: number;
  lastMessageSender?: "candidate" | "hr";
}

export interface Room {
  id: string;
  companyId: string;
  candidateId: string;
  hrId: string;
  messages: ChatMessage[];
  candidateName: string;
  companyName: string;
  hrName: string;
  avatar: string;
}

export interface MessageInterview {
  candidateName?: string;
  hrName?: string;
  companyName?: string;
  interviewId?: string;
  date: string;
  type: MessageType;
  oldDate?: string;
  from: string;
  to: string;
  channel: string;
  jobTitle: string;
  status?: string;
  applicationId?: string;
  candidateId?: string;
  companyId?: string;
  hrId?: string;
  jobId?: string;
  eventId?: string;
  location?: string;
  note?: string;
}

/**
 * Room list item for chat list display
 * Per CHAT-R01 RIS §4.2
 */
export interface RoomListItem {
  uid: string;
  otherPartyId: string;
  otherPartyName: string;
  otherPartyPhoto: string | null;
  positionContext: string | null;
  lastMessageText: string | null;
  lastMessageTime: number;
  lastMessageSender: "candidate" | "hr";
  unreadCount: number;
  hasPendingAppointment: boolean;
}

/**
 * Current user context for chat
 */
export interface ChatCurrentUser {
  id: string;
  role: "candidate" | "company";
}

/**
 * Response from fetchChatRoomsMetadata
 */
export interface ChatRoomsMetadataResponse {
  rooms: RoomListItem[];
  currentUser: ChatCurrentUser;
}

/**
 * Props for ChatEmptyState component
 */
export interface ChatEmptyStateProps {
  type: "candidate" | "company" | "no_selected" | "no_results";
  searchQuery?: string;
  onClearSearch?: () => void;
  className?: string;
}

// ============================================
// CHAT-R02: Chat Room Types
// ============================================

/**
 * Interview status for chat room display
 */
export type InterviewStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "rescheduled"
  | "completed";

/**
 * Input for sending a text message
 */
export interface SendMessageInput {
  roomId: string;
  message: string;
  type?: "text";
}

/**
 * Input for sending a file/image attachment
 */
export interface SendAttachmentInput {
  roomId: string;
  file: File;
  onProgress?: (progress: number) => void;
  signal?: AbortSignal;
}

/**
 * Input for loading message history with pagination
 */
export interface LoadHistoryInput {
  roomId: string;
  cursor?: string | null;
  limit?: number;
}

/**
 * Response from loadMessageHistory
 */
export interface LoadHistoryResponse {
  messages: MessageWithId[];
  hasMore: boolean;
  cursor: string | null;
}

/**
 * Interview details for room display
 */
export interface RoomInterview {
  uid: string;
  appointment: number;
  channel: "online" | "onsite";
  status: InterviewStatus;
  isCancel: boolean;
  isAccepted: boolean;
  from: string;
  to: string;
  location?: string | null;
  meetingLink?: string | null;
  candidateName: string;
  companyName: string;
  jobId?: string;
  applicationId?: string;
  candidateId?: string;
  companyId?: string;
  note?: string | null;
}

/**
 * Room details for chat room page
 */
export interface RoomDetails {
  room: {
    id: string;
    candidateId: string;
    companyId: string;
    jobId?: string | null;
  };
  otherParty: {
    id: string;
    name: string;
    photo: string | null;
    role: "candidate" | "company";
  };
  currentUser: {
    id: string;
    role: "candidate" | "company";
  };
  interview: RoomInterview | null;
  jobId?: string | null;
}

/**
 * Message state for optimistic updates
 */
export type MessageStatus = "sending" | "sent" | "failed";

/**
 * Extended message with optimistic update status
 */
export interface OptimisticMessage extends MessageWithId {
  status?: MessageStatus;
  _tempId?: string;
}

/**
 * Props for ChatRoomHeader component
 */
export interface ChatRoomHeaderProps {
  otherPartyName: string;
  otherPartyPhoto: string | null;
  otherPartyId: string;
  positionContext?: string;
  isOnline?: boolean;
  onBack: () => void;
  onMenuClick?: () => void;
}

/**
 * Props for MessageBubble component
 */
export interface MessageBubbleProps {
  message: OptimisticMessage;
  currentUserId: string;
  onRetry?: (messageId: string) => void;
  onImageClick?: (imageUrl: string) => void;
  onDownload?: (fileUrl: string, fileName: string) => void;
}

/**
 * Props for MessageList component
 */
export interface MessageListProps {
  messages: OptimisticMessage[];
  currentUserId: string;
  isLoading: boolean;
  hasMore: boolean;
  onLoadMore: () => void;
  onRetry?: (messageId: string) => void;
}

/**
 * Props for MessageInput component
 */
export interface MessageInputProps {
  onSend: (message: string) => void;
  onAttachmentClick: () => void;
  isSending?: boolean;
  disabled?: boolean;
}

/**
 * Props for FileUploadButton component
 */
export interface FileUploadButtonProps {
  onFileSelect: (file: File) => void;
  disabled?: boolean;
  multiple?: boolean;
}

/**
 * Props for AttachmentPreview component
 */
export interface AttachmentPreviewProps {
  file: File;
  onRemove: () => void;
  progress: number;
  isUploading: boolean;
}

/**
 * Props for InterviewCard component
 */
export interface InterviewCardProps {
  interview: RoomInterview;
  userRole: "candidate" | "company";
}

/**
 * Props for DateDivider component
 */
export interface DateDividerProps {
  date: Date | number;
}

/**
 * Props for SystemMessage component
 */
export interface SystemMessageProps {
  message: string;
  timestamp: number;
  type?: string;
}

/**
 * Connection status for real-time updates
 */
export type ConnectionStatus =
  | "connected"
  | "connecting"
  | "reconnecting"
  | "offline"
  | "error";

/**
 * Props for ConnectionBanner component
 */
export interface ConnectionBannerProps {
  status: ConnectionStatus;
  onRetry?: () => void;
}

/**
 * Props for ChatRoomClient component
 */
export interface ChatRoomClientProps {
  roomId: string;
  initialRoomDetails: RoomDetails;
  initialMessages?: OptimisticMessage[];
  userId: string;
}
