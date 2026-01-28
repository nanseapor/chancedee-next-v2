"use server";

import { z } from "zod";
import { webCompanyInformationGetById, webCompanyInformationUpdate } from "./company-information";
import { FirebaseCompanyData } from "@/types/company.types";
import type {
  CompanyProfileUpdate,
  CompanyLinks,
  CompanyJobDefaults,
  CompanyNotifications,
  CompanyConfig,
  ActionResult,
  UploadResult,
} from "./company-settings.types";

// Re-export types for consumers
export type {
  CompanyProfileUpdate,
  CompanyLinks,
  CompanyJobDefaults,
  CompanyNotifications,
  CompanyConfig,
  ActionResult,
  UploadResult,
} from "./company-settings.types";

// ============================================
// Validation Schemas
// ============================================

const companyProfileSchema = z.object({
  company_name: z
    .string()
    .min(1, "กรุณาระบุชื่อบริษัท (company_name)")
    .max(200, "ชื่อบริษัทยาวเกินไป (company_name)")
    .optional(),
  company_name_en: z.string().max(200, "ชื่อบริษัทยาวเกินไป").optional(),
  industry: z.string().optional(),
  company_size: z.enum(["S", "M", "L"], {
    errorMap: () => ({ message: "ขนาดบริษัทไม่ถูกต้อง (company_size)" }),
  }).optional(),
  founded_year: z
    .number()
    .min(1800, "ปีก่อตั้งไม่ถูกต้อง (founded_year)")
    .max(new Date().getFullYear(), "ปีก่อตั้งไม่ถูกต้อง (founded_year)")
    .optional(),
  description: z.string().max(5000, "คำอธิบายยาวเกินไป").optional(),
});

const companyLinksSchema = z.object({
  website: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  facebook: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
  linkedin: z
    .string()
    .url("รูปแบบ URL ไม่ถูกต้อง")
    .optional()
    .or(z.literal("")),
});

const companyConfigSchema = z.object({
  job_defaults: z
    .object({
      default_location: z.string().optional(),
      default_job_type: z.string().optional(),
      auto_close_days: z
        .number()
        .min(0, "auto_close_days ต้องเป็นตัวเลข 0 ขึ้นไป (auto_close_days)")
        .max(365, "auto_close_days ต้องไม่เกิน 365 วัน (auto_close_days)")
        .optional(),
    })
    .optional(),
  notifications: z
    .object({
      notify_new_application: z.boolean().optional(),
      daily_summary_enabled: z.boolean().optional(),
      daily_summary_time: z
        .string()
        .regex(/^\d{2}:\d{2}$/, "รูปแบบเวลาไม่ถูกต้อง")
        .optional(),
      interview_reminder_hours: z.number().min(1).max(72).optional(),
    })
    .optional(),
});

// ============================================
// Helper Functions
// ============================================

async function getCompanyOrFail(companyId: string): Promise<FirebaseCompanyData | null> {
  try {
    return await webCompanyInformationGetById(companyId);
  } catch {
    return null;
  }
}

// ============================================
// Server Actions
// ============================================

/**
 * Update company profile information
 */
export async function updateCompanyProfile(
  companyId: string,
  data: CompanyProfileUpdate
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = companyProfileSchema.safeParse(data);
    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        success: false,
        error: firstError?.message || "ข้อมูลไม่ถูกต้อง",
      };
    }

    // Check if company exists
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท (not found)",
      };
    }

    // Check for empty company_name if provided
    if (data.company_name !== undefined && data.company_name.trim() === "") {
      return {
        success: false,
        error: "กรุณาระบุชื่อบริษัท (company_name)",
      };
    }

    // Build update payload
    const updatePayload: Partial<FirebaseCompanyData> = {
      ...company,
    };

    if (data.company_name !== undefined) {
      updatePayload.companyName = data.company_name;
    }
    if (data.company_name_en !== undefined) {
      // Store in overview field temporarily (or add new field)
    }
    if (data.industry !== undefined) {
      updatePayload.industry = data.industry;
    }
    if (data.company_size !== undefined) {
      updatePayload.companySize = data.company_size;
    }
    if (data.founded_year !== undefined) {
      // Store in a custom field or metadata
    }
    if (data.description !== undefined) {
      updatePayload.shortDescription = data.description;
    }

    // Update company
    await webCompanyInformationUpdate(
      updatePayload as FirebaseCompanyData,
      companyId, // actor ID
      companyId  // document ID
    );

    return { success: true };
  } catch (error) {
    console.error("updateCompanyProfile error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่",
    };
  }
}

/**
 * Update company social/website links
 */
export async function updateCompanyLinks(
  companyId: string,
  links: CompanyLinks
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = companyLinksSchema.safeParse(links);
    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        success: false,
        error: firstError?.message || "รูปแบบ URL ไม่ถูกต้อง",
      };
    }

    // Check if company exists
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท",
      };
    }

    // Build update payload
    const updatePayload: FirebaseCompanyData = {
      ...company,
      website: links.website || undefined,
    };

    // Update company
    await webCompanyInformationUpdate(
      updatePayload,
      companyId,
      companyId
    );

    return { success: true };
  } catch (error) {
    console.error("updateCompanyLinks error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่",
    };
  }
}

/**
 * Upload company logo
 * Note: Actual file upload happens client-side, this updates the URL
 */
