'use client';

import { useState, useCallback } from 'react';
import { SearchHeader } from './SearchHeader';
import { ResultsHeader } from './ResultsHeader';
import { JobListResults } from './JobListResults';
import { JobFilters, JobFiltersMobile } from '@/components/jobsmarket/jobs/JobFilters';
import { LoginPromptModal } from '@/components/jobsmarket/jobs/LoginPromptModal';
import { useJobFilters } from '@/hooks/jobsmarket/useJobFilters';
import { useJobSearch } from '@/hooks/jobsmarket/useJobSearch';
import { useSaveJobMutation } from '@/hooks/jobsmarket/useSaveJobMutation';
import type { JobSortOption, EmploymentType, EducationLevel, ExperienceRange, WorkMode } from '@/types/public-jobs';
import { SlidersHorizontal } from 'lucide-react';
import { Button } from '@/components/ui/button';

export interface JobsClientProps {
  initialFilters: {
    keyword: string;
    locations: string[];
    types: EmploymentType[];
    salaryMin: number | null;
    salaryMax: number | null;
    education: EducationLevel[];
    experience: ExperienceRange | null;
    remote: WorkMode | null;
  };
  initialSort: JobSortOption;
  initialPage: number;
}

export function JobsClient({ initialFilters, initialSort, initialPage }: JobsClientProps) {
  // Filter state management
  const filterControls = useJobFilters({
    initialFilters,
    initialSort,
    initialPage,
  });

  // Job search with SWR
  const { data, isLoading, isError, error } = useJobSearch({
    filters: filterControls.filters,
  });

  // Mobile filter sheet state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Login prompt state
  const [showLoginPrompt, setShowLoginPrompt] = useState(false);
  const [loginPromptAction, setLoginPromptAction] = useState<'save' | 'apply'>('save');

  // Save mutation hook
  const { toggleSave, isJobSaved, isSaving: _isSaving } = useSaveJobMutation([], {
    onAuthRequired: () => {
      setLoginPromptAction('save');
      setShowLoginPrompt(true);
    },
  });

  // Handler for save button
  const handleSaveToggle = useCallback(
    (jobId: string) => {
      toggleSave(jobId);
    },
    [toggleSave]
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b">
        <div className="container mx-auto px-4 py-6">
          <SearchHeader
            q={filterControls.filters.q}
            onKeywordChange={filterControls.setKeyword}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="container mx-auto px-4 py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <JobFilters
                filters={filterControls.filters}
                onFilterChange={filterControls.updateFilters}
                onClearAll={filterControls.clearAllFilters}
              />
            </div>
          </aside>

          {/* Results Area */}
          <main className="flex-1 min-w-0">
            {/* Mobile Filter Button */}
            <div className="lg:hidden mb-4">
              <Button
                variant="outline"
                onClick={() => setIsFilterSheetOpen(true)}
                className="w-full"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                ตัวกรอง
                {filterControls.hasActiveFilters && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs font-medium h-5 min-w-[20px] px-1.5">
                    {[
                      filterControls.filters.locations.length,
                      filterControls.filters.types.length,
                      filterControls.filters.education.length,
                      filterControls.filters.experience ? 1 : 0,
                      filterControls.filters.remote ? 1 : 0,
                      filterControls.filters.salaryMin || filterControls.filters.salaryMax ? 1 : 0,
                    ].reduce((a, b) => a + b, 0)}
                  </span>
                )}
              </Button>
            </div>

            {/* Results Header */}
            <ResultsHeader
              totalCount={data?.totalCount ?? 0}
              currentSort={filterControls.filters.sort}
              onSortChange={filterControls.setSort}
              isLoading={isLoading}
              isFallback={data?.isFallback ?? false}
            />

            {/* Job List Results */}
            <JobListResults
              jobs={data?.jobs ?? []}
              isLoading={isLoading}
              isError={isError}
              error={error}
              searchQuery={filterControls.filters.q}
              hasFilters={filterControls.hasActiveFilters}
              onClearFilters={filterControls.clearAllFilters}
              currentPage={filterControls.filters.page}
              totalPages={data?.totalPages ?? 1}
              onPageChange={filterControls.setPage}
              onSaveToggle={handleSaveToggle}
              isJobSaved={isJobSaved}
              showSaveButton={true}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <JobFiltersMobile
        filters={filterControls.filters}
        onFilterChange={filterControls.updateFilters}
        onClearAll={filterControls.clearAllFilters}
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        resultCount={data?.totalCount ?? 0}
      />

      {/* Login Prompt Modal */}
      <LoginPromptModal
        isOpen={showLoginPrompt}
        onClose={() => setShowLoginPrompt(false)}
        action={loginPromptAction}
        returnUrl={typeof window !== 'undefined' ? window.location.href : '/jobs'}
      />
    </div>
  );
}
