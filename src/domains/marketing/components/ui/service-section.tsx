import { Button } from "@/components/ui/button";
import clsx from "clsx";
import Image from "next/image";

const ServiceSection = () => {
  return (
    <section
      className={clsx(`md:pb-24 md:pt-12 lg:bg-primary-100 px-[3%]`)}
    >
      <div
        className={clsx(
          `flex flex-col items-center justify-center md:mx-auto md:w-full md:max-w-295`
        )}
      >
        <h2
          className={clsx(
            `static mb-3 mt-5 text-center text-10.5`,
            `lg:text-5xl/4`
          )}
        >
          ค้นหางานยอดนิยม
        </h2>
        <div
          className={clsx(
            `mb-16 mt-14 grid auto-cols-fr auto-rows-auto grid-cols-1 gap-4`,
            `md:w-full md:max-w-155 md:grid-cols-1 md:items-center md:justify-center`,
            `lg:max-w-full lg:grid-cols-2 lg:gap-x-8`
          )}
        >
          <a
            href="/jobs?page=1&amp;pageSize=10&amp;MinSalary=30000&amp;MaxSalary=100000"
            className={clsx(
              `inline-block h-full max-w-full rounded-lg bg-gray-50 px-6 py-12`,
              `border border-transparent hover:border-primary-300`,
              `no-underline md:flex md:w-full md:items-start md:justify-start`,
              `lg:p-6`
            )}
          >
            <Image
              src={"/images/yellow-icon-01.svg"}
              width="100"
              className={clsx(`grid-icon`, `md:mb-3 md:mr-5`)}
              alt="yellow icon"
            />
            <div className={clsx(`flex flex-col items-start gap-4`)}>
              <div
                className={clsx(`mb-2 inline-block text-xl/5 text-slate-800`)}
              >
                งานรายได้สูง 30,000+
              </div>
              <p
                className={clsx(
                  `mb-0 text-base/6 font-normal tracking-normal text-gray-600 no-underline`
                )}
              >
                Project Engineer, Design Manager, Project Lead, IT Director
              </p>
            </div>
          </a>
          <a
            href="/jobs?page=1&amp;pageSize=10&amp;JobFunctions=sales&amp;MinSalary=0&amp;MaxSalary=100000"
            className={clsx(
              `inline-block h-full max-w-full rounded-lg bg-gray-50 px-6 py-12`,
              `border border-transparent hover:border-primary-300`,
              `no-underline md:flex md:w-full md:items-start md:justify-start`,
              `lg:p-6`
            )}
          >
            <Image
              src={"/images/yellow-icon-02.svg"}
              width="100"
              className={clsx(`grid-icon md:mb-3`, `md:mr-5`)}
              alt="yellow icon"
            />
            <div className={clsx(`flex flex-col items-start gap-4`)}>
              <div
                className={clsx(`mb-2 inline-block text-xl/5 text-slate-800`)}
              >
                งานขาย / บริการลูกค้า
              </div>
              <p
                className={clsx(
                  `mb-0 text-base/6 font-normal tracking-normal text-gray-600 no-underline`
                )}
              >
                During her travels, Chloe rescues a teapot, an heirloom
                belonging to Catherine.
              </p>
            </div>
          </a>
          <a
            href="/jobs?page=1&amp;pageSize=10&amp;JobFunctions=it&amp;MinSalary=0&amp;MaxSalary=100000"
            className={clsx(
              `inline-block h-full max-w-full rounded-lg bg-gray-50 px-6 py-12`,
              `border border-transparent hover:border-primary-300`,
              `no-underline md:flex md:w-full md:items-start md:justify-start`,
              `lg:p-6`
            )}
          >
            <Image
              src={"/images/videocall.svg"}
              width="100"
              className={clsx(`grid-icon md:mb-3`, `md:mr-5`)}
              alt="video call icon"
            />
            <div className={clsx(`flex flex-col items-start gap-4`)}>
              <div
                className={clsx(`mb-2 inline-block text-xl/5 text-slate-800`)}
              >
                งานเทคโนโลยีสารสนเทศ
              </div>
              <p
                className={clsx(
                  `mb-0 text-base/6 font-normal tracking-normal text-gray-600 no-underline`
                )}
              >
                Front-end Developer, Full-stack Developer, IT Project Manager
              </p>
            </div>
          </a>
          <a
            href="/jobs?page=1&amp;pageSize=10&amp;JobFunctions=hr&amp;MinSalary=0&amp;MaxSalary=100000"
            className={clsx(
              `inline-block h-full max-w-full rounded-lg bg-gray-50 px-6 py-12`,
              `border border-transparent hover:border-primary-300`,
              `no-underline md:flex md:w-full md:items-start md:justify-start`,
              `lg:p-6`
            )}
          >
            <Image
              src={"/images/chatting.svg"}
              width="100"
              className={clsx(`grid-icon md:mb-3`, `md:mr-5`)}
              alt="chatting icon"
            />
            <div className={clsx(`flex flex-col items-start gap-4`)}>
              <div
                className={clsx(`mb-2 inline-block text-xl/5 text-slate-800`)}
              >
                งานทรัพยาการบุคคล
              </div>
              <p
                className={clsx(
                  `mb-0 text-base/6 font-normal tracking-normal text-gray-600 no-underline`
                )}
              >
                HR Planning, HR Development, Training, Performance Management
              </p>
            </div>
          </a>
        </div>
        <Button className={clsx(`h-16 px-8 py-4.5`)}>
          <a href="/jobs" className={clsx(`text-base/6 no-underline`)}>
            แสดงงานทั้งหมด
          </a>
        </Button>
      </div>
    </section>
  );
};

export default ServiceSection;
