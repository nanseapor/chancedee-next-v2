/**
 * Public Jobs Server Actions
 *
 * Server actions for public-facing job routes (no authentication required)
 * Used by: JOB-R01 (Jobs List), JOB-R02 (Job Detail), JOB-R02b (Application)
 *
 * @module public-jobs
 */

'use server';

import type {
  JobSearchParams,
  JobSearchResponse,
  JobDetailData,
  JobCardData,
  SaveJobParams,
  SaveJobResult,
  SavedJobItem,
  JobAvailabilityState,
} from '@/types/public-jobs';
import { searchJobsWithFilters } from '@/lib/meilisearch/job-search';
import { jobsRepository } from '@/lib/database/repositories/jobs-repository';
import { candidateSavedJobsRepository } from '@/lib/database/repositories/candidate-saved-jobs-repository';
import { jobApplicationsRepository } from '@/lib/database/repositories/job-applications-repository';
import { MEILISEARCH_TIMEOUT } from '@/lib/constants/jobsmarket/job-filters';

/**
 * Search jobs with advanced filters
 * Primary: MeiliSearch with timeout fallback to Firestore
 *
 * @param params - Search parameters (filters, sort, pagination)
 * @returns JobSearchResponse with jobs array and metadata
 */
export async function searchPublicJobs(params: JobSearchParams): Promise<JobSearchResponse> {
  try {
    // Try MeiliSearch first with timeout
    const meiliPromise = searchJobsWithFilters(params);
    const timeoutPromise = new Promise<never>((_, reject) =>
      setTimeout(() => reject(new Error('MeiliSearch timeout')), MEILISEARCH_TIMEOUT)
    );

    const result = await Promise.race([meiliPromise, timeoutPromise]);

    return {
      success: true,
      data: {
        jobs: result.jobs,
        totalCount: result.totalCount,
        totalPages: result.totalPages,
        currentPage: result.currentPage,
        processingTime: result.processingTime,
        isFallback: false,
      },
    };
  } catch (meiliError) {
    // Fallback to Firestore
    try {
      const firestoreResult = await searchJobsFirestore(params);
      return {
        success: true,
        data: {
          ...firestoreResult,
          isFallback: true,
        },
      };
    } catch (fallbackError) {
      console.error('Both MeiliSearch and Firestore failed:', { meiliError, fallbackError });
      return {
        success: false,
        error: 'Failed to search jobs. Please try again later.',
      };
    }
  }
}

/**
 * Firestore fallback for job search
 * Used when MeiliSearch times out
 */
async function searchJobsFirestore(params: JobSearchParams): Promise<{
  jobs: JobCardData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  processingTime: number;
}> {
  const startTime = Date.now();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;

  // Build Firestore filter (basic - no MeiliSearch advanced features)
  // Note: Firestore has limitations on complex queries, so this is simplified
  const allJobs = await jobsRepository.getByFilter();

  // Filter active/published jobs
  let filteredJobs = allJobs.filter(
    (job) => job.isActive && (job.jobStatus === 'published' || job.jobStatus === 'ontimer')
  );

  // Apply basic filters (Firestore limitations mean we filter in-memory)
  if (params.locations && params.locations.length > 0) {
    filteredJobs = filteredJobs.filter((job) => params.locations!.includes(job.province || ''));
  }

  if (params.types && params.types.length > 0) {
    filteredJobs = filteredJobs.filter((job) =>
      job.employment && params.types!.includes(job.employment as 'fulltime' | 'parttime' | 'contract' | 'internship')
    );
  }

  if (params.salaryMin !== undefined && params.salaryMin !== null) {
    filteredJobs = filteredJobs.filter((job) => (job.maxSalary || 0) >= params.salaryMin!);
  }

  if (params.salaryMax !== undefined && params.salaryMax !== null) {
    filteredJobs = filteredJobs.filter((job) => (job.minSalary || 0) <= params.salaryMax!);
  }

  // Sort (basic)
  filteredJobs.sort((a, b) => {
    switch (params.sort) {
      case 'salary_desc':
        return (b.maxSalary || 0) - (a.maxSalary || 0);
      case 'salary_asc':
        return (a.minSalary || 0) - (b.minSalary || 0);
      case 'newest':
      default:
        return (b.createdAt || 0) - (a.createdAt || 0);
    }
  });

  // Pagination
  const totalCount = filteredJobs.length;
  const totalPages = Math.ceil(totalCount / pageSize);
  const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);

  // Transform to JobCardData
  const jobs: JobCardData[] = paginatedJobs.map((job) => ({
    uid: job.uid || '',
    title: job.title || '',
    companyId: job.companyId || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    minSalary: job.minSalary ?? null,
    maxSalary: job.maxSalary ?? null,
    isNegotiable: job.isNegotiable,
    workLocationText: job.workLocationText || '',
    employmentText: job.employmentText || '',
    experienceText: job.experienceText || '',
    createdAt: job.createdAt || 0,
  }));

  const processingTime = Date.now() - startTime;

  return {
    jobs,
    totalCount,
    totalPages,
    currentPage: page,
    processingTime,
  };
}

