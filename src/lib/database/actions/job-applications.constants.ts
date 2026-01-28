/**
 * Job Application Types and Constants
 * Extracted from job-applications.ts to avoid "use server" export restrictions
 * Per Next.js 15: "use server" files can only export async functions
 */

/**
 * ApplicationWithDetails - Application data with joined job, company, and interview details
 * Returned by webJobApplicationGetByCandidate
 */
export interface ApplicationWithDetails {
  // Core application fields
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  status: string; // JobApplicationStatus
  chatId?: string;
  expectedSalary?: number;
  overheadDays?: number;
  headlines?: string;
  isNegotiable?: boolean;
  rejectFeedback?: string;
  createdAt: number;
  updatedAt: number;

  // Joined job fields
  jobTitle: string;
  jobIsActive: boolean;

  // Joined company fields
  companyName: string;
  companyLogo?: string;

  // Joined interview (optional - only if scheduled)
  interview?: InterviewDetails | null;
}

/**
 * InterviewDetails - Interview data joined to application
 */
export interface InterviewDetails {
  uid: string;
  status: string; // InterviewStatus
  appointment: number; // Timestamp
  from: string; // Start time HH:mm
  to: string; // End time HH:mm
  channel: 'online' | 'onsite';
  location?: string;
  room?: string;
  note?: string;
}

/**
 * Withdrawable application statuses
 * Per CAND-R04 RIS §6 and SA decision
 */
export const WITHDRAWABLE_STATUSES = [
  'applied',
  'read',
  'accepted',
  'scheduled',
  'confirmed',
] as const;

export type WithdrawableStatus = typeof WITHDRAWABLE_STATUSES[number];

/**
 * Active application statuses - block new application
 * Per BLS-03-01 Assessment and SA decision
 */
export const ACTIVE_APPLICATION_STATUSES = [
  'applied',
  'read',
  'accepted',
  'scheduled',
  'confirmed',
] as const;

export type ActiveApplicationStatus = typeof ACTIVE_APPLICATION_STATUSES[number];

/**
 * Reapply allowed statuses - allow reapplication
 * Per BLS-03-01 Assessment and SA decision
 */
export const REAPPLY_ALLOWED_STATUSES = [
  'withdraw',
  'rejected',
  'declined',
  'cancelled',
  'closed',
  'systemclosed',
] as const;

export type ReapplyAllowedStatus = typeof REAPPLY_ALLOWED_STATUSES[number];

/**
 * SubmitApplicationInput - Input for submitApplication server action
 * Per BLS-03-01 specification
 */
export interface SubmitApplicationInput {
  jobId: string;
  expectedSalary?: number | null;
  isNegotiable?: boolean;
  overheadDays?: 0 | 7 | 15 | 30 | 60 | 90;
  headlines?: string;
}

/**
 * SubmitApplicationResult - Return type for submitApplication server action
 * Per BLS-03-01 specification
 */
export interface SubmitApplicationResult {
  success: boolean;
  data?: {
    applicationId: string;
    status: 'applied';
    appliedAt: number;
  };
  error?: 'ALREADY_APPLIED' | 'JOB_CLOSED' | 'JOB_NOT_FOUND' | 'PROFILE_INCOMPLETE' | 'NETWORK_ERROR';
  keysToInvalidate?: string[];
}
