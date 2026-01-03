"use server";

import type { FirebaseJobData } from "@/types/job.types";

import { candidateSavedJobsRepository } from "../repositories/candidate-saved-jobs-repository";
import { jobsRepository } from "../repositories/jobs-repository";

/**
 * CAND-R05: Saved Jobs - Server Actions
 *
 * Server actions for fetching candidate saved jobs with full job details
 */

/**
 * Saved job with full job details
 */
export interface SavedJobWithDetails {
  savedAt: number;
  job: FirebaseJobData;
}

/**
 * Get all saved jobs for a candidate with full job details
 *
 * @param candidateId - Candidate UID
 * @returns Array of saved jobs with full job details, sorted by savedAt (newest first)
 *
 * @example
 * ```typescript
 * const result = await webCandidateSavedJobsGet({ candidateId: "user123" });
 * if (result.success) {
 *   console.log(result.savedJobs); // Array of saved jobs with details
 * }
 * ```
 */
export async function webCandidateSavedJobsGet(input: {
  candidateId: string;
}): Promise<{
  success: boolean;
  savedJobs?: SavedJobWithDetails[];
  error?: string;
}> {
  try {
    const { candidateId } = input;

    // 1. Get all saved job records for this candidate
    const savedRecords = await candidateSavedJobsRepository.getByCandidateId(
      candidateId
    );

    // 2. Fetch full job details for each saved job
    const savedJobsWithDetails = await Promise.all(
      savedRecords.map(async (record) => {
        const job = await jobsRepository.getById(record.jobId);
        return {
          savedAt: record.savedAt,
          job,
        };
      })
    );

    // 3. Filter out any jobs that were deleted (null)
    const validSavedJobs = savedJobsWithDetails.filter(
      (item): item is SavedJobWithDetails => item.job !== null
    );

    return {
      success: true,
      savedJobs: validSavedJobs,
    };
  } catch (error) {
    console.error("Error fetching saved jobs:", error);
    return {
      success: false,
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}
