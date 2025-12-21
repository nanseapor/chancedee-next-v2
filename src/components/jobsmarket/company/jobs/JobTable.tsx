import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { JobRow } from "./JobRow";
import { JobListEmpty } from "./JobListEmpty";
import { JobListSkeleton } from "./JobListSkeleton";
import type { JobListItem, JobAction } from "@/types/jobsmarket/jobs-list.types";

interface JobTableProps {
  jobs: JobListItem[];
  selectedJobs: Set<string>;
  onSelectJob: (jobId: string, selected: boolean) => void;
  onSelectAll: (selected: boolean) => void;
  onJobAction: (jobId: string, action: JobAction) => void;
  onSort?: (field: string) => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  isLoading?: boolean;
  companyId?: string;
}

export function JobTable({
  jobs,
  selectedJobs,
  onSelectJob,
  onSelectAll,
  onJobAction,
  currentPage,
  totalPages,
  onPageChange,
  isLoading = false,
  companyId = "default-company",
}: JobTableProps) {
  const allSelected = jobs.length > 0 && jobs.every((job) => selectedJobs.has(job.uid));

  if (isLoading) {
    return (
      <div data-testid="job-list-skeleton">
        <JobListSkeleton />
      </div>
    );
  }

  if (jobs.length === 0) {
    return <JobListEmpty reason="no-jobs" companyId={companyId} />;
  }

  return (
    <div className="space-y-4">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="w-12 p-4 text-left">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(checked) => onSelectAll(checked as boolean)}
                aria-label="Select all"
              />
            </th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">ตำแหน่ง</th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">แผนก</th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">ใบสมัคร</th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">ผู้เข้าชม</th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">วันที่ลง</th>
            <th className="p-4 text-left text-sm font-medium text-gray-700">สถานะ</th>
            <th className="w-12"></th>
          </tr>
        </thead>
        <tbody>
          {jobs.map((job) => (
            <JobRow
              key={job.uid}
              job={job}
              isSelected={selectedJobs.has(job.uid)}
              onSelect={onSelectJob}
              onAction={onJobAction}
            />
          ))}
        </tbody>
      </table>

      {totalPages > 1 && (
        <nav aria-label="Pagination" className="flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <span className="text-sm text-gray-600">
            หน้า {currentPage} จาก {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </nav>
      )}
    </div>
  );
}
