"use client";

import { useRouter } from "next/navigation";
import { Checkbox } from "@/components/ui/checkbox";
import { Eye, FileText } from "lucide-react";
import { JobStatusBadge } from "./JobStatusBadge";
import { JobActionMenu } from "./JobActionMenu";
import type { JobListItem, JobAction } from "@/types/jobsmarket/jobs-list.types";
import { formatPostedDateRange } from "@/lib/jobsmarket/company/job-list-utils";

interface JobRowProps {
  job: JobListItem;
  isSelected: boolean;
  onSelect: (jobId: string, selected: boolean) => void;
  onAction: (jobId: string, action: JobAction) => void;
}

export function JobRow({ job, isSelected, onSelect, onAction }: JobRowProps) {
  const router = useRouter();

  const handleRowClick = (e: React.MouseEvent) => {
    // Don't navigate if clicking checkbox or action menu
    if (
      (e.target as HTMLElement).closest('button') ||
      (e.target as HTMLElement).closest('[role="checkbox"]')
    ) {
      return;
    }
    router.push(`/jobs/${job.uid}`);
  };

  const handleMenuAction = (action: JobAction) => {
    onAction(job.uid, action);
  };

  return (
    <tr
      data-testid="job-row"
      className="border-b border-gray-200 hover:bg-gray-50 cursor-pointer"
      onClick={handleRowClick}
    >
      <td className="p-4">
        <Checkbox
          checked={isSelected}
          onCheckedChange={(checked) => onSelect(job.uid, checked as boolean)}
        />
      </td>

      <td className="p-4">
        <h3 className="font-medium text-gray-900">{job.title}</h3>
      </td>

      <td className="p-4 text-sm text-gray-600">
        {job.jobFunctionText || "-"}
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <FileText className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900">{job.applicationCount}</span>
          {job.unreadApplicationCount > 0 && (
            <span className="badge rounded-full bg-red-500 px-2 py-0.5 text-xs text-white">
              {job.unreadApplicationCount}
            </span>
          )}
        </div>
      </td>

      <td className="p-4">
        <div className="flex items-center gap-2 text-sm">
          <Eye className="h-4 w-4 text-gray-400" />
          <span className="text-gray-900">{job.viewCount}</span>
        </div>
      </td>

      <td data-testid="posted-date" className="p-4 text-sm text-gray-600">
        {formatPostedDateRange(job.postStartDate, job.postExpiryDate)}
      </td>

      <td className="p-4">
        <JobStatusBadge status={job.jobStatus} />
      </td>

      <td className="p-4">
        <JobActionMenu job={job} onAction={handleMenuAction} defaultOpen={false} />
      </td>
    </tr>
  );
}