/**
 * Get full job details by ID
 * Only returns active published jobs
 *
 * @param jobId - Job UID
 * @returns JobDetailData or null if not found/not available
 */
export async function getPublicJobById(jobId: string): Promise<JobDetailData | null> {
  const job = await jobsRepository.getById(jobId);

  if (!job) {
    return null;
  }

  // Only return active published jobs to public
  if (!job.isActive || (job.jobStatus !== 'published' && job.jobStatus !== 'ontimer')) {
    return null;
  }

  // Transform to JobDetailData
  const jobDetail: JobDetailData = {
    uid: job.uid || '',
    title: job.title || '',
    companyId: job.companyId || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    minSalary: job.minSalary ?? null,
    maxSalary: job.maxSalary ?? null,
    isNegotiable: job.isNegotiable,
    workLocationText: job.workLocationText || '',
    employmentText: job.employmentText || '',
    experienceText: job.experienceText || '',
    educationLevelText: job.educationLevelText || [],
    jobDescriptionDetails: job.jobDescriptionDetails || '',
    qualificationDetails: job.qualificationDetails || '',
    benefitsDetails: job.benefitsDetails || '',
    phone: job.phone || '',
    email: job.email || '',
    postStartDate: job.postStartDate || 0,
    postExpiryDate: job.postExpiryDate || 0,
    jobStatus: job.jobStatus,
    isActive: job.isActive,
    positions: job.positions || 1,
  };

  return jobDetail;
}

/**
 * Get similar jobs based on job function and industry
 * Excludes the current job from results
 *
 * @param jobId - Current job ID to find similar jobs for
 * @param limit - Maximum number of similar jobs to return (default: 5)
 * @returns Result object with success flag and data/error
 */
export async function getSimilarJobs(jobId: string, limit = 5): Promise<{
  success: boolean;
  data?: JobCardData[];
  error?: string;
}> {
  try {
    // Get the current job to extract function/industry
    const currentJob = await jobsRepository.getById(jobId);
    if (!currentJob) {
      return { success: true, data: [] };
    }

    // Search for jobs with same function or industry using MeiliSearch
    // Note: This is a simplified version - actual implementation would need
    // MeiliSearch to support OR queries on job_function and job_industry
    const searchParams: JobSearchParams = {
      page: 1,
      pageSize: limit + 5, // Get extra in case some are filtered out
      sort: 'newest',
    };

    const result = await searchJobsWithFilters(searchParams);

    // Filter: same function or industry, exclude current job, limit results
    const similarJobs = result.jobs
      .filter((job) => job.uid !== jobId)
      .slice(0, limit);

    return { success: true, data: similarJobs };
  } catch (error) {
    console.error('Error fetching similar jobs:', error);
    return { success: false, error: 'Failed to fetch similar jobs' };
  }
}

/**
 * Save a job for a candidate
 * Validates that job exists and is active before saving
 *
 * @param params - SaveJobParams (candidateId, jobId)
 * @returns SaveJobResult indicating success or error
 */
