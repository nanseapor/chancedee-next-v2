/**
 * CAND-R00: Candidate Shell Layout
 *
 * Wraps all /candidates/[id]/* routes with CandidateShell
 * Per Next.js App Router patterns - layout wraps all child pages
 */

import { CandidateShell } from "@/components/jobsmarket/shells/CandidateShell";

interface CandidateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CandidateLayout({
  children,
  params,
}: CandidateLayoutProps) {
  const { id: candidateId } = await params;

  return <CandidateShell candidateId={candidateId}>{children}</CandidateShell>;
}
