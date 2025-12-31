"use server";

import { Filter } from "firebase-admin/firestore";

import { MasterJobApplicationStatuses } from "@/constants/application";
import { jobApplicationData } from "@/types/job-application.types";
import { convertStatusToEnum, JobApplicationData } from "@/lib/database/schemas/job-applications.schema";

import { jobApplicationsRepository } from "../repositories/job-applications-repository";
import { jobsRepository } from "../repositories/jobs-repository";
import { getFirebaseAdminFirestore } from "@/lib/firebase/admin";
import { webJobGetById } from "./jobs";
import { webCompanyInformationGetById } from "./company-information";
import { webJobInterviewGetByFilter } from "./job-interviews";

// Import types and constants from separate file to avoid "use server" export restrictions
// Per Next.js 15: "use server" files can only export async functions
import {
  WITHDRAWABLE_STATUSES,
  ACTIVE_APPLICATION_STATUSES,
  REAPPLY_ALLOWED_STATUSES,
  type WithdrawableStatus,
  type ActiveApplicationStatus,
  type ReapplyAllowedStatus,
  type ApplicationWithDetails,
  type InterviewDetails,
  type SubmitApplicationInput,
  type SubmitApplicationResult
} from './job-applications.constants';
import { candidateInformationRepository } from "../repositories/candidate-information-repository";

// Convert legacy jobApplicationData to new JobApplicationData schema
function convertLegacyToNewJobApplicationData(legacy: jobApplicationData): JobApplicationData {
  return {
    ...legacy,
    status: legacy.status, // The enum values should be the same
    createdAt: legacy.createdAt || 0, // Ensure required field is present
    updatedAt: legacy.updatedAt || 0, // Ensure required field is present
  };
}

