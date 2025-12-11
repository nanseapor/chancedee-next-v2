import { CalendarDays } from 'lucide-react'
import Image from 'next/image'
import Link from 'next/link'

import AvatarPlaceholder from '@/components/media/avatar-placeholder'
import { jobDataProps } from '@/types/job.types'


type jobCardProps = {
  job: jobDataProps,
  listJobFunctions: { value: string, label: string }[],
  bordered?: boolean
}

const JobCard = ({ job, listJobFunctions, bordered }: jobCardProps) => {


  const jobFunction = job.jobFunction;
  const jobFunctionLabel = listJobFunctions.find(
    (item) => item.value === jobFunction
  );
  return (
    <Link href={`/jobs/${job.uid}`}>
      <div
        className={`flex size-full flex-col items-start rounded-xl md:flex-row ${bordered && "border border-secondary-500"} bg-card p-5 text-left text-sm shadow-sm transition-all hover:shadow-lg`}
      >
        <div className="mb-3 size-[76px] shrink-0 overflow-hidden rounded-md md:mb-0">
          {job?.companyLogo ? (
            <Image
              src={job?.companyLogo}
              alt="Job image"
              className="mx-auto size-[76px] w-full object-cover"
              width={76}
              height={76}
            />
          ) : (
            <AvatarPlaceholder size={76} />
          )}
        </div>
        <div className="flex w-full flex-col items-start gap-2 px-0 md:px-4">
          <p className="break-all text-base font-semibold">
            {job.title}
          </p>
          {jobFunctionLabel?.label && (
            <div className="my-1 line-clamp-1 w-max rounded-full bg-primary/10 px-2 py-1 text-xs text-primary">
              {jobFunctionLabel.label}
            </div>
          )}
          <div className="flex w-full flex-row gap-2 overflow-hidden pl-2 ">
            <p className="text-wrap text-sm">
              เงินเดือน (Salary):{" "}
              {job.minSalary?.toLocaleString("th-TH")} บาท -{" "}
              {job.maxSalary && job.maxSalary > 0
                ? job.maxSalary >= 999999
                  ? "ขึ้นไป"
                  : `${job.maxSalary.toLocaleString("th-TH")} บาท`
                : "สามารถต่อรองได้"}
            </p>
          </div>
          <div className="flex w-full flex-row gap-2 overflow-hidden pl-2 ">
            <CalendarDays size={16} />
            <p className="truncate text-sm">
              {job.workDays} วัน/สัปดาห์
            </p>
          </div>
        </div>
      </div>
    </Link>
  )
}

export default JobCard