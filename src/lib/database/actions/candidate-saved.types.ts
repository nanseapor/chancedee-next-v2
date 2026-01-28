/**
 * Candidate Saved Jobs Types
 * Extracted from candidate-saved.ts for Next.js 15+ compatibility
 */

import type { FirebaseJobData } from "@/types/job.types";

/**
 * Saved job with full job details
 */
export interface SavedJobWithDetails {
  savedAt: number;
  job: FirebaseJobData;
}
