import { IJobReturnData, jobDataProps } from "@/types/job.types";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILI_SEARCH_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILI_SEARCH_API_KEY!,
});

const jobIndex = client.index(process.env.NEXT_PUBLIC_MEILI_SEARCH_JOB!);

// Meilisearch hit type (serialized Firestore data)
interface MeiliTimestamp {
  _seconds: number;
  _nanoseconds: number;
}

interface MeiliDocumentRef {
  _path?: {
    segments?: string[];
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type MeiliJobHit = Record<string, any>;

// Extract timestamp from serialized Firestore Timestamp
function extractMeiliTimestamp(timestamp?: MeiliTimestamp): number | undefined {
  if (!timestamp || typeof timestamp._seconds !== "number") return undefined;
  return timestamp._seconds * 1000;
}

// Extract document ID from serialized DocumentReference
function extractMeiliDocumentId(ref?: MeiliDocumentRef): string | undefined {
  if (!ref?._path?.segments) return undefined;
  const segments = ref._path.segments;
  return segments[segments.length - 1];
}

// Transform Meilisearch hit to App model (mirrors jobs-repository transformToAppModel)
function transformMeiliHitToAppModel(hit: MeiliJobHit): jobDataProps {
  return {
    uid: hit.uid || "",
    companyId: hit.company_id,
    companyName: hit.company_name,
    companyLogo: hit.company_logo,
    interviewChannel: hit.interview_channel,
    interviewChannelText: hit.interview_channel_text,
    jobFunction: hit.job_function,
    jobFunctionText: hit.job_function_text,
    jobIndustry: hit.job_industry,
    jobIndustryText: hit.job_industry_text,
    jobType: hit.job_type,
    jobTypeText: hit.job_type_text,
    careerLevel: hit.career_level,
    careerLevelText: hit.career_level_text,
    educationLevel: hit.education_level,
    educationLevelText: hit.education_level_text,
    title: hit.title,
    highlights: hit.highlights,
    isNegotiable: hit.is_negotiable ?? false,
    minSalary: hit.min_salary,
    maxSalary: hit.max_salary,
    positions: hit.positions,
    workLocation: hit.work_location,
    workLocationText: hit.work_location_text,
    isOnlineInterview: hit.is_online_interview ?? false,
    experience: hit.experience,
    experienceText: hit.experience_text,
    employment: hit.employment,
    employmentText: hit.employment_text,
    minExperienceYear: hit.min_experience_year,
    maxExperienceYear: hit.max_experience_year,
    isAcceptNewGrads: hit.is_accept_new_grads ?? false,
    travelMode: hit.travel_mode,
    travelStation: hit.travel_station,
    jobStatus: hit.job_status,
    isActive: hit.is_active ?? false,
    reactivatedCount: hit.reactivated_count,
    workDays: hit.work_days,
    workDaysText: hit.work_days_text,
    postStartDate: extractMeiliTimestamp(hit.post_start_date),
    postExpiryDate: extractMeiliTimestamp(hit.post_expiry_date),
    benefitsDetails: hit.benefits_details,
    benefitsText: hit.benefits_text,
    jobDescriptionDetails: hit.job_description_details,
    jobDescriptionText: hit.job_description_text,
    qualificationDetails: hit.qualification_details,
    qualificationText: hit.qualification_text,
    // Contact (nested object)
    contact: {
      phone: hit.phone ?? "",
      email: hit.email ?? "",
      mobile: hit.mobile,
      facebook: hit.facebook,
      linkedin: hit.linkedin,
      twitter: hit.twitter,
      instagram: hit.instagram,
      line: hit.line,
      website: hit.website,
    },
    // Address (nested object)
    address: {
      addressLine1: hit.address_line_1 ?? "",
      addressLine2: hit.address_line_2,
      district: hit.district ?? "",
      subDistrict: hit.sub_district ?? "",
      postCode: hit.post_code ?? "",
      province: hit.province ?? "",
    },
    createdBy: extractMeiliDocumentId(hit.created_by),
    updatedBy: extractMeiliDocumentId(hit.updated_by),
    createdAt: extractMeiliTimestamp(hit.created_at) || 0,
    updatedAt: extractMeiliTimestamp(hit.updated_at) || 0,
  };
}

interface JobSearchParams {
  page?: number;
  pageSize?: number;
  keyword?: string;
}

interface JobSearchResult {
  data: IJobReturnData[];
  totalPages: number;
  totalCount: number;
}

export const searchJobs = async (params: JobSearchParams): Promise<JobSearchResult> => {
  const { page = 1, pageSize = 10, keyword = "" } = params;

  const result = await jobIndex.search(keyword, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    filter: [
      `job_status IN ["ontimer", "published"]`,
      `is_active = true`,
    ],
    sort: ["post_start_date:desc"],
  });

  const jobs: IJobReturnData[] = result.hits.map((hit) => ({
    id: hit.uid as string,
    data: transformMeiliHitToAppModel(hit),
  }));

  const totalCount = result.estimatedTotalHits || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return { data: jobs, totalPages, totalCount };
};

/**
 * Advanced job search with filters (for public job routes)
 * Supports all filters from JobSearchParams type
 */
import type { JobSearchParams as PublicJobSearchParams, JobCardData, ExperienceRange } from "@/types/public-jobs";

interface JobSearchWithFiltersResult {
  jobs: JobCardData[];
  totalCount: number;
  totalPages: number;
  currentPage: number;
  processingTime: number;
}

/**
 * Map experience range to year filters
 */
function mapExperienceToFilter(experience: ExperienceRange): string {
  switch (experience) {
    case '0':
      return 'is_accept_new_grads = true OR min_experience_year = 0';
    case '1-3':
      return 'min_experience_year <= 3 AND max_experience_year >= 1';
    case '3-5':
      return 'min_experience_year <= 5 AND max_experience_year >= 3';
    case '5-10':
      return 'min_experience_year <= 10 AND max_experience_year >= 5';
    case '10+':
      return 'min_experience_year >= 10';
  }
}

/**
 * Build MeiliSearch filter array from job search params
 */
function buildMeiliFilters(params: PublicJobSearchParams): string[] {
  const filters: string[] = [
    `job_status IN ["ontimer", "published"]`,
    `is_active = true`,
  ];

  // Location filter (province)
  if (params.locations && params.locations.length > 0) {
    const locationFilter = params.locations.map(loc => `"${loc}"`).join(', ');
    filters.push(`province IN [${locationFilter}]`);
  }

  // Employment type filter
  if (params.types && params.types.length > 0) {
    const typeFilter = params.types.map(type => `"${type}"`).join(', ');
    filters.push(`employment IN [${typeFilter}]`);
  }

  // Salary filters
  if (params.salaryMin !== undefined && params.salaryMin !== null) {
    filters.push(`max_salary >= ${params.salaryMin}`);
  }
  if (params.salaryMax !== undefined && params.salaryMax !== null) {
    filters.push(`min_salary <= ${params.salaryMax}`);
  }

  // Education level filter
  if (params.education && params.education.length > 0) {
    const educationFilter = params.education.map(edu => `"${edu}"`).join(', ');
    filters.push(`education_level IN [${educationFilter}]`);
  }

  // Experience filter (complex mapping)
  if (params.experience) {
    filters.push(`(${mapExperienceToFilter(params.experience)})`);
  }

  // Work mode filter (remote/hybrid/onsite)
  if (params.remote) {
    filters.push(`work_mode = "${params.remote}"`);
  }

  return filters;
}

/**
 * Build MeiliSearch sort array from job search params
 */
function buildMeiliSort(sortOption?: string): string[] {
  switch (sortOption) {
    case 'salary_desc':
      return ['max_salary:desc', 'post_start_date:desc'];
    case 'salary_asc':
      return ['min_salary:asc', 'post_start_date:desc'];
    case 'newest':
    default:
      return ['post_start_date:desc'];
  }
}

/**
 * Transform MeiliSearch hit to JobCardData (lightweight)
 */
function transformHitToJobCard(hit: MeiliJobHit): JobCardData {
  return {
    uid: hit.uid || "",
    title: hit.title || "",
    companyId: hit.company_id || "",
    companyName: hit.company_name || "",
    companyLogo: hit.company_logo || "",
    minSalary: hit.min_salary ?? null,
    maxSalary: hit.max_salary ?? null,
    isNegotiable: hit.is_negotiable ?? false,
    workLocationText: hit.work_location_text || "",
    employmentText: hit.employment_text || "",
    experienceText: hit.experience_text || "",
    createdAt: extractMeiliTimestamp(hit.created_at) || 0,
  };
}

/**
 * Search jobs with advanced filters (for public job routes)
 * Returns lightweight JobCardData for list display
 */
export const searchJobsWithFilters = async (
  params: PublicJobSearchParams
): Promise<JobSearchWithFiltersResult> => {
  const startTime = Date.now();
  const page = params.page || 1;
  const pageSize = params.pageSize || 20;
  const keyword = params.q || "";

  const filters = buildMeiliFilters(params);
  const sort = buildMeiliSort(params.sort);

  const result = await jobIndex.search(keyword, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    filter: filters,
    sort,
  });

  const jobs: JobCardData[] = result.hits.map(transformHitToJobCard);

  const totalCount = result.estimatedTotalHits || 0;
  const totalPages = Math.ceil(totalCount / pageSize);
  const processingTime = Date.now() - startTime;

  return {
    jobs,
    totalCount,
    totalPages,
    currentPage: page,
    processingTime,
  };
};
