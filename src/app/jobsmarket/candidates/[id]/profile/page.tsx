/**
 * CAND-R02: Candidate Profile Page
 * Batch 3C: Profile View Mode (Read-only)
 *
 * Server Component that:
 * - Fetches candidate data
 * - Passes data to ProfileViewClient
 * - Edit functionality will be added in Batch 3D
 */

import { notFound } from "next/navigation";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
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

  return <ProfileViewClient candidate={candidate} />;
}
