'use client';

import { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { AlertCircle, RefreshCw } from 'lucide-react';

// Auth hook
import { useCandidateAuth } from '@/hooks/jobsmarket/use-candidate-auth';

// Application hooks from Phase 3
import {
  useApplications,
  useWithdrawApplication,
  useApplicationCounts,
  type StatusTab,
} from '@/hooks/jobsmarket/candidates';

// Withdrawable statuses check
import { WITHDRAWABLE_STATUSES } from '@/lib/database/actions/job-applications.constants';

// Components from Phase 4
import ApplicationsSkeleton from './ApplicationsSkeleton';
import EmptyState from './EmptyState';
import StatusTabs from './StatusTabs';
import ApplicationCard from './ApplicationCard';
import WithdrawModal from './WithdrawModal';

interface ApplicationsClientProps {
  candidateId: string;
}

/**
 * CAND-R04: Applications Client Component
 * Per CAND-R04 RIS §6-8
 *
 * Phase 5: Full Integration
 * - Auth/ownership checks via useCandidateAuth
 * - Fetch applications with useApplications hook
 * - Status tabs with filtering
 * - Application cards with timeline
 * - Withdraw functionality with modal
 */
export default function ApplicationsClient({ candidateId }: ApplicationsClientProps) {
  // Auth check - no onboarding requirement for viewing applications
  const authResult = useCandidateAuth(candidateId, false);

  // Tab state
  const [activeTab, setActiveTab] = useState<StatusTab>('all');

  // Withdraw modal state
  const [withdrawModalOpen, setWithdrawModalOpen] = useState(false);
  const [selectedApplication, setSelectedApplication] = useState<{
    uid: string;
    jobTitle: string;
    companyName: string;
  } | null>(null);

  // Fetch applications
  const {
    applications,
    allApplications,
    isLoading: isDataLoading,
    error,
    mutate,
  } = useApplications(candidateId, activeTab);

  // Calculate counts from all applications (not filtered)
  const counts = useApplicationCounts(allApplications);

  // Withdraw mutation
  const { withdraw, isWithdrawing } = useWithdrawApplication({
    candidateId,
    onSuccess: () => {
      setWithdrawModalOpen(false);
      setSelectedApplication(null);
    },
  });

  // Handle tab change
  const handleTabChange = useCallback((tab: StatusTab) => {
    setActiveTab(tab);
  }, []);

  // Handle withdraw button click - opens modal
  const handleWithdrawClick = useCallback(
    (applicationId: string) => {
      const app = allApplications?.find((a) => a.uid === applicationId);
      if (app) {
        setSelectedApplication({
          uid: app.uid,
          jobTitle: app.jobTitle,
          companyName: app.companyName,
        });
        setWithdrawModalOpen(true);
      }
    },
    [allApplications]
  );

  // Handle withdraw confirmation
  const handleWithdrawConfirm = useCallback(async () => {
    if (selectedApplication) {
      await withdraw(selectedApplication.uid);
    }
  }, [selectedApplication, withdraw]);

  // Handle modal close
  const handleModalClose = useCallback(() => {
    if (!isWithdrawing) {
      setWithdrawModalOpen(false);
      setSelectedApplication(null);
    }
  }, [isWithdrawing]);

  // Handle retry on error
  const handleRetry = useCallback(() => {
    mutate();
  }, [mutate]);

  // Loading state (auth check)
  if (!authResult.isReady) {
    return <ApplicationsSkeleton />;
  }

  // Loading state (initial data fetch)
  if (isDataLoading && !applications) {
    return <ApplicationsSkeleton />;
  }

  // Error state
  if (error) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
          ใบสมัครงานของฉัน
        </h1>

        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mb-4">
            <AlertCircle className="w-8 h-8 text-red-600" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            เกิดข้อผิดพลาด
          </h3>
          <p className="text-sm text-gray-600 text-center max-w-sm mb-6">
            ไม่สามารถโหลดข้อมูลใบสมัครได้ กรุณาลองใหม่อีกครั้ง
          </p>
          <Button onClick={handleRetry} variant="outline">
            <RefreshCw className="w-4 h-4 mr-2" />
            ลองใหม่
          </Button>
        </div>
      </div>
    );
  }

  // No applications at all
  if (!allApplications || allApplications.length === 0) {
    return (
      <div className="container mx-auto px-4 py-6 max-w-7xl">
        <h1 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
          ใบสมัครงานของฉัน
        </h1>

        <EmptyState
          type="no-applications"
          title="คุณยังไม่ได้สมัครงาน"
          description="เริ่มสมัครงานเพื่อติดตามสถานะได้ที่นี่"
          actionLabel="ค้นหางาน"
          actionHref="/jobs"
        />
      </div>
    );
  }

  // Has applications
  return (
    <div className="container mx-auto px-4 py-6 max-w-7xl">
      {/* Page title */}
      <h1 className="text-2xl font-semibold text-gray-900 mb-6 tracking-wide">
        ใบสมัครงานของฉัน
      </h1>

      {/* Status tabs */}
      <StatusTabs
        activeTab={activeTab}
        counts={counts}
        onChange={handleTabChange}
      />

      {/* Applications list */}
      <div
        role="tabpanel"
        id={`panel-${activeTab}`}
        aria-labelledby={`tab-${activeTab}`}
        className="mt-6"
      >
        {/* Loading overlay during revalidation */}
        {isDataLoading && applications && (
          <div className="text-center py-4 text-sm text-gray-500">
            กำลังอัปเดต...
          </div>
        )}

        {/* No results in current filter */}
        {applications && applications.length === 0 && (
          <EmptyState
            type="no-results"
            title="ไม่มีใบสมัครในสถานะนี้"
            description="ลองเลือกสถานะอื่นเพื่อดูใบสมัครของคุณ"
            actionLabel="ดูทั้งหมด"
            onAction={() => setActiveTab('all')}
          />
        )}

        {/* Application cards */}
        {applications && applications.length > 0 && (
          <div className="space-y-4">
            {applications.map((application) => {
              const canWithdraw = (WITHDRAWABLE_STATUSES as readonly string[]).includes(
                application.status
              );

              return (
                <ApplicationCard
                  key={application.uid}
                  application={application}
                  canWithdraw={canWithdraw}
                  onWithdraw={() => handleWithdrawClick(application.uid)}
                />
              );
            })}
          </div>
        )}
      </div>

      {/* Withdraw confirmation modal */}
      {selectedApplication && (
        <WithdrawModal
          isOpen={withdrawModalOpen}
          onClose={handleModalClose}
          onConfirm={handleWithdrawConfirm}
          isLoading={isWithdrawing}
          jobTitle={selectedApplication.jobTitle}
          companyName={selectedApplication.companyName}
        />
      )}
    </div>
  );
}
