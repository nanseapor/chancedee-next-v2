import { z } from 'zod';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Company request status schema
 */
export const CompanyRequestStatusSchema = z.enum(['pending', 'approved', 'rejected', 'suspended']);

/**
 * Company size schema
 */
export const CompanySizeSchema = z.enum(['S', 'M', 'L']);

/**
 * Firebase company requests schema
 * Company registration requests for platform approval
 */
export const FirebaseCompanyRequestsSchema = BaseFirebaseSchema.extend({
  /** The name of the company */
  company_name: z.string(),
  
  /** The first name of the contact person in Thai */
  first_name_th: z.string().optional(),
  
  /** The last name of the contact person in Thai */
  last_name_th: z.string().optional(),
  
  /** The email address of the contact person */
  email: z.string().email(),
  
  /** The status of the request */
  status: CompanyRequestStatusSchema,
  
  /** The URL of the company logo */
  company_logo: z.string().optional(),
  
  /** The country where the company is located */
  country: z.string().optional(),
  
  /** The size of the company */
  company_size: z.string().optional(),
  
  /** The attached files for the company request */
  attached_files: z.array(z.string()).optional(),
});

/**
 * App model company requests schema (repository transformation output)
 */
export const CompanyRequestsDataSchema = BaseAppSchema.extend({
  /** The name of the company */
  companyName: z.string(),
  
  /** The first name of the contact person in Thai */
  firstNameTh: z.string().optional(),
  
  /** The last name of the contact person in Thai */
  lastNameTh: z.string().optional(),
  
  /** The email address of the contact person */
  email: z.string().email(),
  
  /** The status of the request */
  status: CompanyRequestStatusSchema,
  
  /** The URL of the company logo */
  companyLogo: z.string().optional(),
  
  /** The country where the company is located */
  country: z.string().optional(),
  
  /** The size of the company */
  companySize: z.string().optional(),
  
  /** The attached files for the company request */
  attachedFiles: z.array(z.string()).optional(),
});

/**
 * Critical fields schemas for selective validation
 */
export const CompanyRequestsCriticalSchema = FirebaseCompanyRequestsSchema.pick({
  company_name: true,
  email: true,
  status: true,
});

export const CompanyRequestsDataCriticalSchema = CompanyRequestsDataSchema.pick({
  companyName: true,
  email: true,
  status: true,
});

// Export inferred types
export type FirebaseCompanyRequestsType = z.infer<typeof FirebaseCompanyRequestsSchema>;
export type CompanyRequestsData = z.infer<typeof CompanyRequestsDataSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseCompanyRequestsSchema,
    critical: CompanyRequestsCriticalSchema,
  },
  app: {
    full: CompanyRequestsDataSchema,
    critical: CompanyRequestsDataCriticalSchema,
  },
};