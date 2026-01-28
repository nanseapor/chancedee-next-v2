import HeroSection from "@/domains/marketing/components/ui/hero-section";
import JobCategorySections from "@/domains/marketing/components/ui/job-category-sections";
import NewJobSection from "@/domains/marketing/components/ui/new-job-section";
import RecommendationSection from "@/domains/marketing/components/ui/recommendation-section";
import { getHome } from "@/lib/utils/server/home";

/**
 * Homepage
 *
 * Full-width layout with hero section and content sections.
 * Header/Footer provided by (public)/layout.tsx
 */
const HomePage = async () => {
  const homeData = await getHome();
  const firstHome = homeData[0];

  if (!firstHome) {
    return (
      <div className="flex-1 flex items-center justify-center">
        <div className="p-8 text-center">
          <p>ไม่พบข้อมูล</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <HeroSection homeData={firstHome} />
      <JobCategorySections homeData={firstHome} />
      <NewJobSection />
      <RecommendationSection homeData={firstHome} />
    </>
  );
};

export default HomePage;
