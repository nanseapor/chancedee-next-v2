import { z } from 'zod';
import { Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

// Cookie preferences schema
export const CookiePreferencesSchema = z.object({
  essential: z.boolean(),
  analytics: z.boolean(),
  marketing: z.boolean(),
  functional: z.boolean(),
});

// Consent method enum
export const ConsentMethodSchema = z.enum(['banner', 'settings_page', 'api', 'policy_update']);

// Change reason enum  
export const ChangeReasonSchema = z.enum(['initial', 'user_update', 'policy_change', 'withdrawal', 'expiry']);

/**
 * Firebase schema for consent records
 * Snake_case fields matching Firestore document structure
 */
export const ConsentRecordFirebaseSchema = BaseFirebaseSchema.extend({
  user_id: z.string().optional(),
  session_id: z.string().optional(),
  ip_hash: z.string().min(16).max(16), // First 16 chars of SHA256
  user_agent: z.string(),
  policy_version: z.string(),
  preferences: CookiePreferencesSchema,
  consent_method: ConsentMethodSchema,
  withdrawal_date: z.custom<Timestamp>().optional(),
  is_active: z.boolean().default(true),
  parent_consent_id: z.string().optional(), // Links to previous version for audit trail
  version_number: z.number().int().positive().default(1),
  change_reason: ChangeReasonSchema,
  previous_preferences: CookiePreferencesSchema.optional(), // For audit comparison
});

/**
 * App schema for consent records  
 * CamelCase fields for TypeScript application layer
 */
export const ConsentRecordAppSchema = BaseAppSchema.extend({
  userId: z.string().optional(),
  sessionId: z.string().optional(),
  ipHash: z.string().min(16).max(16),
  userAgent: z.string(),
  policyVersion: z.string(),
  preferences: CookiePreferencesSchema,
  consentMethod: ConsentMethodSchema,
  withdrawalDate: z.number().optional(),
  isActive: z.boolean(),
  parentConsentId: z.string().optional(),
  versionNumber: z.number().int().positive(),
  changeReason: ChangeReasonSchema,
  previousPreferences: CookiePreferencesSchema.optional(),
});

/**
 * Client-side consent update request schema
 */
export const ConsentUpdateRequestSchema = z.object({
  preferences: CookiePreferencesSchema,
  sessionId: z.string().optional(),
  changeReason: ChangeReasonSchema.optional().default('user_update'),
  policyVersion: z.string().optional(),
});

/**
 * Consent history item for user dashboard
 */
export const ConsentHistoryItemSchema = z.object({
  id: z.string(),
  timestamp: z.number(),
  preferences: CookiePreferencesSchema,
  changeReason: ChangeReasonSchema,
  policyVersion: z.string(),
  isActive: z.boolean(),
});

// Export inferred types
export type ConsentRecordFirebaseType = z.infer<typeof ConsentRecordFirebaseSchema>;
export type ConsentRecordAppType = z.infer<typeof ConsentRecordAppSchema>;
export type ConsentUpdateRequestType = z.infer<typeof ConsentUpdateRequestSchema>;
export type ConsentHistoryItemType = z.infer<typeof ConsentHistoryItemSchema>;

// Validation functions
export const validateConsentPreferences = (preferences: unknown) => {
  return CookiePreferencesSchema.parse(preferences);
};

export const validateConsentUpdateRequest = (request: unknown): ConsentUpdateRequestType => {
  return ConsentUpdateRequestSchema.parse(request);
};

export const isValidPolicyVersion = (version: string): boolean => {
  return /^\d+\.\d+$/.test(version); // Format: "2.0", "2.1", etc.
};