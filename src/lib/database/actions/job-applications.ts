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
  type WithdrawableStatus,
  type ApplicationWithDetails,
  type InterviewDetails
} from './job-applications.constants';

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
  WithdrawableStatus
} from './job-applications.constants';

