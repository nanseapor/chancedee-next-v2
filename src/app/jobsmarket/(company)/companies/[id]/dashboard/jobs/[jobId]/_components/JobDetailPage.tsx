"use client";

import { useState, useEffect, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { useJobDetail } from '@/hooks/jobsmarket/jobs/use-job-detail';
import { useJobAnalytics } from '@/hooks/jobsmarket/jobs/use-job-analytics';
import { useJobActionsDetail } from '@/hooks/jobsmarket/jobs/use-job-actions-detail';
import { useJobEdit } from '@/hooks/jobsmarket/jobs/use-job-edit';
import { toast } from 'sonner';

// View Mode Components
import { JobDetailHeader } from './JobDetailHeader';
import { JobStatsCards } from './JobStatsCards';
import { JobViewsChart } from './JobViewsChart';
import { RecentApplicationsList } from './RecentApplicationsList';
import { JobPreviewCard } from './JobPreviewCard';

// Edit Mode Components
import { EditModeHeader } from './EditModeHeader';
import { EditableJobForm } from './EditableJobForm';
import { UnsavedChangesModal } from './modals/UnsavedChangesModal';

import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import type { FirebaseJobData } from '@/types/job.types';
import type { PageMode, ViewTab, JobWithAnalytics } from '@/types/jobsmarket/job-detail.types';

interface JobDetailPageProps {
  initialJob: FirebaseJobData;
  companyId: string;
  jobId: string;
}

export function JobDetailPage({ initialJob, companyId, jobId }: JobDetailPageProps) {
  const router = useRouter();

  const [mode, setMode] = useState<PageMode>('view');
  const [activeTab, setActiveTab] = useState<ViewTab>('overview');
  const [showUnsavedModal, setShowUnsavedModal] = useState(false);
  const [pendingNavigation, setPendingNavigation] = useState<string | null>(null);

  // View mode hooks
  const { job, isLoading, mutate } = useJobDetail(jobId);
  const { analytics } = useJobAnalytics(jobId);

  // Use server data as fallback, add analytics for actions hook
  // IMPORTANT: Memoize to prevent infinite re-renders in useJobActionsDetail
  const currentJob: JobWithAnalytics = useMemo(() => ({
    ...(job || initialJob),
    applicationCount: analytics?.applicationCount || 0,
    unreadApplicationCount: analytics?.unreadApplicationCount || 0,
    viewCount: analytics?.totalViews || 0,
  }), [job, initialJob, analytics]);

  const actions = useJobActionsDetail(currentJob);

  // Edit mode hook
  const jobEdit = useJobEdit(job || initialJob);

  // Handle edit mode entry
  const handleEditClick = () => {
    setMode('edit');
  };

  // Handle save
  const handleSave = async () => {
    const result = await jobEdit.save();

    if (result.success) {
      toast.success('บันทึกสำเร็จ');
      mutate(); // Refresh data
      setMode('view');
    } else {
      toast.error('บันทึกไม่สำเร็จ', {
        description: result.error
      });
    }
  };

  // Handle cancel with unsaved changes check
  const handleCancel = () => {
    if (jobEdit.isDirty) {
      setShowUnsavedModal(true);
    } else {
      setMode('view');
    }
  };

  // Handle discard changes
  const handleDiscard = () => {
    jobEdit.cancel();
    setShowUnsavedModal(false);
    setMode('view');

    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Handle save from modal
  const handleSaveFromModal = async () => {
    await handleSave();
    setShowUnsavedModal(false);

    if (pendingNavigation) {
      router.push(pendingNavigation);
      setPendingNavigation(null);
    }
  };

  // Navigation guard
  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (mode === 'edit' && jobEdit.isDirty) {
        e.preventDefault();
        e.returnValue = '';
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [mode, jobEdit.isDirty]);

  const handleActionSuccess = () => {
    mutate(); // Refresh data after action
  };

  if (mode === 'view') {
    return (
      <div className="space-y-6">
        <JobDetailHeader
          job={currentJob}
          onEditClick={handleEditClick}
          actions={actions}
          onActionSuccess={handleActionSuccess}
        />

        <Tabs value={activeTab} onValueChange={(v) => setActiveTab(v as ViewTab)}>
          <TabsList>
            <TabsTrigger value="overview">ภาพรวม</TabsTrigger>
            <TabsTrigger value="applications">ใบสมัคร</TabsTrigger>
            <TabsTrigger value="settings">ตั้งค่า</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            <JobStatsCards analytics={analytics} job={currentJob} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <JobViewsChart dailyViews={analytics?.dailyViews || []} />
              <RecentApplicationsList jobId={jobId} />
            </div>
            <JobPreviewCard job={currentJob} />
          </TabsContent>

          <TabsContent value="applications">
            {/* Link to COMP-R08 Applications page */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">ดูใบสมัครทั้งหมด →</p>
            </div>
          </TabsContent>

          <TabsContent value="settings">
            {/* Future: Job settings */}
            <div className="text-center py-8">
              <p className="text-muted-foreground">การตั้งค่างาน</p>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    );
  }

  // Edit Mode
  return (
    <>
      <EditModeHeader
        jobTitle={currentJob.title || 'Untitled Job'}
        isDirty={jobEdit.isDirty}
        isSaving={jobEdit.editState === 'saving'}
        validationErrors={jobEdit.validationErrors.length}
        onSave={handleSave}
        onCancel={handleCancel}
      />

      <div className="p-6">
        <EditableJobForm
          formData={jobEdit.formData}
          changedFields={jobEdit.changedFields}
          validationErrors={jobEdit.validationErrors}
          setField={jobEdit.setField}
        />
      </div>

      <UnsavedChangesModal
        isOpen={showUnsavedModal}
        onClose={() => setShowUnsavedModal(false)}
        onDiscard={handleDiscard}
        onSave={handleSaveFromModal}
      />
    </>
  );
}
