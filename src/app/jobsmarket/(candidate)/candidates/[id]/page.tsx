import { Metadata } from "next";

import { DashboardClient } from "./_components/DashboardClient";

/**
 * Candidate Dashboard Page
 * Per CAND-R01 RIS
 *
 * Server Component wrapper that:
 * - Extracts candidateId from route params
 * - Passes candidateId to DashboardClient
 * - CandidateShell wrapper is now in layout.tsx (CAND-R00)
 */

export const metadata: Metadata = {
  title: "แดชบอร์ด | Dashboard",
};

interface CandidateDashboardPageProps {
  params: Promise<{ id: string }>;
}

export default async function CandidateDashboardPage({
  params,
}: CandidateDashboardPageProps) {
  const { id: candidateId } = await params;

  return <DashboardClient candidateId={candidateId} />;
}
