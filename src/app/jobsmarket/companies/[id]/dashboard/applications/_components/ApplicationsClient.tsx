/**
 * COMP-R08: Applications Client Orchestrator (Phase 6: Mobile & Responsive)
 *
 * Main client component that orchestrates responsive three-panel layout:
 * - Mobile (<768px): List only, filter/detail as overlays
 * - Tablet (768-1023px): List + Detail, filter as sheet
 * - Desktop (≥1024px): All three panels visible
 *
 * Manages:
 * - Filter state (synced with URL)
 * - Selected application state
 * - SWR data fetching
 * - Accept/Reject actions (Phase 4)
 * - Responsive layout switching (Phase 6)
 *
 * Per COMP-R08 RIS §2 (Three-Panel Layout) and §3 (User Actions)
 */

'use client';

import { useState, useMemo, useCallback } from 'react';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { Filter } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/button';
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { useMediaQuery } from '@/hooks/use-media-query';
import { FilterPanel } from './FilterPanel';
import { ApplicationList } from './ApplicationList';
import { DetailPanel } from './DetailPanel';
import { ApplicationsSkeleton } from './ApplicationsSkeleton';
import { useCompanyApplications } from '@/hooks/jobsmarket/applications/use-company-applications';
import {
  webJobApplicationMarkAsRead,
  webJobApplicationAccept,
  webJobApplicationReject,
} from '@/lib/database/actions/job-applications';
import {
  DEFAULT_APPLICATION_FILTER,
  type ApplicationFilterState,
} from '@/types/jobsmarket/applications.types';
import { filterApplications, getStatusCounts } from './utils/filter-utils';
import type { FilterState } from './utils/filter-utils';

interface ApplicationsClientProps {
  companyId: string;
  initialFilters?: {
    jobId: string | null;
    status: string | null;
  };
}

