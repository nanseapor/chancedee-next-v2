'use client';

import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import type { StatusTab } from '@/hooks/jobsmarket/candidates';
import type { ApplicationCounts } from '@/hooks/jobsmarket/candidates';

const TAB_LABELS: Record<StatusTab, string> = {
  all: 'ทั้งหมด',
  applied: 'สมัครแล้ว',
  reviewing: 'กำลังพิจารณา',
  interviewing: 'นัดสัมภาษณ์',
  rejected: 'ไม่ผ่าน',
};

interface StatusTabsProps {
  activeTab: StatusTab;
  counts: ApplicationCounts;
  onChange: (tab: StatusTab) => void;
  className?: string;
}

export default function StatusTabs({
  activeTab,
  counts,
  onChange,
  className,
}: StatusTabsProps) {
  const tabs: StatusTab[] = ['all', 'applied', 'reviewing', 'interviewing', 'rejected'];

  return (
    <div
      className={cn('w-full border-b border-gray-200', className)}
      role="tablist"
      aria-label="กรองสถานะใบสมัคร"
    >
      <div className="flex space-x-1 overflow-x-auto scrollbar-hide">
        {tabs.map((tab) => {
          const isActive = activeTab === tab;
          const count = counts[tab];

          return (
            <button
              key={tab}
              type="button"
              role="tab"
              aria-selected={isActive}
              aria-controls={`panel-${tab}`}
              onClick={() => onChange(tab)}
              className={cn(
                // Base styles
                'flex items-center gap-2 px-4 py-3 whitespace-nowrap',
                'font-medium tracking-widest text-sm transition-colors',
                'border-b-2 focus:outline-none focus:ring-2 focus:ring-primary-500 focus:ring-offset-2',
                // Active state
                isActive && 'border-primary-600 text-primary-700',
                // Inactive state
                !isActive && 'border-transparent text-gray-600 hover:text-gray-800 hover:border-gray-300'
              )}
            >
              <span>{TAB_LABELS[tab]}</span>
              <Badge
                variant="secondary"
                className={cn(
                  'min-w-[1.5rem] h-6 flex items-center justify-center px-2',
                  isActive
                    ? 'bg-primary-100 text-primary-700'
                    : 'bg-gray-100 text-gray-600'
                )}
              >
                {count}
              </Badge>
            </button>
          );
        })}
      </div>
    </div>
  );
}
