/**
 * CAND-R00: Candidate Shell Layout
 *
 * Wraps all /candidates/[id]/* routes with CandidateShell
 * Per Next.js App Router patterns - layout wraps all child pages
 *
 * Authorization: Requires user to be the owner of the candidate profile
 * - Unauthenticated users are redirected to login
 * - Users accessing other profiles are redirected to 403
 */

import { CandidateShell } from "@/components/jobsmarket/shells/CandidateShell";
import { requireCandidateOwner } from "@/lib/auth/route-guards";

interface CandidateLayoutProps {
  children: React.ReactNode;
  params: Promise<{ id: string }>;
}

export default async function CandidateLayout({
  children,
  params,
}: CandidateLayoutProps) {
  const { id: candidateId } = await params;

  // Server-side auth check - redirects if not owner
  await requireCandidateOwner(candidateId);

  return <CandidateShell candidateId={candidateId}>{children}</CandidateShell>;
}
