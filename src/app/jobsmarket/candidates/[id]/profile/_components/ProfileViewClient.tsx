"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { FirebaseCandidateData } from "@/types/candidate.types";
import {
  webCandidateSetIsSearchable,
  webCandidateSaveProfilePhoto,
} from "@/lib/database/actions/candidate-information";
import { useToast } from "@/hooks/use-toast-notification";

import { ProfileHeader } from "./ProfileHeader";
import { PersonalInfoSection } from "./PersonalInfoSection";
import { WorkExperienceSection } from "./WorkExperienceSection";
import { EducationSection } from "./EducationSection";
import { SkillsSection } from "./SkillsSection";
import { JobPreferencesSection } from "./JobPreferencesSection";
import { DocumentsSection } from "./DocumentsSection";

// Edit drawers (Batch 3D)
import { PersonalInfoEditDrawer } from "./PersonalInfoEditDrawer";
import { WorkExperienceEditDrawer } from "./WorkExperienceEditDrawer";
import { EducationEditDrawer } from "./EducationEditDrawer";
import { SkillsEditDrawer } from "./SkillsEditDrawer";
import { JobPreferencesEditDrawer } from "./JobPreferencesEditDrawer";
import { AboutMeEditDrawer } from "./AboutMeEditDrawer";

// Preview modal (Batch 3E)
import { PreviewModal } from "./PreviewModal";

interface ProfileViewClientProps {
  candidate: FirebaseCandidateData;
}

/**
 * CAND-R02 Batch 3C + 3D + 3E + 4B: Profile View Container
 *
 * Client component that receives candidate data and renders all view sections.
 * Manages drawer state for inline editing (Batch 3D).
 * Manages preview modal state (Batch 3E).
 * Manages file uploads (Batch 4B).
 */
export function ProfileViewClient({ candidate }: ProfileViewClientProps) {
  const { addToast } = useToast();
  const router = useRouter();

  // Drawer open states
  const [personalInfoOpen, setPersonalInfoOpen] = React.useState(false);
  const [workExpOpen, setWorkExpOpen] = React.useState(false);
  const [educationOpen, setEducationOpen] = React.useState(false);
  const [skillsOpen, setSkillsOpen] = React.useState(false);
  const [preferencesOpen, setPreferencesOpen] = React.useState(false);
  const [aboutMeOpen, setAboutMeOpen] = React.useState(false);

  // Preview modal state (Batch 3E)
  const [previewOpen, setPreviewOpen] = React.useState(false);

  // Event handlers
  const handleToggleSearchable = async (value: boolean) => {
    try {
      await webCandidateSetIsSearchable(candidate.uid, value, candidate.uid);
      addToast(
        value ? "เปิดให้ค้นหาโปรไฟล์สำเร็จ" : "ปิดการค้นหาโปรไฟล์สำเร็จ",
        "success"
      );
      // Refresh to show updated state
      handleRefresh();
    } catch (error) {
      console.error("Error toggling searchable:", error);
      addToast("เกิดข้อผิดพลาดในการอัปเดตสถานะ", "error");
    }
  };

  const handleOpenPreview = () => {
    setPreviewOpen(true);
  };

  const handleRefresh = () => {
    // Use Next.js router.refresh() to re-fetch server components
    router.refresh();
  };

  /**
   * CAND-R02 Batch 4B: Handle profile photo upload
   */
  const handlePhotoUploaded = async (photoUrl: string) => {
    try {
      await webCandidateSaveProfilePhoto(candidate.uid, photoUrl, candidate.uid);
      // Refresh to show new photo
      handleRefresh();
    } catch (error) {
      console.error("Error saving profile photo:", error);
      addToast("เกิดข้อผิดพลาดในการบันทึกรูปโปรไฟล์", "error");
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Profile Header */}
        <ProfileHeader
          candidate={candidate}
          onToggleSearchable={handleToggleSearchable}
          onOpenPreview={handleOpenPreview}
          onPhotoUploaded={handlePhotoUploaded}
        />

        {/* Scrollable sections */}
        <div className="space-y-6 mt-6">
          <PersonalInfoSection
            candidate={candidate}
            onEdit={() => setPersonalInfoOpen(true)}
          />

          <WorkExperienceSection
            works={candidate.works || []}
            onEdit={() => setWorkExpOpen(true)}
          />

          <EducationSection
            educations={candidate.educations || []}
            onEdit={() => setEducationOpen(true)}
          />

          <SkillsSection
            skills={candidate.skills || []}
            languages={candidate.languages || []}
            onEdit={() => setSkillsOpen(true)}
          />

          <JobPreferencesSection
            candidateUid={candidate.uid}
            onEdit={() => setPreferencesOpen(true)}
          />

          <DocumentsSection uid={candidate.uid} />
        </div>
      </div>

      {/* Edit Drawers (Batch 3D) */}
      <PersonalInfoEditDrawer
        open={personalInfoOpen}
        onOpenChange={setPersonalInfoOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      <WorkExperienceEditDrawer
        open={workExpOpen}
        onOpenChange={setWorkExpOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      <EducationEditDrawer
        open={educationOpen}
        onOpenChange={setEducationOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      <SkillsEditDrawer
        open={skillsOpen}
        onOpenChange={setSkillsOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      <JobPreferencesEditDrawer
        open={preferencesOpen}
        onOpenChange={setPreferencesOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      <AboutMeEditDrawer
        open={aboutMeOpen}
        onOpenChange={setAboutMeOpen}
        candidate={candidate}
        onSaved={handleRefresh}
      />

      {/* Preview Modal (Batch 3E) */}
      <PreviewModal
        open={previewOpen}
        onOpenChange={setPreviewOpen}
        candidate={candidate}
      />
    </div>
  );
}
