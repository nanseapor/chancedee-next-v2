/**
 * COMP-R08: Application Card Component
 *
 * Displays application preview in the list panel.
 * Clickable card that selects the application for detail view.
 *
 * States:
 * - Default: white background
 * - Selected: primary-50 background with left border
 * - Unread: blue dot indicator
 * - Hover: gray-50 background
 *
 * Per COMP-R08 RIS §2.2 (Application List)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import type { ApplicationListItem } from '@/types/jobsmarket/applications.types';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';

interface ApplicationCardProps {
  application: ApplicationListItem;
  isSelected: boolean;
  onSelect: (id: string) => void;
}

/**
 * Get badge variant for application status
 */
function getStatusBadgeVariant(status: string): 'default' | 'secondary' | 'destructive' | 'outline' {
  switch (status) {
    case 'applied':
      return 'default'; // warning/amber
    case 'read':
      return 'secondary';
    case 'accepted':
    case 'confirmed':
      return 'default'; // success (will style with green)
    case 'rejected':
      return 'destructive';
    case 'scheduled':
      return 'outline'; // info
    default:
      return 'secondary';
  }
}

/**
 * Get Thai label for status
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    applied: 'รอดำเนินการ',
    read: 'ดูแล้ว',
    accepted: 'ตอบรับแล้ว',
    rejected: 'ปฏิเสธ',
    scheduled: 'นัดสัมภาษณ์',
    confirmed: 'ยืนยันแล้ว',
    withdraw: 'ถอนใบสมัคร',
  };
  return labels[status] || status;
}

export function ApplicationCard({ application, isSelected, onSelect }: ApplicationCardProps) {
  const {
    uid,
    candidateName,
    candidatePhoto,
    jobTitle,
    status,
    matchScore,
    isUnread,
    createdAt,
  } = application;

  // Format relative time
  const relativeTime = formatDistanceToNow(new Date(createdAt), {
    addSuffix: true,
    locale: th,
  });

  return (
    <button
      onClick={() => onSelect(uid)}
      className={`
        w-full text-left p-4 border-b border-gray-200 transition-colors
        hover:bg-gray-50
        ${isSelected ? 'bg-secondary-50 border-l-4 border-l-secondary-500 -ml-px' : 'bg-white'}
      `}
      aria-pressed={isSelected}
    >
      <div className="flex gap-3">
        {/* Candidate Avatar */}
        <div className="flex-shrink-0 relative">
          {candidatePhoto ? (
            <img
              src={candidatePhoto}
              alt={candidateName}
              className="h-12 w-12 rounded-full object-cover"
            />
          ) : (
            <div className="h-12 w-12 rounded-full bg-gray-200 flex items-center justify-center">
              <span className="text-gray-500 text-lg font-medium">
                {candidateName.charAt(0).toUpperCase()}
              </span>
            </div>
          )}

          {/* Unread indicator */}
          {isUnread && (
            <span className="absolute top-0 right-0 block h-3 w-3 rounded-full bg-blue-500 ring-2 ring-white" />
          )}
        </div>

        {/* Card Content */}
        <div className="flex-1 min-w-0">
          {/* Candidate Name */}
          <h3 className="text-sm font-medium text-gray-900 tracking-wide truncate">
            {candidateName}
          </h3>

          {/* Job Title */}
          <p className="text-sm text-gray-600 tracking-wider truncate">
            {jobTitle}
          </p>

          {/* Relative Time */}
          <p className="text-xs text-gray-500 tracking-widest mt-1">
            สมัครเมื่อ {relativeTime}
          </p>
        </div>
      </div>

      {/* Status Badge and Match Score */}
      <div className="flex items-center gap-2 mt-3">
        <Badge
          variant={getStatusBadgeVariant(status)}
          className={`
            text-xs tracking-widest
            ${status === 'accepted' || status === 'confirmed' ? 'bg-green-100 text-green-700 hover:bg-green-200' : ''}
            ${status === 'applied' ? 'bg-amber-100 text-amber-700 hover:bg-amber-200' : ''}
          `}
        >
          {getStatusLabel(status)}
        </Badge>

        {/* Match Score (if available) */}
        {matchScore !== null && (
          <span className="text-xs text-gray-600 tracking-widest">
            คะแนน: {matchScore}%
          </span>
        )}
      </div>
    </button>
  );
}
