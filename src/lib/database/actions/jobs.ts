"use server";

import { Filter } from "firebase-admin/firestore";

import { FirebaseJobData } from "@/types/job.types";
import type {
  JobListItem,
  JobListQuery,
  JobListResponse,
  JobAggregationResponse,
} from "@/types/jobsmarket/jobs-list.types";

import { jobsRepository } from "../repositories/jobs-repository";
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

    const updatedJob: Partial<FirebaseJobData> = {
      jobStatus: "published",
      isActive: true,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
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

    const updatedJob: Partial<FirebaseJobData> = {
      jobStatus: "unpublished",
      isActive: false,
    };

    await jobsRepository.update(uid, updatedJob as FirebaseJobData, "system");
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

    const updatedJob: Partial<FirebaseJobData> = {
      jobStatus: "closed",
      isActive: false,
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
  webJobDuplicate,
  webJobBulkUnpublish,
  webJobBulkClose,
  webJobGetCompanyJobsList,
  webJobGetCompanyJobsAggregation,
};

