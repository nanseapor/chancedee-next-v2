"use client";

import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { formatDistanceToNow } from 'date-fns';
import { th } from 'date-fns/locale';
import type { JobApplication } from '@/types/jobsmarket/job-detail.types';

interface ApplicationListItemProps {
  application: JobApplication;
}

const STATUS_VARIANTS = {
  pending: 'outline' as const,
  reviewing: 'outline' as const,
  shortlisted: 'secondary' as const,
  rejected: 'destructive' as const,
  withdrawn: 'outline' as const,
};

const STATUS_LABELS = {
  pending: 'รอดำเนินการ',
  reviewing: 'กำลังพิจารณา',
  shortlisted: 'ผ่านเข้ารอบ',
  rejected: 'ไม่ผ่าน',
  withdrawn: 'ถอนใบสมัคร',
};

export function ApplicationListItem({ application }: ApplicationListItemProps) {
  const initials = application.candidateName
    .split(' ')
    .map((n) => n[0])
    .join('')
    .toUpperCase()
    .slice(0, 2);

  const timeAgo = formatDistanceToNow(new Date(application.appliedAt), {
    addSuffix: true,
    locale: th,
  });

  return (
    <div className="flex items-center gap-3 p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors">
      <Avatar className="h-10 w-10">
        <AvatarImage src={application.candidateAvatar} alt={application.candidateName} />
        <AvatarFallback className="bg-secondary-100 text-secondary-700">
          {initials}
        </AvatarFallback>
      </Avatar>

      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium text-gray-900 truncate">
          {application.candidateName}
        </p>
        <p className="text-xs text-muted-foreground tracking-wider">
          {timeAgo}
        </p>
      </div>

      <Badge variant={STATUS_VARIANTS[application.status] || 'default'} className="shrink-0">
        {STATUS_LABELS[application.status] || application.status}
      </Badge>

      {application.isUnread && (
        <div className="w-2 h-2 bg-primary-600 rounded-full shrink-0" />
      )}
    </div>
  );
}
