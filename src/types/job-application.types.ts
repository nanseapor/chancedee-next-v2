import type { MasterJobApplicationStatuses } from "@/constants/application";

import type { IBaseDatabaseInterface } from "./database.types";
import type { jobInterviewData } from "./interview.types";

/**
 * @typedef {Object} jobApplicationData - Information about a job application
 * @property {string} uid - The unique identifier for the job application.
 * @property {string} jobId - The ID of the job being applied for.
 * @property {string} candidateId - The ID of the candidate who applied for the job.
 * @property {string} hrId - The ID of the HR representative handling the application.
 * @property {string} companyId - The ID of the company offering the job.
 * @property {string} status - The current status of the job application (e.g., pending, accepted, rejected).
 * @property {string} resumeId - The ID of the candidate's resume.
 *
 * @property {number} expectedSalary - The candidate's expected salary for the position.
 * @property {number} overheadDays - The number of days the candidate is available after receiving confirmation.
 * @property {string} headlines - A brief note or headline from the candidate to the employer.
 * @property {boolean} isNegotiable - Whether the expected salary is negotiable.
 * @property {string} expectedDate - The expected start date for the job, if confirmed.
 *
 * @property {jobInterviewData[]} [interview] - An array of interview data (optional).
 * @property {string} [rejectFeedback] - Feedback provided to the candidate if the application is rejected (optional).
 * @property {string} [createBy] - The user who created the application (optional).
 * @property {number} [createDate] - The timestamp when the application was created (optional).
 * @property {string} [updateBy] - The user who last updated the application (optional).
 * @property {number} [updateDate] - The timestamp when the application was last updated (optional).
 * @property {boolean} [isAccepterTerms] - Whether the candidate has accepted the terms and conditions (optional).
 * @property {number} [appliedCount] - The number of times the candidate has applied for jobs (optional).
 */
export interface jobApplicationData extends IBaseDatabaseInterface {
  uid: string;
  jobId: string;
  jobTitle?: string;
  candidateId: string;
  hrId?: string;
  companyId: string;
  companyName: string;
  chatId?: string;
  status: MasterJobApplicationStatuses;
  resumeId?: string;
  expectedSalary?: number;
  overheadDays?: number;
  headlines?: string;
  isNegotiable?: boolean;
  expectedDate?: number;
  interview?: jobInterviewData[];
  rejectFeedback?: string;
  isAccepterTerms?: boolean;
  appliedCount?: number;
}

export interface jobApplicationReturnData {
  id: string;
  data: jobApplicationData;
}

export interface ICandidateApplicationList {
  avatarUrl: string;
  jobApplicationDate: string;
  age: number;
  birthdate: number;
  province: string;
  district: string;
  jobTitle: string;
  jobApplicationId: number;
  jobApplicationStatusId: number;
  jobApplicationStatusText: string;
  candidateId: number;
  jobPostId: number;
  hrId: number;
  hrName: string;
  educationLvId: number;
  educationLevelText: string;
  experienceYear: number;
  expectedSalary: number;
  overheadDays: number;
  headlines: string;
  isNegotiable: false;
  expectedDate: number;
}