async function webJobApplicationGetById(uid: string) {
  try {
    const application = await jobApplicationsRepository.getById(uid);
    if (!application) {
      return null;
    }

    // Validate status
    if (!Object.values(MasterJobApplicationStatuses).includes(application.status as MasterJobApplicationStatuses)) {
      throw new Error("Enum status not matched, data is corrupted");
    }

    // Fetch job title separately to maintain interface compatibility
    let jobTitle: string | undefined;
    if (application.jobId) {
      const job = await jobsRepository.getById(application.jobId);
      jobTitle = job?.title;
    }

    return {
      ...application,
      jobTitle,
    };
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

async function webJobApplicationGetByFilter(filter?: Filter) {
  try {
    const applications = await jobApplicationsRepository.getByFilter(filter);
    if (!applications || applications.length === 0) {
      // If no applications found, return empty array instead of null
      return [];
    }

    // Fetch job titles for all applications in parallel
    const applicationsWithJobTitles = await Promise.all(
      applications.map(async (application) => {
        // Validate status
        if (!Object.values(MasterJobApplicationStatuses).includes(application.status as MasterJobApplicationStatuses)) {
          throw new Error("Enum status not matched, data is corrupted");
        }

        // Fetch job title separately to maintain interface compatibility
        let jobTitle: string | undefined;
        if (application.jobId) {
          const job = await jobsRepository.getById(application.jobId);
          jobTitle = job?.title;
        }

        return {
          ...application,
          jobTitle,
        };
      })
    );

    return applicationsWithJobTitles;
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

async function webJobApplicationCreate(
  payload: jobApplicationData,
  actorId: string,
  uid?: string
) {
  try {
    return await jobApplicationsRepository.create(convertLegacyToNewJobApplicationData(payload), actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

async function webJobApplicationUpdate(
  payload: jobApplicationData,
  actorId: string,
  uid: string
) {
  try {
    return await jobApplicationsRepository.update(uid, convertLegacyToNewJobApplicationData(payload), actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}


async function webJobApplicationDelete(uid: string) {
  try {
    return await jobApplicationsRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
}

/**
 * Fetch all applications for a candidate with joined job, company, and interview data.
 * Uses batch fetching to avoid N+1 queries.
 *
 * @param candidateId - The candidate's UID
 * @returns Array of applications with details, sorted by createdAt desc (newest first)
 *
 * Per CAND-R04 RIS §4.2
 */
export async function webJobApplicationGetByCandidate(
  candidateId: string
): Promise<ApplicationWithDetails[]> {
  try {
    // 1. Fetch all applications for candidate
    const candidateRef = getFirebaseAdminFirestore()
      .collection('candidate_information')
      .doc(candidateId);

    const applications = await webJobApplicationGetByFilter(
      Filter.where('candidate_id', '==', candidateRef)
    );

    if (!applications || applications.length === 0) {
      return [];
    }

    // 2. Extract unique IDs for batch fetching
    const jobIds = [...new Set(applications.map(app => app.jobId))];
    const companyIds = [...new Set(applications.map(app => app.companyId))];

    // 3. Batch fetch jobs
    const jobs = await Promise.all(
      jobIds.map(id => webJobGetById(id).catch(() => null))
    );
    const jobMap = new Map(
      jobs.filter(Boolean).map(job => [job!.uid, job!])
    );

    // 4. Batch fetch companies
    const companies = await Promise.all(
      companyIds.map(id => webCompanyInformationGetById(id).catch(() => null))
    );
    const companyMap = new Map(
      companies.filter(Boolean).map(company => [company!.uid, company!])
    );

    // 5. Batch fetch interviews for this candidate
    const interviews = await webJobInterviewGetByFilter(
      Filter.where('candidate_id', '==', candidateRef)
    );
    const interviewMap = new Map(
      (interviews || []).map(interview => [interview.applicationId, interview])
    );

    // 6. Join data and return
    const result: ApplicationWithDetails[] = applications.map(app => {
      const job = jobMap.get(app.jobId);
      const company = companyMap.get(app.companyId);
      const interview = interviewMap.get(app.uid);

      return {
        // Core application fields
        uid: app.uid,
        jobId: app.jobId,
        candidateId: app.candidateId,
        companyId: app.companyId,
        status: app.status,
        chatId: app.chatId,
        expectedSalary: app.expectedSalary,
        overheadDays: app.overheadDays,
        headlines: app.headlines,
        isNegotiable: app.isNegotiable,
        rejectFeedback: app.rejectFeedback,
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,

        // Joined job fields (with fallbacks)
        jobTitle: job?.title ?? app.jobTitle ?? 'ไม่ระบุตำแหน่ง',
        jobIsActive: job?.isActive ?? true,

        // Joined company fields (with fallbacks)
        companyName: company?.companyName ?? app.companyName ?? 'ไม่ระบุบริษัท',
        companyLogo: company?.profilePhoto ?? undefined,

        // Joined interview (if exists)
        interview: interview ? {
          uid: interview.uid,
          status: interview.status,
          appointment: interview.appointment,
          from: interview.from,
          to: interview.to,
          channel: interview.channel as 'online' | 'onsite',
          location: interview.location,
          room: interview.room,
          note: interview.note,
        } : null,
      };
    });

    // 7. Sort by createdAt descending (newest first)
    result.sort((a, b) => b.createdAt - a.createdAt);

    return result;
  } catch (error) {
    console.error('Error fetching candidate applications:', error);
    throw error;
  }
}

/**
 * Withdraw a job application by updating status to 'withdraw'.
 * DOES NOT delete the application - preserves history.
 *
 * @param uid - Application ID to withdraw
 * @param actorId - The candidate's UID (must be the application owner)
 * @throws Error if application not found, not withdrawable, or not owned by actor
 *
 * Per CAND-R04 RIS §4.3 and BLS-03 §3.3
 */
export async function webJobApplicationWithdraw(
  uid: string,
  actorId: string
): Promise<void> {
  try {
    // 1. Fetch current application
    const application = await jobApplicationsRepository.getById(uid);

    if (!application) {
      throw new Error(`Application ${uid} not found`);
    }

    // 2. Validate ownership - only the candidate can withdraw their own application
    if (application.candidateId !== actorId) {
      throw new Error('Only the application owner can withdraw');
    }

    // 3. Validate current status allows withdrawal
    if (!WITHDRAWABLE_STATUSES.includes(application.status as WithdrawableStatus)) {
      throw new Error(
        `Cannot withdraw application in status "${application.status}". ` +
        `Withdrawable statuses: ${WITHDRAWABLE_STATUSES.join(', ')}`
      );
    }

    // 4. Update status to 'withdraw'
    await jobApplicationsRepository.update(
      uid,
      {
        ...application,
        status: 'withdraw',
      },
      actorId
    );

    // 5. TODO: Future enhancement - notify company of withdrawal
    // This would be handled by a notification service

  } catch (error) {
    console.error('Error withdrawing application:', error);
    throw error;
  }
}

/**
 * COMP-R08: Get all applications for a company with joined candidate and job data.
 * Uses batch fetching to avoid N+1 queries.
 *
 * @param companyId - The company's UID
 * @param status - Optional status filter
 * @param jobId - Optional job ID filter
 * @returns Array of applications with details, sorted by updatedAt desc
 *
 * Per COMP-R08 RIS §4.1-4.2 and BLS-04 §1
 */
export async function webJobApplicationGetByCompany(
  companyId: string,
  status?: string,
  jobId?: string
): Promise<any[]> {
  try {
    // 1. Build filter for company applications
    const companyRef = getFirebaseAdminFirestore()
      .collection('company_information')
      .doc(companyId);

    let filter = Filter.where('company_id', '==', companyRef);

    // Add optional filters
    if (status && status !== 'all') {
      filter = Filter.and(filter, Filter.where('status', '==', status));
    }

    if (jobId && jobId !== 'all') {
      const jobRef = getFirebaseAdminFirestore()
        .collection('jobs')
        .doc(jobId);
      filter = Filter.and(filter, Filter.where('job_id', '==', jobRef));
    }

    // 2. Fetch all applications for company
    const applications = await webJobApplicationGetByFilter(filter);

    if (!applications || applications.length === 0) {
      return [];
    }

    // 3. Extract unique IDs for batch fetching
    const jobIds = [...new Set(applications.map(app => app.jobId))];
    const candidateIds = [...new Set(applications.map(app => app.candidateId))];

    // 4. Batch fetch jobs (for job titles)
    const jobs = await Promise.all(
      jobIds.map(id => webJobGetById(id).catch(() => null))
    );
    const jobMap = new Map(
      jobs.filter(Boolean).map(job => [job!.uid, job!])
    );

    // 5. Batch fetch candidate information
    // TODO: Implement webCandidateInformationGetById or similar
    // For now, we'll use placeholder candidate data
    const candidateMap = new Map<string, any>();

    // 6. Join data and return
    const result = applications.map(app => {
      const job = jobMap.get(app.jobId);
      const candidate = candidateMap.get(app.candidateId);

      return {
        // Core application fields
        uid: app.uid,
        jobId: app.jobId,
        candidateId: app.candidateId,
        companyId: app.companyId,
        hrId: app.hrId || null,
        status: app.status,
        expectedSalary: app.expectedSalary || null,
        isNegotiable: app.isNegotiable ?? true,
        overheadDays: app.overheadDays || 0,
        headlines: app.headlines || '',
        createdAt: app.createdAt,
        updatedAt: app.updatedAt,
        rejectFeedback: app.rejectFeedback,
        chatId: app.chatId,

        // Denormalized candidate info (with fallbacks)
        candidateName: candidate?.displayName ?? 'ไม่ระบุชื่อ',
        candidatePhoto: candidate?.photo ?? null,
        candidateHeadline: candidate?.headline ?? null,

        // Denormalized job info (with fallbacks)
        jobTitle: job?.title ?? app.jobTitle ?? 'ไม่ระบุตำแหน่ง',

        // Computed fields
        matchScore: null, // Phase 2: AI matching
        isUnread: app.status === 'applied',
      };
    });

    // 7. Sort by updatedAt descending (newest first)
    result.sort((a, b) => b.updatedAt - a.updatedAt);

    return result;
  } catch (error) {
    console.error('Error fetching company applications:', error);
    throw error;
  }
}

/**
 * COMP-R08: Mark application as read.
 * Silent background action, idempotent.
 *
 * @param applicationId - Application ID to mark as read
 * @returns Success boolean
 *
 * Per COMP-R08 RIS §3 (JOB-018) and BLS-04 §4
 */
export async function webJobApplicationMarkAsRead(
  applicationId: string
): Promise<{ success: boolean }> {
  try {
    // 1. Fetch current application
    const application = await jobApplicationsRepository.getById(applicationId);

    if (!application) {
      // Silent fail - application not found
      console.warn(`Application ${applicationId} not found for mark-as-read`);
      return { success: false };
    }

    // 2. Check if already read (idempotent)
    if (application.status !== 'applied') {
      // Already read or in another status - no action needed
      return { success: true };
    }

    // 3. Update status to 'read'
    await jobApplicationsRepository.update(
      applicationId,
      {
        ...application,
        status: 'read',
      },
      'system' // Auto-triggered, no specific actor
    );

    return { success: true };
  } catch (error) {
    console.error('Error marking application as read:', error);
    // Silent fail - this is a non-critical action
    return { success: false };
  }
}

/**
 * COMP-R08: Accept a job application.
 * Creates chat room, updates status, sends notifications.
 *
 * @param input - Accept application input
 * @returns Success with chatId
 *
 * Per COMP-R08 RIS §3 (JOB-016) and BLS-04 §5
 */
export async function webJobApplicationAccept(input: {
  companyId: string;
  candidateId: string;
  hrId: string;
  jobId: string;
  applicationId: string;
  name: string;
  jobTitle: string;
  companyName: string;
}): Promise<{ status: 200; message: string; chatId: string }> {
  try {
    // 1. Fetch current application
    const application = await jobApplicationsRepository.getById(input.applicationId);

    if (!application) {
      throw new Error(`Application ${input.applicationId} not found`);
    }

    // 2. Validate current status allows acceptance
    const acceptableStatuses = ['applied', 'read'];
    if (!acceptableStatuses.includes(application.status)) {
      throw new Error(
        `Cannot accept application in status "${application.status}". ` +
        `Acceptable statuses: ${acceptableStatuses.join(', ')}`
      );
    }

    // 3. Create chat room
    // TODO: Implement chat room creation
    // For now, generate a placeholder chatId
    const chatId = `chat-${input.companyId}-${input.candidateId}-${Date.now()}`;

    // 4. Update application status to 'accepted'
    await jobApplicationsRepository.update(
      input.applicationId,
      {
        ...application,
        status: 'accepted',
        hrId: input.hrId,
        chatId: chatId,
      },
      input.hrId
    );

    // 5. TODO: Send email notification to candidate
    // This would be handled by a notification service

    // 6. TODO: Send push notification
    // This would be handled by a notification service

    // 7. TODO: Check first application reward
    // This would be handled by a wallet/reward service

    return {
      status: 200,
      message: 'ตอบรับใบสมัครเรียบร้อย',
      chatId: chatId,
    };
  } catch (error) {
    console.error('Error accepting application:', error);
    throw error;
  }
}

/**
 * COMP-R08: Reject a job application.
 * Updates status, stores feedback, sends notification.
 *
 * @param applicationId - Application ID to reject
 * @param rejectedMessage - Optional feedback message
 * @param actorId - HR user ID who rejected
 * @returns Success boolean
 *
 * Per COMP-R08 RIS §3 (JOB-017) and BLS-04 §6
 */
export async function webJobApplicationReject(
  applicationId: string,
  rejectedMessage: string,
  actorId: string
): Promise<{ success: boolean }> {
  try {
    // 1. Fetch current application
    const application = await jobApplicationsRepository.getById(applicationId);

    if (!application) {
      throw new Error(`Application ${applicationId} not found`);
    }

    // 2. Validate current status allows rejection
    const rejectableStatuses = ['applied', 'read', 'accepted'];
    if (!rejectableStatuses.includes(application.status)) {
      throw new Error(
        `Cannot reject application in status "${application.status}". ` +
        `Rejectable statuses: ${rejectableStatuses.join(', ')}`
      );
    }

    // 3. Update status to 'rejected' with feedback
    await jobApplicationsRepository.update(
      applicationId,
      {
        ...application,
        status: 'rejected',
        rejectFeedback: rejectedMessage,
        hrId: actorId,
      },
      actorId
    );

    // 4. TODO: Send rejection email with feedback
    // This would be handled by a notification service

    // 5. TODO: Send push notification
    // This would be handled by a notification service

    return { success: true };
  } catch (error) {
    console.error('Error rejecting application:', error);
    throw error;
  }
}

/**
 * BLS-03-01: Submit a job application
 * Creates a new job application record and increments job apply count.
 *
 * @param input - Application input (jobId, expectedSalary, isNegotiable, overheadDays, headlines)
 * @param candidateId - The candidate's UID (typically from session)
 * @returns SubmitApplicationResult with success/error status
 *
 * Per BLS-03-01 specification and assessment
 */
export async function submitApplication(
  input: SubmitApplicationInput,
  candidateId?: string
): Promise<SubmitApplicationResult> {
  const { FieldValue } = await import('firebase-admin/firestore');

  try {
    // STEP 1: Input Validation
    // Validate jobId (required)
    if (!input.jobId || typeof input.jobId !== 'string' || input.jobId.trim() === '') {
      throw new Error('Job ID is required');
    }

    // Validate expectedSalary range (0 to 999,999)
    if (input.expectedSalary !== null && input.expectedSalary !== undefined) {
      if (input.expectedSalary < 0) {
        throw new Error('เงินเดือนต้องมากกว่า 0');
      }
      if (input.expectedSalary > 999999) {
        throw new Error('เงินเดือนสูงเกินไป');
      }
    }

    // Validate headlines length (max 500 characters)
    if (input.headlines && input.headlines.length > 500) {
      throw new Error('ข้อความยาวเกินไป');
    }

    // Validate overheadDays enum
    const validOverheadDays = [0, 7, 15, 30, 60, 90];
    if (input.overheadDays !== undefined && !validOverheadDays.includes(input.overheadDays)) {
      throw new Error('Invalid overhead days value');
    }

    // STEP 2: Get current user/candidate
    // For now, candidateId must be passed from caller
    // TODO: In future, get from session/context
    if (!candidateId) {
      throw new Error('Candidate ID is required');
    }

    // STEP 3: Precondition Checks
    // 3.1: Check profile completion
    const candidate = await candidateInformationRepository.getById(candidateId);
    if (!candidate) {
      throw new Error('Candidate not found');
    }
    if (!candidate.isResumeCompleted) {
      return {
        success: false,
        error: 'PROFILE_INCOMPLETE',
      };
    }

    // 3.2: Check job exists and is available
    const job = await jobsRepository.getById(input.jobId);
    if (!job) {
      return {
        success: false,
        error: 'JOB_NOT_FOUND',
      };
    }

    // Check job is active
    if (!job.isActive) {
      return {
        success: false,
        error: 'JOB_CLOSED',
      };
    }

    // Check job expiry date (with fallback per SA decision)
    if (job.postExpiryDate && job.postExpiryDate < Date.now()) {
      return {
        success: false,
        error: 'JOB_CLOSED',
      };
    }

    // 3.3: Check for existing active application
    const candidateRef = getFirebaseAdminFirestore()
      .collection('candidate_information')
      .doc(candidateId);

    const jobRef = getFirebaseAdminFirestore()
      .collection('jobs')
      .doc(input.jobId);

    const existingApplications = await jobApplicationsRepository.getByFilter(
      Filter.and(
        Filter.where('candidate_id', '==', candidateRef),
        Filter.where('job_id', '==', jobRef)
      )
    );

    // Check if any existing application has an active status
    if (existingApplications && existingApplications.length > 0) {
      const hasActiveApplication = existingApplications.some(app =>
        ACTIVE_APPLICATION_STATUSES.includes(app.status as ActiveApplicationStatus)
      );

      if (hasActiveApplication) {
        return {
          success: false,
          error: 'ALREADY_APPLIED',
        };
      }
    }

    // STEP 4: Create Application Record
    const now = Date.now();
    const applicationData: JobApplicationData = {
      uid: '', // Will be set by repository
      jobId: input.jobId,
      candidateId: candidateId,
      companyId: job.companyId || '',
      companyName: job.companyName || '',
      status: 'applied',
      // Use explicit null check to preserve null vs undefined distinction
      // When not provided (undefined), default to null
      expectedSalary: input.expectedSalary === null ? null : (input.expectedSalary ?? null),
      isNegotiable: input.isNegotiable ?? true, // Default true
      overheadDays: input.overheadDays ?? 0, // Default 0
      headlines: input.headlines ?? '', // Default empty string
      createdAt: now,
      updatedAt: now,
    };

    // STEP 5: Create application using repository
    const applicationId = await jobApplicationsRepository.create(
      applicationData,
      candidateId
    );

    // STEP 6: Increment job apply count
    // TODO: Phase 3 - Use transaction to make this atomic with application creation
    const db = getFirebaseAdminFirestore();
    const jobRefForUpdate = db.collection('jobs').doc(input.jobId);
    await jobRefForUpdate.update({
      apply_count: FieldValue.increment(1),
    });

    // STEP 7: Return Success
    return {
      success: true,
      data: {
        applicationId: applicationId,
        status: 'applied',
        appliedAt: now,
      },
      keysToInvalidate: [
        `job-${input.jobId}`,
        `candidate-applications-${candidateId}`,
      ],
    };

    // TODO: Phase 2 - Send notification to company (BLS-03 line 136)
    // TODO: Phase 2 - Check and award first application reward (BLS-03 line 293)

  } catch (error) {
    console.error('Error submitting application:', error);

    // Check if it's a validation error
    if (error instanceof Error && error.message.includes('เงินเดือน')) {
      throw error; // Re-throw validation errors
    }
    if (error instanceof Error && error.message.includes('ข้อความยาวเกินไป')) {
      throw error; // Re-throw validation errors
    }

    return {
      success: false,
      error: 'NETWORK_ERROR',
    };
  }
}

export {
  webJobApplicationCreate,
  webJobApplicationDelete,
  webJobApplicationGetByFilter,
  webJobApplicationGetById,
  webJobApplicationUpdate,
};

// Re-export types for convenience (types don't count as "use server" exports)
export type {
  ApplicationWithDetails,
  InterviewDetails,
  WithdrawableStatus,
  SubmitApplicationInput,
  SubmitApplicationResult
} from './job-applications.constants';

