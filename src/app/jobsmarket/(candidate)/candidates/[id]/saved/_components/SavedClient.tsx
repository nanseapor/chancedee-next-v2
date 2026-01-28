'use client';

import { useRouter, useSearchParams } from 'next/navigation';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useCandidateAuth } from '@/hooks/jobsmarket/use-candidate-auth';
import { useSavedJobs } from '@/hooks/jobsmarket/candidates/use-saved-jobs';
import JobsTab from './JobsTab';

/**
 * CAND-R05: Saved Page Client Component
 *
 * Main client wrapper for saved items page
 * Handles auth, tabs, and content routing
 */

interface SavedClientProps {
  candidateId: string;
}

type TabValue = 'jobs' | 'searches' | 'alerts';

export default function SavedClient({ candidateId }: SavedClientProps) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isReady } = useCandidateAuth(candidateId, false);

  // Get current tab from URL or default to 'jobs'
  const currentTab = (searchParams.get('tab') as TabValue) || 'jobs';

  // Fetch saved jobs
  const { savedJobs, isLoading, error, mutate } = useSavedJobs(candidateId);

  // Handle tab change
  const handleTabChange = (value: string) => {
    router.push(`?tab=${value}`);
  };

  // Show loading while checking auth
  if (!isReady) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-gray-600">กำลังโหลด...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-5xl px-4 py-8">
      {/* Page Header */}
      <h1 className="mb-6 text-3xl font-semibold tracking-wide leading-snug text-gray-900">
        รายการที่บันทึก
      </h1>

      {/* Tab Navigation */}
      <Tabs value={currentTab} onValueChange={handleTabChange}>
        <TabsList className="mb-6">
          <TabsTrigger value="jobs">งานที่บันทึก</TabsTrigger>
          <TabsTrigger value="searches">การค้นหาที่บันทึก</TabsTrigger>
          <TabsTrigger value="alerts">การแจ้งเตือนงาน</TabsTrigger>
        </TabsList>

        {/* Jobs Tab Content */}
        <TabsContent value="jobs">
          <JobsTab savedJobs={savedJobs} isLoading={isLoading} error={error} mutate={mutate} />
        </TabsContent>

        {/* Searches Tab Content - Coming Soon */}
        <TabsContent value="searches">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-lg text-gray-600">เร็วๆ นี้</p>
          </div>
        </TabsContent>

        {/* Alerts Tab Content - Coming Soon */}
        <TabsContent value="alerts">
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <p className="text-lg text-gray-600">เร็วๆ นี้</p>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  );
}
