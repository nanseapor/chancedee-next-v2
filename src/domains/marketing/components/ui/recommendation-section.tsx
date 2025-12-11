import { Home } from "@/lib/utils/server/home";
import clsx from "clsx";
import CompanyRecommend from "../components/company-recommend";
import JobRecommend from "../components/job-recommend";


const RecommendationSection = async ({ homeData }: { homeData: Home }) => {
  return (
    <section
      className={clsx(`flex w-full flex-col items-start justify-between bg-primary/5 py-12 md:py-16 md:flex-row`)}
    >
      <div
        className={clsx(
          `flex flex-col py-0 md:flex-row `,
          `w-full items-stretch justify-between gap-4 bg-auto px-4 sm:container lg:gap-12 2xl:gap-24`,
        )}
      >
        <div className="flex flex-col gap-6 md:w-1/2">
          <CompanyRecommend homeData={homeData} />
        </div>
        <div className="flex flex-col gap-6 md:w-1/2">
          <JobRecommend homeData={homeData} />
        </div>
      </div>
    </section >
  );
};

export default RecommendationSection;
