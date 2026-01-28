"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseJobData } from "@/types/job.types";
import type {
  JobListItem,
  JobListQuery,
  JobListResponse,
  JobAggregationResponse,
} from "@/types/jobsmarket/jobs-list.types";
import type {
  JobAnalytics,
  DailyView,
  ApplicationPreview,
} from "@/types/jobsmarket/job-detail.types";

import { jobsRepository } from "../repositories/jobs-repository";
import { jobApplicationsRepository } from "../repositories/job-applications-repository";
import { DEFAULT_JOBS_PAGE_SIZE } from "./jobs.constants";

const webJobGetById = async (uid: string) => {
  try {
    return await jobsRepository.getById(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobGetByFilter = async (filter?: Filter) => {
  try {
    return await jobsRepository.getByFilter(filter);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobGenerateId = async () => {
  try {
    return await jobsRepository.generateId();
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobCreate = async (
  payload: FirebaseJobData,
  actorId: string,
  uid?: string
) => {
  try {
    return await jobsRepository.create(payload, actorId, uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobUpdate = async (
  payload: FirebaseJobData,
  actorId: string,
  uid: string
) => {
  try {
    return await jobsRepository.update(uid, payload, actorId);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

const webJobDelete = async (uid: string) => {
  try {
    return await jobsRepository.delete(uid);
  } catch (e) {
    const error = e as Error;
    throw error;
  }
};

/**
 * BLS-07-05: Publish Job
 * Transition job from draft/ontimer to published status
 */
const webJobPublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: FirebaseJobData = {
      ...job,
      jobStatus: "published",
      isActive: true,
    };

    await jobsRepository.update(uid, updatedJob, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-07: Unpublish Job (Pause)
 * Transition job from published to unpublished status
 */
const webJobUnpublish = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: FirebaseJobData = {
      ...job,
      jobStatus: "unpublished",
      isActive: false,
    };

    await jobsRepository.update(uid, updatedJob, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-08: Close Job
 * Transition job to closed status (permanent)
 */
const webJobClose = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    const updatedJob: FirebaseJobData = {
      ...job,
      jobStatus: "closed",
      isActive: false,
    };

    await jobsRepository.update(uid, updatedJob, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-06: Schedule Job
 * Set job to ontimer status with scheduled start date
 * Expiry is automatically set to 30 days after start
 */
const webJobSchedule = async (uid: string, scheduledDate: Date) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    // Validate future date
    if (scheduledDate <= new Date()) {
      return { success: false, error: "วันที่ต้องเป็นอนาคต" };
    }

    const startTimestamp = scheduledDate.getTime();
    // Expiry is 30 days from start
    const expiryTimestamp = startTimestamp + 30 * 24 * 60 * 60 * 1000;

    const updatedJob: Partial<FirebaseJobData> = {
      jobStatus: "ontimer",
      postStartDate: startTimestamp,
      postExpiryDate: expiryTimestamp,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
    return { success: true };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-10: Duplicate Job
 * Create a copy of existing job in draft status
 */
const webJobDuplicate = async (uid: string) => {
  try {
    const job = await webJobGetById(uid);
    if (!job) {
      return { success: false, error: "Job not found" };
    }

    // Create copy with modified title and draft status
    const duplicatedJob: FirebaseJobData = {
      ...job,
      title: `${job.title} (สำเนา)`,
      jobStatus: "draft",
      isActive: false,
    };

    // Remove uid and timestamps to create new document
    const { uid: _, createdAt, updatedAt, createdBy, updatedBy, ...jobData } = duplicatedJob as any;

    const newJobId = await jobsRepository.create(jobData as FirebaseJobData, "system");
    return { success: true, data: { uid: newJobId } };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * Bulk Unpublish (Pause) Jobs
 */
const webJobBulkUnpublish = async (uids: string[]) => {
  try {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const uid of uids) {
      const result = await webJobUnpublish(uid);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        errors.push(`${uid}: ${result.error}`);
      }
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      successCount: 0,
      failureCount: uids.length,
      errors: [error.message],
    };
  }
};

/**
 * Bulk Close Jobs
 */
const webJobBulkClose = async (uids: string[]) => {
  try {
    let successCount = 0;
    let failureCount = 0;
    const errors: string[] = [];

    for (const uid of uids) {
      const result = await webJobClose(uid);
      if (result.success) {
        successCount++;
      } else {
        failureCount++;
        errors.push(`${uid}: ${result.error}`);
      }
    }

    return {
      success: failureCount === 0,
      successCount,
      failureCount,
      errors: errors.length > 0 ? errors : undefined,
    };
  } catch (e) {
    const error = e as Error;
    return {
      success: false,
      successCount: 0,
      failureCount: uids.length,
      errors: [error.message],
    };
  }
};

/**
 * BLS-07-01: Get Company Jobs List
 * Fetch paginated jobs list with filters
 */
const webJobGetCompanyJobsList = async (
  companyId: string,
  query?: JobListQuery
): Promise<JobListResponse> => {
  try {
    const {
      status = "all",
      q,
      page = 1,
      limit = DEFAULT_JOBS_PAGE_SIZE,
      sort = "createdAt",
    } = query || {};

    // Build filter
    const filters: Filter[] = [Filter.where("companyId", "==", companyId)];

    if (status !== "all") {
      filters.push(Filter.where("jobStatus", "==", status));
    }

    // For search, we'll filter in memory since Firestore doesn't support full-text search
    const filter = Filter.and(...filters);
    const allJobs = await jobsRepository.getByFilter(filter);

    if (!allJobs) {
      return { success: false, error: "Failed to fetch jobs" };
    }

    // Transform to JobListItem and filter by search query
    let jobs: JobListItem[] = allJobs.map((job) => ({
      uid: job.uid as string,
      title: job.title,
      jobStatus: job.jobStatus,
      isActive: job.isActive,
      applicationCount: 0, // TODO: Get from job_applications aggregation
      unreadApplicationCount: 0, // TODO: Get from job_applications aggregation
      viewCount: 0, // TODO: Get from job_analytics
      createdAt: job.createdAt || Date.now(),
      updatedAt: job.updatedAt || Date.now(),
    }));

    // Apply search filter
    if (q) {
      const searchLower = q.toLowerCase();
      jobs = jobs.filter((job) => job.title.toLowerCase().includes(searchLower));
    }

    // Sort
    jobs.sort((a, b) => {
      if (sort === "createdAt" || sort === "updatedAt") {
        return b[sort] - a[sort]; // Descending (newest first)
      }
      if (sort === "applicationCount" || sort === "viewCount") {
        return b[sort] - a[sort]; // Descending (most first)
      }
      return 0;
    });

    // Paginate
    const total = jobs.length;
    const startIndex = (page - 1) * limit;
    const endIndex = startIndex + limit;
    const paginatedJobs = jobs.slice(startIndex, endIndex);

    return {
      success: true,
      data: paginatedJobs,
      total,
      page,
      limit,
    };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * Get Company Jobs Aggregation (counts by status)
 */
const webJobGetCompanyJobsAggregation = async (
  companyId: string
): Promise<JobAggregationResponse> => {
  try {
    const filter = Filter.where("companyId", "==", companyId);
    const allJobs = await jobsRepository.getByFilter(filter);

    if (!allJobs) {
      return { success: false, error: "Failed to fetch jobs" };
    }

    const aggregation = {
      all: allJobs.length,
      published: allJobs.filter((j) => j.jobStatus === "published").length,
      draft: allJobs.filter((j) => j.jobStatus === "draft").length,
      unpublished: allJobs.filter((j) => j.jobStatus === "unpublished").length,
      closed: allJobs.filter((j) => j.jobStatus === "closed").length,
    };

    return { success: true, data: aggregation };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-11: Fetch Job Analytics
 * Calculate analytics data for a job from application data
 *
 * Note: This is a temporary implementation that calculates analytics on-the-fly.
 * In the future, this should read from a dedicated job_analytics collection
 * that's updated hourly by a background job.
 *
 * @param jobId - Job ID to fetch analytics for
 * @returns JobAnalytics data or error
 */
const webJobFetchAnalytics = async (jobId: string) => {
  try {
    // Fetch all applications for this job
    const filter = Filter.where("job_id", "==", jobId);
    const applications = await jobApplicationsRepository.getByFilter(filter);

    // Calculate total application count
    const totalApplications = applications.length;

    // For now, viewCount is not tracked, so we'll use a placeholder
    // In production, this should come from job_analytics collection
    const totalViews = 0; // Placeholder - not implemented yet

    // Calculate conversion rate (avoid division by zero)
    const conversionRate = totalViews > 0
      ? (totalApplications / totalViews) * 100
      : 0;

    // Generate mock daily views for last 30 days
    // In production, this should come from job_analytics collection
    const dailyViews: DailyView[] = [];
    const today = new Date();
    for (let i = 29; i >= 0; i--) {
      const date = new Date(today);
      date.setDate(date.getDate() - i);
      dailyViews.push({
        date: date.toISOString().split('T')[0] || '', // YYYY-MM-DD
        views: 0, // Placeholder - not implemented yet
      });
    }

    const analytics: JobAnalytics = {
      jobId,
      totalViews,
      viewsChange: 0, // Placeholder - requires historical data
      dailyViews,
      applicationCount: totalApplications,
      unreadApplicationCount: 0, // Placeholder - not implemented yet
      conversionRate,
      conversionChange: 0, // Placeholder - requires historical data
      lastUpdated: Date.now(),
    };

    return { success: true, data: analytics };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

/**
 * BLS-07-11: Fetch Recent Job Applications
 * Retrieve recent applications for a job to display in overview tab
 *
 * @param jobId - Job ID to fetch applications for
 * @param limit - Maximum number of applications to return (default: 5)
 * @returns Array of ApplicationPreview or error
 */
const webJobFetchApplications = async (jobId: string, limit = 5) => {
  try {
    // Fetch applications for this job
    const filter = Filter.where("job_id", "==", jobId);
    const applications = await jobApplicationsRepository.getByFilter(filter);

    // Sort by createdAt descending (most recent first)
    const sortedApplications = applications.sort((a, b) => b.createdAt - a.createdAt);

    // Take only the requested number of applications
    const recentApplications = sortedApplications.slice(0, limit);

    // Transform to ApplicationPreview format
    const previews: ApplicationPreview[] = recentApplications.map((app) => ({
      uid: app.uid,
      candidateId: app.candidateId,
      candidateName: "Unknown", // TODO: Fetch from candidate_information collection
      candidatePhoto: undefined, // TODO: Fetch from candidate_information collection
      status: app.status,
      appliedAt: app.createdAt,
      isRead: app.status !== "applied", // Consider "applied" status as unread
    }));

    return { success: true, data: previews };
  } catch (e) {
    const error = e as Error;
    return { success: false, error: error.message };
  }
};

export {
  webJobCreate,
  webJobDelete,
  webJobGenerateId,
  webJobGetByFilter,
  webJobGetById,
  webJobUpdate,
  webJobPublish,
  webJobUnpublish,
  webJobClose,
  webJobSchedule,
  webJobDuplicate,
  webJobBulkUnpublish,
  webJobBulkClose,
  webJobGetCompanyJobsList,
  webJobGetCompanyJobsAggregation,
  webJobFetchAnalytics,
  webJobFetchApplications,
};

