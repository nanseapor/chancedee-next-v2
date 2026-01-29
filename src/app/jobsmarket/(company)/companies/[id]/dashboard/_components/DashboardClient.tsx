'use client';

import useSWR from 'swr';
import { useCompanyAuth } from '@/hooks/jobsmarket/company';
import { Skeleton } from '@/components/ui/skeleton';
import DashboardMetrics, { DashboardMetricsData } from './DashboardMetrics';
import QuickActions from './QuickActions';
import RecentActivityFeed from './RecentActivityFeed';
import { MOCK_ACTIVITIES } from './mock-activities';

interface DashboardClientProps {
  companyId: string;
}

// TODO: Replace with actual server action
const MOCK_METRICS: DashboardMetricsData = {
  totalJobs: 12,
  activeJobs: 5,
  totalApplications: 87,
  newApplications: 14,
};

function DashboardSkeleton() {
  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-7xl" data-testid="dashboard-skeleton">
      {/* Metrics skeleton */}
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <Skeleton key={i} className="h-24 rounded-lg" />
        ))}
      </div>
      {/* Content skeleton */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Skeleton className="h-64 rounded-lg lg:col-span-2" />
        <Skeleton className="h-64 rounded-lg" />
      </div>
    </div>
  );
}

export default function DashboardClient({ companyId }: DashboardClientProps) {
  const { isLoading: authLoading, isReady, access, hasPermission } = useCompanyAuth({
    companyId,
  });

  // Mock SWR data fetching
  // TODO: Replace with real server action when available
  const { data: metricsData, error, isLoading: dataLoading } = useSWR(
    companyId ? `/api/companies/${companyId}/dashboard/metrics` : null,
    () => Promise.resolve(MOCK_METRICS)
  );

  // Loading state - auth or data
  if (authLoading || dataLoading) {
    return <DashboardSkeleton />;
  }

  // Not authenticated or not a member - return null (hook handles redirect)
  if (access.state === 'unauthorized' || access.state === 'not_member') {
    return null;
  }

  // Pending/rejected - return null (hook handles redirect)
  if (access.state === 'pending_approval' || access.state === 'rejected') {
    return null;
  }

  // Not ready for other reasons
  if (!isReady) {
    return null;
  }

  // Handle fetch errors
  if (error) {
    return (
      <div className="p-3 sm:p-6 max-w-7xl">
        <div className="text-center py-8 text-red-600">
          <p>เกิดข้อผิดพลาดในการโหลดข้อมูล</p>
        </div>
      </div>
    );
  }

  // Handle null metrics data (show skeleton or empty state)
  if (metricsData === null) {
    return <DashboardSkeleton />;
  }

  const canPostJobs = hasPermission('post_jobs');

  return (
    <div className="space-y-4 sm:space-y-6 p-3 sm:p-6 max-w-7xl">
      {/* Page Header */}
      <div>
        <h1 className="text-lg sm:text-2xl font-bold">แดชบอร์ด</h1>
        <p className="text-muted-foreground">
          ยินดีต้อนรับภาพรวมบริษัทของคุณ
        </p>
      </div>

      {/* Metrics Grid */}
      <DashboardMetrics
        companyId={companyId}
        metrics={metricsData}
      />

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Quick Actions - Takes 1 column */}
        <QuickActions
          companyId={companyId}
          canPostJobs={canPostJobs}
        />

        {/* Recent Activity - Takes 2 columns */}
        <RecentActivityFeed
          activities={MOCK_ACTIVITIES}
          className="lg:col-span-2"
        />
      </div>
    </div>
  );
}
