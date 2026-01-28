import { cn } from '@/lib/utils';

interface SalaryDisplayProps {
  minSalary?: number | null;
  maxSalary?: number | null;
  isNegotiable?: boolean;
  className?: string;
  showCurrency?: boolean;
}

export function SalaryDisplay({
  minSalary,
  maxSalary,
  isNegotiable = false,
  className,
  showCurrency = true,
}: SalaryDisplayProps) {
  const formatSalary = (amount: number) => {
    const formatted = new Intl.NumberFormat('th-TH').format(amount);
    return showCurrency ? `฿${formatted}` : formatted;
  };

  // Negotiable
  if (isNegotiable && !minSalary && !maxSalary) {
    return <span className={cn('text-muted-foreground', className)}>ตามตกลง</span>;
  }

  // Not specified
  if (!minSalary && !maxSalary) {
    return <span className={cn('text-muted-foreground', className)}>ไม่ระบุ</span>;
  }

  // Range
  if (minSalary && maxSalary) {
    if (minSalary === maxSalary) {
      return <span className={className}>{formatSalary(minSalary)}</span>;
    }
    return (
      <span className={className}>
        {formatSalary(minSalary)} - {formatSalary(maxSalary)}
      </span>
    );
  }

  // Min only
  if (minSalary) {
    return <span className={className}>{formatSalary(minSalary)}+</span>;
  }

  // Max only
  if (maxSalary) {
    return <span className={className}>สูงสุด {formatSalary(maxSalary)}</span>;
  }

  return null;
}
