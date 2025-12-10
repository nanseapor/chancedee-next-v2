import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase job offer schema
 * Job offers made by companies to candidates
 */
export const FirebaseJobOfferSchema = BaseFirebaseSchema.extend({
  /** The unique identifier for the job */
  job_id: z.string(),
  
  /** The unique identifier for the candidate */
  candidate_id: z.string(),
  
  /** The number of offers made */
  offer_count: z.number(),
  
  /** Indicates if the candidate has applied for the job */
  is_applied: z.boolean().optional(),
  
  /** Indicates if the job offer is currently active */
  is_active: z.boolean(),
  
  /** Additional notes regarding the job offer */
  note: z.string().optional(),
});

/**
 * App model job offer schema (repository transformation output)
 */
export const JobOfferDataSchema = BaseAppSchema.extend({
  /** The unique identifier for the job */
  jobId: z.string(),
  
  /** The unique identifier for the candidate */
  candidateId: z.string(),
  
  /** The number of offers made */
  offerCount: z.number(),
  
  /** Indicates if the candidate has applied for the job */
  isApplied: z.boolean().optional(),
  
  /** Indicates if the job offer is currently active */
  isActive: z.boolean(),
  
  /** Additional notes regarding the job offer */
  note: z.string().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const JobOfferCriticalSchema = FirebaseJobOfferSchema.pick({
  job_id: true,
  candidate_id: true,
  is_active: true,
});

export const JobOfferDataCriticalSchema = JobOfferDataSchema.pick({
  jobId: true,
  candidateId: true,
  isActive: true,
});

// Export inferred types
export type FirebaseJobOfferType = z.infer<typeof FirebaseJobOfferSchema>;
export type JobOfferData = z.infer<typeof JobOfferDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseJobOfferSchema,
    critical: JobOfferCriticalSchema,
  },
  app: {
    full: JobOfferDataSchema,
    critical: JobOfferDataCriticalSchema,
  },
};