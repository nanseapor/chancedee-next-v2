import { DocumentReference } from 'firebase-admin/firestore';
import { z } from 'zod';

import { BaseAppSchema, UserAccountBaseSchema } from './base.schema';

/**
 * User status schema - flexible string for various statuses
 * Common values: verified, unverified, flagged, suspended, pending, deleted, active
 * But allows other values for flexibility
 */
export const UserStatusSchema = z.string().optional();

/**
 * User roles enum values (critical for access control)
 * Based on analysis of conditional logic in auth middleware
 */
export const UserRolesSchema = z.array(z.enum([
  'chancedee',
  'company', 
  'admin',
  'pending',
  'deleted',
  'candidate',
]));

/**
 * Gender schema - flexible string for user input
 */
export const GenderSchema = z.string().optional();

/**
 * Firebase user account schema (what's stored in Firestore)
 * Based on FirebaseUserAccountType
 */
export const FirebaseUserAccountSchema = UserAccountBaseSchema.extend({
  /** Optional URL to the user's avatar image */
  avatar_url: z.string().optional(),

  /** User's first name in Thai */
  first_name_th: z.string().optional(),

  /** User's last name in Thai */
  last_name_th: z.string().optional(),

  /** User's nickname in Thai */
  nick_name_th: z.string().optional(),

  /** User's gender */
  gender: GenderSchema,

  /** User's email address */
  email: z.string().email().optional(),

  /** User's phone number */
  phone: z.string().optional(),

  /**
   * Indicates if the user account is active
   * CRITICAL FIELD - Controls UI access and filtering
   */
  is_active: z.boolean(),

  /** Indicates if the user has accepted the policy */
  is_policy_accepted: z.boolean().optional(),

  /** Types of services the user is associated with */
  service_types: z.string().optional(),

  /** User's citizen identification number */
  citizen_id: z.string().optional(),

  /** Optional job title of the user */
  job_title: z.string().optional(),

  /**
   * User status for admin actions
   * CRITICAL FIELD - Controls admin UI and user management
   */
  status: UserStatusSchema,

  /** Reference to candidate information (optional) */
  candidate_id: z.custom<DocumentReference>().optional(),

  /** Reference to referral information (optional) */
  referral_id: z.custom<DocumentReference>().optional(),
});

/**
 * User info props schema (nested in app model)
 */
export const UserInfoPropsSchema = z.object({
  uid: z.string(),
  /**
   * User roles array
   * CRITICAL FIELD - Controls access to entire platform sections
   */
  roles: UserRolesSchema,
  companyId: z.string().optional(),
  currentStep: z.number().optional(),
  currentStepName: z.string().optional(),
  remark: z.string().optional(),
});

/**
 * User transfer props schema (nested in app model)
 */
export const UserTransferPropsSchema = z.object({
  uid: z.string(),
  targetCompany: z.string(),
  requestTimestamp: z.number(),
  transferApproved: z.boolean(),
});

/**
 * Firebase user data props schema (repository transformation output)
 * Based on FirebaseUserDataProps interface
 */
export const FirebaseUserDataPropsSchema = BaseAppSchema.extend({
  avatarURL: z.string().optional(),
  firstnameTH: z.string().optional(),
  lastnameTH: z.string().optional(),
  nicknameTH: z.string().optional(),
  email: z.string().email().optional(),
  phone: z.string().optional(),
  gender: GenderSchema,
  /** Indicates if the user has accepted the policy */
  isPolicyAccepted: z.boolean().optional(),
  /** CRITICAL FIELD - Controls user access */
  isActive: z.boolean(),
  serviceTypes: z.string().optional(),
  citizenId: z.string().optional(),
  jobTitle: z.string().optional(),
  /** CRITICAL FIELD - Controls admin actions */
  status: UserStatusSchema,
});

/**
 * Full user data props schema (app model with info)
 * Based on userDataProps interface
 */
export const UserDataPropsSchema = BaseAppSchema.extend({
  avatarURL: z.string().optional(),
  firstnameTH: z.string().optional(),
  lastnameTH: z.string().optional(),
  nicknameTH: z.string().optional(),
  firstnameEN: z.string().optional(),
  lastnameEN: z.string().optional(),
  nicknameEN: z.string().optional(),
  gender: GenderSchema,
  email: z.string().email().optional(),
  phone: z.string().optional(),
  /** CRITICAL FIELD - Contains user roles and permissions */
  info: UserInfoPropsSchema,
  transfer: UserTransferPropsSchema.optional(),
  /** Indicates if the user has accepted the policy */
  isPolicyAccepted: z.boolean().optional(),
  /** CRITICAL FIELD - Controls user access */
  isActive: z.boolean(),
  serviceTypes: z.string().optional(),
  citizenId: z.string().optional(),
  jobTitle: z.string().optional(),
  /** CRITICAL FIELD - Controls admin actions */
  status: UserStatusSchema,
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp fields to catch serialization issues
 */
export const UserAccountCriticalSchema = FirebaseUserAccountSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  is_active: true,
  status: true,
});

export const UserDataPropsCriticalSchema = UserDataPropsSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  isActive: true,
  status: true,
  info: true, // Contains critical roles array
});

// Export inferred types
export type FirebaseUserAccountType = z.infer<typeof FirebaseUserAccountSchema>;
export type UserInfoProps = z.infer<typeof UserInfoPropsSchema>;
export type UserTransferProps = z.infer<typeof UserTransferPropsSchema>;
export type FirebaseUserDataProps = z.infer<typeof FirebaseUserDataPropsSchema>;
export type UserDataProps = z.infer<typeof UserDataPropsSchema>;
export type UserStatus = z.infer<typeof UserStatusSchema>;
export type UserRoles = z.infer<typeof UserRolesSchema>;
export type Gender = z.infer<typeof GenderSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseUserAccountSchema,
    critical: UserAccountCriticalSchema,
  },
  app: {
    userDataProps: {
      full: UserDataPropsSchema,
      critical: UserDataPropsCriticalSchema,
    },
    firebaseUserDataProps: {
      full: FirebaseUserDataPropsSchema,
      critical: FirebaseUserDataPropsSchema.pick({
        isActive: true,
        status: true,
      }),
    },
  },
};
