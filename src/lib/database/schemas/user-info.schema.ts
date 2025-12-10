import { z } from 'zod';
import { DocumentReference } from 'firebase-admin/firestore';

import { UserAccountBaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase user info schema
 * Extended user information beyond basic user accounts
 */
export const FirebaseUserInfoSchema = UserAccountBaseSchema.extend({
  /** The role of the user within the application */
  roles: z.array(z.string()),
  
  /** The ID of the company the user is associated with */
  company_id: z.custom<DocumentReference>().optional(),
  
  /** The current onboarding step the user is on */
  current_step: z.number().optional(),
  
  /** The name of the current onboarding step */
  current_step_name: z.string().optional(),
  
  /** Additional remarks about the user */
  remark: z.string().optional(),
  
  /** Indicates if the user's email is verified */
  is_verified: z.boolean().optional(),
  
  /** Indicates if the user has completed the preference questionnaire */
  is_preference_set: z.boolean().optional(),
  
  /** Indicates if the user has been rewarded for their first application */
  is_first_applicantion_rewarded: z.boolean().optional(),
  
  /** Indicates if the user has been rewarded for their first interview */
  is_first_interviewer_rewarded: z.boolean().optional(),
  
  /** Indicates if the user is new */
  is_new_user_rewarded: z.boolean().optional(),
  
  /** Indicates if the user has completed onboarding */
  is_onboarded: z.boolean().optional(),
  
  /** Indicates if the user has created a resume */
  is_resume_completed: z.boolean().optional(),
});

/**
 * App model user info schema (repository transformation output)
 */
export const UserInfoDataSchema = BaseAppSchema.extend({
  /** The role of the user within the application */
  roles: z.array(z.string()),
  
  /** The ID of the company the user is associated with */
  companyId: z.string().optional(),
  
  /** The current onboarding step the user is on */
  currentStep: z.number().optional(),
  
  /** The name of the current onboarding step */
  currentStepName: z.string().optional(),
  
  /** Additional remarks about the user */
  remark: z.string().optional(),
  
  /** Indicates if the user's email is verified */
  isVerified: z.boolean().optional(),
  
  /** Indicates if the user has completed the preference questionnaire */
  isPreferenceSet: z.boolean().optional(),
  
  /** Indicates if the user has been rewarded for their first application */
  isFirstApplicantionRewarded: z.boolean().optional(),
  
  /** Indicates if the user has been rewarded for their first interview */
  isFirstInterviewerRewarded: z.boolean().optional(),
  
  /** Indicates if the user is new */
  isNewUserRewarded: z.boolean().optional(),
  
  /** Indicates if the user has completed onboarding */
  isOnboarded: z.boolean().optional(),
  
  /** Indicates if the user has created a resume */
  isResumeCompleted: z.boolean().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const UserInfoCriticalSchema = FirebaseUserInfoSchema.pick({
  roles: true,
  is_verified: true,
  is_onboarded: true,
});

export const UserInfoDataCriticalSchema = UserInfoDataSchema.pick({
  roles: true,
  isVerified: true,
  isOnboarded: true,
});

// Export inferred types
export type FirebaseUserInfoType = z.infer<typeof FirebaseUserInfoSchema>;
export type UserInfoData = z.infer<typeof UserInfoDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseUserInfoSchema,
    critical: UserInfoCriticalSchema,
  },
  app: {
    full: UserInfoDataSchema,
    critical: UserInfoDataCriticalSchema,
  },
};