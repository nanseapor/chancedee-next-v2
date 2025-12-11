import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { MasterJobApplicationStatuses } from '@/constants/application';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Interview status schema - based on MasterJobApplicationStatuses enum
 */
export const InterviewStatusSchema = z.enum([
  'withdraw',
  'accepted', 
  'rejected',
  'read',
  'applied', // This is the value for MasterJobApplicationStatuses.new
  'scheduled',
  'cancelled',
  'confirmed',
  'declined',
  'closed',
  'systemclosed', // This is the value for MasterJobApplicationStatuses.system
]);

/**
 * Interview channel schema
 */
export const InterviewChannelSchema = z.enum(['online', 'onsite']);

/**
 * Firebase job interview schema
 * Interview scheduling and management between candidates and companies
 */
export const FirebaseJobInterviewSchema = BaseFirebaseSchema.extend({
  /** Interview references */
  job_id: z.custom<DocumentReference>(),
  application_id: z.custom<DocumentReference>(),
  candidate_id: z.custom<DocumentReference>(),
  company_id: z.custom<DocumentReference>(),
  
  /** Names for display */
  candidate_name: z.string(),
  company_name: z.string(),
  
  /** Interview details */
  channel: z.string(), // online | onsite
  status: InterviewStatusSchema,
  appointment: z.custom<Timestamp>(),
  from: z.string(),
  to: z.string(),
  location: z.string(),
  room: z.string().optional(),
  note: z.string().optional(),
  
  /** Status flags */
  is_cancel: z.boolean().optional(),
  cancel_reason: z.string().optional(),
  is_accepted: z.boolean().optional(),
  reject_feedback: z.string().optional(),
});

/**
 * App model job interview schema (repository transformation output)
 */
export const JobInterviewDataSchema = BaseAppSchema.extend({
  /** Interview references */
  jobId: z.string(),
  applicationId: z.string(),
  candidateId: z.string(),
  companyId: z.string(),
  
  /** Names for display */
  candidateName: z.string(),
  companyName: z.string(),
  
  /** Interview details */
  channel: z.string(),
  status: z.custom<MasterJobApplicationStatuses>(),
  appointment: z.number(),
  from: z.string(),
  to: z.string(),
  location: z.string(),
  room: z.string().optional(),
  note: z.string().optional(),
  
  /** Status flags */
  isCancel: z.boolean().optional(),
  cancelReason: z.string().optional(),
  isAccepted: z.boolean().optional(),
  rejectFeedback: z.string().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const JobInterviewCriticalSchema = FirebaseJobInterviewSchema.pick({
  status: true,
  appointment: true,
  channel: true,
});

export const JobInterviewDataCriticalSchema = JobInterviewDataSchema.pick({
  status: true,
  appointment: true,
  channel: true,
});

// Export inferred types
export type FirebaseJobInterviewType = z.infer<typeof FirebaseJobInterviewSchema>;
export type JobInterviewData = z.infer<typeof JobInterviewDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseJobInterviewSchema,
    critical: JobInterviewCriticalSchema,
  },
  app: {
    full: JobInterviewDataSchema,
    critical: JobInterviewDataCriticalSchema,
  },
};