/**
 * COMP-R00: Company Profile Types
 *
 * Re-exports existing company profile types from src/types/company.types.ts
 * and adds jobsmarket-specific extensions
 */

import type { CompanyStatus } from "./status";

/**
 * Company size categories
 * Maps to existing 'S' | 'M' | 'L' in company.types.ts
 */
export type CompanySize =
  | "1-10"
  | "11-50"
  | "51-200"
  | "201-500"
  | "501-1000"
  | "1000+";

/**
 * Company size display labels (Thai)
 */
export const COMPANY_SIZE_LABELS: Record<CompanySize, string> = {
  "1-10": "1-10 คน",
  "11-50": "11-50 คน",
  "51-200": "51-200 คน",
  "201-500": "201-500 คน",
  "501-1000": "501-1,000 คน",
  "1000+": "มากกว่า 1,000 คน",
} as const;

/**
 * Map legacy size codes to new size ranges
 */
export const LEGACY_SIZE_TO_RANGE: Record<"S" | "M" | "L", CompanySize> = {
  S: "1-10",
  M: "11-50",
  L: "51-200",
} as const;

/**
 * Company address
 * Extends existing address type from database.types.ts
 */
export interface CompanyAddress {
  street?: string;
  district?: string;
  province?: string;
  postalCode?: string;
  country?: string;
}

/**
 * Company social media links
 */
export interface CompanySocialLinks {
  facebook?: string;
  linkedin?: string;
  twitter?: string;
  instagram?: string;
}

/**
 * Company profile data (simplified for jobsmarket routes)
 * Based on FirebaseCompanyData from src/types/company.types.ts
 */
export interface CompanyProfile {
  uid: string;
  companyName: string;
  shortDescription?: string;
  industry?: string;
  overview?: string;
  taxId: string;
  website?: string;
  coverPhoto?: string;
  profilePhoto?: string;
  videoLink?: string;
  companySize?: "S" | "M" | "L"; // Legacy format
  benefitsDetails?: string;
  mapLocation?: string;
  status: CompanyStatus;
  isActive: boolean;
  staff?: string[];
  createdAt?: number;
  updatedAt?: number;
}
