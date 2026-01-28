/**
 * Job Wizard Types
 * Types for COMP-R06: Job Creation Wizard
 */

/**
 * Wizard step number (1-4)
 */
export type WizardStep = 1 | 2 | 3 | 4;

/**
 * Auto-save state machine states
 */
export type AutoSaveState = "idle" | "dirty" | "debouncing" | "saving" | "saved";

/**
 * Job form data structure for wizard
 * Matches all fields across 4 steps
 */
export interface JobFormData {
  // Step 1: Basic Information
  title: string;
  jobFunctionId?: number;
  jobFunctionText?: string;
  jobType?: "fulltime" | "parttime" | "contract" | "internship";
  jobLevel?: string;
  department?: string;
  minSalary?: number;
  maxSalary?: number;
  hideSalary: boolean;
  numberOfPosition: number;

  // Step 2: Job Details
  jobDescriptionDetails?: string; // HTML
  jobDescriptionText?: string; // Plain text
  jobResponsibilitiesDetails?: string;
  jobResponsibilitiesText?: string;
  jobRequirementsDetails?: string;
  jobRequirementsText?: string;
  skills: string[];
  benefits?: string;

  // Step 3: Location
  workModel?: "onsite" | "hybrid" | "remote";
  provinceId?: number;
  province?: string;
  districtId?: number;
  district?: string;
  btsStationId?: number;
  btsStation?: string;
  remotePercentage?: number;
  fullAddress?: string;
}

/**
 * Publish options for final step
 */
export interface PublishOptions {
  mode: "now" | "schedule" | "draft";
  scheduledDate?: Date;
}

/**
 * Step validation result
 */
export interface StepValidation {
  isValid: boolean;
  errors: Record<string, string>;
}

/**
 * Field validation result
 */
export interface FieldValidation {
  isValid: boolean;
  error?: string;
}

/**
 * Default empty form data
 */
export const DEFAULT_JOB_FORM_DATA: JobFormData = {
  title: "",
  jobType: undefined,
  jobLevel: undefined,
  department: "",
  minSalary: undefined,
  maxSalary: undefined,
  hideSalary: false,
  numberOfPosition: 1,
  jobDescriptionDetails: "",
  jobDescriptionText: "",
  jobResponsibilitiesDetails: "",
  jobResponsibilitiesText: "",
  jobRequirementsDetails: "",
  jobRequirementsText: "",
  skills: [],
  benefits: "",
  workModel: undefined,
  provinceId: undefined,
  province: undefined,
  districtId: undefined,
  district: undefined,
  btsStationId: undefined,
  btsStation: undefined,
  remotePercentage: undefined,
  fullAddress: "",
};
