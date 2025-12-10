import { z } from "zod";

/**
 * Form validation schema for license input
 * Includes validation messages for user interface
 */
export const LicenseFormSchema = z.object({
  records: z
    .object({
      certificateName: z.string().min(1, "กรุณากรอกชื่อใบรับรอง"),
      certifiedDate: z.number(),
      score: z.string().optional(),
      note: z.string().optional(), // Added missing field from database schema
      uid: z.string().optional(),
      createdBy: z.string().optional(),
      createdAt: z.number().optional(),
      updatedBy: z.string().optional(),
      updatedAt: z.number().optional(),
    })
    .array(),
});

// Export inferred types
export type LicenseFormData = z.infer<typeof LicenseFormSchema>;
export type LicenseRecord = LicenseFormData["records"][number];
