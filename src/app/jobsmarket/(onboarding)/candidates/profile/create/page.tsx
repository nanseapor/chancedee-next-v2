import { redirect } from "next/navigation";
import { ProfileCreationClient } from "./_components/ProfileCreationClient";
import { webCandidateGetPersonalInfo } from "@/lib/database/actions/candidate-information";
import { cookies } from "next/headers";

/**
 * Profile Creation Page (CAND-R02)
 *
 * Route: /jobsmarket/candidates/profile/create
 *
 * Multi-step wizard for creating candidate profile
 * Server component that handles authentication and data loading
 */
export default async function ProfileCreatePage() {
  // Get user session
  // TODO: Replace with actual auth check from candidate auth hook
  const cookieStore = await cookies();
  const uid = cookieStore.get("candidateUid")?.value;

  if (!uid) {
    // No session, redirect to login
    redirect("/auth/login");
  }

  // Load existing personal info (if any) for draft resume
  let initialData;
  try {
    const personalInfo = await webCandidateGetPersonalInfo(uid);
    if (personalInfo) {
      initialData = {
        step1: personalInfo,
      };
    }
  } catch (error) {
    console.error("Error loading personal info:", error);
    // Continue without initial data
  }

  return <ProfileCreationClient uid={uid} initialData={initialData} />;
}
