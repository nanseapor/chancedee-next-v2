import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { JobAvailabilityState } from '@/types/public-jobs';

interface JobStatusBadgeProps {
  status: JobAvailabilityState;
  className?: string;
}

const STATUS_CONFIG: Record<
  JobAvailabilityState,
  { label: string; variant: 'default' | 'secondary' | 'destructive' | 'outline' }
> = {
  available: { label: '', variant: 'default' }, // Hidden
  closed: { label: 'ปิดรับสมัครแล้ว', variant: 'secondary' },
  expired: { label: 'หมดอายุแล้ว', variant: 'secondary' },
  unpublished: { label: 'ไม่เผยแพร่', variant: 'secondary' },
  not_found: { label: 'ไม่พบงาน', variant: 'destructive' },
};

export function JobStatusBadge({ status, className }: JobStatusBadgeProps) {
  if (status === 'available') return null;

  const config = STATUS_CONFIG[status];

  return (
    <Badge variant={config.variant} className={cn('font-normal', className)}>
      {config.label}
    </Badge>
  );
}
