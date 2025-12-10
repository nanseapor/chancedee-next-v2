import { Timestamp } from 'firebase-admin/firestore';
import { z } from 'zod';

/**
 * OTP status schema
 */
export const OTPStatusSchema = z.string().nullable();

/**
 * Firebase OTP codes schema
 * One-time password codes for email verification
 */
export const FirebaseOTPCodesSchema = z.object({
  uid: z.string(),
  /** The email address associated with the OTP code */
  email: z.string().email(),
  
  /** The one-time password code */
  otp_code: z.string(),
  
  /** The reference code associated with the OTP */
  ref_code: z.string(),
  
  /** Creation timestamp */
  createDate: z.custom<Timestamp>(),
  
  /** Status of the OTP code */
  status: OTPStatusSchema,
});

/**
 * App model OTP codes schema (repository transformation output)
 */
export const OTPCodesDataSchema = z.object({
  /** Unique identifier */
  uid: z.string(),
  
  /** The email address associated with the OTP code */
  email: z.string().email(),
  
  /** The one-time password code */
  otpCode: z.string(),
  
  /** The reference code associated with the OTP */
  refCode: z.string(),
  
  /** Creation timestamp */
  createDate: z.number(),
  
  /** Status of the OTP code */
  status: OTPStatusSchema,
  
  /** Base audit fields */
  createdBy: z.string(),
  updatedBy: z.string(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

/**
 * Critical fields schemas for selective validation
 */
export const OTPCodesCriticalSchema = FirebaseOTPCodesSchema.pick({
  email: true,
  otp_code: true,
  status: true,
});

export const OTPCodesDataCriticalSchema = OTPCodesDataSchema.pick({
  email: true,
  otpCode: true,
  status: true,
});

// Export inferred types
export type FirebaseOTPCodesType = z.infer<typeof FirebaseOTPCodesSchema>;
export type OTPCodesData = z.infer<typeof OTPCodesDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseOTPCodesSchema,
    critical: OTPCodesCriticalSchema,
  },
  app: {
    full: OTPCodesDataSchema,
    critical: OTPCodesDataCriticalSchema,
  },
};