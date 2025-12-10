import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Job status schema - strict enum for job lifecycle management
 * CRITICAL FIELD - Controls job visibility and workflow
 * 
 * Valid transitions:
 * - draft → published (manual publishing)
 * - draft → ontimer (schedule for future)
 * - published → unpublished (manual deactivation)  
 * - ontimer → published (early activation)
 * - ontimer → unpublished (cancel scheduled)
 * - draft → closed (deactivate draft)
 * - unpublished → closed (deactivate unpublished)
 */
export const JobStatusSchema = z.enum(['draft', 'published', 'ontimer', 'unpublished', 'closed'], {
  errorMap: () => ({ message: 'สถานะงานไม่ถูกต้อง' })
});

/**
 * Firebase jobs schema (complete to match repository expectations)
 * Based on FirebaseJobType and repository transformation requirements
 */
export const FirebaseJobSchema = BaseFirebaseSchema.extend({
  /** Company information */
  company_id: z.string(),
  company_ref: z.custom<DocumentReference>().optional(),
  company_name: z.string(),
  company_logo: z.string(),
  
  /** Interview information */
  interview_channel: z.string().optional(),
  interview_channel_text: z.string().optional(),
  
  /** Job basic information */
  title: z.string(),
  job_function: z.string().optional(),
  job_function_text: z.string().optional(),
  job_industry: z.string().optional(),
  job_type: z.string().optional(),
  career_level: z.string().optional(),
  career_level_text: z.string().optional(),
  education_level: z.array(z.number()).optional(),
  education_level_text: z.array(z.string()).optional(),
  
  /** Salary information */
  is_negotiable: z.boolean(),
  min_salary: z.number().optional(),
  max_salary: z.number().optional(),
  
  /** Job details */
  positions: z.number().optional(),
  work_location: z.string().optional(),
  work_location_text: z.string().optional(),
  is_online_interview: z.boolean(),
  
  /** Experience requirements */
  experience: z.string().optional(),
  experience_text: z.string().optional(),
  min_experience_year: z.number().optional(),
  max_experience_year: z.number().optional(),
  is_accept_new_grads: z.boolean(),
  
  /** Employment type */
  employment: z.string().optional(),
  employment_text: z.string().optional(),
  
  /** Work schedule */
  work_days: z.string().optional(),
  work_days_text: z.string().optional(),
  
  /** Transportation */
  has_car: z.boolean().optional(),
  has_motorcycle: z.boolean().optional(),
  travel_mode: z.string().optional(),
  travel_station: z.string().optional(),
  
  /** Dates */
  post_start_date: z.custom<Timestamp>().optional(),
  post_expiry_date: z.custom<Timestamp>().optional(),
  
  /** Job content */
  benefits_details: z.string().optional(),
  benefits_text: z.string().optional(),
  job_description_details: z.string().optional(),
  job_description_text: z.string().optional(),
  qualification_details: z.string().optional(),
  qualification_text: z.string().optional(),
  
  /** Contact information */
  phone: z.string(),
  email: z.string().email(),
  mobile: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  line: z.string().optional(),
  website: z.string().optional(),
  
  /** Address information */
  address_line_1: z.string(),
  address_line_2: z.string().optional(),
  district: z.string(),
  sub_district: z.string(),
  post_code: z.string(),
  province: z.string(),
  
  /** 
   * The status of the job
   * CRITICAL FIELD - Controls job visibility and workflow
   */
  job_status: JobStatusSchema,
  
  /** 
   * Indicates if the job is active (soft delete)
   * CRITICAL FIELD - Controls job visibility in lists
   */
  is_active: z.boolean(),
  
  /** Reactivation tracking */
  reactivated_count: z.number().optional(),
});

/**
 * App model jobs schema (repository transformation output)
 * Based on FirebaseJobData interface - complete to match repository expectations
 */
export const FirebaseJobDataSchema = BaseAppSchema.extend({
  /** Company information */
  companyId: z.string(),
  companyName: z.string(),
  companyLogo: z.string(),
  
  /** Interview information */
  interviewChannel: z.string().optional(),
  interviewChannelText: z.string().optional(),
  
  /** Job basic information */
  title: z.string(),
  jobFunction: z.string().optional(),
  jobFunctionText: z.string().optional(),
  jobIndustry: z.string().optional(),
  jobType: z.string().optional(),
  careerLevel: z.string().optional(),
  careerLevelText: z.string().optional(),
  educationLevel: z.array(z.number()).optional(),
  educationLevelText: z.array(z.string()).optional(),
  
  /** Salary information */
  isNegotiable: z.boolean(),
  minSalary: z.number().optional(),
  maxSalary: z.number().optional(),
  
  /** Job details */
  positions: z.number().optional(),
  workLocation: z.string().optional(),
  workLocationText: z.string().optional(),
  isOnlineInterview: z.boolean(),
  
  /** Experience requirements */
  experience: z.string().optional(),
  experienceText: z.string().optional(),
  minExperienceYear: z.number().optional(),
  maxExperienceYear: z.number().optional(),
  isAcceptNewGrads: z.boolean(),
  
  /** Employment type */
  employment: z.string().optional(),
  employmentText: z.string().optional(),
  
  /** Work schedule */
  workDays: z.string().optional(),
  workDaysText: z.string().optional(),
  
  /** Transportation */
  hasCar: z.boolean().optional(),
  hasMotorcycle: z.boolean().optional(),
  travelMode: z.string().optional(),
  travelStation: z.string().optional(),
  
  /** Dates */
  postStartDate: z.number().optional(),
  postExpiryDate: z.number().optional(),
  
  /** Job content */
  benefitsDetails: z.string().optional(),
  benefitsText: z.string().optional(),
  jobDescriptionDetails: z.string().optional(),
  jobDescriptionText: z.string().optional(),
  qualificationDetails: z.string().optional(),
  qualificationText: z.string().optional(),
  
  /** Contact information */
  phone: z.string(),
  email: z.string().email(),
  mobile: z.string().optional(),
  facebook: z.string().optional(),
  linkedin: z.string().optional(),
  twitter: z.string().optional(),
  instagram: z.string().optional(),
  line: z.string().optional(),
  website: z.string().optional(),
  
  /** Address information */
  addressLine1: z.string(),
  addressLine2: z.string().optional(),
  district: z.string(),
  subDistrict: z.string(),
  postCode: z.string(),
  province: z.string(),
  
  /** CRITICAL FIELD - Controls job visibility and workflow */
  jobStatus: JobStatusSchema,
  
  /** CRITICAL FIELD - Controls job visibility in lists */
  isActive: z.boolean(),
  
  /** Reactivation tracking */
  reactivatedCount: z.number().optional(),
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const JobCriticalSchema = FirebaseJobSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  job_status: true,
  is_active: true,
});

export const JobDataCriticalSchema = FirebaseJobDataSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  jobStatus: true,
  isActive: true,
});

// Export inferred types
export type FirebaseJobType = z.infer<typeof FirebaseJobSchema>;
export type FirebaseJobData = z.infer<typeof FirebaseJobDataSchema>;
export type JobStatus = z.infer<typeof JobStatusSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseJobSchema,
    critical: JobCriticalSchema,
  },
  app: {
    full: FirebaseJobDataSchema,
    critical: JobDataCriticalSchema,
  },
};