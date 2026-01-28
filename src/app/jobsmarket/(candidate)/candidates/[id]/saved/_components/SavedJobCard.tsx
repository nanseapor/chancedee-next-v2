'use client';

import { JobCard } from '@/components/jobsmarket/jobs/JobCard';
import type { FirebaseJobData } from '@/types/job.types';
import type { JobCardData, JobAvailabilityState } from '@/types/public-jobs';

/**
 * CAND-R05: Saved Job Card Component
 *
 * Wrapper around JobCard with 'saved' variant
 * Shows job details with unsave button and availability state
 */

interface SavedJobCardProps {
  job: Partial<FirebaseJobData>;
  savedAt: number;
  onUnsave: (jobId: string) => void;
}

/**
 * Convert FirebaseJobData to JobCardData
 * Transforms database model to card display format
 */
function toJobCardData(job: Partial<FirebaseJobData>): JobCardData {
  return {
    uid: job.uid || '',
    title: job.title || '',
    companyId: job.companyId || '',
    companyName: job.companyName || '',
    companyLogo: job.companyLogo || '',
    minSalary: job.minSalary ?? null,
    maxSalary: job.maxSalary ?? null,
    isNegotiable: job.isNegotiable || false,
    workLocationText: job.workLocationText || '',
    employmentText: job.employmentText || '',
    experienceText: job.experienceText || '',
    createdAt: job.createdAt || Date.now(),
  };
}

/**
 * Determine job availability state
 */
function getAvailabilityState(job: Partial<FirebaseJobData>): JobAvailabilityState {
  if (!job.isActive || job.jobStatus === 'closed') {
    return 'closed';
  }
  if (job.jobStatus === 'draft' || job.jobStatus === 'unpublished') {
    return 'unpublished';
  }
  return 'available';
}

export default function SavedJobCard({ job, onUnsave }: SavedJobCardProps) {
  const jobCardData = toJobCardData(job);
  const availability = getAvailabilityState(job);

  const handleSaveToggle = (jobId: string, isSaved: boolean) => {
    // When toggling from saved to unsaved
    if (!isSaved) {
      onUnsave(jobId);
    }
  };

  return (
    <div data-testid="saved-job-card">
      <JobCard
        job={jobCardData}
        variant="saved"
        isSaved={true}
        onSaveToggle={handleSaveToggle}
        showSaveButton={true}
        availability={availability}
      />
    </div>
  );
}
