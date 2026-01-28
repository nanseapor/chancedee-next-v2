"use client";

import { useState } from "react";

import { Button } from "@/components/ui/button";
import {
  useProfileCompletion,
  CandidateProfileData,
} from "@/hooks/jobsmarket/use-profile-completion";

import { ChecklistModal } from "./ChecklistModal";

/**
 * Profile Completion Card Component
 * Per CAND-R01 RIS §3.2.2
 *
 * Features:
 * - Circular progress ring showing completion %
 * - Top 3 missing sections
 * - CTA button to complete profile → opens modal
 * - Modal shows complete checklist
 */

export interface ProfileCompletionCardProps {
  profile: CandidateProfileData;
}

export function ProfileCompletionCard({
  profile,
}: ProfileCompletionCardProps) {
  const [showModal, setShowModal] = useState(false);
  const { percentage, missingSections } = useProfileCompletion(profile);

  const isComplete = percentage === 100;

  // Calculate stroke dasharray for circular progress
  const radius = 40;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <>
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 sm:p-6">
        <div className="flex items-start justify-between mb-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-900">
              ความสมบูรณ์ของโปรไฟล์
            </h2>
            <p className="text-sm text-gray-500">Profile Completion</p>
          </div>
        </div>

        <div className="flex items-center gap-3 sm:gap-4 sm:p-6">
          {/* Circular Progress Ring */}
          <div className="relative flex-shrink-0">
            <svg width="100" height="100" className="w-[72px] h-[72px] sm:w-[100px] sm:h-[100px] transform -rotate-90">
              {/* Background circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke="#E5E7EB"
                strokeWidth="8"
                fill="none"
              />
              {/* Progress circle */}
              <circle
                cx="50"
                cy="50"
                r={radius}
                stroke={isComplete ? "#10B981" : "#F59E0B"}
                strokeWidth="8"
                fill="none"
                strokeDasharray={circumference}
                strokeDashoffset={strokeDashoffset}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
            </svg>
            <div className="absolute inset-0 flex items-center justify-center">
              <span className="text-lg sm:text-2xl font-bold text-gray-900">
                {percentage}%
              </span>
            </div>
          </div>

          {/* Missing Sections or Completion Message */}
          <div className="flex-1">
            {isComplete ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <svg
                    className="w-5 h-5 text-green-500"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
                      clipRule="evenodd"
                    />
                  </svg>
                  <p className="text-sm font-medium text-green-700">
                    โปรไฟล์สมบูรณ์แล้ว!
                  </p>
                </div>
                <p className="text-sm text-gray-600">
                  ยอดเยี่ยม! โปรไฟล์ของคุณพร้อมสำหรับการสมัครงานแล้ว
                </p>
              </div>
            ) : (
              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  ข้อมูลที่ยังไม่สมบูรณ์:
                </p>
                <ul className="space-y-1">
                  {missingSections.slice(0, 3).map((section, idx) => (
                    <li key={idx} className="flex items-center gap-2 text-sm">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-500"></span>
                      <span className="text-gray-600">{section.label_th}</span>
                      <span className="text-xs text-gray-400">
                        ({section.label_en})
                      </span>
                    </li>
                  ))}
                </ul>
                {missingSections.length > 3 && (
                  <p className="text-xs text-gray-400 mt-1">
                    และอีก {missingSections.length - 3} หมวดหมู่
                  </p>
                )}
              </div>
            )}
          </div>
        </div>

        {/* CTA Button */}
        {!isComplete && (
          <Button
            onClick={() => setShowModal(true)}
            variant="secondary"
            className="mt-4 w-full"
          >
            กรอกข้อมูลให้สมบูรณ์
          </Button>
        )}
      </div>

      {/* Checklist Modal */}
      {showModal && (
        <ChecklistModal
          profile={profile}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
