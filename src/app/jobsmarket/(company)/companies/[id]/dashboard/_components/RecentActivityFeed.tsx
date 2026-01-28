'use client';

import { FileText, Briefcase, CheckCircle, XCircle, BriefcaseIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';
import { Activity, getRelativeTime } from './mock-activities';

interface RecentActivityFeedProps {
  activities?: Activity[];
  isLoading?: boolean;
  className?: string;
}

const ACTIVITY_ICONS: Record<Activity['type'], React.ElementType> = {
  application_received: FileText,
  job_posted: Briefcase,
  job_closed: BriefcaseIcon,
  application_accepted: CheckCircle,
  application_rejected: XCircle,
};

const ACTIVITY_COLORS: Record<Activity['type'], string> = {
  application_received: 'text-blue-500 bg-blue-50',
  job_posted: 'text-green-500 bg-green-50',
  job_closed: 'text-gray-500 bg-gray-50',
  application_accepted: 'text-green-600 bg-green-50',
  application_rejected: 'text-red-500 bg-red-50',
};

export default function RecentActivityFeed({
  activities = [],
  isLoading = false,
  className,
}: RecentActivityFeedProps) {
  // Limit to max 5 items
  const displayedActivities = activities.slice(0, 5);

  return (
    <Card className={className}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg">กิจกรรมล่าสุด</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="space-y-4" data-testid="activity-skeleton">
            {[1, 2, 3].map((i) => (
              <div key={i} className="flex items-start gap-3">
                <Skeleton className="w-8 h-8 rounded-full" />
                <div className="flex-1">
                  <Skeleton className="h-4 w-3/4 mb-2" />
                  <Skeleton className="h-3 w-1/4" />
                </div>
              </div>
            ))}
          </div>
        ) : displayedActivities.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <p>ยังไม่มีกิจกรรม</p>
          </div>
        ) : (
          <div className="space-y-4">
            {displayedActivities.map((activity) => {
              const Icon = ACTIVITY_ICONS[activity.type];
              const colorClass = ACTIVITY_COLORS[activity.type];

              return (
                <div key={activity.id} className="flex items-start gap-3" data-testid={`activity-item-${activity.id}`}>
                  <div className={cn('w-8 h-8 rounded-full flex items-center justify-center', colorClass)}>
                    <Icon className="w-4 h-4" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="text-sm">{activity.message}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {getRelativeTime(activity.timestamp)}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
