import type { MESSAGE_TYPES } from "@/constant/message";

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
