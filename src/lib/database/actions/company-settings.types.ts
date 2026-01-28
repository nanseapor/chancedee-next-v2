/**
 * Company Settings Types
 * Extracted from company-settings.ts for Next.js 15+ compatibility
 */

export interface CompanyProfileUpdate {
  company_name?: string;
  company_name_en?: string;
  industry?: string;
  company_size?: "S" | "M" | "L";
  founded_year?: number;
  description?: string;
}

export interface CompanyLinks {
  website?: string;
  facebook?: string;
  linkedin?: string;
}

export interface CompanyJobDefaults {
  default_location?: string;
  default_job_type?: string;
  auto_close_days?: number;
}

export interface CompanyNotifications {
  notify_new_application?: boolean;
  daily_summary_enabled?: boolean;
  daily_summary_time?: string;
  interview_reminder_hours?: number;
}

export interface CompanyConfig {
  job_defaults?: CompanyJobDefaults;
  notifications?: CompanyNotifications;
}

export interface ActionResult<T = void> {
  success: boolean;
  error?: string;
  data?: T;
}

export interface UploadResult {
  success: boolean;
  url?: string;
  error?: string;
}
