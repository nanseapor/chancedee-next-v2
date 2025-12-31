/**
 * Job Filter Constants
 *
 * Constants for public job search filters and options
 * Used in: JOB-R01 (Job List), JobFilters component
 */

import type {
  EmploymentType,
  EducationLevel,
  ExperienceRange,
  WorkMode,
  JobSortOption,
} from '@/types/public-jobs';

/**
 * Employment type filter options
 * Matches Firebase job.employment field values
 */
export const EMPLOYMENT_TYPES: Array<{ value: EmploymentType; label: string; labelEn: string }> = [
  { value: 'fulltime', label: 'งานประจำ', labelEn: 'Full-time' },
  { value: 'parttime', label: 'งานพาร์ทไทม์', labelEn: 'Part-time' },
  { value: 'contract', label: 'สัญญาจ้าง', labelEn: 'Contract' },
  { value: 'internship', label: 'ฝึกงาน', labelEn: 'Internship' },
] as const;

/**
 * Education level filter options
 */
export const EDUCATION_LEVELS: Array<{ value: EducationLevel; label: string; labelEn: string }> = [
  { value: 'high_school', label: 'มัธยมศึกษา', labelEn: 'High School' },
  { value: 'vocational', label: 'อาชีวศึกษา', labelEn: 'Vocational' },
  { value: 'bachelor', label: 'ปริญญาตรี', labelEn: 'Bachelor\'s Degree' },
  { value: 'master', label: 'ปริญญาโท', labelEn: 'Master\'s Degree' },
  { value: 'doctorate', label: 'ปริญญาเอก', labelEn: 'Doctorate' },
] as const;

/**
 * Experience range filter options
 */
export const EXPERIENCE_RANGES: Array<{ value: ExperienceRange; label: string; labelEn: string }> = [
  { value: '0', label: 'ไม่มีประสบการณ์ / จบใหม่', labelEn: 'No experience / Fresh graduate' },
  { value: '1-3', label: '1-3 ปี', labelEn: '1-3 years' },
  { value: '3-5', label: '3-5 ปี', labelEn: '3-5 years' },
  { value: '5-10', label: '5-10 ปี', labelEn: '5-10 years' },
  { value: '10+', label: 'มากกว่า 10 ปี', labelEn: 'More than 10 years' },
] as const;

/**
 * Work mode filter options (remote work support)
 */
export const WORK_MODES: Array<{ value: WorkMode; label: string; labelEn: string }> = [
  { value: 'onsite', label: 'ทำงานที่สำนักงาน', labelEn: 'On-site' },
  { value: 'hybrid', label: 'ทำงานแบบผสม', labelEn: 'Hybrid' },
  { value: 'remote', label: 'ทำงานระยะไกล', labelEn: 'Remote' },
] as const;

/**
 * Job sort options
 */
export const JOB_SORT_OPTIONS: Array<{ value: JobSortOption; label: string; labelEn: string }> = [
  { value: 'newest', label: 'ใหม่สุด', labelEn: 'Newest' },
  { value: 'salary_desc', label: 'เงินเดือนมาก-น้อย', labelEn: 'Salary High-Low' },
  { value: 'salary_asc', label: 'เงินเดือนน้อย-มาก', labelEn: 'Salary Low-High' },
  { value: 'relevant', label: 'ตรงที่สุด', labelEn: 'Most Relevant' },
] as const;

/**
 * Salary range presets for Thai job market
 * Based on common salary ranges in Thailand
 */
export const SALARY_PRESETS = [
  { min: 0, max: 15000, label: 'ต่ำกว่า 15,000 บาท', labelEn: 'Below ฿15,000' },
  { min: 15000, max: 30000, label: '15,000 - 30,000 บาท', labelEn: '฿15,000 - ฿30,000' },
  { min: 30000, max: 50000, label: '30,000 - 50,000 บาท', labelEn: '฿30,000 - ฿50,000' },
  { min: 50000, max: 100000, label: '50,000 - 100,000 บาท', labelEn: '฿50,000 - ฿100,000' },
  { min: 100000, max: null, label: 'มากกว่า 100,000 บาท', labelEn: 'Above ฿100,000' },
] as const;

/**
 * Default filter values
 */
export const DEFAULT_FILTER_STATE = {
  q: '',
  locations: [],
  types: [],
  salaryMin: null,
  salaryMax: null,
  education: [],
  experience: null,
  remote: null,
  sort: 'newest' as JobSortOption,
  page: 1,
} as const;

/**
 * Jobs per page for pagination
 */
export const JOBS_PER_PAGE = 20;

/**
 * Filter priority for empty state suggestions
 * Order: Most restrictive to least restrictive
 * Used when no results found to suggest which filter to remove first
 */
export const FILTER_REMOVAL_PRIORITY = [
  'salaryMin',    // Most restrictive (high salary requirements)
  'experience',   // Specific experience requirements
  'education',    // Specific education requirements
  'remote',       // Work mode restrictions
  'types',        // Employment type restrictions
  'locations',    // Location restrictions (least restrictive)
] as const;

/**
 * MeiliSearch timeout configuration (milliseconds)
 */
export const MEILISEARCH_TIMEOUT = 5000; // 5 seconds

/**
 * Firestore fallback timeout configuration (milliseconds)
 */
export const FIRESTORE_TIMEOUT = 10000; // 10 seconds
