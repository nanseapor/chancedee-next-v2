import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase admin invitation schema
 * Invitation codes for admin user registration
 */
export const FirebaseAdminInvitationSchema = BaseFirebaseSchema.extend({
  /** Invitation code */
  code: z.string(),
  
  /** Timestamp */
  timestamp: z.custom<Timestamp>(),
  
  /** Indicates whether this code has been used */
  is_used: z.boolean(),
});

/**
 * App model admin invitation schema (repository transformation output)
 */
export const AdminInvitationDataSchema = BaseAppSchema.extend({
  /** Invitation code */
  code: z.string(),
  
  /** Timestamp */
  timestamp: z.number(),
  
  /** Indicates whether this code has been used */
  isUsed: z.boolean(),
});

/**
 * Critical fields schemas for selective validation
 */
export const AdminInvitationCriticalSchema = FirebaseAdminInvitationSchema.pick({
  code: true,
  is_used: true,
});

export const AdminInvitationDataCriticalSchema = AdminInvitationDataSchema.pick({
  code: true,
  isUsed: true,
});

// Export inferred types
export type FirebaseAdminInvitationType = z.infer<typeof FirebaseAdminInvitationSchema>;
export type AdminInvitationData = z.infer<typeof AdminInvitationDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseAdminInvitationSchema,
    critical: AdminInvitationCriticalSchema,
  },
  app: {
    full: AdminInvitationDataSchema,
    critical: AdminInvitationDataCriticalSchema,
  },
};