'use client';

import type { KeyedMutator } from 'swr';
import { useSaveJobMutation } from '@/hooks/jobsmarket/useSaveJobMutation';
import SavedJobCard from './SavedJobCard';
import { SavedJobsSkeleton } from './SavedJobsSkeleton';
import { EmptyState } from './EmptyState';
import type { SavedJobWithDetails } from '@/lib/database/actions/candidate-saved';

/**
 * CAND-R05: Jobs Tab Component
 *
 * Displays list of saved jobs with loading and empty states
 */

interface JobsTabProps {
  savedJobs: SavedJobWithDetails[] | undefined;
  isLoading: boolean;
  error: Error | undefined;
  mutate: KeyedMutator<SavedJobWithDetails[]>;
}

export default function JobsTab({ savedJobs, isLoading, error, mutate }: JobsTabProps) {
  const { toggleSave } = useSaveJobMutation();

  // Loading state
  if (isLoading) {
    return <SavedJobsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="rounded-lg border border-red-200 bg-red-50 p-6 text-center">
        <p className="text-red-700">เกิดข้อผิดพลาด: {error.message}</p>
      </div>
    );
  }

  // Empty state
  if (!savedJobs || savedJobs.length === 0) {
    return <EmptyState />;
  }

  // Handle unsave action with optimistic update
  const handleUnsave = async (jobId: string) => {
    // 1. Optimistically remove from UI immediately
    await mutate(
      (currentData) => currentData?.filter(job => job.job.uid !== jobId),
      { revalidate: false }
    );

    // 2. Call server mutation in background
    try {
      await toggleSave(jobId);
    } catch (error) {
      // 3. If mutation fails, revalidate to restore correct state
      console.error('Failed to unsave job:', error);
      await mutate();
    }
  };

  // Jobs list
  return (
    <div data-testid="jobs-tab-content" className="space-y-4">
      {savedJobs.map((savedJob) => (
        <SavedJobCard
          key={savedJob.job.uid}
          job={savedJob.job}
          savedAt={savedJob.savedAt}
          onUnsave={handleUnsave}
        />
      ))}
    </div>
  );
}
