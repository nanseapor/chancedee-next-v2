import type { JobStatus } from "@/types/jobsmarket/jobs-list.types";
import {
  getJobStatusColor,
  getJobStatusLabel,
} from "@/lib/jobsmarket/company/job-list-utils";

interface JobStatusBadgeProps {
  status: JobStatus;
}

export function JobStatusBadge({ status }: JobStatusBadgeProps) {
  const colorClasses = getJobStatusColor(status);
  const label = getJobStatusLabel(status);

  return (
    <span
      className={`inline-flex items-center rounded-[0.625rem] border px-2 py-1 text-xs font-medium tracking-widest ${colorClasses}`}
    >
      {label}
    </span>
  );
}
