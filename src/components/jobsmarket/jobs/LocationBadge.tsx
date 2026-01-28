import { MapPin } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface LocationBadgeProps {
  province: string;
  district?: string;
  className?: string;
  showIcon?: boolean;
}

export function LocationBadge({
  province,
  district,
  className,
  showIcon = true,
}: LocationBadgeProps) {
  const location = district ? `${district}, ${province}` : province;

  return (
    <Badge variant="secondary" className={cn('font-normal', className)}>
      {showIcon && <MapPin size={12} className="mr-1" />}
      {location}
    </Badge>
  );
}
