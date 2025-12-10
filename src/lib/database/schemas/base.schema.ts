import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

/**
 * Base schema for all Firebase documents
 * Equivalent to baseType in models/base.ts
 */
export const BaseFirebaseSchema = z.object({
  uid: z.string(),
  created_by: z.custom<DocumentReference>().nullable(),
  updated_by: z.custom<DocumentReference>().nullable(),
  created_at: z.custom<Timestamp>(),
  updated_at: z.custom<Timestamp>(),
});

/**
 * Base schema for user account documents
 * Equivalent to userAccountBaseType in models/base.ts
 */
export const UserAccountBaseSchema = z.object({
  uid: z.string(),
  created_by: z.string(),
  updated_by: z.string(),
  created_at: z.custom<Timestamp>(),
  updated_at: z.custom<Timestamp>(),
});

/**
 * Base schema for app models (with transformed timestamps)
 */
export const BaseAppSchema = z.object({
  uid: z.string(),
  createdBy: z.string().optional(),
  updatedBy: z.string().optional(),
  createdAt: z.number(),
  updatedAt: z.number(),
});

// Export inferred types
export type BaseFirebaseType = z.infer<typeof BaseFirebaseSchema>;
export type UserAccountBaseType = z.infer<typeof UserAccountBaseSchema>;
export type BaseAppType = z.infer<typeof BaseAppSchema>;