import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase candidate preference schema
 * Candidate job preferences and requirements
 */
export const FirebaseCandidatePreferenceSchema = BaseFirebaseSchema.extend({
  /** The identity of the candidate, selected from a dropdown */
  i_am: z.string().optional(),
  
  /** A list of attributes the candidate is looking for */
  i_amLooking_for: z.array(z.string()).optional(),
  
  /** A list of values important to the candidate */
  i_values: z.array(z.string()).optional(),
  
  /** A list of the candidate's preferred job titles */
  my_preferred_jobs: z.array(z.string()).optional(),
  
  /** A list of the candidate's personal values */
  my_values: z.array(z.string()).optional(),
  
  /** The candidate's preferred company (currently not used) */
  preferred_company: z.string().optional(),
  
  /** The candidate's preferred position (currently not used) */
  preferred_position: z.string().optional(),
  
  /** The candidate's expected salary */
  expected_salary: z.number().optional(),
  
  /** Indicates if the expected salary is negotiable */
  is_negotiable: z.boolean().optional(),
  
  /** A note from the candidate to the company */
  headlines: z.string().optional(),
  
  /** The candidate's availability timeline */
  overhead_days: z.string().optional(),
  
  /** Expected start date (deprecated) */
  expected_start_date: z.custom<Timestamp>().optional(),
  
  /** Job location preference */
  job_location: z.string().optional(),
  
  /** The type of job the candidate is interested in */
  job_type: z.string().optional(),
  
  /** The job function the candidate is interested in */
  job_function: z.array(z.string()).optional(),
  
  /** The industry the candidate is interested in */
  job_industry: z.array(z.string()).optional(),
  
  /** The candidate's experience level */
  experience: z.string().optional(),
  
  /** The candidate's current employment status */
  employment_status: z.string().optional(),
});

/**
 * App model candidate preference schema (repository transformation output)
 */
export const CandidatePreferenceDataSchema = BaseAppSchema.extend({
  /** The identity of the candidate */
  iAm: z.string().optional(),
  
  /** A list of attributes the candidate is looking for */
  iAmLookingFor: z.array(z.string()).optional(),
  
  /** A list of values important to the candidate */
  iValues: z.array(z.string()).optional(),
  
  /** A list of the candidate's preferred job titles */
  myPreferredJobs: z.array(z.string()).optional(),
  
  /** A list of the candidate's personal values */
  myValues: z.array(z.string()).optional(),
  
  /** The candidate's preferred company */
  preferredCompany: z.string().optional(),
  
  /** The candidate's preferred position */
  preferredPosition: z.string().optional(),
  
  /** The candidate's expected salary */
  expectedSalary: z.number().optional(),
  
  /** Indicates if the expected salary is negotiable */
  isNegotiable: z.boolean().optional(),
  
  /** A note from the candidate to the company */
  headlines: z.string().optional(),
  
  /** The candidate's availability timeline */
  overheadDays: z.string().optional(),
  
  /** Expected start date */
  expectedStartDate: z.number().optional(),
  
  /** Job location preference */
  jobLocation: z.string().optional(),
  
  /** The type of job the candidate is interested in */
  jobType: z.string().optional(),
  
  /** The job function the candidate is interested in */
  jobFunction: z.array(z.string()).optional(),
  
  /** The industry the candidate is interested in */
  jobIndustry: z.array(z.string()).optional(),
  
  /** The candidate's experience level */
  experience: z.string().optional(),
  
  /** The candidate's current employment status */
  employmentStatus: z.string().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const CandidatePreferenceCriticalSchema = FirebaseCandidatePreferenceSchema.pick({
  expected_salary: true,
  job_type: true,
  job_location: true,
});

export const CandidatePreferenceDataCriticalSchema = CandidatePreferenceDataSchema.pick({
  expectedSalary: true,
  jobType: true,
  jobLocation: true,
});

// Export inferred types
export type FirebaseCandidatePreferenceType = z.infer<typeof FirebaseCandidatePreferenceSchema>;
export type CandidatePreferenceData = z.infer<typeof CandidatePreferenceDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseCandidatePreferenceSchema,
    critical: CandidatePreferenceCriticalSchema,
  },
  app: {
    full: CandidatePreferenceDataSchema,
    critical: CandidatePreferenceDataCriticalSchema,
  },
};