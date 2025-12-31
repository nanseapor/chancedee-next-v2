/**
 * Job Summary Card Component
 *
 * Displays job context information in the apply modal
 * Based on JOB-R02b RIS Section 3.1
 */

import { Building2, MapPin } from 'lucide-react';
import Image from 'next/image';
import type { ApplyModalJob } from '@/types/jobsmarket/apply-modal.types';

interface JobSummaryCardProps {
  job: ApplyModalJob;
}

/**
 * Job Summary Card
 *
 * Shows job title, company name, and location in modal header
 * Provides context for what the user is applying to
 */
export function JobSummaryCard({ job }: JobSummaryCardProps) {
  return (
    <div className="rounded-lg border bg-muted/50 p-4">
      <div className="flex gap-3">
        {/* Company Logo */}
        <div className="flex-shrink-0">
          {job.companyLogo ? (
            <div className="relative h-12 w-12 overflow-hidden rounded-md border bg-white">
              <Image
                src={job.companyLogo}
                alt={job.companyName}
                fill
                className="object-contain p-1"
              />
            </div>
          ) : (
            <div className="flex h-12 w-12 items-center justify-center rounded-md border bg-white">
              <Building2 className="h-6 w-6 text-muted-foreground" />
            </div>
          )}
        </div>

        {/* Job Info */}
        <div className="flex-1 min-w-0">
          <h3 className="font-semibold text-sm leading-tight line-clamp-2">
            {job.title}
          </h3>
          <p className="text-sm text-muted-foreground mt-1">
            {job.companyName}
          </p>
          {job.workLocationText && (
            <div className="flex items-center gap-1 mt-1 text-xs text-muted-foreground">
              <MapPin className="h-3 w-3" />
              <span>{job.workLocationText}</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
