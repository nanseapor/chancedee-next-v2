"use client";
import { Card, CardContent } from "@/components/ui/card";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { useMediaQuery } from "@/hooks/use-media-query";
import { Home } from "@/lib/utils/server/home";
import getAssets from "@/lib/utils/shared/asset";
import clsx from "clsx";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";

const JobCategorySections = ({ homeData }: { homeData: Home }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);
  const [seeAll, setSeeAll] = useState(false);
  const isTablet = useMediaQuery('(min-width: 769px) and (max-width: 1024px)')
  const isDesktop = useMediaQuery('(min-width: 1025px)')


  useEffect(() => {
    if (!api) {
      return;
    }

    setCount(api.scrollSnapList().length);
    setCurrent(api.selectedScrollSnap());
    console.log("current", api.selectedScrollSnap());

    api.on("select", () => {
      setCurrent(api.selectedScrollSnap());
    });
  }, [api]);

  // Don't render if no job categories data
  if (!homeData.job_categories || homeData.job_categories.length < 1) {
    console.log("JobCategorySections: No job categories data available");
    return null;
  }

  return (
    <section
      className={clsx(
        `flex w-full flex-col items-start justify-between bg-muted py-12 md:py-16`
      )}
    >
      <div
        className={clsx(
          `flex flex-col py-0 `,
          `w-full items-stretch justify-between bg-auto px-4 sm:container`,
        )}
      >
        <div className="flex flex-row justify-between">
          <h1 className="mb-4 text-start text-3xl font-normal">
            ค้นหางานยอดนิยม
          </h1>
          <div className="cursor-pointer text-primary underline" onClick={() => setSeeAll(!seeAll)}>{seeAll ? `Collapse` : `View all`}</div>
        </div>
        <div className={seeAll ? "hidden" : "relative md:mx-12"}>
          <Carousel
            opts={{ align: "start", loop: false, duration: 28, slidesToScroll: isDesktop ? 4 : isTablet ? 2 : 1 }}
            setApi={setApi}
          >
            <CarouselContent className="-ml-2">
              {
                homeData.job_categories?.map((data, index) => {
                  const job = data.Job_Categories_id;
                  return <CarouselItem key={index} className="basis-full pl-1 md:basis-1/2 lg:basis-1/4">
                    <Link href={job.url}>
                      <div className="size-full p-1">
                        <Card className="size-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                          <CardContent className="flex h-full min-h-[196px] w-full flex-col items-start justify-start gap-4 p-6">
                            <Image unoptimized src={getAssets(job.thumbnail)} alt={job.name} width={60} height={60} />
                            <div className="flex flex-col gap-1">
                              <span className="text-xl font-semibold">{job.name}</span>
                              <p className="text-xs text-muted-foreground">
                                {job.description}
                              </p>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    </Link>
                  </CarouselItem>
                })
              }
            </CarouselContent>
            <CarouselPrevious className="hidden lg:flex h-12 w-12 -left-16 bg-white shadow-md border hover:border-secondary-500 hover:shadow-lg [&>svg]:h-6 [&>svg]:w-6" />
            <CarouselNext className="hidden lg:flex h-12 w-12 -right-16 bg-white shadow-md border hover:border-secondary-500 hover:shadow-lg [&>svg]:h-6 [&>svg]:w-6" />
          </Carousel>
          {/* Mobile Navigation and Indicators */}
          <div className="flex items-center justify-center space-x-4 py-4 lg:hidden">
            <button
              onClick={() => api?.scrollPrev()}
              disabled={current === 0}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-secondary-500 hover:shadow-lg transition-all"
              aria-label="Previous slide"
            >
              <ChevronLeft size={16} className="text-gray-600" />
            </button>
            
            <div className="flex justify-center space-x-2" aria-label={`Slide ${current + 1} of ${count}`}>
              {Array.from({ length: count }).map((_, index) => (
                <button
                  key={index}
                  className={`size-3 rounded-full transition-colors ${
                    index === current 
                      ? 'bg-primary shadow-sm' 
                      : 'bg-gray-300 hover:bg-gray-400'
                  }`}
                  aria-label={`Go to slide ${index + 1}`}
                  onClick={() => api?.scrollTo(index)}
                />
              ))}
            </div>
            
            <button
              onClick={() => api?.scrollNext()}
              disabled={current === count - 1}
              className="flex h-8 w-8 items-center justify-center rounded-full bg-white shadow-md border border-gray-200 disabled:opacity-50 disabled:cursor-not-allowed hover:border-secondary-500 hover:shadow-lg transition-all"
              aria-label="Next slide"
            >
              <ChevronRight size={16} className="text-gray-600" />
            </button>
          </div>

          {/* Desktop Indicators Only */}
          <div className="hidden lg:flex justify-center space-x-2 py-2" aria-label={`Slide ${current + 1} of ${count}`}>
            {Array.from({ length: count }).map((_, index) => (
              <button
                key={index}
                className={`size-3 rounded-full transition-colors ${
                  index === current 
                    ? 'bg-primary shadow-sm' 
                    : 'bg-gray-300 hover:bg-gray-400'
                }`}
                aria-label={`Go to slide ${index + 1}`}
                onClick={() => api?.scrollTo(index)}
              />
            ))}
          </div>
        </div>
        <div className={seeAll ? "mx-auto grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4" : "hidden"}>
          {
            homeData.job_categories?.map((data) => {
              const job = data.Job_Categories_id;
              return (
                <Link key={job.name} href={job.url}>
                  <div className="size-full p-1">
                    <Card className="size-full transition-all duration-200 hover:shadow-lg hover:scale-[1.02]">
                      <CardContent className="flex h-full min-h-[196px] w-full flex-col items-start justify-start gap-4 p-6">
                        <Image unoptimized src={getAssets(job.thumbnail)} alt={job.name} width={60} height={60} />
                        <div className="flex flex-col gap-1">
                          <span className="text-xl font-semibold">{job.name}</span>
                          <p className="text-xs text-muted-foreground">
                            {job.description}
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </Link>
              )
            })
          }
        </div>
      </div>
    </section>
  );
};

export default JobCategorySections;
