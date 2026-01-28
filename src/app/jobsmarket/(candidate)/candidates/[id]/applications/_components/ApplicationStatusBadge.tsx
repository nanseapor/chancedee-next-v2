import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

type ApplicationStatus =
  | 'applied'
  | 'read'
  | 'accepted'
  | 'rejected'
  | 'scheduled'
  | 'confirmed'
  | 'declined'
  | 'withdraw'
  | 'closed'
  | 'systemclosed'
  | 'cancelled';

interface StatusConfig {
  label: string;
  variant: 'default' | 'secondary' | 'destructive' | 'outline';
  className?: string;
}

/**
 * Status configuration following RIS §6.2 and design guidelines
 */
const STATUS_CONFIG: Record<ApplicationStatus, StatusConfig> = {
  applied: {
    label: 'ส่งใบสมัครแล้ว',
    variant: 'default',
    className: 'bg-blue-100 text-blue-700 hover:bg-blue-100',
  },
  read: {
    label: 'บริษัทดูแล้ว',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  accepted: {
    label: 'ผ่านการคัดเลือก',
    variant: 'default',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  rejected: {
    label: 'ไม่ผ่านการคัดเลือก',
    variant: 'destructive',
    className: 'bg-red-100 text-red-700 hover:bg-red-100',
  },
  scheduled: {
    label: 'นัดสัมภาษณ์แล้ว',
    variant: 'default',
    className: 'bg-orange-100 text-orange-700 hover:bg-orange-100',
  },
  confirmed: {
    label: 'ยืนยันสัมภาษณ์แล้ว',
    variant: 'default',
    className: 'bg-green-100 text-green-700 hover:bg-green-100',
  },
  declined: {
    label: 'ปฏิเสธสัมภาษณ์',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  withdraw: {
    label: 'ถอนใบสมัครแล้ว',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  closed: {
    label: 'ปิดรับสมัครแล้ว',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  systemclosed: {
    label: 'ปิดโดยระบบ',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
  cancelled: {
    label: 'ยกเลิก',
    variant: 'secondary',
    className: 'bg-gray-100 text-gray-700 hover:bg-gray-100',
  },
};

interface ApplicationStatusBadgeProps {
  status: string;
  className?: string;
}

export default function ApplicationStatusBadge({
  status,
  className
}: ApplicationStatusBadgeProps) {
  const config = STATUS_CONFIG[status as ApplicationStatus] ?? {
    label: status,
    variant: 'secondary' as const,
    className: 'bg-gray-100 text-gray-700',
  };

  return (
    <Badge
      variant={config.variant}
      className={cn(config.className, className)}
    >
      {config.label}
    </Badge>
  );
}

// Export for reuse
export { STATUS_CONFIG, type ApplicationStatus };
