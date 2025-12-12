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
