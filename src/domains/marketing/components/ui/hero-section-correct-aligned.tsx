import { Button } from "@/components/ui/button";
import { authenticateSession } from "@/domains/authentication/services/server/core/auth-engine";
import { Home } from "@/lib/utils/server/home";
import getAssets from "@/lib/utils/shared/asset";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Section correctly aligned with jobs.chancedee.com screenshot
 * 
 * Based on actual screenshot analysis:
 * 1. Compact height (~40vh, not full viewport)
 * 2. Larger, more prominent subtitle text
 * 3. Two-color headline (CHANCEDEE in orange + Jobs Market in dark)
 * 4. Balanced proportions that don't dominate the page
 * 5. Clean, professional layout matching the reference
 */
const HeroSectionCorrectAligned = async ({ homeData }: { homeData: Home }) => {
  const auth = await authenticateSession({ includeProfile: true });
  const user = auth?.profile;

  const imageSrc = homeData?.hero_image ? getAssets(homeData?.hero_image) : '/images/asset-1.svg';

  return (
    <section className="pb-8 md:pb-0">
      {/* Compact height like jobs.chancedee.com - around 40vh */}
      <div className="flex flex-col md:flex-row md:min-h-[40vh] md:items-center">
        
        {/* Text Content - Left Side */}
        <div className="flex w-full flex-col items-center justify-center px-4 py-8 text-center md:w-1/2 md:px-8 md:py-12 md:text-left">
          
          {/* Two-color headline matching screenshot */}
          <h1 className="mb-4 text-4xl font-medium md:text-5xl lg:text-6xl">
            <span className="text-primary">CHANCEDEE</span>
            <span className="text-foreground"> Jobs Market</span>
          </h1>
          
          {/* Larger, more prominent subtitle text as seen in screenshot */}
          <p className="mb-6 text-xl font-medium text-muted-foreground md:text-2xl lg:text-3xl">
            "ตลาดงานของมนุษย์เงินเดือนที่ใหญ่ที่สุด"
          </p>
          
          {/* Optional: Keep CMS content but smaller */}
          {homeData?.hero_sub_title && (
            <div className="mb-6 text-base text-muted-foreground max-w-md">
              {homeData.hero_sub_title}
            </div>
          )}
          
          {/* Buttons matching screenshot styling */}
          <div className="flex flex-col gap-4 md:flex-row md:items-center">
            <Link
              href={user?.info.roles.includes('candidate') ? `/candidates/${user.uid}/` : "/auth/login"}
            >
              <Button 
                size="lg" 
                variant="default"
                className="w-full md:w-auto px-8 py-3 text-base font-medium rounded-full"
              >
                สร้างเรซูเม่
              </Button>
            </Link>
            
            <Link
              href={user?.info.roles.includes('company') && !user?.info.roles.includes('pending') ? `/companies/${user.info.companyId}/dashboard/jobs` : "/auth/login"}
              className="flex items-center justify-center text-base font-medium text-foreground hover:text-primary transition-colors"
            >
              ประกาศงาน
            </Link>
          </div>
        </div>
        
        {/* Image Section - Right Side */}
        <div className="w-full md:w-1/2">
          <Image
            src={imageSrc}
            alt="Hero image showcasing job market platform"
            width={600}
            height={400}
            sizes="(max-width: 768px) 100vw, 50vw"
            className="h-[300px] w-full object-cover md:h-[40vh]"
            priority
          />
        </div>
      </div>
    </section>
  );
};

export default HeroSectionCorrectAligned;