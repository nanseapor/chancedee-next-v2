/**
 * COMP-R08: Application List Component
 *
 * Scrollable list of application cards (350px fixed width).
 * Displays filtered applications with selection state.
 *
 * States:
 * - Loading: Shows skeleton cards
 * - Empty: Shows empty state message
 * - Error: Shows error message
 * - Data: Shows application cards
 *
 * Per COMP-R08 RIS §2.2 (Application List)
 */

'use client';

import { ApplicationCard } from './ApplicationCard';
import { Skeleton } from '@/components/ui/skeleton';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';

interface ApplicationListProps {
  applications: ApplicationListItem[] | undefined;
  isLoading: boolean;
  isError: boolean;
  selectedApplicationId: string | null;
  onSelectApplication: (id: string) => void;
}

export function ApplicationList({
  applications,
  isLoading,
  isError,
  selectedApplicationId,
  onSelectApplication,
}: ApplicationListProps) {
  // Loading state
  if (isLoading) {
    return (
      <div className="w-[350px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="p-4 border-b border-gray-200">
          <Skeleton className="h-6 w-48" />
        </div>
        <div className="divide-y divide-gray-200">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="p-4">
              <div className="flex gap-3">
                <Skeleton className="h-12 w-12 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-5 w-32 mb-2" />
                  <Skeleton className="h-4 w-48 mb-1" />
                  <Skeleton className="h-3 w-24" />
                </div>
              </div>
              <div className="flex gap-2 mt-3">
                <Skeleton className="h-6 w-20" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="w-[350px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
            ใบสมัครงาน
          </h2>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg
            className="w-16 h-16 text-red-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
          <p className="text-sm text-gray-600 tracking-wider">
            เกิดข้อผิดพลาดในการโหลดข้อมูล
          </p>
          <p className="text-xs text-gray-500 tracking-widest mt-1">
            กรุณาลองใหม่อีกครั้ง
          </p>
        </div>
      </div>
    );
  }

  // Empty state
  if (!applications || applications.length === 0) {
    return (
      <div className="w-[350px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
        <div className="p-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
            ใบสมัครงาน
          </h2>
          <p className="text-sm text-gray-500 tracking-wider mt-1">
            0 รายการ
          </p>
        </div>
        <div className="flex flex-col items-center justify-center p-8 text-center">
          <svg
            className="w-16 h-16 text-gray-300 mb-4"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
            />
          </svg>
          <p className="text-sm text-gray-600 tracking-wider">
            ยังไม่มีใบสมัครงาน
          </p>
          <p className="text-xs text-gray-500 tracking-widest mt-1 max-w-xs">
            เมื่อมีผู้สมัครงานตำแหน่งของคุณ ใบสมัครจะแสดงที่นี่
          </p>
        </div>
      </div>
    );
  }

  // Data state - show applications
  return (
    <div className="w-[350px] flex-shrink-0 border-r border-gray-200 overflow-y-auto bg-white">
      {/* List header */}
      <div className="p-4 border-b border-gray-200 bg-white sticky top-0 z-10">
        <h2 className="text-lg font-semibold text-gray-900 tracking-wide">
          ใบสมัครงาน
        </h2>
        <p className="text-sm text-gray-500 tracking-wider mt-1">
          {applications.length} รายการ
        </p>
      </div>

      {/* Application cards */}
      <div>
        {applications.map((application) => (
          <ApplicationCard
            key={application.uid}
            application={application}
            isSelected={selectedApplicationId === application.uid}
            onSelect={onSelectApplication}
          />
        ))}
      </div>
    </div>
  );
}
