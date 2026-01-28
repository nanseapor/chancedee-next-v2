/**
 * COMP-R08: Application Detail Panel (Phase 4: Actions & Chat)
 *
 * Displays detailed view of selected application with:
 * - Candidate header (photo, name, contact, match score)
 * - Application info (salary, overhead days, applied date)
 * - Match score breakdown (if available)
 * - Profile sections (experience, education, skills, languages)
 * - Resume download
 * - Action buttons (accept/reject) - Phase 4
 *
 * Per COMP-R08 RIS §2.3 (Detail Panel) and §3 (User Actions)
 */

'use client';

import { useState } from 'react';
import { CandidateHeader } from './CandidateHeader';
import { ApplicationInfo } from './ApplicationInfo';
import { MatchScoreBreakdown } from './MatchScoreBreakdown';
import { ProfileSections } from './ProfileSections';
import { ResumeViewer } from './ResumeViewer';
import { ActionBar } from './ActionBar';
import { RejectModal } from './RejectModal';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';

interface DetailPanelProps {
  application: ApplicationListItem | undefined;
  companyId: string;
  canManageApplications: boolean;
  onAccept: () => void;
  onReject: (feedback: string) => void;
  isAccepting: boolean;
  isRejecting: boolean;
}

export function DetailPanel({
  application,
  companyId: _companyId,
  canManageApplications,
  onAccept,
  onReject,
  isAccepting,
  isRejecting,
}: DetailPanelProps) {
  const [isRejectModalOpen, setIsRejectModalOpen] = useState(false);
  // No application selected
  if (!application) {
    return (
      <div className="flex flex-col items-center justify-center h-full text-gray-500 px-6">
        <svg
          className="w-24 h-24 text-gray-300 mb-4"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          xmlns="http://www.w3.org/2000/svg"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
          />
        </svg>
        <p className="text-lg font-medium text-gray-700 mb-1 tracking-wide">
          เลือกใบสมัครเพื่อดูรายละเอียด
        </p>
        <p className="text-sm text-gray-500 text-center max-w-sm tracking-wider leading-relaxed">
          คลิกที่ใบสมัครในรายการด้านซ้ายเพื่อดูข้อมูลผู้สมัคร และดำเนินการต่างๆ
        </p>
      </div>
    );
  }

  /**
   * Phase 3 Note: We're working with ApplicationListItem which has basic candidate info.
   * Full candidate profile (experience, education, etc.) would require additional fetch.
   * For Phase 3, we'll show what we have and display empty states for missing data.
   *
   * TODO Phase 4+: Implement webJobApplicationGetDetail server action to fetch:
   * - Full candidate profile with work experience
   * - Education history
   * - Skills list
   * - Languages
   * - Resume URL
   */

  // Mock candidate data for Phase 3 (will be replaced with real data in Phase 4+)
  const candidateProfile = {
    photo: application.candidatePhoto,
    name: application.candidateName,
    headline: application.candidateHeadline || null,
    email: 'candidate@example.com', // TODO: Fetch from candidate profile
    phone: null, // TODO: Fetch from candidate profile
    workExperience: [], // TODO: Fetch from candidate profile
    education: [], // TODO: Fetch from candidate profile
    skills: [], // TODO: Fetch from candidate profile
    languages: [], // TODO: Fetch from candidate profile
    resumeUrl: null, // TODO: Fetch from candidate profile
  };

  return (
    <div className="h-full overflow-y-auto bg-gray-50">
      {/* Candidate Header */}
      <CandidateHeader
        photo={candidateProfile.photo}
        name={candidateProfile.name}
        headline={candidateProfile.headline}
        email={candidateProfile.email}
        phone={candidateProfile.phone}
        matchScore={application.matchScore}
      />

      {/* Application Info */}
      <ApplicationInfo
        expectedSalary={application.expectedSalary}
        isNegotiable={application.isNegotiable}
        overheadDays={application.overheadDays}
        headlines={application.headlines}
        appliedAt={application.createdAt}
      />

      {/* Match Score Breakdown */}
      <MatchScoreBreakdown
        score={null} // Phase 2+: AI matching deferred per SA decision
      />

      {/* Profile Sections */}
      <ProfileSections
        experience={candidateProfile.workExperience}
        education={candidateProfile.education}
        skills={candidateProfile.skills}
        languages={candidateProfile.languages}
      />

      {/* Resume Viewer */}
      <ResumeViewer resumeUrl={candidateProfile.resumeUrl} />

      {/* Phase 4: Action Bar */}
      <ActionBar
        application={application}
        onAccept={onAccept}
        onReject={() => setIsRejectModalOpen(true)}
        isAccepting={isAccepting}
        isRejecting={isRejecting}
        canManageApplications={canManageApplications}
      />

      {/* Phase 4: Reject Modal */}
      <RejectModal
        isOpen={isRejectModalOpen}
        onClose={() => setIsRejectModalOpen(false)}
        onConfirm={(feedback) => {
          onReject(feedback);
          setIsRejectModalOpen(false);
        }}
        isSubmitting={isRejecting}
        candidateName={application.candidateName}
        jobTitle={application.jobTitle}
      />
    </div>
  );
}
