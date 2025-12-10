import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase candidate referral schema
 * Candidate referral system for user acquisition
 */
export const FirebaseCandidateReferralSchema = BaseFirebaseSchema.extend({
  /** The referral code for the user */
  refer_code: z.string().optional(),
  
  /** Optional referral link */
  refer_link: z.string().optional(),
  
  /** Optional ID of the user who referred */
  refer_by: z.string().optional(),
  
  /** Optional timestamp of when the referral was made */
  refer_date: z.custom<Timestamp>().optional(),
  
  /** Optional list of referred candidates */
  referred_list: z.array(z.string()).optional(),
});

/**
 * App model candidate referral schema (repository transformation output)
 */
export const CandidateReferralDataSchema = BaseAppSchema.extend({
  /** The referral code for the user */
  referCode: z.string().optional(),
  
  /** Optional referral link */
  referLink: z.string().optional(),
  
  /** Optional ID of the user who referred */
  referBy: z.string().optional(),
  
  /** Optional timestamp of when the referral was made */
  referDate: z.number().optional(),
  
  /** Optional list of referred candidates */
  referredList: z.array(z.string()).optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const CandidateReferralCriticalSchema = FirebaseCandidateReferralSchema.pick({
  refer_code: true,
  refer_by: true,
});

export const CandidateReferralDataCriticalSchema = CandidateReferralDataSchema.pick({
  referCode: true,
  referBy: true,
});

// Export inferred types
export type FirebaseCandidateReferralType = z.infer<typeof FirebaseCandidateReferralSchema>;
export type CandidateReferralData = z.infer<typeof CandidateReferralDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseCandidateReferralSchema,
    critical: CandidateReferralCriticalSchema,
  },
  app: {
    full: CandidateReferralDataSchema,
    critical: CandidateReferralDataCriticalSchema,
  },
};