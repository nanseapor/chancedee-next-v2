import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Candidate status schema - flexible to match repository usage
 */
export const CandidateStatusSchema = z.string().optional();

/**
 * Firebase candidate information schema
 * Complete schema matching the repository field requirements
 */
export const FirebaseCandidateInformationSchema = BaseFirebaseSchema.extend({
  /** Profile photo */
  resume_photo_url: z.string().optional(),
  
  /** Thai name fields */
  first_name_th: z.string().optional(),
  last_name_th: z.string().optional(),
  nick_name_th: z.string().optional(),
  
  /** Contact information */
  email: z.string().optional(),
  phone_number: z.string().optional(),
  
  /** Address fields */
  address_line_1: z.string().optional(),
  address_line_2: z.string().optional(),
  sub_district: z.string().optional(),
  district: z.string().optional(),
  province: z.string().optional(),
  post_code: z.string().optional(),
  
  /** Personal information */
  birthdate: z.custom<Timestamp>().optional(),
  bloodgroup: z.string().optional(),
  birthplace: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  race: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  marital_status: z.string().optional(),
  millitary_status: z.string().optional(),
  line_id: z.string().optional(),
  
  /** Professional information */
  about_me: z.string().optional(),
  area_of_expertise: z.string().optional(),
  achievement: z.string().optional(),
  experience_years: z.number().optional(),
  
  /** Transportation */
  has_car: z.boolean().optional(),
  has_motorcycle: z.boolean().optional(),
  
  /** Arrays for professional details */
  educations: z.array(z.object({
    institution: z.string(),
    major: z.string().optional(),
    minor: z.string().optional(),
    education_level: z.number(),
    education_label: z.string(),
    start_year: z.number(),
    end_year: z.number(),
    gpax: z.string(),
    highlights: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
  works: z.array(z.object({
    company: z.string(),
    job_industry: z.string().optional(),
    job_function: z.string().optional(),
    job_title: z.string(),
    experience_years: z.number().optional(),
    salary: z.number(),
    career_level: z.string().optional(),
    start_month: z.number(),
    start_year: z.number(),
    end_month: z.number().optional(),
    end_year: z.number().optional(),
    note: z.string().optional(),
    is_current: z.boolean(),
    is_new_graduate: z.boolean(),
  })).optional(),
  skills: z.array(z.object({
    skill_name: z.string(),
    expertise_level: z.string(),
    is_certified: z.boolean(),
    skill_certified_name: z.string().optional(),
    skill_certified_score: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({
    language_name: z.string(),
    language_level: z.string(),
    is_certified: z.boolean(),
    language_certified_name: z.string().optional(),
    language_certified_score: z.string().optional(),
  })).optional(),
  licenses: z.array(z.object({
    certificate_name: z.string(),
    certified_date: z.custom<number>(),
    score: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
  
  /** Status flags */
  is_active: z.boolean(),
  is_searchable: z.boolean(),
  status: CandidateStatusSchema,
  
  /** Verification and onboarding flags */
  is_verified: z.boolean().optional(),
  is_preference_set: z.boolean().optional(),
  is_first_applicantion_rewarded: z.boolean().optional(),
  is_first_interviewer_rewarded: z.boolean().optional(),
  is_new_user_rewarded: z.boolean().optional(),
  is_onboarded: z.boolean().optional(),
  is_resume_completed: z.boolean().optional(),
});

/**
 * App model candidate information schema (repository transformation output)
 */
export const CandidateInformationDataSchema = BaseAppSchema.extend({
  /** Profile photo */
  resumePhotoURL: z.string().optional(),
  
  /** Thai name fields */
  firstnameTH: z.string().optional(),
  lastnameTH: z.string().optional(),
  nicknameTH: z.string().optional(),
  
  /** Contact information */
  email: z.string().optional(),
  phone: z.string().optional(),
  
  /** Address fields */
  addressLine1: z.string().optional(),
  addressLine2: z.string().optional(),
  district: z.string().optional(),
  subDistrict: z.string().optional(),
  postCode: z.string().optional(),
  province: z.string().optional(),
  
  /** Personal information */
  birthdate: z.number().optional(),
  bloodgroup: z.string().optional(),
  birthplace: z.string().optional(),
  religion: z.string().optional(),
  nationality: z.string().optional(),
  race: z.string().optional(),
  height: z.number().optional(),
  weight: z.number().optional(),
  maritalStatus: z.string().optional(),
  millitaryStatus: z.string().optional(),
  lineId: z.string().optional(),
  
  /** Professional information */
  aboutMe: z.string().optional(),
  areaOfExpertise: z.string().optional(),
  achievement: z.string().optional(),
  experienceYears: z.number().optional(),
  
  /** Transportation */
  hasCar: z.boolean().optional(),
  hasMotorcycle: z.boolean().optional(),
  
  /** Arrays for professional details */
  educations: z.array(z.object({
    institution: z.string(),
    major: z.string().optional(),
    minor: z.string().optional(),
    educationLevel: z.number(),
    educationLabel: z.string(),
    startYear: z.number(),
    endYear: z.number(),
    gpax: z.string(),
    highlights: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
  works: z.array(z.object({
    company: z.string(),
    jobIndustry: z.string().optional(),
    jobFunction: z.string().optional(),
    jobTitle: z.string(),
    experienceYears: z.number().optional(),
    salary: z.number(),
    careerLevel: z.string().optional(),
    startMonth: z.number(),
    startYear: z.number(),
    endMonth: z.number().optional(),
    endYear: z.number().optional(),
    note: z.string().optional(),
    isCurrent: z.boolean(),
    isNewGraduate: z.boolean(),
  })).optional(),
  skills: z.array(z.object({
    skillName: z.string(),
    expertiseLevel: z.string(),
    isCertified: z.boolean(),
    skillCertifiedName: z.string().optional(),
    skillCertifiedScore: z.string().optional(),
  })).optional(),
  languages: z.array(z.object({
    languageName: z.string(),
    languageLevel: z.string(),
    isCertified: z.boolean(),
    languageCertifiedName: z.string().optional(),
    languageCertifiedScore: z.string().optional(),
  })).optional(),
  licenses: z.array(z.object({
    certificateName: z.string(),
    certifiedDate: z.number(),
    score: z.string().optional(),
    note: z.string().optional(),
  })).optional(),
  
  /** Status flags */
  isActive: z.boolean(),
  isSearchable: z.boolean(),
  status: CandidateStatusSchema,
  
  /** Verification and onboarding flags */
  isOnboarded: z.boolean().optional(),
  isVerified: z.boolean().optional(),
  isPreferenceSet: z.boolean().optional(),
  isFirstApplicantionRewarded: z.boolean().optional(),
  isFirstInterviewerRewarded: z.boolean().optional(),
  isNewUserRewarded: z.boolean().optional(),
  isResumeCompleted: z.boolean().optional(),
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const CandidateInformationCriticalSchema = FirebaseCandidateInformationSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  is_active: true,
  is_searchable: true,
  status: true,
});

export const CandidateDataCriticalSchema = CandidateInformationDataSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  isSearchable: true,
  status: true,
});

// Export inferred types
export type FirebaseCandidateInformationType = z.infer<typeof FirebaseCandidateInformationSchema>;
export type CandidateInformationData = z.infer<typeof CandidateInformationDataSchema>;
export type CandidateStatus = z.infer<typeof CandidateStatusSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseCandidateInformationSchema,
    critical: CandidateInformationCriticalSchema,
  },
  app: {
    full: CandidateInformationDataSchema,
    critical: CandidateDataCriticalSchema,
  },
};