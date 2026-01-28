'use client';

import Link from 'next/link';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { JobCardData, JobAvailabilityState } from '@/types/public-jobs';
import { SalaryDisplay } from './SalaryDisplay';
import { LocationBadge } from './LocationBadge';
import { JobStatusBadge } from './JobStatusBadge';
import { SaveJobButton } from './SaveJobButton';
import { Briefcase, GraduationCap, Clock } from 'lucide-react';

interface JobCardProps {
  job: JobCardData;
  variant?: 'list' | 'compact' | 'saved';
  isSaved?: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  showSaveButton?: boolean;
  availability?: JobAvailabilityState;
}

// Utility function for relative time
function formatRelativeTime(timestamp: number): string {
  const now = Date.now();
  const diff = now - timestamp;
  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const weeks = Math.floor(days / 7);
  const months = Math.floor(days / 30);

  if (months > 0) return `${months} เดือนที่แล้ว`;
  if (weeks > 0) return `${weeks} สัปดาห์ที่แล้ว`;
  if (days > 0) return `${days} วันที่แล้ว`;
  if (hours > 0) return `${hours} ชั่วโมงที่แล้ว`;
  if (minutes > 0) return `${minutes} นาทีที่แล้ว`;
  return 'เมื่อสักครู่';
}

export function JobCard({
  job,
  variant = 'list',
  isSaved = false,
  onSaveToggle,
  showSaveButton = true,
  availability = 'available',
}: JobCardProps) {
  if (variant === 'compact') {
    return <JobCardCompact job={job} isSaved={isSaved} onSaveToggle={onSaveToggle} showSaveButton={showSaveButton} />;
  }

  if (variant === 'saved') {
    return (
      <JobCardSaved
        job={job}
        isSaved={isSaved}
        onSaveToggle={onSaveToggle}
        showSaveButton={showSaveButton}
        availability={availability}
      />
    );
  }

  // List variant (default)
  return <JobCardList job={job} isSaved={isSaved} onSaveToggle={onSaveToggle} showSaveButton={showSaveButton} />;
}

