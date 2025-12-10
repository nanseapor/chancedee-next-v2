import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Profile verification status schema
 */
export const ProfileVerificationStatusSchema = z.enum(['verified', 'unverified', 'flagged', 'suspended']).optional();

/**
 * Firebase candidate screening schema
 * Security and verification screening for candidates
 */
export const FirebaseCandidateScreeningSchema = BaseFirebaseSchema.extend({
  /** Last activity timestamp */
  last_active: z.custom<Timestamp>().optional(),
  
  /** Profile verification status */
  profile_status: ProfileVerificationStatusSchema,
  
  /** Number of flags raised */
  flag_count: z.number().optional(),
  
  /** Email verification status */
  email_verification: z.boolean().optional(),
  
  /** Phone verification status */
  phone_verification: z.boolean().optional(),
  
  /** Identity verification status */
  identity_verification: z.boolean().optional(),
  
  /** Risk assessment score */
  risk_score: z.number().optional(),
});

/**
 * Firebase suspension records schema
 */
export const FirebaseSuspensionRecordsSchema = BaseFirebaseSchema.extend({
  /** Last activity timestamp */
  last_active: z.number().optional(),
  
  /** Suspension date */
  date: z.string().optional(),
  
  /** Reason for suspension */
  reason: z.string().optional(),
  
  /** Duration of suspension */
  duration: z.string().optional(),
  
  /** Admin who issued suspension */
  admin_id: z.string().optional(),
  admin_name: z.string().optional(),
  
  /** Suspension status */
  status: z.string().optional(),
});

/**
 * Firebase activity logs schema
 */
export const FirebaseActivityLogsSchema = BaseFirebaseSchema.extend({
  /** Last activity timestamp */
  last_active: z.number().optional(),
  
  /** Activity type */
  type: z.string().optional(),
  
  /** Activity description */
  description: z.string().optional(),
  
  /** Activity timestamp */
  timestamp: z.string().optional(),
  
  /** IP address */
  ip_address: z.string().optional(),
  
  /** Location information */
  location: z.string().optional(),
  
  /** Device information */
  device_info: z.string().optional(),
});

/**
 * Firebase content flags schema
 */
export const FirebaseContentFlagsSchema = BaseFirebaseSchema.extend({
  /** Last activity timestamp */
  last_active: z.number().optional(),
  
  /** Content section flagged */
  section: z.string().optional(),
  
  /** Flagged content */
  content: z.string().optional(),
  
  /** Reason for flag */
  reason: z.string().optional(),
  
  /** Severity level */
  severity: z.string().optional(),
  
  /** Flag date */
  date: z.string().optional(),
  
  /** Flag status */
  status: z.string().optional(),
  
  /** Reviewer information */
  reviewed_by: z.string().optional(),
});

/**
 * App model schemas (repository transformation output)
 */
export const CandidateScreeningDataSchema = BaseAppSchema.extend({
  lastActive: z.number().optional(),
  profileStatus: ProfileVerificationStatusSchema,
  flagCount: z.number().optional(),
  emailVerification: z.boolean().optional(),
  phoneVerification: z.boolean().optional(),
  identityVerification: z.boolean().optional(),
  riskScore: z.number().optional(),
});

export const SuspensionRecordsDataSchema = BaseAppSchema.extend({
  lastActive: z.number().optional(),
  date: z.string().optional(),
  reason: z.string().optional(),
  duration: z.string().optional(),
  adminId: z.string().optional(),
  adminName: z.string().optional(),
  status: z.string().optional(),
});

export const ActivityLogsDataSchema = BaseAppSchema.extend({
  lastActive: z.number().optional(),
  type: z.string().optional(),
  description: z.string().optional(),
  timestamp: z.string().optional(),
  ipAddress: z.string().optional(),
  location: z.string().optional(),
  deviceInfo: z.string().optional(),
});

export const ContentFlagsDataSchema = BaseAppSchema.extend({
  lastActive: z.number().optional(),
  section: z.string().optional(),
  content: z.string().optional(),
  reason: z.string().optional(),
  severity: z.string().optional(),
  date: z.string().optional(),
  status: z.string().optional(),
  reviewedBy: z.string().optional(),
});

// Export inferred types
export type FirebaseCandidateScreeningType = z.infer<typeof FirebaseCandidateScreeningSchema>;
export type FirebaseSuspensionRecords = z.infer<typeof FirebaseSuspensionRecordsSchema>;
export type FirebaseActivityLogs = z.infer<typeof FirebaseActivityLogsSchema>;
export type FirebaseContentFlags = z.infer<typeof FirebaseContentFlagsSchema>;

export type CandidateScreeningData = z.infer<typeof CandidateScreeningDataSchema>;
export type SuspensionRecordsData = z.infer<typeof SuspensionRecordsDataSchema>;
export type ActivityLogsData = z.infer<typeof ActivityLogsDataSchema>;
export type ContentFlagsData = z.infer<typeof ContentFlagsDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    candidateScreening: FirebaseCandidateScreeningSchema,
    suspensionRecords: FirebaseSuspensionRecordsSchema,
    activityLogs: FirebaseActivityLogsSchema,
    contentFlags: FirebaseContentFlagsSchema,
  },
  app: {
    candidateScreening: CandidateScreeningDataSchema,
    suspensionRecords: SuspensionRecordsDataSchema,
    activityLogs: ActivityLogsDataSchema,
    contentFlags: ContentFlagsDataSchema,
  },
};