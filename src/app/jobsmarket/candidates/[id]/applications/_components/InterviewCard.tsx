'use client';

import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar, Clock, MapPin, Video } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

export interface InterviewDetails {
  date: Date;
  time: string;
  location: string;
  type: 'onsite' | 'online';
  meetingLink?: string;
  notes?: string;
}

interface InterviewCardProps {
  interview: InterviewDetails;
  onConfirm?: () => void;
  onDecline?: () => void;
  isConfirmed?: boolean;
  isDeclined?: boolean;
  className?: string;
}

export default function InterviewCard({
  interview,
  onConfirm,
  onDecline,
  isConfirmed = false,
  isDeclined = false,
  className,
}: InterviewCardProps) {
  const isOnline = interview.type === 'online';

  return (
    <Card className={cn('p-4 space-y-3', className)}>
      <h3 className="text-sm font-medium text-gray-900">รายละเอียดการสัมภาษณ์</h3>

      {/* Date and Time */}
      <div className="flex items-start gap-3">
        <Calendar className="h-5 w-5 text-gray-400 mt-0.5" />
        <div>
          <p className="text-sm font-medium text-gray-900">
            {format(interview.date, 'd MMMM yyyy', { locale: th })}
          </p>
          <div className="flex items-center gap-2 mt-1">
            <Clock className="h-4 w-4 text-gray-400" />
            <p className="text-sm text-gray-600">{interview.time}</p>
          </div>
        </div>
      </div>

      {/* Location/Link */}
      <div className="flex items-start gap-3">
        {isOnline ? (
          <Video className="h-5 w-5 text-gray-400 mt-0.5" />
        ) : (
          <MapPin className="h-5 w-5 text-gray-400 mt-0.5" />
        )}
        <div className="flex-1">
          <p className="text-sm text-gray-600">{interview.location}</p>
          {isOnline && interview.meetingLink && (
            <a
              href={interview.meetingLink}
              target="_blank"
              rel="noopener noreferrer"
              className="text-sm text-primary-600 hover:text-primary-700 underline mt-1 inline-block"
            >
              เข้าร่วมการประชุม
            </a>
          )}
        </div>
      </div>

      {/* Notes */}
      {interview.notes && (
        <div className="bg-gray-50 rounded-lg p-3">
          <p className="text-sm text-gray-700">{interview.notes}</p>
        </div>
      )}

      {/* Action Buttons */}
      {!isConfirmed && !isDeclined && (onConfirm || onDecline) && (
        <div className="flex gap-2 pt-2">
          {onConfirm && (
            <Button
              onClick={onConfirm}
              className="flex-1 bg-primary-600 hover:bg-primary-700 text-white"
            >
              ยืนยันเข้าสัมภาษณ์
            </Button>
          )}
          {onDecline && (
            <Button
              onClick={onDecline}
              variant="outline"
              className="flex-1 border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              ปฏิเสธ
            </Button>
          )}
        </div>
      )}

      {/* Confirmed State */}
      {isConfirmed && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-3">
          <p className="text-sm text-green-700 font-medium">
            ✓ คุณได้ยืนยันเข้าสัมภาษณ์แล้ว
          </p>
        </div>
      )}

      {/* Declined State */}
      {isDeclined && (
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
          <p className="text-sm text-gray-600">คุณได้ปฏิเสธการสัมภาษณ์</p>
        </div>
      )}
    </Card>
  );
}
