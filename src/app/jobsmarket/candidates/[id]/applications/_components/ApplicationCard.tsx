'use client';

import { useState } from 'react';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building2, ChevronDown, ChevronUp, Trash2 } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';
import type { ApplicationWithDetails } from '@/lib/database/actions/job-applications';
import ApplicationStatusBadge from './ApplicationStatusBadge';
import ApplicationTimeline from './ApplicationTimeline';
import InterviewCard from './InterviewCard';

interface ApplicationCardProps {
  application: ApplicationWithDetails;
  canWithdraw?: boolean;
  onWithdraw?: () => void;
  onConfirmInterview?: () => void;
  onDeclineInterview?: () => void;
  className?: string;
}

/**
 * ApplicationCard - Main component for displaying application details
 *
 * Features:
 * - Expandable/collapsible card
 * - Company logo and job title
 * - Status badge
 * - Application date
 * - Timeline of status changes
 * - Interview details (if applicable)
 * - Withdraw button (if allowed)
 */
export default function ApplicationCard({
  application,
  canWithdraw = false,
  onWithdraw,
  onConfirmInterview,
  onDeclineInterview,
  className,
}: ApplicationCardProps) {
  const [isExpanded, setIsExpanded] = useState(false);

  const hasInterview = !!application.interview;
  const isConfirmed = application.status === 'confirmed';
  const isDeclined = application.status === 'declined';

  // Build timeline events from application data
  const timelineEvents = [
    {
      status: 'applied',
      label: 'ส่งใบสมัคร',
      timestamp: new Date(application.createdAt),
    },
    ...(application.status !== 'applied'
      ? [
          {
            status: application.status,
            label: getStatusLabel(application.status),
            timestamp: new Date(application.updatedAt),
          },
        ]
      : []),
  ];

  return (
    <Card className={cn('overflow-hidden', className)}>
      {/* Header - Always Visible */}
      <div className="p-4">
        <div className="flex items-start gap-4">
          {/* Company Logo */}
          <div className="shrink-0">
            {application.companyLogo ? (
              <img
                src={application.companyLogo}
                alt={application.companyName}
                className="h-12 w-12 rounded-lg object-cover"
              />
            ) : (
              <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-gray-100">
                <Building2 className="h-6 w-6 text-gray-400" />
              </div>
            )}
          </div>

          {/* Content */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div className="flex-1 min-w-0">
                <h3 className="text-base font-medium text-gray-900 truncate">
                  {application.jobTitle}
                </h3>
                <p className="text-sm text-gray-600 mt-0.5">
                  {application.companyName}
                </p>
              </div>
              <ApplicationStatusBadge
                status={application.status}
                className="shrink-0"
              />
            </div>

            <p className="text-xs text-gray-500 mt-2">
              สมัครเมื่อ {format(new Date(application.createdAt), 'd MMM yyyy', { locale: th })}
            </p>

            {/* Expected Salary (if provided) */}
            {application.expectedSalary && (
              <p className="text-sm text-gray-700 mt-1">
                ค่าจ้างที่คาดหวัง: {application.expectedSalary.toLocaleString()} บาท
                {application.isNegotiable && <span className="text-gray-500"> (ต่อรองได้)</span>}
              </p>
            )}
          </div>
        </div>

        {/* Expand/Collapse Button */}
        <Button
          variant="ghost"
          size="sm"
          onClick={() => setIsExpanded(!isExpanded)}
          className="w-full mt-3 text-gray-600 hover:text-gray-900"
        >
          {isExpanded ? (
            <>
              <ChevronUp className="h-4 w-4 mr-1" />
              ซ่อนรายละเอียด
            </>
          ) : (
            <>
              <ChevronDown className="h-4 w-4 mr-1" />
              ดูรายละเอียดเพิ่มเติม
            </>
          )}
        </Button>
      </div>

      {/* Expanded Content */}
      {isExpanded && (
        <div className="border-t border-gray-200 bg-gray-50 p-4 space-y-4">
          {/* Headlines (if provided) */}
          {application.headlines && (
            <div>
              <h4 className="text-sm font-medium text-gray-700 mb-1">ข้อความถึงบริษัท</h4>
              <p className="text-sm text-gray-600">{application.headlines}</p>
            </div>
          )}

          {/* Interview Details */}
          {hasInterview && application.interview && (
            <InterviewCard
              interview={{
                date: new Date(application.interview.appointment),
                time: `${application.interview.from} - ${application.interview.to}`,
                location: application.interview.location || application.interview.room || 'ไม่ระบุ',
                type: application.interview.channel,
                notes: application.interview.note,
              }}
              onConfirm={onConfirmInterview}
              onDecline={onDeclineInterview}
              isConfirmed={isConfirmed}
              isDeclined={isDeclined}
            />
          )}

          {/* Timeline */}
          <ApplicationTimeline events={timelineEvents} />

          {/* Reject Feedback (if provided) */}
          {application.rejectFeedback && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-3">
              <h4 className="text-sm font-medium text-red-900 mb-1">
                เหตุผลที่ไม่ผ่านการคัดเลือก
              </h4>
              <p className="text-sm text-red-700">{application.rejectFeedback}</p>
            </div>
          )}

          {/* Withdraw Button */}
          {canWithdraw && onWithdraw && (
            <Button
              variant="outline"
              onClick={onWithdraw}
              className="w-full border-red-300 text-red-700 hover:bg-red-50"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              ถอนใบสมัคร
            </Button>
          )}
        </div>
      )}
    </Card>
  );
}

/**
 * Helper function to get Thai label for status
 */
function getStatusLabel(status: string): string {
  const labels: Record<string, string> = {
    applied: 'ส่งใบสมัคร',
    read: 'บริษัทดูแล้ว',
    accepted: 'ผ่านการคัดเลือก',
    rejected: 'ไม่ผ่านการคัดเลือก',
    scheduled: 'นัดสัมภาษณ์',
    confirmed: 'ยืนยันสัมภาษณ์',
    declined: 'ปฏิเสธสัมภาษณ์',
    withdraw: 'ถอนใบสมัคร',
    closed: 'ปิดรับสมัคร',
    systemclosed: 'ปิดโดยระบบ',
    cancelled: 'ยกเลิก',
  };
  return labels[status] || status;
}