export async function uploadCompanyLogo(
  companyId: string,
  file: File
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "รองรับเฉพาะไฟล์ JPG, PNG เท่านั้น",
      };
    }

    // Validate file size (5MB max)
    const maxSize = 5 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "ไฟล์ใหญ่เกิน 5MB",
      };
    }

    // Check if company exists
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท",
      };
    }

    // In a real implementation, upload to Firebase Storage here
    // For now, return a mock URL
    const mockUrl = `https://storage.example.com/companies/${companyId}/logo.${file.type.split("/")[1]}`;

    // Update company profile_photo
    const updatePayload: FirebaseCompanyData = {
      ...company,
      profilePhoto: mockUrl,
    };

    await webCompanyInformationUpdate(
      updatePayload,
      companyId,
      companyId
    );

    return {
      success: true,
      url: mockUrl,
    };
  } catch (error) {
    console.error("uploadCompanyLogo error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่",
    };
  }
}

/**
 * Upload company cover photo
 */
export async function uploadCompanyCover(
  companyId: string,
  file: File
): Promise<UploadResult> {
  try {
    // Validate file type
    const allowedTypes = ["image/jpeg", "image/jpg", "image/png", "image/webp"];
    if (!allowedTypes.includes(file.type)) {
      return {
        success: false,
        error: "รองรับเฉพาะไฟล์ JPG, PNG, WebP เท่านั้น",
      };
    }

    // Validate file size (10MB max for cover)
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      return {
        success: false,
        error: "ไฟล์ใหญ่เกิน 10MB",
      };
    }

    // Check if company exists
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท",
      };
    }

    // In a real implementation, upload to Firebase Storage here
    const mockUrl = `https://storage.example.com/companies/${companyId}/cover.${file.type.split("/")[1]}`;

    // Update company cover_photo
    const updatePayload: FirebaseCompanyData = {
      ...company,
      coverPhoto: mockUrl,
    };

    await webCompanyInformationUpdate(
      updatePayload,
      companyId,
      companyId
    );

    return {
      success: true,
      url: mockUrl,
    };
  } catch (error) {
    console.error("uploadCompanyCover error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการอัพโหลด กรุณาลองใหม่",
    };
  }
}

/**
 * Update company configuration (job defaults, notifications)
 */
export async function updateCompanyConfig(
  companyId: string,
  config: CompanyConfig
): Promise<ActionResult> {
  try {
    // Validate input
    const validated = companyConfigSchema.safeParse(config);
    if (!validated.success) {
      const firstError = validated.error.errors[0];
      return {
        success: false,
        error: firstError?.message || "ข้อมูลไม่ถูกต้อง",
      };
    }

    // Check for negative auto_close_days
    if (
      config.job_defaults?.auto_close_days !== undefined &&
      config.job_defaults.auto_close_days < 0
    ) {
      return {
        success: false,
        error: "auto_close_days ต้องเป็นตัวเลข 0 ขึ้นไป",
      };
    }

    // Check if company exists
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท",
      };
    }

    // Merge new config with existing config
    const existingConfig = company.config || {};
    const mergedConfig = {
      ...existingConfig,
      ...(config.job_defaults && {
        job_defaults: {
          ...existingConfig.job_defaults,
          ...config.job_defaults,
        },
      }),
      ...(config.notifications && {
        notifications: {
          ...existingConfig.notifications,
          ...config.notifications,
        },
      }),
    };

    // Store config in company document
    const updatePayload: FirebaseCompanyData = {
      ...company,
      config: mergedConfig,
    };

    await webCompanyInformationUpdate(
      updatePayload,
      companyId,
      companyId
    );

    return { success: true };
  } catch (error) {
    console.error("updateCompanyConfig error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการบันทึก กรุณาลองใหม่",
    };
  }
}

/**
 * Get company settings data
 */
export async function getCompanySettings(companyId: string): Promise<ActionResult<{
  profile: CompanyProfileUpdate;
  links: CompanyLinks;
  config: CompanyConfig;
}>> {
  try {
    const company = await getCompanyOrFail(companyId);
    if (!company) {
      return {
        success: false,
        error: "ไม่พบข้อมูลบริษัท",
      };
    }

    // Get stored config with defaults for missing values
    const storedConfig = company.config || {};
    const defaultConfig = {
      job_defaults: {
        default_location: undefined,
        default_job_type: "full-time",
        auto_close_days: 30,
      },
      notifications: {
        notify_new_application: true,
        daily_summary_enabled: false,
        daily_summary_time: "09:00",
        interview_reminder_hours: 24,
      },
    };

    return {
      success: true,
      data: {
        profile: {
          company_name: company.companyName,
          company_name_en: undefined, // Not in current schema
          industry: company.industry,
          company_size: company.companySize,
          founded_year: undefined, // Not in current schema
          description: company.shortDescription,
        },
        links: {
          website: company.website,
          facebook: undefined, // Not in current schema
          linkedin: undefined, // Not in current schema
        },
        config: {
          job_defaults: {
            ...defaultConfig.job_defaults,
            ...storedConfig.job_defaults,
          },
          notifications: {
            ...defaultConfig.notifications,
            ...storedConfig.notifications,
          },
        },
      },
    };
  } catch (error) {
    console.error("getCompanySettings error:", error);
    return {
      success: false,
      error: "เกิดข้อผิดพลาดในการโหลดข้อมูล",
    };
  }
}
