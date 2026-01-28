'use client';

import { Briefcase, BriefcaseBusiness, FileText, FilePlus } from 'lucide-react';
import StatCard from './StatCard';
import { cn } from '@/lib/utils';

export interface DashboardMetricsData {
  totalJobs: number;
  activeJobs: number;
  totalApplications: number;
  newApplications: number;
}

interface DashboardMetricsProps {
  companyId: string;
  metrics?: DashboardMetricsData;
  isLoading?: boolean;
  className?: string;
}

export default function DashboardMetrics({
  companyId,
  metrics,
  isLoading = false,
  className,
}: DashboardMetricsProps) {
  if (isLoading) {
    return (
      <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4', className)} data-testid="dashboard-metrics-loading">
        {[1, 2, 3, 4].map((i) => (
          <StatCard
            key={i}
            title="..."
            value={0}
            icon={Briefcase}
            isLoading={true}
          />
        ))}
      </div>
    );
  }

  const stats = [
    {
      key: 'totalJobs',
      title: 'งานทั้งหมด',
      value: metrics?.totalJobs ?? 0,
      icon: Briefcase,
      href: `/jobsmarket/companies/${companyId}/jobs`,
    },
    {
      key: 'activeJobs',
      title: 'งานที่เปิดรับ',
      value: metrics?.activeJobs ?? 0,
      icon: BriefcaseBusiness,
      href: `/jobsmarket/companies/${companyId}/jobs?status=active`,
    },
    {
      key: 'totalApplications',
      title: 'ใบสมัครทั้งหมด',
      value: metrics?.totalApplications ?? 0,
      icon: FileText,
      href: `/jobsmarket/companies/${companyId}/applications`,
    },
    {
      key: 'newApplications',
      title: 'ใบสมัครใหม่',
      value: metrics?.newApplications ?? 0,
      icon: FilePlus,
      href: `/jobsmarket/companies/${companyId}/applications?status=new`,
    },
  ];

  return (
    <div className={cn('grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4', className)}>
      {stats.map((stat) => (
        <StatCard
          key={stat.key}
          title={stat.title}
          value={stat.value}
          icon={stat.icon}
          href={stat.href}
        />
      ))}
    </div>
  );
}
