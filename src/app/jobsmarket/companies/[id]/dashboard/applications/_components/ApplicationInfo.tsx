/**
 * COMP-R08: Application Info Component
 *
 * Displays application-specific information:
 * - Expected salary and negotiability
 * - Overhead days (notice period)
 * - Application headlines/message
 * - Applied date
 *
 * Per COMP-R08 RIS §4.2 (Application List Item)
 */

'use client';

import { Badge } from '@/components/ui/badge';
import { Calendar, DollarSign, Clock, MessageSquare } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export interface ApplicationInfoProps {
  expectedSalary: number | null;
  isNegotiable: boolean;
  overheadDays: number;
  headlines: string;
  appliedAt: number;
}

/**
 * Format salary with Thai Baht formatting
 */
function formatSalary(amount: number): string {
  return new Intl.NumberFormat('th-TH').format(amount);
}

export function ApplicationInfo({
  expectedSalary,
  isNegotiable,
  overheadDays,
  headlines,
  appliedAt,
}: ApplicationInfoProps) {
  return (
    <div className="p-6 border-b border-gray-200 bg-white">
      <h2 className="text-lg font-semibold text-gray-900 tracking-wide leading-snug mb-4">
        ข้อมูลการสมัคร
      </h2>

      <div className="space-y-3">
        {/* Expected Salary */}
        <div className="flex items-start gap-3">
          <DollarSign className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 tracking-wider">เงินเดือนที่คาดหวัง</p>
            <p className="text-base text-gray-900 font-medium tracking-wider mt-1">
              {expectedSalary ? `฿${formatSalary(expectedSalary)}` : 'ไม่ระบุ'}
              {expectedSalary && isNegotiable && (
                <Badge variant="secondary" className="ml-2 text-xs tracking-widest">
                  ต่อรองได้
                </Badge>
              )}
            </p>
          </div>
        </div>

        {/* Overhead Days (Notice Period) */}
        <div className="flex items-start gap-3">
          <Clock className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 tracking-wider">ระยะเวลาแจ้งล่วงหน้า</p>
            <p className="text-base text-gray-900 font-medium tracking-wider mt-1">
              {overheadDays} วัน
            </p>
          </div>
        </div>

        {/* Applied Date */}
        <div className="flex items-start gap-3">
          <Calendar className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
          <div className="flex-1">
            <p className="text-sm text-gray-600 tracking-wider">วันที่สมัคร</p>
            <p className="text-base text-gray-900 font-medium tracking-wider mt-1">
              {format(new Date(appliedAt), 'd MMMM yyyy, HH:mm น.', { locale: th })}
            </p>
          </div>
        </div>

        {/* Headlines/Message */}
        {headlines && (
          <div className="flex items-start gap-3">
            <MessageSquare className="h-5 w-5 text-secondary-600 flex-shrink-0 mt-0.5" />
            <div className="flex-1">
              <p className="text-sm text-gray-600 tracking-wider">ข้อความจากผู้สมัคร</p>
              <p className="text-sm text-gray-700 tracking-wider leading-relaxed mt-1 whitespace-pre-wrap">
                {headlines}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
