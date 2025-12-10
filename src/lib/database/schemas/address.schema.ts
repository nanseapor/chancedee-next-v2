import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Firebase address schema
 * Based on Thai address system with province/district/subdistrict hierarchy
 */
export const FirebaseAddressSchema = BaseFirebaseSchema.extend({
  /** Address line 1 */
  address_line_1: z.string(),
  
  /** Address line 2 (optional) */
  address_line_2: z.string().optional(),
  
  /** Sub district */
  sub_district: z.string(),
  
  /** District */
  district: z.string(),
  
  /** Province */
  province: z.string(),
  
  /** Post code */
  post_code: z.string(),
});

/**
 * App model address schema (repository transformation output)
 */
export const AddressDataSchema = BaseAppSchema.extend({
  /** Address line 1 */
  addressLine1: z.string(),
  
  /** Address line 2 (optional) */
  addressLine2: z.string().optional(),
  
  /** Sub district */
  subDistrict: z.string(),
  
  /** District */
  district: z.string(),
  
  /** Province */
  province: z.string(),
  
  /** Post code */
  postCode: z.string(),
});

/**
 * Critical fields schemas for selective validation
 */
export const AddressCriticalSchema = FirebaseAddressSchema.pick({
  address_line_1: true,
  district: true,
  province: true,
});

export const AddressDataCriticalSchema = AddressDataSchema.pick({
  addressLine1: true,
  district: true,
  province: true,
});

// Export inferred types
export type FirebaseAddressType = z.infer<typeof FirebaseAddressSchema>;
export type AddressData = z.infer<typeof AddressDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseAddressSchema,
    critical: AddressCriticalSchema,
  },
  app: {
    full: AddressDataSchema,
    critical: AddressDataCriticalSchema,
  },
};