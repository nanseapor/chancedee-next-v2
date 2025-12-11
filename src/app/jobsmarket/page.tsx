
import Footer from "@/components/layout/Footer";
import HeroSection from "@/domains/marketing/components/ui/hero-section";
import JobCategorySections from "@/domains/marketing/components/ui/job-category-sections";
import NewJobSection from "@/domains/marketing/components/ui/new-job-section";
import RecommendationSection from "@/domains/marketing/components/ui/recommendation-section";
import { getHome } from "@/lib/utils/server/home";


const HomePage = async () => {
  const homeData = await getHome();

  return (
    <>
      <main
        className={`flex min-h-[calc(100dvh-80px)] flex-row bg-background`}
      >
        <div className="m-auto w-full bg-background">
          <HeroSection homeData={homeData[0]} />
          {/* <CTASection /> */}
          {/* <ServiceSection /> */}
          <JobCategorySections homeData={homeData[0]} />
          <NewJobSection />
          <RecommendationSection homeData={homeData[0]} />
          {/* <TestimonialSection featuredJobs={featuredJobsData || []} /> */}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
