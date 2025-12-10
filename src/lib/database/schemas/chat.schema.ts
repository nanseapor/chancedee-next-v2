import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Chat status schema - flexible to match repository usage
 */
export const ChatStatusSchema = z.string().optional();

/**
 * Firebase chat schema
 * Chat rooms between candidates and HR representatives
 */
export const FirebaseChatSchema = BaseFirebaseSchema.extend({
  /** Candidate information */
  candidate_id: z.custom<DocumentReference>().optional(),
  candidate_name: z.string().optional(),
  
  /** Company information */
  company_id: z.custom<DocumentReference>().optional(),
  company_name: z.string().optional(),
  
  /** HR representative */
  responsible_hr_id: z.custom<DocumentReference>().optional(),
  responsible_hr_name: z.string().optional(),
  
  /** Interview reference */
  interview_id: z.custom<DocumentReference>().optional(),
  
  /** Chat status - active | pending | closed */
  status: ChatStatusSchema,
  
  /** Last message information */
  last_message_text: z.string().optional(),
  last_message_sender: z.string().optional(), // 'candidate' | 'hr'
  last_message_time: z.custom<Timestamp>().optional(),
  
  /** Chat timestamp */
  timestamp: z.custom<Timestamp>(),
});

/**
 * App model chat schema (repository transformation output)
 */
export const ChatDataSchema = BaseAppSchema.extend({
  /** Candidate information */
  candidateId: z.string().optional(),
  candidateName: z.string().optional(),
  
  /** Company information */
  companyId: z.string().optional(),
  companyName: z.string().optional(),
  
  /** HR representative */
  responsibleHrId: z.string().optional(),
  responsibleHrName: z.string().optional(),
  
  /** Interview reference */
  interviewId: z.string().optional(),
  
  /** Chat status */
  status: ChatStatusSchema,
  
  /** Last message information */
  lastMessageText: z.string().optional(),
  lastMessageSender: z.string().optional(),
  lastMessageTime: z.number().optional(),
  
  /** Chat timestamp */
  timestamp: z.number(),
});

/**
 * Critical fields schemas for selective validation
 */
export const ChatCriticalSchema = FirebaseChatSchema.pick({
  status: true,
  timestamp: true,
});

export const ChatDataCriticalSchema = ChatDataSchema.pick({
  status: true,
  timestamp: true,
});

// Export inferred types
export type FirebaseChatType = z.infer<typeof FirebaseChatSchema>;
export type ChatData = z.infer<typeof ChatDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseChatSchema,
    critical: ChatCriticalSchema,
  },
  app: {
    full: ChatDataSchema,
    critical: ChatDataCriticalSchema,
  },
};