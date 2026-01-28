/**
 * Public Companies Types
 *
 * Type definitions for public-facing company directory routes (COMP-R09)
 * Used by: /companies page, CompanyCard, CompanyFilters
 */

/**
 * Industry filter options
 * Matches Firebase company.industry field values
 */
export type Industry =
  | "technology"
  | "finance"
  | "healthcare"
  | "education"
  | "retail"
  | "manufacturing"
  | "hospitality"
  | "construction"
  | "logistics"
  | "other";

/**
 * Company size filter options
 * Matches Firebase company.company_size field values
 */
export type CompanySize = "S" | "M" | "L";

/**
 * Company sort options
 * - newest: Most recently registered/approved
 * - alphabetical: A-Z by company name (Thai locale)
 * - most_jobs: Most open positions
 */
export type CompanySortOption = "newest" | "alphabetical" | "most_jobs";

/**
 * Lightweight company data for card display
 * Used in company listing grid
 */
export interface CompanyCardData {
  uid: string;
  companyName: string;
  profilePhoto: string | null;
  industry: string | null;
  industryLabel: string | null;
  companySize: CompanySize | null;
  companySizeLabel: string | null;
  shortDescriptionText: string | null;
  openJobsCount: number;
  createdAt: number;
}

/**
 * Company search parameters for server action
 * All parameters are optional for flexible filtering
 */
export interface CompanySearchParams {
  q?: string; // Search keyword (company name, description)
  industries?: Industry[]; // Industry filter (multi-select)
  sizes?: CompanySize[]; // Company size filter (multi-select)
  sort?: CompanySortOption; // Sort order
  page?: number; // 1-indexed page number
  pageSize?: number; // Items per page (default: 20)
}

/**
 * Company search response from server action
 */
export interface CompanySearchResponse {
  success: boolean;
  data?: {
    companies: CompanyCardData[];
    totalCount: number;
    totalPages: number;
    currentPage: number;
    processingTime: number;
  };
  error?: string;
}

/**
 * Filter state for company search (client-side)
 * Used by useCompanyFilters hook
 */
export interface CompanyFilterState {
  q: string;
  industries: Industry[];
  sizes: CompanySize[];
  sort: CompanySortOption;
  page: number;
}
