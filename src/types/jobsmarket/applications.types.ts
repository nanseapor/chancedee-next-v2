/**
 * COMP-R08: Company Applications Management
 * TypeScript type definitions for application management features
 *
 * Per COMP-R08 RIS §4 (Data Contract) and BLS-04 (Screening Stage)
 */

import { MasterJobApplicationStatuses } from '@/constants/application';

// Type alias for application status
export type ApplicationStatus = MasterJobApplicationStatuses;

/**
 * Filter state for applications list
 * Per COMP-R08 RIS §4.4 and BLS-04 §2
 */
export interface ApplicationFilterState {
  jobId: string | null;
  statuses: ApplicationStatus[];
  dateFrom: Date | null;
  dateTo: Date | null;
  minScore: number;
  maxScore: number;
}

/**
 * Sort options for applications list
 * Per COMP-R08 RIS §4.4
 */
export type ApplicationSortOption = 'newest' | 'oldest' | 'score_high' | 'score_low';

/**
 * Application list item for company view
 * Per COMP-R08 RIS §4.2
 */
export interface ApplicationListItem {
  // Core application fields
  uid: string;
  jobId: string;
  candidateId: string;
  companyId: string;
  hrId: string | null;
  status: ApplicationStatus;
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
  createdAt: number;
  updatedAt: number;
  rejectFeedback?: string;
  chatId?: string;

  // Denormalized candidate info
  candidateName: string;
  candidatePhoto: string | null;
  candidateHeadline: string | null;

  // Denormalized job info
  jobTitle: string;

  // Computed fields
  matchScore: number | null;
  isUnread: boolean; // status === 'applied'
}

/**
 * Work experience entry
 * Per COMP-R08 RIS §4.3
 */
export interface WorkExperience {
  company: string;
  position: string;
  startDate: number;
  endDate: number | null;
  isCurrent: boolean;
  description: string;
}

/**
 * Education entry
 * Per COMP-R08 RIS §4.3
 */
export interface Education {
  institution: string;
  degree: string;
  field: string;
  graduationYear: number;
}

/**
 * Language proficiency entry
 * Per COMP-R08 RIS §4.3
 */
export interface Language {
  language: string;
  proficiency: 'basic' | 'conversational' | 'fluent' | 'native';
}

/**
 * Match score breakdown
 * Per COMP-R08 RIS §4.3
 * Note: Deferred to Phase 2+ per SA decision
 */
export interface MatchBreakdown {
  total: number;
  skillMatch: number;
  experienceMatch: number;
  educationMatch: number;
  salaryMatch: number;
}

/**
 * Candidate profile for detail view
 * Per COMP-R08 RIS §4.3
 */
export interface CandidateProfile {
  uid: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  photo: string | null;
  headline: string | null;
  aboutMe: string | null;
  workExperience: WorkExperience[];
  education: Education[];
  skills: string[];
  languages: Language[];
  resumeUrl: string | null;
  expectedSalary: number | null;
  currentSalary: number | null;
}

/**
 * Job details for application context
 * Per COMP-R08 RIS §4.3
 */
export interface JobDetails {
  uid: string;
  title: string;
  status: string;
  isActive: boolean;
  positions: number;
  minSalary: number | null;
  maxSalary: number | null;
  requiredSkills: string[];
  requiredExperience: string;
  requiredEducation: string[];
}

/**
 * Internal note (Phase 2 feature)
 * Per COMP-R08 RIS §4.3
 */
export interface InternalNote {
  uid: string;
  authorId: string;
  authorName: string;
  content: string;
  createdAt: number;
}

/**
 * Interview details (if exists)
 * Per COMP-R08 RIS §4.3
 */
export interface InterviewDetails {
  uid: string;
  status: string;
  appointment: number;
  from: number;
  to: number;
  channel: 'online' | 'onsite';
  location?: string;
  room?: string;
  note?: string;
}

/**
 * Full application detail for detail panel
 * Per COMP-R08 RIS §4.3
 */
export interface ApplicationDetail extends ApplicationListItem {
  // Extended candidate profile
  candidate: CandidateProfile;

  // Match breakdown (null if not calculated)
  matchBreakdown: MatchBreakdown | null;

  // Related job
  job: JobDetails;

  // Interview history
  interviews: InterviewDetails[];

  // Internal notes (Phase 2)
  notes: InternalNote[];
}

/**
 * Accept application input
 * Per BLS-04 §5 (AcceptApplication)
 */
export interface AcceptApplicationInput {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}

/**
 * Accept application output
 * Per BLS-04 §5 (AcceptApplication)
 */
export interface AcceptApplicationOutput {
  status: 200;
  message: string;
  chatId: string;
}

/**
 * Reject application input
 * Per BLS-04 §6 (rejectApplication)
 */
export interface RejectApplicationInput {
  applicationId: string;
  rejectedMessage: string;
  actorId: string;
}

/**
 * Reject application output
 * Per BLS-04 §6 (rejectApplication)
 */
export interface RejectApplicationOutput {
  success: boolean;
}

/**
 * Read application input
 * Per BLS-04 §4 (readApplication)
 */
export interface ReadApplicationInput {
  applicationId: string;
}

/**
 * Read application output
 * Per BLS-04 §4 (readApplication)
 */
export interface ReadApplicationOutput {
  success: boolean;
}

/**
 * Get company applications input
 * Per BLS-04 §1 (JobApplicationGetByCompany)
 */
export interface GetCompanyApplicationsInput {
  companyId: string;
  status?: ApplicationStatus;
  jobId?: string;
}

/**
 * Default filter state
 */
export const DEFAULT_APPLICATION_FILTER: ApplicationFilterState = {
  jobId: null,
  statuses: [],
  dateFrom: null,
  dateTo: null,
  minScore: 0,
  maxScore: 100,
};

/**
 * Withdrawable application statuses
 * Per BLS-03 §3 (withdraw rules)
 */
export const WITHDRAWABLE_STATUSES: readonly ApplicationStatus[] = [
  MasterJobApplicationStatuses.new, // 'applied'
  MasterJobApplicationStatuses.read,
  MasterJobApplicationStatuses.accepted,
  MasterJobApplicationStatuses.scheduled,
  MasterJobApplicationStatuses.confirmed,
] as const;

/**
 * Acceptable application statuses (for Accept button)
 * Per COMP-R08 RIS §3 (JOB-016)
 */
export const ACCEPTABLE_STATUSES: readonly ApplicationStatus[] = [
  MasterJobApplicationStatuses.new, // 'applied'
  MasterJobApplicationStatuses.read,
] as const;

/**
 * Rejectable application statuses (for Reject button)
 * Per COMP-R08 RIS §3 (JOB-017)
 */
export const REJECTABLE_STATUSES: readonly ApplicationStatus[] = [
  MasterJobApplicationStatuses.new, // 'applied'
  MasterJobApplicationStatuses.read,
  MasterJobApplicationStatuses.accepted,
] as const;
