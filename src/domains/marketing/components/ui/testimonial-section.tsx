"use client";
import {
  Carousel,
  CarouselApi,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
} from "@/components/ui/carousel";
import { jobDataProps } from "@/types/job.types";
import clsx from "clsx";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState, startTransition } from "react";

type featuredSectionType = {
  id: string;
  featured_job_url: string;
  featured_job_image: string;
};

const fetcher = (url: string) => fetch(url).then((res) => res.json());

const TestimonialSection = ({ featuredJobs }: { featuredJobs: jobDataProps[] }) => {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!api) {
      return;
    }

    startTransition(() => {
      setCount(api.scrollSnapList().length);
      setCurrent(api.selectedScrollSnap());
    });

    api.on("select", () => {
      startTransition(() => {
        setCurrent(api.selectedScrollSnap());
      });
    });
  }, [api]);

  console.log("featuredJobs", featuredJobs.length);

  return (
    <section
      className={clsx(
        `relative flex flex-col items-center justify-center overflow-hidden bg-primary-500 pb-44 pt-20 px-[3%]`
      )}
    >
      <h2
        className={clsx(
          `static mb-2 mt-5 text-center text-10.5 text-white`,
          `lg:text-5xl/none`
        )}
      >
        งานแนะนำ
      </h2>
      <Carousel
        opts={{ loop: true, duration: 28 }}
        setApi={setApi}
        data-delay="4000"
        data-animation="slide"
        data-autoplay="false"
        data-easing="ease"
        data-hide-arrows="false"
        data-disable-swipe="false"
        data-autoplay-limit="0"
        data-nav-spacing="3"
        className={clsx(`mt-20 size-full max-w-140 rounded-lg`)}
      >
        <CarouselContent>
          {
            featuredJobs?.map((job, index) => {
              return <CarouselItem
                key={index}
                className={`${current === index ? "" : "opacity-50"}`}
              >
                <div
                  className={clsx(
                    `relative mr-12 inline-block size-full rounded-lg border border-neutral-50 bg-white p-0 text-left align-top tracking-normal`,
                    `hover:shadow-lg`
                  )}
                >
                  <Link
                    key={job.uid}
                    href={`/jobs/${job.uid}`}
                    className={clsx(
                      `job-recommend w-inline-block`,
                      `inline-block max-w-full no-underline`
                    )}
                  >
                    <div
                      className={clsx(
                        `flex min-h-88 flex-col justify-between px-16 pb-12 pt-24`,
                        `md:h-[30vh] md:pt-20`
                      )}
                    >
                      <div
                        className={clsx(
                          `max-sm:flex-col max-sm:items-center max-sm:justify-center`,
                          `mt-0 flex items-start justify-start gap-6`
                        )}
                      >
                        <div className=" overflow-hidden rounded-xl ">
                          <Image
                            src={job.companyLogo}
                            alt=""
                            width={144}
                            height={144}
                            className={clsx(
                              `profile-image`,
                              `mr-0 inline-block max-w-full object-cover align-middle`
                            )}
                          />
                        </div>
                        <div className={clsx(`flex flex-col items-start gap-4`)}>
                          <div
                            className={clsx(
                              `text-midnight-blue mb-2 inline-block text-xl/7 font-medium`
                            )}
                          >
                            {job.title}
                          </div>
                          <div
                            className={clsx(
                              `rounded-2xl bg-primary-100 p-2 text-xs/4 text-primary`
                            )}
                          >
                            {job.jobFunction}
                          </div>
                          <div
                            className={clsx(
                              `text-dim-grey mb-0 text-base/6 font-normal tracking-normal no-underline`
                            )}
                          >
                            เงินเดือน (Salary):{" "}
                            {job.minSalary?.toLocaleString("th-TH")} บาท -{" "}
                            {job.maxSalary && job.maxSalary > 0
                              ? job.maxSalary >= 999999
                                ? "ขึ้นไป"
                                : `${job.maxSalary.toLocaleString("th-TH")} บาท`
                              : "สามารถต่อรองได้"}
                          </div>
                          <div
                            className={clsx(
                              `text-dim-grey mb-0 text-base/6 font-normal tracking-normal no-underline`
                            )}
                          >
                            {job.workDays} วัน / สัปดาห์
                          </div>
                        </div>
                      </div>
                    </div>
                  </Link>

                </div>
              </CarouselItem>
            })
          }
        </CarouselContent>
        <CarouselPrevious className="size-14" />
        <CarouselNext className="size-14" />
      </Carousel>
    </section>
  );
};

export default TestimonialSection;
