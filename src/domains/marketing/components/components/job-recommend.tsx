import Link from "next/link";

import { getJobDataPropsByIds } from "@/lib/database/repositories/web-job-data-props";
import { Home } from "@/lib/utils/server/home";
import { selectOptionsGet } from "@/domains/admin/services/server/actions/master-data-management";

import JobCard from "./job-card";


type featuredSectionType = {
  id: string;
  featured_job_url: string;
  featured_job_image: string;
};

const getFeaturedJobs = async () => {
  const featuredJobs = await fetch("https://content.chancedee.com/items/Featured_Jobs");
  const cmsData = await featuredJobs.json();
  const ids = cmsData.data?.map((item: featuredSectionType) =>
    item.featured_job_url.split("/").pop()
  );
  return getJobDataPropsByIds(ids);
};

const JobRecommend = async ({ homeData }: { homeData: Home }) => {
  const [featuredJobsData, listJobFunctions] = await Promise.all([
    getFeaturedJobs(),
    selectOptionsGet({ collectionName: "master_job_functions" }),
  ]);

  return (
    <>
      <div className="flex flex-row justify-between">
        <h1 className="mb-4 text-start text-2xl font-normal">
          งานแนะนำ
        </h1>
        <Link href="/jobs" className="cursor-pointer text-primary underline" >View all</Link>
      </div>
      {
        featuredJobsData?.map((data) => {
          return (
            <JobCard job={data} listJobFunctions={listJobFunctions} key={data.uid} />
          )
        })
      }
    </>
  )
}

export default JobRecommend