"use client";

import { CompanyCard } from "@/components/jobsmarket/companies";
import type { CompanyCardData } from "@/types/public-companies";
import { LoadingState } from "./LoadingState";
import { ErrorState } from "./ErrorState";
import { EmptyState } from "./EmptyState";
import { Pagination } from "./Pagination";

export interface CompanyListResultsProps {
  companies: CompanyCardData[];
  isLoading: boolean;
  isError: boolean;
  error?: string;
  searchQuery?: string;
  hasFilters: boolean;
  onClearFilters: () => void;
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
}

/**
 * CompanyListResults - Main results area with loading/error/empty states
 *
 * @specification COMP-R09 Company Directory
 */
export function CompanyListResults({
  companies,
  isLoading,
  isError,
  error,
  searchQuery,
  hasFilters,
  onClearFilters,
  currentPage,
  totalPages,
  onPageChange,
}: CompanyListResultsProps) {
  // Loading state
  if (isLoading) {
    return <LoadingState count={6} />;
  }

  // Error state
  if (isError) {
    return (
      <ErrorState
        error={error || "ไม่สามารถโหลดข้อมูลบริษัทได้ กรุณาลองใหม่อีกครั้ง"}
        onRetry={() => window.location.reload()}
      />
    );
  }

  // Empty state
  if (companies.length === 0) {
    return (
      <EmptyState
        searchQuery={searchQuery}
        hasFilters={hasFilters}
        onClearFilters={onClearFilters}
        onClearSearch={onClearFilters}
      />
    );
  }

  return (
    <div data-testid="companies-results">
      {/* Company List */}
      <div className="space-y-4 mb-6">
        {companies.map((company) => (
          <CompanyCard key={company.uid} company={company} />
        ))}
      </div>

      {/* Pagination */}
      <Pagination
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
        isLoading={isLoading}
      />
    </div>
  );
}
