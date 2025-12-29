import { Suspense } from 'react';
import { notFound } from 'next/navigation';
import { webJobGetById } from '@/lib/database/actions/jobs';
import { JobDetailPage } from './_components/JobDetailPage';
import { JobDetailSkeleton } from './_components/JobDetailSkeleton';

interface PageProps {
  params: Promise<{
    id: string;      // Company ID
    jobId: string;   // Job ID
  }>;
}

export default async function JobDetailRoute({ params }: PageProps) {
  const { id: companyId, jobId } = await params;

  // Fetch initial data on server
  const job = await webJobGetById(jobId);

  if (!job) {
    notFound();
  }

  // Verify job belongs to company
  if (job.companyId !== companyId) {
    notFound();
  }

  return (
    <Suspense fallback={<JobDetailSkeleton />}>
      <JobDetailPage
        initialJob={job}
        companyId={companyId}
        jobId={jobId}
      />
    </Suspense>
  );
}
