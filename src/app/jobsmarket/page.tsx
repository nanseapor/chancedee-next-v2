
import Footer from "@/components/layout/Footer";
import HeroSection from "@/domains/marketing/components/ui/hero-section";
import JobCategorySections from "@/domains/marketing/components/ui/job-category-sections";
import NewJobSection from "@/domains/marketing/components/ui/new-job-section";
import RecommendationSection from "@/domains/marketing/components/ui/recommendation-section";
import { getHome } from "@/lib/utils/server/home";


const HomePage = async () => {
  const homeData = await getHome();
  const firstHome = homeData[0];

  if (!firstHome) {
    return (
      <>
        <main className={`flex min-h-[calc(100dvh-80px)] flex-row bg-background`}>
          <div className="m-auto w-full bg-background p-8 text-center">
            <p>ไม่พบข้อมูล</p>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <main
        className={`flex min-h-[calc(100dvh-80px)] flex-row bg-background`}
      >
        <div className="m-auto w-full bg-background">
          <HeroSection homeData={firstHome} />
          {/* <CTASection /> */}
          {/* <ServiceSection /> */}
          <JobCategorySections homeData={firstHome} />
          <NewJobSection />
          <RecommendationSection homeData={firstHome} />
          {/* <TestimonialSection featuredJobs={featuredJobsData || []} /> */}
        </div>
      </main>
      <Footer />
    </>
  );
};

export default HomePage;
