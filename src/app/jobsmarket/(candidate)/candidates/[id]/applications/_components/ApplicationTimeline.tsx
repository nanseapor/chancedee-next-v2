'use client';

import { cn } from '@/lib/utils';
import { Calendar, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { format } from 'date-fns';
import { th } from 'date-fns/locale';

interface TimelineEvent {
  status: string;
  label: string;
  timestamp: Date;
  isLast?: boolean;
}

interface ApplicationTimelineProps {
  events: TimelineEvent[];
  className?: string;
}

/**
 * Get icon and color for timeline event based on status
 */
function getEventStyle(status: string) {
  switch (status) {
    case 'accepted':
    case 'confirmed':
      return {
        icon: CheckCircle2,
        color: 'text-green-600',
        bgColor: 'bg-green-100',
      };
    case 'rejected':
    case 'declined':
      return {
        icon: XCircle,
        color: 'text-red-600',
        bgColor: 'bg-red-100',
      };
    case 'scheduled':
      return {
        icon: Calendar,
        color: 'text-orange-600',
        bgColor: 'bg-orange-100',
      };
    default:
      return {
        icon: Clock,
        color: 'text-blue-600',
        bgColor: 'bg-blue-100',
      };
  }
}

export default function ApplicationTimeline({
  events,
  className,
}: ApplicationTimelineProps) {
  if (events.length === 0) {
    return null;
  }

  return (
    <div className={cn('space-y-4', className)}>
      <h3 className="text-sm font-medium text-gray-700">ประวัติการดำเนินการ</h3>
      <div className="relative">
        {events.map((event, index) => {
          const { icon: Icon, color, bgColor } = getEventStyle(event.status);
          const isLast = index === events.length - 1;

          return (
            <div key={index} className="relative flex gap-3 pb-6 last:pb-0">
              {/* Timeline line */}
              {!isLast && (
                <div className="absolute left-[15px] top-8 h-[calc(100%-2rem)] w-0.5 bg-gray-200" />
              )}

              {/* Icon */}
              <div
                className={cn(
                  'relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-full',
                  bgColor
                )}
              >
                <Icon className={cn('h-4 w-4', color)} />
              </div>

              {/* Content */}
              <div className="flex-1 pt-1">
                <p className="text-sm font-medium text-gray-900">{event.label}</p>
                <p className="text-xs text-gray-500">
                  {format(event.timestamp, 'd MMM yyyy, HH:mm น.', { locale: th })}
                </p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
