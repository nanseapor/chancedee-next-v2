import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Device type schema
 */
export const DeviceTypeSchema = z.enum(['android', 'ios', 'web']);

/**
 * FCM token status schema
 */
export const FCMTokenStatusSchema = z.enum(['active', 'inactive']);

/**
 * Firebase FCM token schema
 * Firebase Cloud Messaging tokens for push notifications
 */
export const FirebaseFCMTokenSchema = BaseFirebaseSchema.extend({
  /** The FCM token string used for sending notifications to the device */
  fcm_token: z.string(),
  
  /** The type of device associated with the FCM token */
  device_type: z.string().optional(),
  
  /** Optional status of the FCM token */
  status: z.string().optional(),
});

/**
 * App model FCM token schema (repository transformation output)
 */
export const FCMTokenDataSchema = BaseAppSchema.extend({
  /** The FCM token string used for sending notifications to the device */
  fcmToken: z.string(),
  
  /** The type of device associated with the FCM token */
  deviceType: z.string().optional(),
  
  /** Optional status of the FCM token */
  status: z.string().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const FCMTokenCriticalSchema = FirebaseFCMTokenSchema.pick({
  fcm_token: true,
  status: true,
});

export const FCMTokenDataCriticalSchema = FCMTokenDataSchema.pick({
  fcmToken: true,
  status: true,
});

// Export inferred types
export type FirebaseFCMTokenType = z.infer<typeof FirebaseFCMTokenSchema>;
export type FCMTokenData = z.infer<typeof FCMTokenDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseFCMTokenSchema,
    critical: FCMTokenCriticalSchema,
  },
  app: {
    full: FCMTokenDataSchema,
    critical: FCMTokenDataCriticalSchema,
  },
};