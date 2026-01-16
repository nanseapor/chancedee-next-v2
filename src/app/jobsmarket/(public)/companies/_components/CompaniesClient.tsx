"use client";

import { useState } from "react";
import { SearchHeader } from "./SearchHeader";
import { ResultsHeader } from "./ResultsHeader";
import { CompanyListResults } from "./CompanyListResults";
import {
  CompanyFilters,
  CompanyFiltersMobile,
} from "@/components/jobsmarket/companies";
import { useCompanyFilters } from "@/hooks/jobsmarket/useCompanyFilters";
import { useCompanySearch } from "@/hooks/jobsmarket/useCompanySearch";
import type {
  CompanySortOption,
  Industry,
  CompanySize,
} from "@/types/public-companies";
import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/button";

export interface CompaniesClientProps {
  initialFilters: {
    keyword: string;
    industries: Industry[];
    sizes: CompanySize[];
  };
  initialSort: CompanySortOption;
  initialPage: number;
}

/**
 * CompaniesClient - Main client component for company directory
 *
 * @specification COMP-R09 Company Directory
 */
export function CompaniesClient({
  initialFilters,
  initialSort,
  initialPage,
}: CompaniesClientProps) {
  // Debug: Log initial values from server
  console.log("[CompaniesClient] Initial props:", {
    keyword: initialFilters.keyword,
    industries: initialFilters.industries,
    sizes: initialFilters.sizes,
    sort: initialSort,
    page: initialPage,
  });

  // Filter state management - uses server-provided initial values
  const filterControls = useCompanyFilters({
    initialFilters,
    initialSort,
    initialPage,
  });

  // Company search with SWR
  const { data, isLoading, isError, error } = useCompanySearch({
    filters: filterControls.filters,
  });

  // Mobile filter sheet state
  const [isFilterSheetOpen, setIsFilterSheetOpen] = useState(false);

  // Count active filters for badge
  const activeFilterCount =
    filterControls.filters.industries.length +
    filterControls.filters.sizes.length;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Search Header */}
      <div className="bg-white border-b -mx-4 sm:-mx-6 lg:-mx-8 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto py-6">
          <SearchHeader
            q={filterControls.filters.q}
            onKeywordChange={filterControls.setKeyword}
          />
        </div>
      </div>

      {/* Main Content */}
      <div className="py-6">
        <div className="flex gap-6">
          {/* Desktop Filters Sidebar */}
          <aside className="hidden lg:block w-80 flex-shrink-0">
            <div className="sticky top-6">
              <CompanyFilters
                filters={filterControls.filters}
                onFilterChange={filterControls.updateFilters}
                onClearAll={filterControls.clearAllFilters}
                hasActiveFilters={filterControls.hasActiveFilters}
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
                data-testid="mobile-filter-button"
              >
                <SlidersHorizontal className="mr-2 h-4 w-4" />
                ตัวกรอง
                {activeFilterCount > 0 && (
                  <span className="ml-2 inline-flex items-center justify-center rounded-full bg-primary text-white text-xs font-medium h-5 min-w-[20px] px-1.5">
                    {activeFilterCount}
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
            />

            {/* Company List Results */}
            <CompanyListResults
              companies={data?.companies ?? []}
              isLoading={isLoading}
              isError={isError}
              error={error}
              searchQuery={filterControls.filters.q}
              hasFilters={filterControls.hasActiveFilters}
              onClearFilters={filterControls.clearAllFilters}
              currentPage={filterControls.filters.page}
              totalPages={data?.totalPages ?? 1}
              onPageChange={filterControls.setPage}
            />
          </main>
        </div>
      </div>

      {/* Mobile Filter Bottom Sheet */}
      <CompanyFiltersMobile
        filters={filterControls.filters}
        onFilterChange={filterControls.updateFilters}
        onClearAll={filterControls.clearAllFilters}
        hasActiveFilters={filterControls.hasActiveFilters}
        isOpen={isFilterSheetOpen}
        onClose={() => setIsFilterSheetOpen(false)}
        resultCount={data?.totalCount ?? 0}
      />
    </div>
  );
}
