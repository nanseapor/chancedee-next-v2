"use client";

import * as React from "react";
import useSWR from "swr";
import { useRouter } from "next/navigation";
import { useFirebaseAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast-notification";
import {
  webCandidateInformationGetById,
  webCandidateUpdateSettings,
  webCandidateSetIsSearchable,
} from "@/lib/database/actions/candidate-information";

import { AccountLinkCard } from "./AccountLinkCard";
import { ProfileVisibilitySection } from "./ProfileVisibilitySection";
import { ApplicationPreferencesSection } from "./ApplicationPreferencesSection";
import { NotificationPreferencesSection } from "./NotificationPreferencesSection";

interface SettingsClientProps {
  candidateId: string;
}

/**
 * CAND-R03: Settings Page Container
 *
 * Client component that manages settings state and handles updates.
 * Uses per-toggle loading states following AUTH-R06 pattern.
 * Fetches candidate data client-side with SWR.
 */
export function SettingsClient({ candidateId }: SettingsClientProps) {
  const { addToast } = useToast();
  const router = useRouter();
  const { user: firebaseUser, loading: authLoading } = useFirebaseAuth();

  // Fetch candidate data using SWR
  const { data: candidate, isLoading: candidateLoading } = useSWR(
    candidateId ? ["candidate", candidateId] : null,
    ([, id]) => webCandidateInformationGetById(id),
    {
      revalidateOnFocus: false,
    }
  );

  // Redirect to login if not authenticated
  React.useEffect(() => {
    if (authLoading || candidateLoading) return;

    if (!firebaseUser) {
      router.push("/jobsmarket/auth/login");
    }
  }, [authLoading, candidateLoading, firebaseUser, router]);

  // Ownership validation - redirect to own settings if trying to access others
  React.useEffect(() => {
    if (authLoading || candidateLoading) return;

    if (firebaseUser && firebaseUser.uid !== candidateId) {
      router.push(`/jobsmarket/candidates/${firebaseUser.uid}/settings`);
    }
  }, [authLoading, candidateLoading, firebaseUser, candidateId, router]);

  // Per-toggle loading states
  const [savingStates, setSavingStates] = React.useState<Record<string, boolean>>({});

  // Local state for debounced cover letter
  const [coverLetterDraft, setCoverLetterDraft] = React.useState(
    candidate?.defaultCoverLetter || ""
  );

  // Update cover letter draft when candidate data loads
  React.useEffect(() => {
    if (candidate?.defaultCoverLetter !== undefined) {
      setCoverLetterDraft(candidate.defaultCoverLetter || "");
    }
  }, [candidate?.defaultCoverLetter]);

  /**
   * Generic toggle handler
   * Follows AUTH-R06 NotificationsTab pattern
   */
  const handleToggle = async (
    field: "isSearchable" | "autoAttachCoverLetter" | "emailJobRecommendations",
    value: boolean
  ) => {
    if (!candidate) return;

    setSavingStates((prev) => ({ ...prev, [field]: true }));

    try {
      if (field === "isSearchable") {
        // Use existing specialized function for is_searchable (includes MeiliSearch sync)
        await webCandidateSetIsSearchable(candidate.uid, value, candidate.uid);
      } else {
        // Use new generic settings update function
        await webCandidateUpdateSettings(
          candidate.uid,
          { [field]: value },
          candidate.uid
        );
      }

      addToast("บันทึกแล้ว", "success");
      // No router.refresh() needed - SWR will update automatically on next revalidation
    } catch (error) {
      console.error(`Error toggling ${field}:`, error);
      addToast("บันทึกไม่สำเร็จ กรุณาลองใหม่", "error");
    } finally {
      setSavingStates((prev) => ({ ...prev, [field]: false }));
    }
  };

  /**
   * Debounced cover letter save
   * Waits 500ms after user stops typing before saving
   */
  const debouncedSaveCoverLetter = React.useCallback(
    async (text: string) => {
      if (!candidate) return;

      setSavingStates((prev) => ({ ...prev, coverLetter: true }));

      try {
        await webCandidateUpdateSettings(
          candidate.uid,
          { defaultCoverLetter: text },
          candidate.uid
        );
        addToast("บันทึกจดหมายสมัครงานแล้ว", "success");
      } catch (error) {
        console.error("Error saving cover letter:", error);
        addToast("บันทึกจดหมายสมัครงานไม่สำเร็จ", "error");
      } finally {
        setSavingStates((prev) => ({ ...prev, coverLetter: false }));
      }
    },
    [candidate, addToast]
  );

  /**
   * Debounce timer ref
   */
  const debounceTimer = React.useRef<NodeJS.Timeout | undefined>(undefined);

  /**
   * Handle cover letter change with debounce
   */
  const handleCoverLetterChange = (value: string) => {
    setCoverLetterDraft(value);

    // Clear existing timer
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set new timer
    debounceTimer.current = setTimeout(() => {
      debouncedSaveCoverLetter(value);
    }, 500);
  };

  // Cleanup debounce timer on unmount
  React.useEffect(() => {
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, []);

  // Show loading while checking auth or fetching data
  if (authLoading || candidateLoading || !firebaseUser || !candidate) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <p className="text-gray-500">กำลังโหลด...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-semibold tracking-wide leading-snug text-gray-900">
            การตั้งค่า
          </h1>
          <p className="text-sm text-gray-500 mt-1">Settings</p>
        </div>

        {/* Settings Sections */}
        <div className="space-y-6">
          {/* Account Settings Link */}
          <AccountLinkCard />

          {/* Profile Visibility */}
          <ProfileVisibilitySection
            isSearchable={candidate.isSearchable}
            onToggle={(value) => handleToggle("isSearchable", value)}
            isSaving={savingStates.isSearchable || false}
          />

          {/* Application Preferences */}
          <ApplicationPreferencesSection
            autoAttachCoverLetter={candidate.autoAttachCoverLetter || false}
            coverLetterDraft={coverLetterDraft}
            onToggleCoverLetter={(value) =>
              handleToggle("autoAttachCoverLetter", value)
            }
            onCoverLetterChange={handleCoverLetterChange}
            isSavingToggle={savingStates.autoAttachCoverLetter || false}
            isSavingCoverLetter={savingStates.coverLetter || false}
          />

          {/* Notification Preferences */}
          <NotificationPreferencesSection
            emailJobRecommendations={candidate.emailJobRecommendations ?? true}
            onToggleEmail={(value) =>
              handleToggle("emailJobRecommendations", value)
            }
            isSavingEmail={savingStates.emailJobRecommendations || false}
          />
        </div>
      </div>
    </div>
  );
}
