import { z } from "zod";

/**
 * Form validation schema for skill input
 * Includes validation messages for user interface
 */
export const SkillFormSchema = z.object({
  records: z
    .object({
      skillName: z.string().min(1, "กรุณากรอกข้อมูล"),
      expertiseLevel: z.string(),
      isCertified: z.boolean(),
      skillCertifiedScore: z.string().optional(),
      skillCertifiedName: z.string().optional(),
      uid: z.string().optional(),
      createdBy: z.string().optional(),
      createdAt: z.number().optional(),
      updatedBy: z.string().optional(),
      updatedAt: z.number().optional(),
    })
    .array(),
});

// Export inferred types
export type SkillFormData = z.infer<typeof SkillFormSchema>;
export type SkillRecord = SkillFormData["records"][number];
