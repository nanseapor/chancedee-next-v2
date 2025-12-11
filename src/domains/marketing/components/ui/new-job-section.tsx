import { selectOptionsGet } from "@/domains/admin/services/server/actions/master-data-management";
import { searchJobs } from "@/lib/meilisearch/job-search";
import clsx from "clsx";
import Link from "next/link";
import JobCard from "../components/job-card";

const NewJobSection = async () => {
  const [listJobFunctions, jobSearchResult] = await Promise.all([
    selectOptionsGet({
      collectionName: "master_job_functions",
      code: "",
    }),
    searchJobs({
      page: 1,
      pageSize: 9,
    }),
  ]);

  const jobList = jobSearchResult.data;

  return (
    <section
      className={clsx(`flex w-full flex-col items-start justify-between bg-background py-12 md:py-16`)}
    >
      <div
        className={clsx(
          `flex flex-col py-0 `,
          `w-full items-stretch justify-between bg-auto px-4 sm:container`,
        )}
      >
        <div className="flex flex-row justify-between">
          <h1 className="mb-4 text-start text-2xl font-normal">
            New Jobs
          </h1>
          <Link href="/jobs" className="cursor-pointer text-primary underline" >View all</Link>
        </div>
        <div
          className={clsx(
            `grid auto-cols-fr grid-cols-1 gap-4 lg:gap-6`,
            `no-underline md:grid-cols-3 md:gap-x-4 md:gap-y-3 md:self-stretch`)}
        >
          {
            jobList?.map((job) => {
              return (
                <JobCard job={job.data} bordered listJobFunctions={listJobFunctions} key={job.id} />
              )
            })
          }
        </div>
      </div>
    </section >
  );
};

export default NewJobSection;
