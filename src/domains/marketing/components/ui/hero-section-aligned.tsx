import { Button } from "@/components/ui/button";
import { authenticateSession } from "@/domains/authentication/services/server/core/auth-engine";
import { Home } from "@/lib/utils/server/home";
import getAssets from "@/lib/utils/shared/asset";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Section aligned with jobs.chancedee.com design
 * 
 * Key alignment changes:
 * 1. Single-color headline treatment (no two-color split)
 * 2. Standard height instead of full viewport
 * 3. Hardcoded Thai subtitle for consistency
 * 4. Simplified button styling
 * 5. Clean, minimalist approach matching reference site
 */
const HeroSectionAligned = async ({ homeData }: { homeData: Home }) => {
  const auth = await authenticateSession({ includeProfile: true });
  const user = auth?.profile;

  const imageSrc = homeData?.hero_image ? getAssets(homeData?.hero_image) : '/images/asset-1.svg';

  return (
    <section className="bg-white">
      {/* Standard height container instead of full viewport */}
      <div className="flex min-h-[600px] flex-col md:flex-row max-w-7xl mx-auto">
        
        {/* Text Content - Aligned with jobs.chancedee.com */}
        <div className="flex w-full flex-col items-center justify-center px-4 py-12 text-center md:w-1/2 md:px-8 md:text-left md:py-16">
        
          {/* Single-color headline treatment (aligned with reference) */}
          <h1 className="mb-6 text-4xl font-light text-gray-900 md:text-5xl lg:text-6xl">
            CHANCEDEE Jobs Market
          </h1>
          
          {/* Hardcoded Thai subtitle for consistency with jobs.chancedee.com */}
          <p className="mb-6 text-xl text-gray-600 font-medium">
            "ตลาดงานของมนุษย์เงินเดือนที่ใหญ่ที่สุด"
          </p>
          
          {/* Optional: Keep CMS content as additional description */}
          {homeData?.hero_sub_title && (
            <div className="mb-8 text-base text-gray-500 max-w-md">
              {homeData.hero_sub_title}
            </div>
          )}
          
          {/* Button styling aligned with reference site */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Link
              href={user?.info.roles.includes('candidate') ? `/candidates/${user.uid}/` : "/auth/login"}
            >
              <Button 
                size="lg" 
                variant="default"
                className="w-full md:w-auto text-white px-8 py-3 text-base font-medium rounded-full"
              >
                สร้างเรซูเม่
              </Button>
            </Link>
            
            <Link
              href={user?.info.roles.includes('company') && !user?.info.roles.includes('pending') ? `/companies/${user.info.companyId}/dashboard/jobs` : "/auth/login"}
              className="flex items-center justify-center h-12 px-6 text-base font-medium text-gray-900 hover:text-blue-600 transition-colors"
            >
              ประกาศงาน
            </Link>
          </div>
        </div>
        
        {/* Image Section - Keep responsive behavior */}
        <div className="w-full md:w-1/2 flex items-center justify-center">
          <div className="relative w-full h-[400px] md:h-[500px] lg:h-[600px]">
            <Image
              src={imageSrc}
              alt="Hero image showcasing job market platform"
              fill
              sizes="(max-width: 768px) 100vw, 50vw"
              className="object-cover rounded-lg"
              priority
            />
          </div>
        </div>
      </div>
    </section>
  );
};

export default HeroSectionAligned;