import { IJobReturnData, jobDataProps } from "@/types/job.types";
import { MeiliSearch } from "meilisearch";

const client = new MeiliSearch({
  host: process.env.NEXT_PUBLIC_MEILI_SEARCH_HOST!,
  apiKey: process.env.NEXT_PUBLIC_MEILI_SEARCH_API_KEY!,
});

const jobIndex = client.index(process.env.NEXT_PUBLIC_MEILI_SEARCH_JOB!);

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
  const now = Date.now();

  const result = await jobIndex.search(keyword, {
    limit: pageSize,
    offset: (page - 1) * pageSize,
    filter: [
      `job_status IN ["ontimer", "published"]`,
      `is_active = true`,
      `post_start_date <= ${now}`,
    ],
    sort: ["post_start_date:desc"],
  });

  const jobs: IJobReturnData[] = result.hits.map((hit) => ({
    id: hit.uid as string,
    data: hit as unknown as jobDataProps,
  }));

  const totalCount = result.estimatedTotalHits || 0;
  const totalPages = Math.ceil(totalCount / pageSize);

  return { data: jobs, totalPages, totalCount };
};
