import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

/**
 * Candidate Saved Jobs Schema
 *
 * Collection: candidate_saved_jobs
 * Purpose: Track jobs saved/bookmarked by candidates for later reference
 *
 * Document ID Format: {candidateId}_{jobId} for uniqueness and efficient lookups
 */

/**
 * Firebase schema for candidate_saved_jobs collection
 * Stores the raw Firestore document structure
 */
export const FirebaseCandidateSavedJobSchema = z.object({
  uid: z.string(),
  candidate_id: z.string(),
  job_id: z.string(),
  saved_at: z.custom<Timestamp>(),
  created_by: z.custom<DocumentReference>().nullable().optional(),
  updated_by: z.custom<DocumentReference>().nullable().optional(),
  created_at: z.custom<Timestamp>(),
  updated_at: z.custom<Timestamp>(),
});

/**
 * App schema for candidate saved jobs
 * Transformed version with JS-friendly types (timestamps as numbers)
 */
export const AppCandidateSavedJobSchema = z.object({
  uid: z.string(),
  candidateId: z.string(),
  jobId: z.string(),
  savedAt: z.number(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Export inferred types
export type FirebaseCandidateSavedJobType = z.infer<typeof FirebaseCandidateSavedJobSchema>;
export type AppCandidateSavedJobType = z.infer<typeof AppCandidateSavedJobSchema>;
