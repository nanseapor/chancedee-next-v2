'use client';

import { JobCard } from '@/components/jobsmarket/jobs/JobCard';
import type { JobCardData } from '@/types/public-jobs';
import { LoadingState } from './LoadingState';
import { ErrorState } from './ErrorState';
import { EmptyState } from './EmptyState';
import { Pagination } from './Pagination';

export interface JobListResultsProps {
  jobs: JobCardData[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  searchQuery?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  onSaveToggle?: (jobId: string) => void;
  isJobSaved?: (jobId: string) => boolean;
  showSaveButton?: boolean;
}

export function JobListResults({
  jobs,
  isLoading,
  isError,
  error,
  searchQuery,
  hasFilters,
  onClearFilters,
  currentPage,
  totalPages,
  onPageChange,
  onSaveToggle,
  isJobSaved,
  showSaveButton = false,
}: JobListResultsProps) {
  // Loading state
  if (isLoading) {
    return <LoadingState count={6} />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        error={error || 'ไม่สามารถโหลดข้อมูลงานได้ กรุณาลองใหม่อีกครั้ง'}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Empty state
  if (jobs.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onClearSearch={onClearFilters}
      />
    );
  }

  return (
    <div>
      {/* Job List */}
      <div className="space-y-4 mb-6">
        {jobs.map((job) => (
          <JobCard
            key={job.uid}
            job={job}
            variant="list"
            showSaveButton={showSaveButton}
            isSaved={isJobSaved?.(job.uid) ?? false}
            onSaveToggle={(jobId, _saved) => onSaveToggle?.(jobId)}
          />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
