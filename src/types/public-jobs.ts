/**
 * Public Jobs Types
 *
 * Type definitions for public-facing job routes (JOB-R00 cross-cutting patterns)
 * Used by: JOB-R01 (Jobs List), JOB-R02 (Job Detail), JOB-R02b (Application)
 */

/**
 * Employment type options for job filtering
 */
export type EmploymentType = 'fulltime' | 'parttime' | 'contract' | 'internship';

/**
 * Education level requirements for jobs
 */
export type EducationLevel = 'high_school' | 'vocational' | 'bachelor' | 'master' | 'doctorate';

/**
 * Experience range options
 */
export type ExperienceRange = '0' | '1-3' | '3-5' | '5-10' | '10+';

/**
 * Work mode options (remote work support)
 */
export type WorkMode = 'onsite' | 'hybrid' | 'remote';

/**
 * Job sort options
 * - newest: Most recently posted
 * - salary_desc: Highest salary first
 * - salary_asc: Lowest salary first
 * - relevant: Most relevant (only available with search query)
 */
export type JobSortOption = 'newest' | 'salary_desc' | 'salary_asc' | 'relevant';

/**
 * Job availability states for display
 */
export type JobAvailabilityState =
  | 'available'      // Can view and apply
  | 'closed'         // Job manually closed by company
  | 'expired'        // Past expiry date
  | 'unpublished'    // Taken down temporarily
  | 'not_found';     // Doesn't exist

/**
 * Lightweight job data for card display
 * Used in job lists, similar jobs, saved jobs
 */
export interface JobCardData {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  workLocationText: string;
  employmentText: string;
  experienceText: string;
  createdAt: number;
  _matchScore?: number;  // Only for logged-in candidates (future enhancement)
}

/**
 * Job search parameters for MeiliSearch/Firestore queries
 * All parameters are optional for flexible filtering
 */
export interface JobSearchParams {
  q?: string;                    // Search keyword (title, company, function)
  locations?: string[];          // Province codes (comma-separated in URL)
  types?: EmploymentType[];      // Employment types filter
  salaryMin?: number;            // Minimum salary (THB)
  salaryMax?: number;            // Maximum salary (THB)
  education?: EducationLevel[];  // Education requirements
  experience?: ExperienceRange;  // Experience range
  remote?: WorkMode;             // Work mode (onsite/hybrid/remote)
  sort?: JobSortOption;          // Sort order
  page?: number;                 // 1-indexed page number
  pageSize?: number;             // Items per page (default: 20)
}

/**
 * Job search response from server action
 */
export interface JobSearchResponse {
  success: boolean;
  data?: {
    jobs: JobCardData[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    processingTime: number;
    isFallback: boolean;    // True if using Firestore fallback (MeiliSearch timeout)
  };
  error?: string;
}

/**
 * Filter state for job search sidebar
 * Tracks both applied and pending (unapplied) filters
 */
export interface JobFilterState {
  q: string;
  locations: string[];
  types: EmploymentType[];
  salaryMin: number | null;
  salaryMax: number | null;
  education: EducationLevel[];
  experience: ExperienceRange | null;
  remote: WorkMode | null;
  sort: JobSortOption;
  page: number;
}

/**
 * Save/unsave job input parameters
 */
export interface SaveJobParams {
  candidateId: string;
  jobId: string;
}

/**
 * Save/unsave job result
 */
export interface SaveJobResult {
  success: boolean;
  error?: string;
}

/**
 * Saved job item with metadata
 * Used in candidate's saved jobs list
 */
export interface SavedJobItem {
  job: JobCardData;
  savedAt: number;
  hasApplication: boolean;
  jobAvailability: JobAvailabilityState;
}

/**
 * Job detail data (full job information)
 * Used in JOB-R02 job detail page
 */
export interface JobDetailData {
  uid: string;
  title: string;
  companyId: string;
  companyName: string;
  companyLogo: string;
  minSalary: number | null;
  maxSalary: number | null;
  isNegotiable: boolean;
  workLocationText: string;
  employmentText: string;
  experienceText: string;
  educationLevelText: string[];
  jobDescriptionDetails: string;   // HTML content
  qualificationDetails: string;    // HTML content
  benefitsDetails: string;         // HTML content
  phone: string;
  email: string;
  postStartDate: number;
  postExpiryDate: number;
  jobStatus: 'draft' | 'published' | 'ontimer' | 'unpublished' | 'closed';
  isActive: boolean;
  positions: number;
  company?: {
    uid: string;
    name: string;
    logo?: string;
    industry?: string;
    size?: string;
    location?: string;
    about?: string;
  };
}

/**
 * Login prompt action types
 * Determines which message to show in login prompt modal
 */
export type LoginPromptAction = 'save' | 'apply' | 'view_saved';
