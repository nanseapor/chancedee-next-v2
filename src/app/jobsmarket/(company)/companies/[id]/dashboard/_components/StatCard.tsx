'use client';

import Link from 'next/link';
import { LucideIcon } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface StatCardProps {
  title: string;
  value: number;
  icon: LucideIcon;
  href?: string;
  isLoading?: boolean;
  className?: string;
}

function formatNumber(num: number): string {
  return num.toLocaleString('th-TH');
}

export default function StatCard({
  title,
  value,
  icon: Icon,
  href,
  isLoading = false,
  className,
}: StatCardProps) {
  const card = (
    <Card className={cn(
      'transition duration-200',
      href && 'hover:shadow-md hover:border-primary/50 cursor-pointer'
    )}>
      <CardContent className="p-6 flex items-center gap-4">
        <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
          <Icon className="w-6 h-6 text-primary" aria-hidden="true" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm text-muted-foreground truncate">{title}</p>
          {isLoading ? (
            <Skeleton className="h-8 w-16 mt-1" data-testid="stat-card-skeleton" />
          ) : (
            <p className="text-2xl font-bold">{formatNumber(value)}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );

  if (href) {
    return (
      <Link href={href} className={className} tabIndex={0} aria-label={`${title}: ${formatNumber(value)}`}>
        {card}
      </Link>
    );
  }

  return <div className={className} aria-label={title}>{card}</div>;
}
