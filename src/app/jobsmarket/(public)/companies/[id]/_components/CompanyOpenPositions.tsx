"use client";

import Link from "next/link";
import { Briefcase, ArrowRight } from "lucide-react";
import { JobCard } from "@/components/jobsmarket/jobs/JobCard";
import type { JobCardData } from "@/types/public-jobs";
import { Skeleton } from "@/components/ui/skeleton";

interface CompanyOpenPositionsProps {
  jobs: JobCardData[];
  companyId: string;
  isLoading?: boolean;
}

const MAX_VISIBLE_JOBS = 6;

/**
 * Open positions section showing company's active job listings
 *
 * @specification BLS-02 §3.6 viewCompanyProfile
 * @specification BLS-02 §3.7 viewCompanyJobs
 */
export function CompanyOpenPositions({
  jobs,
  companyId,
  isLoading = false,
}: CompanyOpenPositionsProps) {
  const hasJobs = jobs.length > 0;
  const showViewAll = jobs.length > MAX_VISIBLE_JOBS;
  const visibleJobs = jobs.slice(0, MAX_VISIBLE_JOBS);

  if (isLoading) {
    return (
      <section data-testid="jobs-skeleton" className="bg-white rounded-lg border p-4 sm:p-6">
        <div className="flex items-center gap-2 mb-4">
          <Skeleton className="h-5 w-5 rounded" />
          <Skeleton className="h-6 w-40" />
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-32 rounded-lg" />
          ))}
        </div>
      </section>
    );
  }

  return (
    <section
      data-testid="company-open-positions"
      className="bg-white rounded-lg border p-4 sm:p-6"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-gray-900">
          <Briefcase size={20} className="text-secondary-600" />
          ตำแหน่งที่เปิดรับ
          <span className="text-sm font-normal text-gray-500">
            ({jobs.length} ตำแหน่ง)
          </span>
        </h2>

        {showViewAll && (
          <Link
            href={`/jobs?company=${companyId}`}
            className="inline-flex items-center gap-1 text-sm font-medium text-secondary-600 hover:text-secondary-700"
          >
            ดูทั้งหมด
            <ArrowRight size={16} />
          </Link>
        )}
      </div>

      {/* Job List */}
      {hasJobs ? (
        <div role="list" className="grid gap-4 sm:grid-cols-2">
          {visibleJobs.map((job) => (
            <div key={job.uid} role="listitem">
              <JobCard
                job={job}
                variant="list"
                showSaveButton={false}
              />
            </div>
          ))}
        </div>
      ) : (
        <EmptyJobsState />
      )}
    </section>
  );
}

function EmptyJobsState() {
  return (
    <div className="text-center py-8">
      <div
        data-testid="empty-jobs-illustration"
        className="mx-auto w-16 h-16 rounded-full bg-gray-100 flex items-center justify-center mb-4"
      >
        <Briefcase size={32} className="text-gray-400" />
      </div>
      <p className="text-gray-500">ยังไม่มีตำแหน่งเปิดรับ</p>
      <p className="text-sm text-gray-400 mt-1">
        กรุณาติดตามข่าวสารจากบริษัทนี้
      </p>
    </div>
  );
}
