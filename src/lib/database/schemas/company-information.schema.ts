import { z } from 'zod';
import { DocumentReference, Timestamp } from 'firebase-admin/firestore';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Company status enum values (what's actually stored in Firebase)
 * CRITICAL FIELD - Controls admin approval workflows and company visibility
 */
export const CompanyStatusSchema = z.enum([
  'pending',    // New registration, awaiting admin approval
  'approved',   // Admin approved, company visible in lists
  'rejected',   // Admin rejected, company not visible
  'suspended',  // Admin suspended, company temporarily hidden
]);

/**
 * Company size enum values
 */
export const CompanySizeSchema = z.enum([
  'S', // รายได้น้อยกว่า 100ล้าน (S)
  'M', // รายได้มากกว่า 100ล้าน แต่น้อยกว่า 1000 ล้าน (M)
  'L', // รายได้มากกว่า 1000ล้าน (L)
]).optional();

/**
 * Firebase company information schema (what's stored in Firestore)
 * Based on FirebaseCompanyInformationType
 */
export const FirebaseCompanyInformationSchema = BaseFirebaseSchema.extend({
  /** The name of the company */
  company_name: z.string(),
  
  /** A brief description of the company */
  short_description: z.string().optional(),
  short_description_text: z.string().optional(),
  
  /** A brief description of the benefits */
  benefits_details: z.string().optional(),
  benefits_text: z.string().optional(),
  
  /** The industry in which the company operates */
  industry: z.string().optional(),
  
  /** An overview of the company */
  overview: z.string().optional(),
  overview_text: z.string().optional(),
  
  /** The tax identification number of the company */
  tax_id: z.string(),
  
  /** The website URL of the company */
  website: z.string().url().optional(),
  
  /** The URL of the company's cover photo */
  cover_photo: z.string().url().optional(),
  
  /** The URL of the company's profile photo */
  profile_photo: z.string().url().optional(),
  
  /** A link to a video about the company */
  video_link: z.string().url().optional(),
  
  /** The size of the company */
  company_size: CompanySizeSchema,
  
  /** The mode of travel to the company */
  travel_mode: z.string().optional(),
  
  /** The public transport station for the company */
  travel_station: z.string().optional(),
  
  /** The map location of the company */
  map_location: z.string().optional(),
  
  /** 
   * The status of the company's information
   * CRITICAL FIELD - Controls company visibility and admin workflows
   */
  status: CompanyStatusSchema,
  
  /** 
   * Indicates whether the company is active
   * CRITICAL FIELD - Controls UI visibility (soft delete)
   */
  is_active: z.boolean(),
  
  /** A list of staff members associated with the company */
  staff: z.array(z.string()).optional(),
});

/**
 * Firebase company data schema (repository transformation output)
 * Based on FirebaseCompanyData interface
 */
export const FirebaseCompanyDataSchema = BaseAppSchema.extend({
  companyName: z.string(),
  shortDescription: z.string().optional(),
  shortDescriptionText: z.string().optional(),
  industry: z.string().optional(),
  overview: z.string().optional(),
  overviewText: z.string().optional(),
  taxId: z.string(),
  website: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  profilePhoto: z.string().url().optional(),
  videoLink: z.string().url().optional(),
  companySize: CompanySizeSchema,
  travelMode: z.string().optional(),
  travelStation: z.string().optional(),
  benefitsDetails: z.string().optional(),
  benefitsText: z.string().optional(),
  mapLocation: z.string().optional(),
  
  /** CRITICAL FIELD - Controls company visibility and admin workflows */
  status: CompanyStatusSchema,
  
  /** CRITICAL FIELD - Controls UI visibility (soft delete) */
  isActive: z.boolean(),
  
  staff: z.array(z.string()).optional(),
});

/**
 * Address schema (nested in full company data)
 */
export const AddressSchema = z.object({
  address: z.string().optional(),
  province: z.string().optional(),
  district: z.string().optional(),
  subdistrict: z.string().optional(),
  postalCode: z.string().optional(),
}).optional();

/**
 * Contact schema (nested in full company data)
 */
export const ContactSchema = z.object({
  email: z.string().email().optional(),
  phone: z.string().optional(),
  website: z.string().url().optional(),
}).optional();

/**
 * Full company data props schema (app model with address and contact)
 * Based on companyDataProps interface
 */
export const CompanyDataPropsSchema = BaseAppSchema.extend({
  companyName: z.string(),
  shortDescription: z.string().optional(),
  industry: z.string().optional(),
  address: AddressSchema,
  overview: z.string().optional(),
  taxId: z.string(),
  website: z.string().url().optional(),
  coverPhoto: z.string().url().optional(),
  profilePhoto: z.string().url().optional(),
  videoLink: z.string().url().optional(),
  companySize: CompanySizeSchema,
  contact: ContactSchema,
  benefitsDetails: z.string().optional(),
  travelMode: z.string().optional(),
  travelStation: z.string().optional(),
  mapLocation: z.string().optional(),
  
  /** CRITICAL FIELD - Controls company visibility and admin workflows */
  status: CompanyStatusSchema,
  
  /** CRITICAL FIELD - Controls UI visibility (soft delete) */
  isActive: z.boolean(),
  
  staff: z.array(z.string()).optional(),
  approvedBy: z.string().optional(),
  approvedAt: z.number().optional(),
  deletedBy: z.string().optional(),
  deletedAt: z.number().optional(),
});

/**
 * Company employee schema
 * Based on CompanyEmployeeType interface
 */
export const CompanyEmployeeSchema = z.object({
  id: z.string(),
  email: z.string().email(),
  phone: z.string(),
  avatar: z.string().url(),
  firstnameTh: z.string(),
  firstnameEn: z.string(),
  lastnameTh: z.string(),
  lastnameEn: z.string(),
  lineId: z.string(),
  role: z.string(),
  status: z.string(),
  remark: z.string(),
  companyId: z.string(),
});

/**
 * Critical fields schemas for selective validation
 * Include base timestamp/reference fields to catch serialization issues
 */
export const CompanyInformationCriticalSchema = FirebaseCompanyInformationSchema.pick({
  uid: true,
  created_by: true,
  updated_by: true,
  created_at: true,
  updated_at: true,
  status: true,
  is_active: true,
});

export const CompanyDataCriticalSchema = FirebaseCompanyDataSchema.pick({
  uid: true,
  createdBy: true,
  updatedBy: true,
  createdAt: true,
  updatedAt: true,
  status: true,
  isActive: true,
});

// Export inferred types
export type FirebaseCompanyInformationType = z.infer<typeof FirebaseCompanyInformationSchema>;
export type FirebaseCompanyData = z.infer<typeof FirebaseCompanyDataSchema>;
export type CompanyDataProps = z.infer<typeof CompanyDataPropsSchema>;
export type CompanyEmployee = z.infer<typeof CompanyEmployeeSchema>;
export type CompanyStatus = z.infer<typeof CompanyStatusSchema>;
export type CompanySize = z.infer<typeof CompanySizeSchema>;
export type Address = z.infer<typeof AddressSchema>;
export type Contact = z.infer<typeof ContactSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseCompanyInformationSchema,
    critical: CompanyInformationCriticalSchema,
  },
  app: {
    firebaseCompanyData: {
      full: FirebaseCompanyDataSchema,
      critical: CompanyDataCriticalSchema,
    },
    companyDataProps: {
      full: CompanyDataPropsSchema,
      critical: CompanyDataPropsSchema.pick({
        status: true,
        isActive: true,
      }),
    },
  },
};