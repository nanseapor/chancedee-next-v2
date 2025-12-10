import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Message types schema - flexible to match repository usage
 */
export const MessageTypeSchema = z.string();

/**
 * Firebase messages schema
 * Complete schema matching the repository field requirements
 */
export const FirebaseMessageSchema = BaseFirebaseSchema.extend({
  /** Core message fields */
  room_id: z.custom<DocumentReference>().optional(),
  sender_id: z.custom<DocumentReference>().optional(),
  sender_name: z.string(),
  sender_avatar: z.string(),
  type: z.string().optional(),
  message: z.string().optional(),
  
  /** File/Image support */
  file_url: z.string().optional(),
  file_type: z.string().optional(),
  file_size: z.string().optional(),
  
  /** Emoji-specific */
  emoji_code: z.string().optional(),
  emoji_url: z.string().optional(),
  
  /** Reply/Interview-related fields */
  application_id: z.custom<DocumentReference>().optional(),
  candidate_id: z.custom<DocumentReference>().optional(),
  company_id: z.custom<DocumentReference>().optional(),
  job_id: z.custom<DocumentReference>().optional(),
  job_title: z.string().optional(),
  candidate_name: z.string().optional(),
  status: z.string().optional(),
  channel: z.string().optional(),
  location: z.string().optional(),
  note: z.string().optional(),
  
  /** Interview schedule */
  schedule_date: z.string().optional(),
  schedule_time_from: z.string().optional(),
  schedule_time_to: z.string().optional(),
  interview_id: z.string().optional(),
  
  /** Reschedule-specific */
  reschedule_old_date: z.string().optional(),
  reschedule_new_date: z.string().optional(),
  reschedule_time_from: z.string().optional(),
  reschedule_time_to: z.string().optional(),
  
  /** System message */
  system_title: z.string().optional(),
  system_company: z.string().optional(),
  system_message: z.string().optional(),
  action_link: z.string().optional(),
  
  /** Meta */
  timestamp: z.custom<Timestamp>(),
  unread: z.array(z.string()),
});

/**
 * App model messages schema (repository transformation output)
 */
export const MessageDataSchema = BaseAppSchema.extend({
  /** Core fields */
  roomId: z.string(),
  messageId: z.string(),
  senderId: z.string(),
  timestamp: z.number(),
  type: MessageTypeSchema,
  
  /** Message content */
  actionLink: z.string().optional(),
  avatar: z.string(),
  name: z.string(),
  message: z.string(),
  unread: z.array(z.string()),
  attachments: z.string().optional(),
  
  /** Interview details */
  interviewId: z.string().optional(),
  interviewDate: z.string().optional(),
  interviewTimeFrom: z.string().optional(),
  interviewTimeTo: z.string().optional(),
  interviewChannel: z.string().optional(),
  interviewLocation: z.string().optional(),
  interviewStatus: z.string().optional(),
  
  /** Job and candidate info */
  jobTitle: z.string().optional(),
  candidateName: z.string().optional(),
  applicationId: z.string().optional(),
  candidateId: z.string().optional(),
  companyId: z.string().optional(),
  jobId: z.string().optional(),
  note: z.string().optional(),
  
  /** Reschedule details */
  newInterviewDate: z.string().optional(),
  oldInterviewDate: z.string().optional(),
  oldInterviewTimeFrom: z.string().optional(),
  oldInterviewTimeTo: z.string().optional(),
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const MessageCriticalSchema = FirebaseMessageSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  type: true,
  timestamp: true,
});

export const MessageDataCriticalSchema = MessageDataSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  type: true,
  timestamp: true,
});

// Export inferred types
export type FirebaseMessagesType = z.infer<typeof FirebaseMessageSchema>;
export type MessageData = z.infer<typeof MessageDataSchema>;
export type MessageType = z.infer<typeof MessageTypeSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseMessageSchema,
    critical: MessageCriticalSchema,
  },
  app: {
    full: MessageDataSchema,
    critical: MessageDataCriticalSchema,
  },
};