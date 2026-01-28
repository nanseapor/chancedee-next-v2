/**
 * COMP-R08: Company Applications Management - Server Page Component
 *
 * This is the main page for viewing and managing job applications.
 * Implements three-panel responsive layout per COMP-R08 RIS §2.
 *
 * Layout: Filter Panel (250px) + Application List (350px) + Detail Panel (flex-grow)
 *
 * Per COMP-R08 RIS and BLS-04 (Screening Stage)
 */

import { Metadata } from 'next';
import ApplicationsClient from './_components/ApplicationsClient';

interface PageProps {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
}

export const metadata: Metadata = {
  title: 'จัดการใบสมัครงาน | Chancedee Jobs',
  description: 'ดูและจัดการใบสมัครงานจากผู้สมัคร',
};

export default async function ApplicationsPage({ params, searchParams }: PageProps) {
  const { id: companyId } = await params;
  const resolvedSearchParams = await searchParams;

  // Extract URL filters (Phase 5: URL sync)
  // For Phase 2, we just pass the companyId
  const initialFilters = {
    jobId: (resolvedSearchParams.job as string) || null,
    status: (resolvedSearchParams.status as string) || null,
  };

  return (
    <ApplicationsClient
      companyId={companyId}
      initialFilters={initialFilters}
    />
  );
}
