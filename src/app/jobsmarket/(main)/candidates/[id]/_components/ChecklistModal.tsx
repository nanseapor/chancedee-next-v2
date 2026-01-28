"use client";

import Link from "next/link";
import { X } from "lucide-react";

import { Button } from "@/components/ui/button";
import {
  useProfileCompletion,
  CandidateProfileData,
} from "@/hooks/jobsmarket/use-profile-completion";

/**
 * Profile Completion Checklist Modal
 * Per CAND-R01 RIS §3.2.2
 *
 * Shows detailed checklist of missing fields grouped by section
 * with links to profile edit page
 */

export interface ChecklistModalProps {
  profile: CandidateProfileData;
  onClose: () => void;
}

export function ChecklistModal({ profile, onClose }: ChecklistModalProps) {
  const { percentage, missingSections } = useProfileCompletion(profile);

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      {/* Backdrop */}
      <div
        className="fixed inset-0 bg-black bg-opacity-50 transition-opacity"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="flex min-h-full items-center justify-center p-4">
        <div className="relative bg-white rounded-lg shadow-xl max-w-md w-full p-6">
          {/* Header */}
          <div className="flex items-start justify-between mb-4">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">
                รายการตรวจสอบโปรไฟล์
              </h3>
              <p className="text-sm text-gray-500">
                Profile Completion Checklist
              </p>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600"
            >
              <X className="w-6 h-6" />
            </Button>
          </div>

          {/* Progress Bar */}
          <div className="mb-6">
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm font-medium text-gray-700">
                ความสมบูรณ์
              </span>
              <span className="text-sm font-medium text-gray-900">
                {percentage}%
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-secondary-600 h-2 rounded-full transition-all duration-500"
                style={{ width: `${percentage}%` }}
              />
            </div>
          </div>

          {/* Missing Sections List */}
          {missingSections.length > 0 ? (
            <div className="space-y-3 mb-6">
              <p className="text-sm font-medium text-gray-700">
                หมวดหมู่ที่ยังไม่สมบูรณ์:
              </p>
              <ul className="space-y-2">
                {missingSections.map((section, idx) => (
                  <li
                    key={idx}
                    className="flex items-start gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <svg
                      className="w-5 h-5 text-amber-500 flex-shrink-0 mt-0.5"
                      fill="currentColor"
                      viewBox="0 0 20 20"
                    >
                      <path
                        fillRule="evenodd"
                        d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <div className="flex-1">
                      <p className="text-sm font-medium text-gray-900">
                        {section.label_th}
                      </p>
                      <p className="text-xs text-gray-500">{section.label_en}</p>
                      <p className="text-xs text-gray-600 mt-1">
                        ลำดับความสำคัญ: {section.priority}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          ) : (
            <div className="mb-6 p-4 bg-green-50 rounded-lg">
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
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex gap-3">
            {missingSections.length > 0 && (
              <Button
                asChild
                variant="secondary"
                className="flex-1"
              >
                <Link href={`/jobsmarket/candidates/${profile.uid}/profile/edit`}>
                  แก้ไขโปรไฟล์
                </Link>
              </Button>
            )}
            <Button
              variant="outline"
              onClick={onClose}
              className="flex-1"
            >
              ปิด
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
