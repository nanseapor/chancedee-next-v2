import { Button } from "@/components/ui/button";
import { authenticateSession } from "@/domains/authentication/services/server/core/auth-engine";
import { Home } from "@/lib/utils/server/home";
import getAssets from "@/lib/utils/shared/asset";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";

/**
 * Hero Section exactly matching jobs.chancedee.com master branch
 * 
 * Key elements from master branch:
 * - Height: md:min-h-[40svh] lg:min-h-[40svh]
 * - Colors: text-primary + text-neutral (not text-secondary-800)
 * - Structure: flex-col base, then md:flex with proper responsive behavior
 * - Spacing: Uses chancedee spacing system (h-chancedee10, etc.)
 * - Typography: Exact same responsive text sizing
 */
const HeroSectionExactMaster = async ({ homeData }: { homeData: Home }) => {
  const auth = await authenticateSession({ includeProfile: true });
  const user = auth?.profile;

  const imageSrc = homeData?.hero_image ? getAssets(homeData?.hero_image) : '/images/asset-1.svg';

  console.log("Image source", imageSrc);

  return (
    <section className="pb-12 md:p-0 lg:pb-0">
      <div
        className={clsx(
          `flex-col py-0`,
          `md:flex md:min-h-[40svh] md:w-auto md:flex-row md:items-stretch md:justify-between md:bg-auto`,
          `lg:max-h-none lg:min-h-[40svh]`
        )}
      >
        <div
          id="w-node-cc324bdd-9ea5-ce9a-0c23-86dce911b0c1-7697086f"
          className={clsx(
            `mx-auto flex w-full flex-col items-center py-4 text-center md:py-12`,
            `relative md:flex md:w-1/2 md:max-w-200 md:items-center md:justify-center md:text-8`,
            `lg:w-1/2 lg:px-10`
          )}
        >
          <h1
            className={clsx(
              `text-5xl`,
              `md:ml-4 md:w-auto md:max-w-80 md:text-5xl md:font-medium`,
              `lg:max-w-140 lg:text-7xl`
            )}
          >
            <span className="text-primary">CHANCEDEE</span>
            <span className="text-neutral"> Jobs Market</span>
          </h1>
          <div className="h-2.5"></div>
          <p
            className={clsx(
              `text-muted-foreground my-2.5 text-5.5/normal`,
              `md:mt-2.5 md:max-w-180 md:text-base`,
              `lg:max-w-160 lg:text-4xl`
            )}
          >
            {homeData?.hero_title}
          </p>
          <div className="h-10">{homeData?.hero_sub_title}</div>
          <div
            className={clsx(
              `flex flex-col gap-6`,
              `md:flex md:flex-0-auto md:flex-row md:flex-wrap md:items-center md:justify-center md:self-center`,
              `lg:flex lg:flex-row`
            )}
          >
            <Link
              href={user?.info.roles.includes('candidate') ? `/candidates/${user.uid}/` : "/auth/social"}
              className={clsx(`text-base no-underline`)}
            >
              <Button
                size={"lg"}
                variant="default"
                className={clsx(
                  `h-chandedee50 max-sm:w-40 max-sm:max-w-41.5 max-sm:px-0 rounded-full`,
                  `px-5`,
                  `lg:w-40 lg:max-w-41.5`
                )}
              >
                <p
                  className={clsx(
                    `md:mb-0 md:cursor-pointer md:text-base md:text-primary-foreground md:hover:border-none`
                  )}
                >
                  สร้างเรซูเม่
                </p>
              </Button>
            </Link>
            <Link
              href={user?.info.roles.includes('company') && !user?.info.roles.includes('pending') ? `/companies/${user.info.companyId}/dashboard/jobs` : "/auth/email/sign-in"}
              className={clsx(`text-base no-underline`)}
            >
              <p
                className={clsx(
                  `text-foreground hover:text-primary`,
                  `md:mb-0 md:text-center md:text-base md:font-normal`
                )}
              >
                ประกาศงาน
              </p>
            </Link>
          </div>
          <div className="h-2.5"></div>
        </div>
        <Image
          src={imageSrc}
          alt="Hero image"
          width={500}
          height={500}
          sizes="(max-width: 768px) 100vw, 50vw"
          className={clsx(
            `w-full overflow-hidden px-6`,
            `object-cover md:static md:box-border md:w-1/2 md:overflow-hidden md:px-0 md:align-baseline`
          )}
        />
      </div>
    </section>
  );
};

export default HeroSectionExactMaster;