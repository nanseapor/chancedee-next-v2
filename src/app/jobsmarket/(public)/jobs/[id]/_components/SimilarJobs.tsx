'use client';

import { useEffect, useState } from 'react';
import { JobCard } from '@/components/jobsmarket/jobs/JobCard';
import { getSimilarJobs } from '@/domains/jobs/services/server/actions/jobsmarket/public-jobs';
import { Skeleton } from '@/components/ui/skeleton';
import { JobCardData } from '@/types/public-jobs';

interface SimilarJobsProps {
  jobId: string;
  jobFunction?: string;
  jobIndustry?: string;
  limit?: number;
}

/**
 * Similar Jobs Component
 *
 * Displays a grid of similar jobs based on job function and industry.
 * Uses compact JobCard variant without save buttons.
 * Hides section if no similar jobs are found.
 */
export function SimilarJobs({
  jobId,
  jobFunction,
  jobIndustry,
  limit = 6
}: SimilarJobsProps) {
  const [jobs, setJobs] = useState<JobCardData[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function fetchSimilarJobs() {
      try {
        setIsLoading(true);
        const result = await getSimilarJobs(jobId, limit);

        if (result.success && result.data) {
          setJobs(result.data);
        } else {
          setError(result.error || 'Failed to fetch similar jobs');
        }
      } catch (err) {
        setError('Failed to fetch similar jobs');
        console.error('Similar jobs error:', err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchSimilarJobs();
  }, [jobId, limit]);

  // Don't render section if no similar jobs AND no error
  if (!isLoading && jobs.length === 0 && !error) {
    return null;
  }

  return (
    <section className="mt-8">
      <h2 className="text-lg font-semibold mb-4">งานที่คล้ายกัน</h2>

      {isLoading ? (
        <SimilarJobsSkeleton count={3} />
      ) : error ? (
        <p className="text-sm text-muted-foreground">
          ไม่สามารถโหลดงานที่คล้ายกันได้
        </p>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {jobs.map((job) => (
            <JobCard
              key={job.uid}
              job={job}
              variant="compact"
              showSaveButton={false}
            />
          ))}
        </div>
      )}
    </section>
  );
}

/**
 * Loading skeleton for similar jobs section
 */
function SimilarJobsSkeleton({ count }: { count: number }) {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {Array.from({ length: count }).map((_, i) => (
        <div key={i} className="p-4 border rounded-lg space-y-3">
          <Skeleton className="h-10 w-10 rounded" />
          <Skeleton className="h-4 w-3/4" />
          <Skeleton className="h-3 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
        </div>
      ))}
    </div>
  );
}