// List Variant
function JobCardList({
  job,
  isSaved,
  onSaveToggle,
  showSaveButton,
}: {
  job: JobCardData;
  isSaved: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  showSaveButton: boolean;
}) {
  return (
    <div data-testid="job-card" className="border rounded-lg p-4 hover:shadow-md transition-shadow bg-card">
      <div className="flex gap-4">
        {/* Company Logo */}
        <Link href={`/companies/${job.companyId}`} className="shrink-0">
          <div className="w-12 h-12 relative rounded-md overflow-hidden border bg-muted">
            {job.companyLogo ? (
              <Image src={job.companyLogo} alt={job.companyName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {job.companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.uid}`} className="hover:underline">
                <h3 className="font-semibold text-base line-clamp-1">{job.title}</h3>
              </Link>
              <Link
                href={`/companies/${job.companyId}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                {job.companyName}
              </Link>
            </div>

            {/* Save Button */}
            {showSaveButton && onSaveToggle && (
              <SaveJobButton jobId={job.uid} isSaved={isSaved} onToggle={onSaveToggle} variant="icon" size="default" />
            )}
          </div>

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <LocationBadge province={job.workLocationText} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase size={14} />
              {job.employmentText}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap size={14} />
              {job.experienceText}
            </span>
          </div>

          {/* Salary & Posted Time */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
            <SalaryDisplay
              minSalary={job.minSalary}
              maxSalary={job.maxSalary}
              isNegotiable={job.isNegotiable}
              className="font-medium text-secondary-700"
            />
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <Clock size={12} />
              โพสต์เมื่อ {formatRelativeTime(job.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

// Compact Variant
function JobCardCompact({
  job,
  isSaved,
  onSaveToggle,
  showSaveButton,
}: {
  job: JobCardData;
  isSaved: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  showSaveButton: boolean;
}) {
  return (
    <Link href={`/jobs/${job.uid}`} data-testid="job-card" className="block border rounded-lg p-3 hover:shadow-md transition-shadow bg-card">
      <div className="text-center space-y-2">
        {/* Company Logo */}
        <div className="w-10 h-10 relative rounded-md overflow-hidden border bg-muted mx-auto">
          {job.companyLogo ? (
            <Image src={job.companyLogo} alt={job.companyName} fill className="object-cover" />
          ) : (
            <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
              {job.companyName.substring(0, 2).toUpperCase()}
            </div>
          )}
        </div>

        {/* Job Title */}
        <h4 className="font-medium text-sm line-clamp-2">{job.title}</h4>

        {/* Company Name */}
        <p className="text-xs text-muted-foreground line-clamp-1">{job.companyName}</p>

        {/* Salary */}
        <SalaryDisplay
          minSalary={job.minSalary}
          maxSalary={job.maxSalary}
          isNegotiable={job.isNegotiable}
          className="text-sm font-medium text-secondary-700"
        />

        {/* Save Button */}
        {showSaveButton && onSaveToggle && (
          <SaveJobButton jobId={job.uid} isSaved={isSaved} onToggle={onSaveToggle} variant="icon" size="sm" />
        )}
      </div>
    </Link>
  );
}

// Saved Variant (with availability overlay)
function JobCardSaved({
  job,
  isSaved,
  onSaveToggle,
  showSaveButton,
  availability,
}: {
  job: JobCardData;
  isSaved: boolean;
  onSaveToggle?: (jobId: string, saved: boolean) => void;
  showSaveButton: boolean;
  availability: JobAvailabilityState;
}) {
  const isUnavailable = availability !== 'available';

  return (
    <div data-testid="job-card" className={cn('border rounded-lg p-4 hover:shadow-md transition-shadow bg-card', isUnavailable && 'opacity-60')}>
      <div className="flex gap-4">
        {/* Company Logo */}
        <Link href={`/companies/${job.companyId}`} className="shrink-0">
          <div className="w-12 h-12 relative rounded-md overflow-hidden border bg-muted">
            {job.companyLogo ? (
              <Image src={job.companyLogo} alt={job.companyName} fill className="object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-xs text-muted-foreground">
                {job.companyName.substring(0, 2).toUpperCase()}
              </div>
            )}
          </div>
        </Link>

        {/* Content */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="flex-1 min-w-0">
              <Link href={`/jobs/${job.uid}`} className="hover:underline">
                <h3 className="font-semibold text-base line-clamp-1">{job.title}</h3>
              </Link>
              <Link
                href={`/companies/${job.companyId}`}
                className="text-sm text-muted-foreground hover:underline"
              >
                {job.companyName}
              </Link>
            </div>

            {/* Save Button */}
            {showSaveButton && onSaveToggle && (
              <SaveJobButton jobId={job.uid} isSaved={isSaved} onToggle={onSaveToggle} variant="icon" size="default" />
            )}
          </div>

          {/* Status Badge */}
          {isUnavailable && (
            <div className="mt-2">
              <JobStatusBadge status={availability} />
            </div>
          )}

          {/* Badges */}
          <div className="flex flex-wrap items-center gap-2 mt-2">
            <LocationBadge province={job.workLocationText} />
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <Briefcase size={14} />
              {job.employmentText}
            </span>
            <span className="inline-flex items-center gap-1 text-sm text-muted-foreground">
              <GraduationCap size={14} />
              {job.experienceText}
            </span>
          </div>

          {/* Salary & Posted Time */}
          <div className="flex flex-wrap items-center gap-4 mt-2 text-sm">
            <SalaryDisplay
              minSalary={job.minSalary}
              maxSalary={job.maxSalary}
              isNegotiable={job.isNegotiable}
              className="font-medium text-secondary-700"
            />
            <span className="inline-flex items-center gap-1 text-muted-foreground text-xs">
              <Clock size={12} />
              โพสต์เมื่อ {formatRelativeTime(job.createdAt)}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