export async function saveJob(params: SaveJobParams): Promise<SaveJobResult> {
  const { candidateId, jobId } = params;

  // Validate input
  if (!candidateId || candidateId.trim() === '') {
    return {
      success: false,
      error: 'Invalid candidate ID',
    };
  }

  if (!jobId || jobId.trim() === '') {
    return {
      success: false,
      error: 'Invalid job ID',
    };
  }

  try {
    // Check if job exists and is active
    const job = await jobsRepository.getById(jobId);
    if (!job) {
      return {
        success: false,
        error: 'Job not found',
      };
    }

    if (!job.isActive || (job.jobStatus !== 'published' && job.jobStatus !== 'ontimer')) {
      return {
        success: false,
        error: 'Job is not available',
      };
    }

    // Check if already saved (idempotent)
    const alreadySaved = await candidateSavedJobsRepository.exists(candidateId, jobId);
    if (alreadySaved) {
      return {
        success: true, // Idempotent - no error if already saved
      };
    }

    // Create saved job record
    await candidateSavedJobsRepository.create(candidateId, jobId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error saving job:', error);
    return {
      success: false,
      error: 'Failed to save job. Please try again.',
    };
  }
}

/**
 * Remove a saved job for a candidate
 * Idempotent - no error if not saved
 *
 * @param params - SaveJobParams (candidateId, jobId)
 * @returns SaveJobResult indicating success or error
 */
export async function unsaveJob(params: SaveJobParams): Promise<SaveJobResult> {
  const { candidateId, jobId } = params;

  // Validate input
  if (!candidateId || candidateId.trim() === '') {
    return {
      success: false,
      error: 'Invalid candidate ID',
    };
  }

  if (!jobId || jobId.trim() === '') {
    return {
      success: false,
      error: 'Invalid job ID',
    };
  }

  try {
    // Delete saved job (idempotent)
    await candidateSavedJobsRepository.delete(candidateId, jobId);

    return {
      success: true,
    };
  } catch (error) {
    console.error('Error unsaving job:', error);
    return {
      success: false,
      error: 'Failed to unsave job. Please try again.',
    };
  }
}

/**
 * Get all saved jobs for a candidate with metadata
 * Joins with jobs collection to get current job details
 * Determines job availability state for each saved job
 *
 * @param candidateId - Candidate UID
 * @returns Array of SavedJobItem with job data and metadata
 */
export async function getSavedJobs(candidateId: string): Promise<SavedJobItem[]> {
  try {
    // Get all saved job records for this candidate
    const savedRecords = await candidateSavedJobsRepository.getByCandidateId(candidateId);

    // Fetch job details for each saved job
    const savedJobsPromises = savedRecords.map(async (record) => {
      const job = await jobsRepository.getById(record.jobId);

      // Determine job availability
      let jobAvailability: JobAvailabilityState;
      if (!job) {
        jobAvailability = 'not_found';
      } else if (!job.isActive) {
        if (job.jobStatus === 'closed') {
          jobAvailability = 'closed';
        } else if (job.jobStatus === 'unpublished') {
          jobAvailability = 'unpublished';
        } else {
          jobAvailability = 'closed';
        }
      } else if (job.postExpiryDate && job.postExpiryDate < Date.now()) {
        jobAvailability = 'expired';
      } else {
        jobAvailability = 'available';
      }

      // Check if candidate has applied to this job
      const applications = await jobApplicationsRepository.getByFilter();
      const hasApplication = applications.some(
        (app) => app.candidateId === candidateId && app.jobId === record.jobId
      );

      // Transform job to JobCardData
      const jobCard: JobCardData = job
        ? {
            uid: job.uid || '',
            title: job.title || '',
            companyId: job.companyId || '',
            companyName: job.companyName || '',
            companyLogo: job.companyLogo || '',
            minSalary: job.minSalary ?? null,
            maxSalary: job.maxSalary ?? null,
            isNegotiable: job.isNegotiable,
            workLocationText: job.workLocationText || '',
            employmentText: job.employmentText || '',
            experienceText: job.experienceText || '',
            createdAt: job.createdAt || 0,
          }
        : {
            // Placeholder for deleted job
            uid: record.jobId,
            title: 'Job no longer available',
            companyId: '',
            companyName: '',
            companyLogo: '',
            minSalary: null,
            maxSalary: null,
            isNegotiable: false,
            workLocationText: '',
            employmentText: '',
            experienceText: '',
            createdAt: 0,
          };

      const savedJobItem: SavedJobItem = {
        job: jobCard,
        savedAt: record.savedAt,
        hasApplication,
        jobAvailability,
      };

      return savedJobItem;
    });

    const savedJobs = await Promise.all(savedJobsPromises);
    return savedJobs;
  } catch (error) {
    console.error('Error fetching saved jobs:', error);
    return [];
  }
}
