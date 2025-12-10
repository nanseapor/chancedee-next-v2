import { z } from "zod";

/**
 * Form validation schema for language input
 * Includes validation messages for user interface
 */
export const LanguageFormSchema = z.object({
  records: z
    .object({
      languageName: z.string().min(1, {
        message: "กรุณาเลือกภาษา",
      }),
      languageLevel: z.string().min(1, {
        message: "กรุณาเลือกระดับ",
      }),
      isCertified: z.boolean(),
      languageCertifiedName: z.string().optional(),
      languageCertifiedScore: z.string().optional(),
      uid: z.string().optional(),
      createdBy: z.string().optional(),
      createdAt: z.number().optional(),
      updatedBy: z.string().optional(),
      updatedAt: z.number().optional(),
    })
    .array(),
});

// Export inferred types
export type LanguageFormData = z.infer<typeof LanguageFormSchema>;
export type LanguageRecord = LanguageFormData["records"][number];
