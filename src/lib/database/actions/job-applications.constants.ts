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
