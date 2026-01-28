import { Metadata } from "next";

import ApplicationsClient from "./_components/ApplicationsClient";

export const metadata: Metadata = {
  title: "ใบสมัครของฉัน | ChanceDee",
  description: "ติดตามสถานะใบสมัครงานของคุณ",
};

interface ApplicationsPageProps {
  params: Promise<{ id: string }>;
}

/**
 * CAND-R04: Candidate Applications Page
 * Route: /candidates/[id]/applications
 *
 * Features:
 * - View all job applications with status
 * - Filter by status tabs
 * - View application timeline
 * - Withdraw applications
 *
 * Per CAND-R04 RIS
 */
export default async function ApplicationsPage({
  params,
}: ApplicationsPageProps) {
  const { id } = await params;

  return <ApplicationsClient candidateId={id} />;
}
