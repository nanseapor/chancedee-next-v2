import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase contact schema
 * Contact information including phone, email, and social media profiles
 */
export const FirebaseContactSchema = BaseFirebaseSchema.extend({
  /** The phone number of the contact */
  phone: z.string(),
  
  /** The email address of the contact */
  email: z.string().email(),
  
  /** The mobile number of the contact (optional) */
  mobile: z.string().optional(),
  
  /** The Facebook profile of the contact (optional) */
  facebook: z.string().optional(),
  
  /** The LinkedIn profile of the contact (optional) */
  linkedin: z.string().optional(),
  
  /** The Twitter handle of the contact (optional) */
  twitter: z.string().optional(),
  
  /** The Instagram handle of the contact (optional) */
  instagram: z.string().optional(),
  
  /** The Line ID of the contact (optional) */
  line: z.string().optional(),
  
  /** The website URL of the contact (optional) */
  website: z.string().url().optional(),
});

/**
 * App model contact schema (repository transformation output)
 */
export const ContactDataSchema = BaseAppSchema.extend({
  /** The phone number of the contact */
  phone: z.string(),
  
  /** The email address of the contact */
  email: z.string().email(),
  
  /** The mobile number of the contact (optional) */
  mobile: z.string().optional(),
  
  /** The Facebook profile of the contact (optional) */
  facebook: z.string().optional(),
  
  /** The LinkedIn profile of the contact (optional) */
  linkedin: z.string().optional(),
  
  /** The Twitter handle of the contact (optional) */
  twitter: z.string().optional(),
  
  /** The Instagram handle of the contact (optional) */
  instagram: z.string().optional(),
  
  /** The Line ID of the contact (optional) */
  line: z.string().optional(),
  
  /** The website URL of the contact (optional) */
  website: z.string().url().optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const ContactCriticalSchema = FirebaseContactSchema.pick({
  phone: true,
  email: true,
});

export const ContactDataCriticalSchema = ContactDataSchema.pick({
  phone: true,
  email: true,
});

// Export inferred types
export type FirebaseContactType = z.infer<typeof FirebaseContactSchema>;
export type ContactData = z.infer<typeof ContactDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseContactSchema,
    critical: ContactCriticalSchema,
  },
  app: {
    full: ContactDataSchema,
    critical: ContactDataCriticalSchema,
  },
};