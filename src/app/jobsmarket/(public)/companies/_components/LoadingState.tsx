"use client";

import { CompanyCardSkeleton } from "@/components/jobsmarket/companies";

interface LoadingStateProps {
  count?: number;
}

/**
 * LoadingState - Skeleton loading for company grid
 *
 * @specification COMP-R09 Company Directory
 */
export function LoadingState({ count = 6 }: LoadingStateProps) {
  return (
    <div
      className="grid grid-cols-1 gap-4"
      data-testid="companies-loading-state"
    >
      {Array.from({ length: count }).map((_, index) => (
        <CompanyCardSkeleton key={index} />
      ))}
    </div>
  );
}
