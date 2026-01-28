/**
 * Apply Modal Types
 *
 * Type definitions for JOB-R02b apply modal functionality
 */

/**
 * Form data for job application
 * Based on RIS Section 3.2 and BLS-03-01
 */
export interface ApplyFormData {
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number; // 0, 7, 15, 30, 60, 90
  headlines: string; // Cover letter
}

/**
 * Validation errors for apply form
 */
export interface ApplyFormErrors {
  expectedSalary?: string;
  headlines?: string;
}

/**
 * Form validation result
 */
export interface ApplyFormValidation {
  isValid: boolean;
  errors: ApplyFormErrors;
}

/**
 * Modal state machine states
 * Based on RIS Section 4.1
 */
export type ApplyModalState = 'closed' | 'editing' | 'submitting' | 'success';

/**
 * Availability options for overhead days
 * Based on RIS Section 3.3
 */
export interface AvailabilityOption {
  value: number;
  labelThai: string;
  labelEnglish: string;
}

/**
 * Job data needed for application
 */
export interface ApplyModalJob {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo?: string;
  workLocationText?: string;
}

/**
 * Application submission result (mock for v1.0)
 */
export interface ApplySubmitResult {
  success: boolean;
  applicationId?: string;
  error?: string;
}
