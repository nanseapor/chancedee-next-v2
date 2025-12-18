"use client";

import useSWR from "swr";

import { useCandidateAuth, useCandidateOnboardingCheck } from "@/hooks/jobsmarket/use-candidate-auth";
import { webCandidateInformationGetById } from "@/lib/database/actions/candidate-information";
import { webJobApplicationGetByFilter } from "@/lib/database/actions/job-applications";
import { webJobInterviewGetUpcoming } from "@/lib/database/actions/job-interviews";
import { webPocketsGetById } from "@/lib/database/actions/pockets";
import { jobApplicationData } from "@/types/job-application.types";
import { CandidateProfileData } from "@/hooks/jobsmarket/use-profile-completion";

import { AppointmentsSection } from "./AppointmentsSection";
import { ApplicationSummary } from "./ApplicationSummary";
import { CoinBalanceCard } from "./CoinBalanceCard";
import { ProfileCompletionCard } from "./ProfileCompletionCard";
import { RecentApplicationsList } from "./RecentApplicationsList";
import { RecommendedJobsCarousel } from "./RecommendedJobsCarousel";
import { WelcomeHeader } from "./WelcomeHeader";

/**
 * Dashboard Client Component
 * Per CAND-R01 RIS §3
 *
 * Implements state machine:
 * - loading: Initial state, checking auth
 * - ready: All checks passed, display dashboard
 * - (other states handled by useCandidateAuth with redirects)
 *
 * Features:
 * - Profile completion tracking
 * - Application summary (4 status cards)
 * - Coin balance display
 * - Upcoming interviews
 * - Recent applications (last 5)
 * - Recommended jobs (mocked with simple logic)
 */

export interface DashboardClientProps {
  candidateId: string;
}

export function DashboardClient({ candidateId }: DashboardClientProps) {
  // Auth/ownership guard with state machine
  // Enforce onboarding: users without complete profile will be redirected to /profile
  const authResult = useCandidateAuth(candidateId, true);
  const { setOnboardingComplete } = authResult;

  // Fetch candidate profile (needed for onboarding check)
  const { data: profile, error: profileError } = useSWR(
    authResult.state === "ready" || authResult.state === "onboard_check"
      ? ["candidate-profile", candidateId]
      : null,
    () => webCandidateInformationGetById(candidateId)
  );

  // Fetch coin balance (wallet is keyed by candidate uid)
  const { data: coinBalance, error: coinError } = useSWR(
    authResult.state === "ready" && profile
      ? ["coin-balance", profile.uid]
      : null,
    () => webPocketsGetById(profile!.uid, "coin")
  );

  // Fetch all applications for summary
  // Note: webJobApplicationGetByFilter returns all applications (no candidateId filter)
  // We'll need to filter client-side or update the server action
  const { data: allApplications, error: applicationsError } = useSWR(
    authResult.state === "ready" ? ["applications", candidateId] : null,
    () => webJobApplicationGetByFilter()
  );

  // Filter applications for this candidate
  const applications = (allApplications?.filter(
    (app) => app.candidateId === candidateId
  ) || []) as jobApplicationData[];

  // Fetch upcoming interviews
  const { data: upcomingInterviews } = useSWR(
    authResult.state === "ready" ? ["upcoming-interviews", candidateId] : null,
    () => webJobInterviewGetUpcoming(candidateId)
  );

  // Implement onboarding check hook per CAND-R01 RIS
  useCandidateOnboardingCheck(
    profile?.isOnboarded,
    candidateId,
    authResult.state,
    setOnboardingComplete
  );

  // Loading state (auth checking, ownership checking, onboarding check, or data loading)
  if (
    authResult.state === "loading" ||
    authResult.state === "auth_check" ||
    authResult.state === "owner_check" ||
    authResult.state === "onboard_check"
  ) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-500">กำลังโหลด...</p>
        </div>
      </div>
    );
  }

  // Error state (failed to load profile or critical data)
  if (profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen px-4">
        <div className="text-center max-w-md">
          <svg
            className="mx-auto h-12 w-12 text-gray-400"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
            />
          </svg>
          <h3 className="mt-2 text-sm font-medium text-gray-900">
            ไม่สามารถโหลดข้อมูลได้
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            เกิดข้อผิดพลาดในการโหลดข้อมูลโปรไฟล์ กรุณาลองใหม่อีกครั้ง
          </p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-primary hover:bg-primary/90"
          >
            โหลดใหม่
          </button>
        </div>
      </div>
    );
  }

  // Profile loading state (auth ready but profile not loaded yet)
  if (authResult.state === "ready" && !profile && !profileError) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          <p className="mt-2 text-sm text-gray-500">กำลังโหลดข้อมูล...</p>
        </div>
      </div>
    );
  }

  // Ready state - display dashboard
  if (authResult.state === "ready" && profile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
          {/* Welcome Header */}
          <WelcomeHeader
            firstName={profile.firstnameTH || ""}
            lastName={profile.lastnameTH || ""}
          />

          {/* Top Row: Profile Completion + Coin Balance */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <ProfileCompletionCard profile={profile as unknown as CandidateProfileData} />
            <CoinBalanceCard
              balance={coinBalance?.balance ?? 0}
              isLoading={!coinBalance && !coinError}
              error={coinError}
            />
          </div>

          {/* Appointments Section */}
          {upcomingInterviews && upcomingInterviews.length > 0 && (
            <AppointmentsSection interviews={upcomingInterviews} />
          )}

          {/* Application Summary (4 Status Cards) */}
          <ApplicationSummary
            applications={applications ?? []}
            isLoading={!applications && !applicationsError}
          />

          {/* Recent Applications List */}
          <RecentApplicationsList
            applications={applications ?? []}
            isLoading={!applications && !applicationsError}
          />

          {/* Recommended Jobs Carousel */}
          <RecommendedJobsCarousel candidateId={candidateId} />
        </div>
      </div>
    );
  }

  // Fallback (should not reach here due to useCandidateAuth redirects)
  return null;
}
