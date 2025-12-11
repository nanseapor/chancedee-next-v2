import { z } from 'zod';

import { PHONE_REGEX_THAI } from '@/constants/constant';

import { BaseFirebaseSchema, BaseAppSchema } from './base.schema';

/**
 * Delete request status schema
 */
export const DeleteRequestStatusSchema = z.string();

/**
 * Firebase delete request schema
 * Data deletion requests for user privacy compliance
 */
export const FirebaseDeleteRequestSchema = BaseFirebaseSchema.extend({
  /** Document code for the deletion request */
  document_code: z.string(),
  
  /** The first name in Thai */
  first_name_th: z.string(),
  
  /** The last name in Thai */
  last_name_th: z.string(),
  
  /** The phone number associated with the record */
  phone_number: z.string(),
  
  /** The email address associated with the record */
  email: z.string().email(),
  
  /** The status of the record */
  status: DeleteRequestStatusSchema,
  
  /** An array of file paths attached to the record */
  attached_files: z.array(z.string()),
});

/**
 * App model delete request schema (repository transformation output)
 */
export const DeleteRequestDataSchema = BaseAppSchema.extend({
  /** Document code for the deletion request */
  documentCode: z.string(),
  
  /** The first name in Thai */
  firstNameTh: z.string(),
  
  /** The last name in Thai */
  lastNameTh: z.string(),
  
  /** The phone number associated with the record */
  phoneNumber: z.string(),
  
  /** The email address associated with the record */
  email: z.string().email(),
  
  /** The status of the record */
  status: DeleteRequestStatusSchema,
  
  /** An array of file paths attached to the record */
  attachedFiles: z.array(z.string()),
});

/**
 * Critical fields schemas for selective validation
 */
export const DeleteRequestCriticalSchema = FirebaseDeleteRequestSchema.pick({
  document_code: true,
  email: true,
  status: true,
});

export const DeleteRequestDataCriticalSchema = DeleteRequestDataSchema.pick({
  documentCode: true,
  email: true,
  status: true,
});

/**
 * Delete request form schema (for client-side form validation)
 * Excludes attachedFiles as they're handled separately by file upload hook
 */
export const DeleteRequestFormSchema = z.object({
  documentCode: z.string(),
  email: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .email("รูปแบบอีเมลไม่ถูกต้อง"),
  phoneNumber: z
    .string({ required_error: "กรุณาเลือกข้อมูล" })
    .min(1, { message: "กรุณากรอกข้อมูล" })
    .regex(PHONE_REGEX_THAI, "หมายเลขโทรศัพท์ไม่ถูกต้อง"),
  firstNameTH: z.string().min(1, { message: "กรุณากรอกข้อมูล" }).max(50),
  lastNameTH: z.string().min(1, { message: "กรุณากรอกข้อมูล" }).max(50),
  status: z.string(),
});

// Export inferred types
export type FirebaseDeleteRequestType = z.infer<typeof FirebaseDeleteRequestSchema>;
export type DeleteRequestData = z.infer<typeof DeleteRequestDataSchema>;
export type DeleteRequestFormData = z.infer<typeof DeleteRequestFormSchema>;

// Export schemas for use in repositories
export const schemas = {
  firebase: {
    full: FirebaseDeleteRequestSchema,
    critical: DeleteRequestCriticalSchema,
  },
  app: {
    full: DeleteRequestDataSchema,
    critical: DeleteRequestDataCriticalSchema,
  },
};