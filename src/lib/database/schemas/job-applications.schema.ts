import { DocumentReference, Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

import { MasterJobApplicationStatuses } from '@/constant/application';
import { BaseAppSchema, BaseFirebaseSchema } from './base.schema';

/**
 * Job application status enum values (what's actually stored in Firebase)
 * Based on MasterJobApplicationStatuses enum values, not keys
 */
export const JobApplicationStatusSchema = z.enum([
  'applied',     // MasterJobApplicationStatuses.new = "applied"
  'read',        // MasterJobApplicationStatuses.read = "read"
  'accepted',    // MasterJobApplicationStatuses.accepted = "accepted"
  'rejected',    // MasterJobApplicationStatuses.rejected = "rejected"
  'scheduled',   // MasterJobApplicationStatuses.scheduled = "scheduled"
  'confirmed',   // MasterJobApplicationStatuses.confirmed = "confirmed"
  'declined',    // MasterJobApplicationStatuses.declined = "declined"
  'withdraw',    // MasterJobApplicationStatuses.withdraw = "withdraw"
  'closed',      // MasterJobApplicationStatuses.closed = "closed"
  'systemclosed', // MasterJobApplicationStatuses.system = "systemclosed"
  'cancelled',   // MasterJobApplicationStatuses.cancelled = "cancelled"
]);

/**
 * Firebase job application schema (what's stored in Firestore)
 * Based on FirebaseJobApplicationType
 */
export const FirebaseJobApplicationSchema = BaseFirebaseSchema.extend({
  /** The unique identifier for the job */
  job_id: z.custom<DocumentReference>(),
  
  /** The unique identifier for the candidate */
  candidate_id: z.custom<DocumentReference>(),
  
  /** The unique identifier for the HR representative (optional) */
  hr_id: z.custom<DocumentReference>().optional(),
  
  /** The unique identifier for the company */
  company_id: z.custom<DocumentReference>(),
  
  /** Company name for easy access */
  company_name: z.string(),
  
  /** Chat room reference (optional) */
  chat_id: z.custom<DocumentReference>().optional(),
  
  /** 
   * Current status of the job application
   * Stores enum VALUES not keys (e.g., "applied" not "new")
   */
  status: JobApplicationStatusSchema,
  
  /** The unique identifier for the candidate's resume (optional) */
  resume_id: z.custom<DocumentReference>().optional(),
  
  /** The expected salary for the job (optional) */
  expected_salary: z.number().optional(),
  
  /** 
   * Number of overhead days for the job application process (optional)
   * 0 = ready now, 30 = 1 month prior to start, 365 = check exact ready date
   */
  overhead_days: z.number().optional(),
  
  /** Headlines or summary of the job application (optional) */
  headlines: z.string().optional(),
  
  /** Indicates if the salary is negotiable (optional) */
  is_negotiable: z.boolean().optional(),
  
  /** Expected date for the job application process (optional) */
  expected_date: z.custom<Timestamp>().optional(),
  
  /** Optional feedback provided if the application is rejected */
  reject_feedback: z.string().optional(),
  
  /** 
   * Optional flag indicating if the terms are accepted
   * @deprecated
   */
  is_accepter_terms: z.boolean().optional(),
  
  /** Optional count of how many times the candidate has applied */
  applied_count: z.number().optional(),
});

/**
 * App model job application schema (transformed for application use)
 * Based on jobApplicationData interface
 */
export const JobApplicationSchema = BaseAppSchema.extend({
  /** Job ID */
  jobId: z.string(),
  
  /** Job title (added by repository transformation) */
  jobTitle: z.string().optional(),
  
  /** Candidate ID */
  candidateId: z.string(),
  
  /** HR ID (optional) */
  hrId: z.string().optional(),
  
  /** Company ID */
  companyId: z.string(),
  
  /** Company name */
  companyName: z.string(),
  
  /** Chat ID (optional) */
  chatId: z.string().optional(),
  
  /** 
   * Application status using enum type
   * This will be validated against the enum at runtime
   */
  status: JobApplicationStatusSchema,
  
  /** Resume ID (optional) */
  resumeId: z.string().optional(),
  
  /** Expected salary (optional) */
  expectedSalary: z.number().optional(),
  
  /** Overhead days (optional) */
  overheadDays: z.number().optional(),
  
  /** Headlines (optional) */
  headlines: z.string().optional(),
  
  /** Is salary negotiable (optional) */
  isNegotiable: z.boolean().optional(),
  
  /** Expected date as timestamp (optional) */
  expectedDate: z.number().optional(),
  
  /** 
   * Interview data (not stored in Firebase, added by app logic)
   * TODO: Replace z.any() with proper jobInterviewData schema once type compatibility issues are resolved
   * This field expects jobInterviewData[] but creating a matching Zod schema creates circular type issues
   */
  interview: z.array(z.any()).optional(),
  
  /** Rejection feedback (optional) */
  rejectFeedback: z.string().optional(),
  
  /** Terms acceptance (optional, deprecated) */
  isAccepterTerms: z.boolean().optional(),
  
  /** Applied count (optional) */
  appliedCount: z.number().optional(),
});

/**
 * Critical fields schema for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const JobApplicationCriticalSchema = JobApplicationSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  status: true,
});

export const FirebaseJobApplicationCriticalSchema = FirebaseJobApplicationSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  status: true,
});

// Export inferred types
export type FirebaseJobApplicationType = z.infer<typeof FirebaseJobApplicationSchema>;
export type JobApplicationData = z.infer<typeof JobApplicationSchema>;
export type JobApplicationStatus = z.infer<typeof JobApplicationStatusSchema>;

// Import for compatibility mapping

// Type conversion utility for gradual migration
export function convertStatusToEnum(status: JobApplicationStatus): MasterJobApplicationStatuses {
  // Map status values to enum values (they should be identical, but this ensures type safety)
  const statusMap: Record<JobApplicationStatus, MasterJobApplicationStatuses> = {
    'applied': MasterJobApplicationStatuses.new,
    'read': MasterJobApplicationStatuses.read,
    'accepted': MasterJobApplicationStatuses.accepted,
    'rejected': MasterJobApplicationStatuses.rejected,
    'scheduled': MasterJobApplicationStatuses.scheduled,
    'confirmed': MasterJobApplicationStatuses.confirmed,
    'declined': MasterJobApplicationStatuses.declined,
    'withdraw': MasterJobApplicationStatuses.withdraw,
    'closed': MasterJobApplicationStatuses.closed,
    'systemclosed': MasterJobApplicationStatuses.system,
    'cancelled': MasterJobApplicationStatuses.cancelled,
  };
  
  return statusMap[status];
}

// Convert JobApplicationData to legacy jobApplicationData for compatibility
export function convertToLegacyJobApplicationData(data: JobApplicationData): import('@/types/job-application.types').jobApplicationData {
  return {
    ...data,
    status: convertStatusToEnum(data.status),
  } as import('@/types/job-application.types').jobApplicationData;
}

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseJobApplicationSchema,
    critical: FirebaseJobApplicationCriticalSchema,
  },
  app: {
    full: JobApplicationSchema,
    critical: JobApplicationCriticalSchema,
  },
};