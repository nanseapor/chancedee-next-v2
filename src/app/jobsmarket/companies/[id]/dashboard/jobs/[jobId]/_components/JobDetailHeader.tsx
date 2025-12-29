"use client";

import { useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Pencil } from 'lucide-react';
import { StatusActionButtons } from './StatusActionButtons';
import { canEditJob } from '@/types/jobsmarket/job-detail.types';
import type { JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';
import type { UseJobActionsDetailReturn } from '@/hooks/jobsmarket/jobs/use-job-actions-detail';

interface JobDetailHeaderProps {
  job: JobWithAnalytics;
  onEditClick: () => void;
  actions: UseJobActionsDetailReturn;
  onActionSuccess: () => void;
}

const STATUS_LABELS: Record<string, string> = {
  draft: 'ฉบับร่าง',
  ontimer: 'รอเผยแพร่',
  published: 'เผยแพร่แล้ว',
  unpublished: 'หยุดชั่วคราว',
  closed: 'ปิดรับสมัคร',
};

const STATUS_VARIANTS: Record<string, 'default' | 'secondary' | 'destructive' | 'outline'> = {
  draft: 'secondary',
  ontimer: 'outline',
  published: 'default',
  unpublished: 'outline',
  closed: 'destructive',
};

export function JobDetailHeader({ job, onEditClick, actions, onActionSuccess }: JobDetailHeaderProps) {
  const isEditable = canEditJob(job.jobStatus);

  const formattedDate = useMemo(() => {
    return new Date(job.createdAt || Date.now()).toLocaleDateString('th-TH');
  }, [job.createdAt]);

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="space-y-1">
        <div className="flex items-center gap-2">
          <h1 className="text-2xl font-semibold tracking-wide leading-snug">{job.title}</h1>
          <Badge variant={STATUS_VARIANTS[job.jobStatus] || 'default'}>
            {STATUS_LABELS[job.jobStatus] || job.jobStatus}
          </Badge>
        </div>
        <p className="text-muted-foreground text-sm font-normal tracking-wider">
          {job.companyName} • สร้างเมื่อ {formattedDate}
        </p>
      </div>

      <div className="flex items-center gap-2">
        {isEditable && (
          <Button variant="outline" onClick={onEditClick} className="rounded-[0.625rem] font-medium tracking-widest">
            <Pencil className="h-4 w-4 mr-2" />
            แก้ไข
          </Button>
        )}
        <StatusActionButtons
          job={job}
          actions={actions}
          onSuccess={onActionSuccess}
        />
      </div>
    </div>
  );
}
