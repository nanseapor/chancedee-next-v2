/**
 * Company Filter Constants
 *
 * Constants for public company directory filters and options
 * Used in: COMP-R09 (Company Directory), CompanyFilters component
 */

import type {
  Industry,
  CompanySize,
  CompanySortOption,
} from "@/types/public-companies";

/**
 * Industry filter options
 * Matches Firebase company.industry field values
 */
export const INDUSTRY_OPTIONS: Array<{
  value: Industry;
  label: string;
  labelEn: string;
}> = [
  { value: "technology", label: "เทคโนโลยีและสารสนเทศ", labelEn: "Technology" },
  { value: "finance", label: "การเงินและธนาคาร", labelEn: "Finance & Banking" },
  { value: "healthcare", label: "สุขภาพและการแพทย์", labelEn: "Healthcare" },
  { value: "education", label: "การศึกษา", labelEn: "Education" },
  { value: "retail", label: "ค้าปลีก", labelEn: "Retail" },
  { value: "manufacturing", label: "การผลิต", labelEn: "Manufacturing" },
  {
    value: "hospitality",
    label: "การโรงแรมและท่องเที่ยว",
    labelEn: "Hospitality",
  },
  {
    value: "construction",
    label: "ก่อสร้างและอสังหาริมทรัพย์",
    labelEn: "Construction",
  },
  { value: "logistics", label: "โลจิสติกส์และขนส่ง", labelEn: "Logistics" },
  { value: "other", label: "อื่นๆ", labelEn: "Other" },
] as const;

/**
 * Company size filter options
 */
export const COMPANY_SIZE_OPTIONS: Array<{
  value: CompanySize;
  label: string;
  labelEn: string;
}> = [
  { value: "S", label: "เล็ก (1-50 คน)", labelEn: "Small (1-50)" },
  { value: "M", label: "กลาง (51-200 คน)", labelEn: "Medium (51-200)" },
  { value: "L", label: "ใหญ่ (มากกว่า 200 คน)", labelEn: "Large (200+)" },
] as const;

/**
 * Company sort options
 */
export const COMPANY_SORT_OPTIONS: Array<{
  value: CompanySortOption;
  label: string;
  labelEn: string;
}> = [
  { value: "newest", label: "ใหม่สุด", labelEn: "Newest" },
  { value: "alphabetical", label: "ก-ฮ", labelEn: "A-Z" },
  {
    value: "most_jobs",
    label: "ตำแหน่งงานมากที่สุด",
    labelEn: "Most Jobs",
  },
] as const;

/**
 * Default filter values
 */
export const DEFAULT_COMPANY_FILTER_STATE = {
  q: "",
  industries: [] as Industry[],
  sizes: [] as CompanySize[],
  sort: "newest" as CompanySortOption,
  page: 1,
} as const;

/**
 * Companies per page for pagination
 */
export const COMPANIES_PER_PAGE = 20;

/**
 * Helper function to get industry label
 */
export function getIndustryLabel(value: string | null | undefined): string {
  if (!value) return "ไม่ระบุ";
  const option = INDUSTRY_OPTIONS.find((opt) => opt.value === value);
  return option?.label || value;
}

/**
 * Helper function to get company size label
 */
export function getCompanySizeLabel(
  value: CompanySize | string | null | undefined
): string {
  if (!value) return "ไม่ระบุ";
  const option = COMPANY_SIZE_OPTIONS.find((opt) => opt.value === value);
  return option?.label || String(value);
}

/**
 * Filter priority for empty state suggestions
 * Order: Most restrictive to least restrictive
 */
export const FILTER_REMOVAL_PRIORITY = [
  "sizes", // Company size restrictions
  "industries", // Industry restrictions
  "q", // Keyword search (least restrictive)
] as const;