export default function ApplicationsClient({
  companyId,
  initialFilters,
}: ApplicationsClientProps) {
  // Phase 5: URL sync hooks
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Initialize filter state from URL
  const [filters, setFilters] = useState<FilterState>({
    jobId: searchParams.get('job') || initialFilters?.jobId || null,
    statuses: searchParams.get('status')
      ? searchParams.get('status') === 'all'
        ? []
        : [searchParams.get('status')! as any]
      : initialFilters?.status
        ? [initialFilters.status as any]
        : [],
    sortBy: (searchParams.get('sort') as FilterState['sortBy']) || 'newest',
    // Phase 5: Date and score filters (not yet implemented in UI)
    dateFrom: null,
    dateTo: null,
    minScore: 0,
    maxScore: 100,
  });

  // Selected application state (from URL)
  const [selectedApplicationId, setSelectedApplicationId] = useState<string | null>(
    searchParams.get('selected') || null
  );

  // Phase 4: Accept/Reject loading states
  const [isAccepting, setIsAccepting] = useState(false);
  const [isRejecting, setIsRejecting] = useState(false);

  // Phase 6: Responsive state
  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const [showMobileFilter, setShowMobileFilter] = useState(false);
  const [showMobileDetail, setShowMobileDetail] = useState(false);

  // Fetch applications with SWR
  const { applications, isLoading, isError, mutate } = useCompanyApplications(companyId, {
    status: filters.statuses.length === 1 ? filters.statuses[0] : null,
    jobId: filters.jobId,
  });

  // Phase 5: Apply client-side filtering and sorting using filter utilities
  const filteredApplications = useMemo(() => {
    if (!applications) return [];
    return filterApplications(applications, filters);
  }, [applications, filters]);

  // Phase 5: Get status counts for filter panel
  const statusCounts = useMemo(() => {
    if (!applications) return {};
    return getStatusCounts(applications);
  }, [applications]);

  // Phase 5: Update URL when filters change
  const updateURL = useCallback(
    (params: Record<string, string | null>) => {
      // Fix: Use window.location.search instead of searchParams to avoid stale closures
      const newParams = new URLSearchParams(window.location.search);

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === '') {
          newParams.delete(key);
        } else {
          newParams.set(key, value);
        }
      });

      const queryString = newParams.toString();
      const newURL = queryString ? `${pathname}?${queryString}` : pathname;

      // Use window.history.replaceState for immediate URL updates
      // router.replace() alone doesn't update URL synchronously in Next.js App Router
      window.history.replaceState(null, '', newURL);

      // Also call router.replace for Next.js routing awareness
      router.replace(newURL, { scroll: false });
    },
    [router, pathname] // Removed searchParams from dependencies
  );

  // Handle filter changes
  const handleFiltersChange = (newFilters: Partial<FilterState>) => {
    const updated = { ...filters, ...newFilters };
    setFilters(updated);

    // Update URL
    updateURL({
      job: updated.jobId,
      status:
        updated.statuses.length === 0
          ? null // Don't set status param if showing all
          : updated.statuses.length === 1
            ? (updated.statuses[0] ?? null)
            : updated.statuses.join(','),
      sort: updated.sortBy !== 'newest' ? updated.sortBy : null, // Only set if not default
    });
  };

  // Get selected application object
  const selectedApplication = filteredApplications.find(
    (app) => app.uid === selectedApplicationId
  );

  // Handle application selection with mark-as-read
  const handleSelectApplication = useCallback(
    async (applicationId: string) => {
      setSelectedApplicationId(applicationId);

      // Phase 5: Update URL with selected application ID
      updateURL({ selected: applicationId });

      // Phase 6: Open detail sheet on mobile
      if (isMobile) {
        setShowMobileDetail(true);
      }

      // Mark as read if status is 'applied' (unread)
      const app = filteredApplications.find((a) => a.uid === applicationId);
      if (app?.status === 'applied') {
        // Silent background call - no toast
        try {
          await webJobApplicationMarkAsRead(applicationId);

          // Revalidate SWR cache to fetch updated data
          mutate();
        } catch (error) {
          console.error('Failed to mark application as read:', error);
          // Silent fail - non-critical action
        }
      }
    },
    [filteredApplications, mutate, updateURL, isMobile]
  );

  // Phase 4: Handle accept application
  const handleAcceptApplication = useCallback(async () => {
    if (!selectedApplication) return;

    setIsAccepting(true);
    try {
      const result = await webJobApplicationAccept({
        companyId,
        candidateId: selectedApplication.candidateId,
        hrId: '', // TODO: Get from auth context or company admin
        jobId: selectedApplication.jobId,
        applicationId: selectedApplication.uid,
        name: selectedApplication.candidateName,
        jobTitle: selectedApplication.jobTitle,
        companyName: '', // TODO: Get from company profile
      });

      if (result.status === 200) {
        toast.success('ยอมรับใบสมัครสำเร็จ', {
          description: `ส่งข้อความถึง ${selectedApplication.candidateName} แล้ว`,
        });

        // Revalidate cache
        mutate();

        // TODO Phase 4: Open chat drawer with result.chatId
        console.log('Chat ID for opening drawer:', result.chatId);
      }
    } catch (error) {
      console.error('Failed to accept application:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถยอมรับใบสมัครได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsAccepting(false);
    }
  }, [selectedApplication, companyId, mutate]);

  // Phase 4: Handle reject application
  const handleRejectApplication = useCallback(async (feedback: string) => {
    if (!selectedApplication) return;

    setIsRejecting(true);
    try {
      const result = await webJobApplicationReject(
        selectedApplication.uid,
        feedback,
        '' // TODO: Get actorId from auth context
      );

      if (result.success) {
        toast.success('ปฏิเสธใบสมัครสำเร็จ', {
          description: feedback
            ? `ส่งข้อความถึง ${selectedApplication.candidateName} แล้ว`
            : 'อัปเดตสถานะแล้ว',
        });

        // Revalidate cache
        mutate();
      }
    } catch (error) {
      console.error('Failed to reject application:', error);
      toast.error('เกิดข้อผิดพลาด', {
        description: 'ไม่สามารถปฏิเสธใบสมัครได้ กรุณาลองใหม่อีกครั้ง',
      });
    } finally {
      setIsRejecting(false);
    }
  }, [selectedApplication, mutate]);

  // Show skeleton while loading
  if (isLoading && !applications) {
    return <ApplicationsSkeleton />;
  }

  return (
    <>
      <div className="flex h-[calc(100vh-var(--header-height))]">
        {/* Phase 6: Mobile Filter Button */}
        {isMobile && (
          <div className="fixed top-4 left-4 z-10">
            <Button
              variant="outline"
              size="icon"
              onClick={() => setShowMobileFilter(true)}
              className="bg-white shadow-md"
            >
              <Filter className="h-4 w-4" />
            </Button>
          </div>
        )}

        {/* Filter Panel - Hidden on mobile/tablet, visible on desktop */}
        <aside className="hidden lg:block w-[250px] flex-shrink-0">
          <FilterPanel
            companyId={companyId}
            filters={filters}
            onFiltersChange={handleFiltersChange}
          />
        </aside>

        {/* Application List - Full width on mobile, 350px on tablet/desktop */}
        <div className="w-full md:w-[350px] flex-shrink-0">
          <ApplicationList
            applications={filteredApplications}
            isLoading={isLoading}
            isError={isError}
            selectedApplicationId={selectedApplicationId}
            onSelectApplication={handleSelectApplication}
          />
        </div>

        {/* Detail Panel - Hidden on mobile, visible on tablet/desktop */}
        <main className="hidden md:block flex-1 overflow-y-auto bg-gray-50">
          <DetailPanel
            application={selectedApplication}
            companyId={companyId}
            canManageApplications={true} // TODO: Get from permissions/role
            onAccept={handleAcceptApplication}
            onReject={handleRejectApplication}
            isAccepting={isAccepting}
            isRejecting={isRejecting}
          />
        </main>
      </div>

      {/* Phase 6: Mobile Filter Sheet */}
      <Sheet open={showMobileFilter} onOpenChange={setShowMobileFilter}>
        <SheetContent className="w-[280px]">
          <SheetHeader>
            <SheetTitle>ตัวกรอง</SheetTitle>
          </SheetHeader>
          <div className="mt-4">
            <FilterPanel
              companyId={companyId}
              filters={filters}
              onFiltersChange={(newFilters) => {
                handleFiltersChange(newFilters);
                setShowMobileFilter(false); // Close sheet after applying
              }}
              asSheet
            />
          </div>
        </SheetContent>
      </Sheet>

      {/* Phase 6: Mobile Detail Sheet */}
      <Sheet open={showMobileDetail} onOpenChange={setShowMobileDetail}>
        <SheetContent className="w-full">
          <div className="h-full overflow-y-auto">
            <DetailPanel
              application={selectedApplication}
              companyId={companyId}
              canManageApplications={true}
              onAccept={handleAcceptApplication}
              onReject={handleRejectApplication}
              isAccepting={isAccepting}
              isRejecting={isRejecting}
            />
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
