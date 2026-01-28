/**
 * CAND-R02: Candidate Profile Page
 *
 * Server Component that:
 * - Verifies user owns this profile (access control)
 * - Checks onboarding status
 * - Redirects to onboarding wizard if not onboarded (per CAND-R02 RIS)
 * - Fetches candidate data and renders profile view
 *
 * Access Control (per CAND-R00):
 * 1. User must be authenticated
 * 2. User must own this candidate profile (uid === params.id)
 *
 * Onboarding Mode Detection (per CAND-R02 RIS Section 6.1):
 * - If !isOnboarded → redirect to onboarding wizard
 * - If isOnboarded → show profile view
 */

import { notFound, redirect } from "next/navigation";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { requireCandidateOwner } from "@/lib/auth/route-guards";
import { ProfileViewClient } from "./_components/ProfileViewClient";

interface CandidateProfilePageProps {
  params: Promise<{
    id: string;
  }>;
}

export default async function CandidateProfilePage({
  params,
}: CandidateProfilePageProps) {
  // Await params (Next.js 16 requirement)
  const { id } = await params;

  // Validate params
  if (!id) {
    notFound();
  }

  // Access control: verify user owns this profile
  // Redirects to login if not authenticated, 403 if wrong user
  await requireCandidateOwner(id);

  // Fetch candidate data
  let candidate;
  try {
    candidate = await webCandidateInformationGetById(id);
  } catch (error) {
    console.error("Failed to fetch candidate:", error);
    notFound();
  }

  // If no candidate found, show 404
  if (!candidate) {
    notFound();
  }

  // Onboarding mode detection: redirect non-onboarded users to wizard
  if (!candidate.isOnboarded) {
    redirect("/candidates/profile/create");
  }

  return <ProfileViewClient candidate={candidate} />;
}
