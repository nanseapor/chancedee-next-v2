import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { UserAccountBaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase user transfer schema
 * User transfer requests between companies
 */
export const FirebaseUserTransferSchema = UserAccountBaseSchema.extend({
  /** The company to which the user is being transferred */
  target_company: z.string().optional(),
  
  /** The timestamp when the transfer request was made */
  request_timestamp: z.custom<Timestamp>().optional(),
  
  /** Indicates whether the transfer has been approved */
  transfer_approved: z.boolean().optional(),
});

/**
 * App model user transfer schema (repository transformation output)
 */
export const UserTransferDataSchema = BaseAppSchema.extend({
  /** The company to which the user is being transferred */
  targetCompany: z.string().optional(),
  
  /** The timestamp when the transfer request was made */
  requestTimestamp: z.number().optional(),
  
  /** Indicates whether the transfer has been approved */
  transferApproved: z.boolean().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const UserTransferCriticalSchema = FirebaseUserTransferSchema.pick({
  target_company: true,
  transfer_approved: true,
});

export const UserTransferDataCriticalSchema = UserTransferDataSchema.pick({
  targetCompany: true,
  transferApproved: true,
});

// Export inferred types
export type FirebaseUserTransferType = z.infer<typeof FirebaseUserTransferSchema>;
export type UserTransferData = z.infer<typeof UserTransferDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseUserTransferSchema,
    critical: UserTransferCriticalSchema,
  },
  app: {
    full: UserTransferDataSchema,
    critical: UserTransferDataCriticalSchema,
  },
};